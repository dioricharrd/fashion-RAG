# retrieval_service.py

import io
import os
from typing import Tuple, List

import torch
import numpy as np
from PIL import Image
import pandas as pd

from models import DEVICE, clip_model, clip_processor, faiss_index, metadata


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


def search_faiss(embedding: np.ndarray, top_k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
    """
    Mencari tetangga terdekat di FAISS index.
    Return: distances, indices
    """
    if faiss_index is None:
        raise RuntimeError("FAISS index belum dimuat. Pastikan file index tersedia.")

    distances, indices = faiss_index.search(embedding, top_k)
    return distances[0], indices[0]


def build_response_items(indices: np.ndarray, distances: np.ndarray) -> List[dict]:
    """
    Menyusun list item hasil retrieval untuk dikirim ke frontend.
    """
    global metadata

    items: List[dict] = []

    if metadata is None:
        return items

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


def get_image_bytes_by_idx(idx: int) -> io.BytesIO:
    """
    Ambil gambar dari metadata berdasarkan idx dan kembalikan sebagai buffer bytes.
    Dipakai endpoint /image/{idx}.
    """
    global metadata

    if metadata is None:
        raise RuntimeError("Metadata belum dimuat.")

    # metadata bisa DataFrame atau list
    if isinstance(metadata, pd.DataFrame):
        if idx < 0 or idx >= len(metadata):
            raise IndexError("Index di luar jangkauan")
        row = metadata.iloc[idx]
        image_path = row.get("image_path", "")
    elif isinstance(metadata, list):
        if idx < 0 or idx >= len(metadata):
            raise IndexError("Index di luar jangkauan")
        image_path = metadata[idx].get("image_path", "")
    else:
        raise TypeError("Tipe metadata tidak didukung")

    if not image_path or not os.path.exists(image_path):
        raise FileNotFoundError(f"Gambar tidak ditemukan untuk idx={idx}")

    img = Image.open(image_path).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf
