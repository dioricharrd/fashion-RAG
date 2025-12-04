from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.responses import StreamingResponse

import io
import torch
import faiss
import numpy as np
import pandas as pd
import pickle
from PIL import Image

from transformers import (
    CLIPProcessor,
    CLIPModel,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
)

import io
import os

# ============================
# CONFIG
# ============================

INDEX_PATH = "fashion_product.index"      # TODO: pastikan nama & lokasi sama dengan file kamu
METADATA_PATH = "fashion_metadata.pkl"    # TODO: file metadata (list/df produk)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ============================
# INISIALISASI APLIKASI
# ============================

app = FastAPI(
    title="Fashion RAG Backend",
    description="API untuk text/image search + RAG pada dataset fashion",
    version="0.1.0",
)

# Allow CORS (supaya FE bisa akses, nanti tinggal diisi origin front-end)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: production sebaiknya dibatasi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# LOAD MODEL & INDEX
# ============================

print(f"Using device: {DEVICE}")

# CLIP untuk embedding gambar & teks
clip_model_name = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(clip_model_name).to(DEVICE)
clip_processor = CLIPProcessor.from_pretrained(clip_model_name)

# Flan-T5 (atau model T5 lain) untuk generatif RAG
t5_model_name = "google/flan-t5-small"
t5_tokenizer = AutoTokenizer.from_pretrained(t5_model_name)
t5_model = AutoModelForSeq2SeqLM.from_pretrained(t5_model_name).to(DEVICE)

# FAISS index & metadata (harus sudah dibuat dulu dengan script offline)
if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
    print("Loading FAISS index and metadata...")
    faiss_index = faiss.read_index(INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)
    # metadata bisa berupa DataFrame atau list of dict
else:
    print("WARNING: Index / metadata file not found. Search endpoint will fail.")
    faiss_index = None
    metadata = None

# ============================
# UTIL FUNCTIONS
# ============================

def get_text_embedding(text: str) -> np.ndarray:
    """
    Menghasilkan embedding CLIP dari teks (1 x d).
    """
    inputs = clip_processor(
        text=[text],
        images=None,
        return_tensors="pt",
        padding=True,
        truncation=True,
    ).to(DEVICE)

    with torch.no_grad():
        text_emb = clip_model.get_text_features(**inputs)
        text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)

    return text_emb.cpu().numpy().astype("float32")


def get_image_embedding(image: Image.Image) -> np.ndarray:
    """
    Menghasilkan embedding CLIP dari gambar (1 x d).
    """
    inputs = clip_processor(
        text=None,
        images=image,
        return_tensors="pt",
        padding=True,
        truncation=True,
    ).to(DEVICE)

    with torch.no_grad():
        img_emb = clip_model.get_image_features(**inputs)
        img_emb = img_emb / img_emb.norm(dim=-1, keepdim=True)

    return img_emb.cpu().numpy().astype("float32")


def search_faiss(embedding: np.ndarray, top_k: int = 5):
    """
    Mencari tetangga terdekat di FAISS index.
    Return: distances, indices
    """
    if faiss_index is None:
        raise RuntimeError("FAISS index belum dimuat. Pastikan file index tersedia.")

    distances, indices = faiss_index.search(embedding, top_k)
    return distances[0], indices[0]


def build_context_from_indices(indices: np.ndarray) -> str:
    """
    Menggabungkan informasi metadata dari item yang didapat menjadi satu context string
    untuk dimasukkan ke model T5.
    Struktur metadata disesuaikan dengan metadata kamu.
    Misal: display_name, category, description.
    """
    # Jika metadata berupa DataFrame
    if isinstance(metadata, pd.DataFrame):
        rows = metadata.iloc[indices]
        context_parts = []
        for _, row in rows.iterrows():
            part = f"Name: {row.get('display_name', '')}. Category: {row.get('category', '')}. Description: {row.get('description', '')}."
            context_parts.append(part)
        context = "\n".join(context_parts)
    # Jika metadata list of dict
    elif isinstance(metadata, list):
        context_parts = []
        for idx in indices:
            item = metadata[int(idx)]
            part = f"Name: {item.get('display_name', '')}. Category: {item.get('category', '')}. Description: {item.get('description', '')}."
            context_parts.append(part)
        context = "\n".join(context_parts)
    else:
        context = ""

    return context


