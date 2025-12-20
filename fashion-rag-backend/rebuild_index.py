# rebuild_index.py
"""
Rebuild FAISS index using the CLIP model (e.g. jinaai/jina-clip-v1).
Reads metadata from METADATA_PATH (pickle) and expects an 'image_path' field
(or a column named 'image_path' if metadata is a DataFrame).
Saves FAISS index to INDEX_PATH and image embeddings to image_embeddings.npy.
"""

import os
import sys
import pickle
from typing import List
from pathlib import Path

import numpy as np
from tqdm import tqdm
from PIL import Image

import torch
import faiss

from transformers import (
    CLIPProcessor,
    CLIPModel,
    AutoProcessor,
    AutoModel,
)

# Try to import user config if present
try:
    import config as cfg
    INDEX_PATH = getattr(cfg, "INDEX_PATH", "fashion_product.index")
    METADATA_PATH = getattr(cfg, "METADATA_PATH", "fashion_metadata.pkl")
    CLIP_MODEL_NAME = getattr(cfg, "CLIP_MODEL_NAME", "jinaai/jina-clip-v1")
except Exception:
    # Fallback defaults
    INDEX_PATH = "fashion_product.index"
    METADATA_PATH = "fashion_metadata.pkl"
    CLIP_MODEL_NAME = "jinaai/jina-clip-v1"

# Device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[rebuild_index] Using device: {DEVICE}")
print(f"[rebuild_index] CLIP model: {CLIP_MODEL_NAME}")
print(f"[rebuild_index] METADATA_PATH: {METADATA_PATH}")
print(f"[rebuild_index] INDEX_PATH: {INDEX_PATH}")

# -------------------------
# Load metadata
# -------------------------
if not os.path.exists(METADATA_PATH):
    print(f"[ERROR] Metadata file not found: {METADATA_PATH}")
    sys.exit(1)

with open(METADATA_PATH, "rb") as f:
    metadata = pickle.load(f)

# Determine list of image paths from metadata
def extract_image_paths(metadata_obj) -> List[str]:
    if isinstance(metadata_obj, list):
        paths = []
        for item in metadata_obj:
            if isinstance(item, dict):
                paths.append(item.get("image_path", "") or "")
            else:
                # fallback: try attribute access
                paths.append(getattr(item, "image_path", "") or "")
        return paths
    try:
        # pandas DataFrame-like
        import pandas as pd
        if isinstance(metadata_obj, pd.DataFrame):
            if "image_path" in metadata_obj.columns:
                return metadata_obj["image_path"].astype(str).tolist()
            # try common column names
            for col in ["image", "image_path", "path", "img_path"]:
                if col in metadata_obj.columns:
                    return metadata_obj[col].astype(str).tolist()
    except Exception:
        pass

    raise RuntimeError("Unknown metadata format. Expect list[dict] or pandas.DataFrame with 'image_path' column.")

image_paths = extract_image_paths(metadata)
n_items = len(image_paths)
print(f"[rebuild_index] Found {n_items} image paths in metadata")

# -------------------------
# Load model & processor
# -------------------------
# We try to support both CLIPProcessor/CLIPModel and AutoProcessor/AutoModel variants gracefully.
processor = None
model = None

load_error = None
try:
    # Preferred: CLIP classes
    processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)
    model = CLIPModel.from_pretrained(CLIP_MODEL_NAME).to(DEVICE)
    print("[rebuild_index] Loaded CLIPProcessor + CLIPModel")
except Exception as e:
    load_error = e
    try:
        # Fallback: AutoProcessor & AutoModel
        processor = AutoProcessor.from_pretrained(CLIP_MODEL_NAME)
        model = AutoModel.from_pretrained(CLIP_MODEL_NAME).to(DEVICE)
        print("[rebuild_index] Loaded AutoProcessor + AutoModel (fallback)")
    except Exception as e2:
        print("[ERROR] Failed to load model/processor from transformers.")
        print("Primary error:", load_error)
        print("Fallback error:", e2)
        raise

