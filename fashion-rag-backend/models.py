# models.py

import os
import pickle

import torch
import faiss
import pandas as pd

from transformers import (
    CLIPProcessor,
    CLIPModel,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
)

from config import INDEX_PATH, METADATA_PATH, CLIP_MODEL_NAME, T5_MODEL_NAME

# ============================
# DEVICE
# ============================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {DEVICE}")

# ============================
# LOAD CLIP (retrieval)
# ============================

clip_model = CLIPModel.from_pretrained(CLIP_MODEL_NAME).to(DEVICE)
clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME)

# ============================
# LOAD T5 (generatif)
# ============================

t5_tokenizer = AutoTokenizer.from_pretrained(T5_MODEL_NAME)
t5_model = AutoModelForSeq2SeqLM.from_pretrained(T5_MODEL_NAME).to(DEVICE)

# ============================
# LOAD FAISS & METADATA
# ============================

if os.path.exists(INDEX_PATH) and os.path.exists(METADATA_PATH):
    print("Loading FAISS index and metadata...")
    faiss_index = faiss.read_index(INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)
else:
    print("WARNING: Index / metadata file not found. Search endpoint will fail.")
    faiss_index = None
    metadata = None