def generate_rag_description(user_query: str, context: str, max_new_tokens: int = 128) -> str:
    """
    Menghasilkan teks rekomendasi / ringkasan menggunakan Flan-T5
    berdasarkan query user dan context dari hasil retrieval.
    """
    prompt = (
        "You are a fashion recommendation assistant. "
        "Given the user query and some product descriptions, "
        "write a short recommendation in Indonesian that explains the style and match.\n\n"
        f"User query: {user_query}\n\n"
        f"Relevant products:\n{context}\n\n"
        "Recommendation:"
    )

    inputs = t5_tokenizer(prompt, return_tensors="pt", truncation=True).to(DEVICE)

    with torch.no_grad():
        outputs = t5_model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            num_beams=4,
            early_stopping=True,
        )

    text = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
    return text.strip()


def build_response_items(indices: np.ndarray, distances: np.ndarray):
    """
    Menyusun list item hasil retrieval untuk dikirim ke frontend.
    Sesuaikan field dengan kebutuhan front-end kamu.
    """
    items = []

    # Kalau metadata DataFrame
    if isinstance(metadata, pd.DataFrame):
        for idx, dist in zip(indices, distances):
            row = metadata.iloc[int(idx)]
            items.append(
                {
                    "idx": int(idx),
                    "score": float(dist),
                    "image_path": row.get("image_path", ""),
                    "display_name": row.get("display_name", ""),
                    "category": row.get("category", ""),
                    "description": row.get("description", ""),
                }
            )
    # Kalau metadata list of dict
    elif isinstance(metadata, list):
        for idx, dist in zip(indices, distances):
            item = metadata[int(idx)]
            items.append(
                {
                    "idx": int(idx),
                    "score": float(dist),
                    "image_path": item.get("image_path", ""),
                    "display_name": item.get("display_name", ""),
                    "category": item.get("category", ""),
                    "description": item.get("description", ""),
                }
            )

    return items


# ============================
# REQUEST / RESPONSE MODELS
# ============================

class TextSearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResultItem(BaseModel):
    idx: int
    score: float
    image_path: Optional[str] = None
    display_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    rag_text: Optional[str] = None


# ============================
# ROUTES
# ============================

@app.get("/")
def root():
    return {"message": "Fashion RAG API is running"}


@app.post("/search/text", response_model=SearchResponse)
def search_by_text(req: TextSearchRequest):
    # 1. Embed teks
    emb = get_text_embedding(req.query)

    # 2. Cari di FAISS
    distances, indices = search_faiss(emb, top_k=req.top_k)

    # 3. Build context untuk RAG
    context = build_context_from_indices(indices)

    # 4. Generate teks rekomendasi
    rag_text = generate_rag_description(req.query, context)

    # 5. Build list hasil
    items = build_response_items(indices, distances)

    return SearchResponse(
        query=req.query,
        results=[SearchResultItem(**item) for item in items],
        rag_text=rag_text,
    )


@app.post("/search/image", response_model=SearchResponse)
async def search_by_image(
    file: UploadFile = File(...),
    top_k: int = 5,
):
    # 1. Baca file gambar ke PIL
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # 2. Embed gambar
    emb = get_image_embedding(image)

    # 3. Cari di FAISS
    distances, indices = search_faiss(emb, top_k=top_k)

    # 4. Build context untuk RAG
    context = build_context_from_indices(indices)

    # 5. Generate teks rekomendasi
    rag_text = generate_rag_description("Pencarian berdasarkan gambar", context)

    # 6. Build list hasil
    items = build_response_items(indices, distances)

    return SearchResponse(
        query="image_query",
        results=[SearchResultItem(**item) for item in items],
        rag_text=rag_text,
    )

@app.get("/image/{idx}")
def get_image(idx: int):
    """
    Mengembalikan file gambar berdasarkan index hasil retrieval.
    FE bisa pakai <img src="http://localhost:8000/image/1320" />
    """
    if metadata is None:
        raise RuntimeError("Metadata belum dimuat.")

    # metadata bisa DataFrame atau list
    if isinstance(metadata, pd.DataFrame):
        if idx < 0 or idx >= len(metadata):
            return {"error": "Index di luar jangkauan"}
        row = metadata.iloc[idx]
        image_path = row.get("image_path", "")
    elif isinstance(metadata, list):
        if idx < 0 or idx >= len(metadata):
            return {"error": "Index di luar jangkauan"}
        image_path = metadata[idx].get("image_path", "")
    else:
        return {"error": "Tipe metadata tidak didukung"}

    if not image_path or not os.path.exists(image_path):
        return {"error": f"Gambar tidak ditemukan untuk idx={idx}"}

    img = Image.open(image_path).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/jpeg")
