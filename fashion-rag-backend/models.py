import os
import pickle
import logging

import torch
import faiss
import pandas as pd
import numpy as np
from PIL import Image

# transformers imports
from transformers import (
    CLIPModel,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    AutoProcessor,         # fallback apabila CLIPProcessor tidak tersedia
)

# coba import CLIPProcessor (beberapa model pakai AutoProcessor instead)
try:
    from transformers import CLIPProcessor  # type: ignore
except Exception:
    CLIPProcessor = None  # type: ignore

from config import INDEX_PATH, METADATA_PATH, CLIP_MODEL_NAME, T5_MODEL_NAME

# ============================
# DEVICE
# ============================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# set up module logger
logging.basicConfig()
logger = logging.getLogger(__name__)
logger.info("[models] Using device: %s", DEVICE)

# ============================
# LOAD CLIP (retrieval)
# ============================
print(f"[models] Loading CLIP model: {CLIP_MODEL_NAME} ...")
clip_model = CLIPModel.from_pretrained(CLIP_MODEL_NAME).to(DEVICE)

# Prefer CLIPProcessor if available for standard CLIP models, otherwise AutoProcessor
if CLIPProcessor is not None:
    try:
        clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)
        print("[models] Loaded CLIPProcessor.")
    except Exception as e:
        logger.warning("[models] CLIPProcessor.from_pretrained failed: %s. Trying AutoProcessor.", e)
        clip_processor = AutoProcessor.from_pretrained(CLIP_MODEL_NAME)
        logger.info("[models] Loaded AutoProcessor as fallback.")
else:
    clip_processor = AutoProcessor.from_pretrained(CLIP_MODEL_NAME)
    print("[models] CLIPProcessor not available in transformers, using AutoProcessor.")

# ============================
# LOAD T5 (generatif)
# ============================
print(f"[models] Loading generative model: {T5_MODEL_NAME} ...")
t5_tokenizer = AutoTokenizer.from_pretrained(T5_MODEL_NAME)
t5_model = AutoModelForSeq2SeqLM.from_pretrained(T5_MODEL_NAME).to(DEVICE)

# ============================
# LOAD FAISS & METADATA
# ============================
if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
    print("[models] Loading FAISS index and metadata...")
    faiss_index = faiss.read_index(INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)
    # compute metadata text embeddings (if possible) for reranking text searches
    metadata_text_embeddings = None
    try:
        texts = []
        if isinstance(metadata, pd.DataFrame):
            # combine display name + description for richer text
            for _, row in metadata.iterrows():
                texts.append(f"{row.get('display_name','')} {row.get('description','')}")
        elif isinstance(metadata, list):
            for item in metadata:
                texts.append(f"{item.get('display_name','')} {item.get('description','')}")

        if texts:
            batch_size = 64
            emb_batches = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                inputs = clip_processor(text=batch, images=None, return_tensors="pt", padding=True, truncation=True).to(DEVICE)
                with torch.no_grad():
                    t_emb = clip_model.get_text_features(**inputs)
                    t_emb = t_emb / t_emb.norm(dim=-1, keepdim=True)
                emb_batches.append(t_emb.cpu().numpy())
            if emb_batches:
                metadata_text_embeddings = np.vstack(emb_batches).astype("float32")
                print(f"[models] metadata_text_embeddings shape: {metadata_text_embeddings.shape}")
    except Exception as e:
        logger.warning("[models] Failed to compute metadata text embeddings: %s", e)
        metadata_text_embeddings = None
    # print small summary of metadata format
    if isinstance(metadata, pd.DataFrame):
        print(f"[models] metadata: pandas.DataFrame, n_items={len(metadata)}")
    elif isinstance(metadata, list):
        print(f"[models] metadata: list, n_items={len(metadata)}")
    else:
        print(f"[models] metadata: {type(metadata)}")
else:
    logger.warning("[models] Index / metadata file not found. Search endpoint will fail.")
    faiss_index = None
    metadata = None

# ============================
# SANITY CHECK (cek shape embedding)
# ============================
def _sanity_check_clip(show_output: bool = True):
    """
    Jalankan sekali untuk melihat shape embedding teks & gambar.
    Berguna untuk mengetahui apakah dim berubah (harus rebuild index).
    """
    try:
        # cek text embedding
        text_inputs = clip_processor(text=["test"], images=None, return_tensors="pt", padding=True).to(DEVICE)
        with torch.no_grad():
            text_emb = clip_model.get_text_features(**text_inputs)
        text_shape = tuple(text_emb.shape)

        # cek image embedding (dummy white image)
        img = Image.new("RGB", (224, 224), color=(255, 255, 255))
        img_inputs = clip_processor(images=img, return_tensors="pt", padding=True).to(DEVICE)
        with torch.no_grad():
            img_emb = clip_model.get_image_features(**img_inputs)
        img_shape = tuple(img_emb.shape)

        # projection dim (feature dim)
        feat_dim = text_shape[-1] if len(text_shape) >= 2 else None

        if show_output:
            print(f"[models] CLIP text embedding shape: {text_shape}")
            print(f"[models] CLIP image embedding shape: {img_shape}")
            print(f"[models] CLIP embedding dim: {feat_dim}")

        return {"text_shape": text_shape, "image_shape": img_shape, "feat_dim": feat_dim}
    except Exception as e:
        logger.warning("[models] Sanity check failed: %s", e)
        return None

# Jalankan sanity check saat import (akan print ukuran embedding)
_clip_info = _sanity_check_clip()

# Jika index ada, cek dim konsistensi dengan index
if faiss_index is not None and _clip_info is not None:
    try:
        index_d = faiss_index.d
        clip_d = _clip_info.get("feat_dim")
        if clip_d is not None and index_d != clip_d:
            logger.warning(
                "[models] DIM MISMATCH: FAISS index dim=%s != CLIP embedding dim=%s. "
                "Jika benar berbeda, kamu harus rebuild FAISS index dengan model baru.",
                index_d,
                clip_d,
            )
    except Exception as e:
        logger.warning("[models] Gagal membaca dim indeks FAISS: %s", e)

# expose useful names from module
__all__ = [
    "DEVICE",
    "clip_model",
    "clip_processor",
    "t5_tokenizer",
    "t5_model",
    "faiss_index",
    "metadata",
]