# Quick sanity check to find image/text feature method names
def get_image_features_from_model(model_obj, processed_inputs):
    """
    Try common ways to obtain image features:
     - model.get_image_features(...)
     - model(**inputs).image_embeds or .last_hidden_state then pooled
    Returns torch.Tensor
    """
    # 1) direct method
    if hasattr(model_obj, "get_image_features"):
        return model_obj.get_image_features(**processed_inputs)
    # 2) call the model and try to find common attr
    out = model_obj(**processed_inputs)
    # look for common output names
    for attr in ["image_embeds", "last_hidden_state", "pooler_output"]:
        if hasattr(out, attr):
            return getattr(out, attr)
    # last_hidden_state as first tensor
    if isinstance(out, tuple) and len(out) > 0 and isinstance(out[0], torch.Tensor):
        return out[0]
    raise RuntimeError("Cannot extract image features from the model output. Please adapt this script for model outputs.")

# -------------------------
# Build embeddings
# -------------------------
emb_list = []
missing_count = 0

# We'll try to infer embedding dim by running one sample first
sample_emb = None
sample_shape = None

# define helper to process single image into tensor inputs for the model
def prepare_inputs_for_image(img_path: str):
    img = Image.open(img_path).convert("RGB")
    # processor can accept images directly
    inputs = processor(images=img, return_tensors="pt")
    # move tensors to device
    for k, v in inputs.items():
        if isinstance(v, torch.Tensor):
            inputs[k] = v.to(DEVICE)
    return inputs

print("[rebuild_index] Start embedding images...")
for p in tqdm(image_paths, desc="images"):
    if not p or (isinstance(p, str) and not os.path.exists(p)):
        # push zero vector placeholder for missing images (will be normalized later)
        emb_list.append(None)
        missing_count += 1
        continue
    try:
        inputs = prepare_inputs_for_image(p)
        with torch.no_grad():
            feats = get_image_features_from_model(model, inputs)
            # some outputs might be (batch, seq_len, dim) -> try to pool / mean
            if feats.dim() == 3:
                # mean pool over seq dim
                feats = feats.mean(dim=1)
            # ensure batch dim 1
            if feats.dim() == 2 and feats.shape[0] == 1:
                vec = feats[0]
            else:
                # if somehow multiple batch, take first
                vec = feats.detach().cpu()[0]
            # normalize to unit vector
            vec = vec / vec.norm(p=2)
            vec = vec.cpu().numpy().astype("float32")
            emb_list.append(vec)
            if sample_emb is None:
                sample_emb = vec
                sample_shape = vec.shape
    except Exception as e:
        print(f"[WARN] Failed to process image {p}: {e}")
        emb_list.append(None)
        missing_count += 1

if sample_emb is None:
    raise RuntimeError("No valid embeddings were created. Check that images are accessible and model/processors are correct.")

# Replace None placeholders with zero vectors (will be normalized to small non-zero)
d = sample_shape[0]
print(f"[rebuild_index] Embedding dimension detected: {d}")

emb_array = np.zeros((n_items, d), dtype="float32")
for i, v in enumerate(emb_list):
    if v is None:
        # small random vector instead of strict zeros to avoid degenerate norms
        vec = np.random.normal(scale=1e-6, size=(d,)).astype("float32")
        # normalize
        nrm = np.linalg.norm(vec)
        if nrm > 0:
            vec = vec / nrm
        emb_array[i] = vec
    else:
        emb_array[i] = v

print(f"[rebuild_index] Created embeddings array: {emb_array.shape}, missing images: {missing_count}")

# -------------------------
# Normalize (L2) for cosine via inner product
# -------------------------
faiss.normalize_L2(emb_array)

# -------------------------
# Build FAISS index (Inner Product)
# -------------------------
index = faiss.IndexFlatIP(d)
index.add(emb_array)
print(f"[rebuild_index] Added {index.ntotal} vectors to FAISS index (dim={d})")

# Ensure parent dir exists
idx_path = Path(INDEX_PATH)
if not idx_path.parent.exists():
    idx_path.parent.mkdir(parents=True, exist_ok=True)

faiss.write_index(index, INDEX_PATH)
print(f"[rebuild_index] Wrote index to: {INDEX_PATH}")

# Save embeddings (optional)
np.save("image_embeddings.npy", emb_array)
print("[rebuild_index] Saved image_embeddings.npy for debugging/analysis")

print("[rebuild_index] DONE.")
