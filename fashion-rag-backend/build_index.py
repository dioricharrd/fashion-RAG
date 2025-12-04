import os
import torch
import faiss
import numpy as np
import pandas as pd
from tqdm import tqdm
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import kagglehub
import pickle

# ============================
# CONFIG & DEVICE
# ============================

MAX_IMAGES = 20000          # limit seperti di notebook
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Using device: {DEVICE}")

# ============================
# STEP 1: DOWNLOAD & LOAD DATASET
# ============================

print("\n[1/4] Downloading Fashion Product Dataset from Kaggle...")

# Download dataset (otomatis ke cache kagglehub)
path = kagglehub.dataset_download(
    "nirmalsankalana/fashion-product-text-images-dataset"
)
print("Path to dataset files:", path)

# Cari CSV metadata
csv_files = [f for f in os.listdir(path) if f.endswith(".csv")]
if not csv_files:
    raise RuntimeError("CSV metadata tidak ditemukan di folder dataset.")

metadata_path = os.path.join(path, csv_files[0])
df = pd.read_csv(metadata_path)
print(f"Dataset loaded: {len(df)} products")
print("Dataset columns:", df.columns.tolist())
# Di PDF: ['image', 'description', 'display name', 'category'] :contentReference[oaicite:1]{index=1}

# ============================
# STEP 2: SIAPKAN PATH GAMBAR + METADATA
# ============================

print("\n[2/4] Preparing image paths...")

# cari kolom gambar (image / path / filename)
image_col = None
for col in df.columns:
    if "image" in col.lower() or "path" in col.lower() or "filename" in col.lower():
        image_col = col
        break

if image_col is None:
    raise RuntimeError(f"Tidak menemukan kolom gambar. Kolom tersedia: {df.columns.tolist()}")

print(f"Using image column: {image_col}")


def get_full_image_path(img_name: str) -> str | None:
    """
    Cari path lengkap file gambar di bawah folder `path`.
    """
    # kalau sudah full path
    if os.path.exists(img_name):
        return img_name

    for root, dirs, files in os.walk(path):
        if img_name in files:
            return os.path.join(root, img_name)
    return None


valid_data = []
print("Validating image files...")
for idx, row in tqdm(df.iterrows(), total=len(df)):
    img_name = str(row[image_col])
    img_path = get_full_image_path(img_name)

    if img_path and os.path.exists(img_path):
        # standarisasi metadata ke format yang dipakai backend
        row_dict = row.to_dict()
        valid_data.append(
            {
                "image_path": img_path,
                "display_name": row_dict.get("display name", ""),   # dari CSV :contentReference[oaicite:2]{index=2}
                "category": row_dict.get("category", ""),
                "description": row_dict.get("description", ""),
            }
        )

    if len(valid_data) >= MAX_IMAGES:
        break

print(f"Valid images found: {len(valid_data)}")
if len(valid_data) == 0:
    raise RuntimeError("No valid images found. Cek struktur dataset.")

print("Sample image path:", valid_data[0]["image_path"])

# ============================
# STEP 3: LOAD CLIP & EXTRACT EMBEDDINGS
# ============================

print("\n[3/4] Loading CLIP model...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model.eval()
print("CLIP model loaded successfully!")

print("\n[4/4] Extracting image embeddings...")

def extract_image_embedding(image_path: str) -> np.ndarray | None:
    try:
        image = Image.open(image_path).convert("RGB")
        inputs = clip_processor(images=image, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            image_features = clip_model.get_image_features(**inputs)
            # normalisasi untuk cosine similarity
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        return image_features.cpu().numpy().flatten()
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None


embeddings = []
metadata_list = []

print(f"Processing {len(valid_data)} images...")
for item in tqdm(valid_data):
    emb = extract_image_embedding(item["image_path"])
    if emb is not None:
        embeddings.append(emb)
        metadata_list.append(item)

embeddings = np.array(embeddings).astype("float32")
print(f"\nEmbeddings extracted: {len(embeddings)}")
print(f"Embeddings shape: {embeddings.shape}")

if embeddings.ndim != 2 or embeddings.shape[0] == 0:
    raise RuntimeError("Embeddings array is empty or invalid.")

# ============================
# BUILD FAISS INDEX & SAVE
# ============================

print("\n[5/4] Building FAISS index and saving files...")

d = embeddings.shape[1]
index = faiss.IndexFlatIP(d)

# pastikan ter-normalisasi
faiss.normalize_L2(embeddings)
index.add(embeddings)

print(f"FAISS index built with {index.ntotal} vectors")

# simpan index dan metadata
faiss.write_index(index, "fashion_product.index")
with open("fashion_metadata.pkl", "wb") as f:
    pickle.dump(metadata_list, f)

print("✅ Index saved as: fashion_product.index")
print("✅ Metadata saved as: fashion_metadata.pkl")
print("\nDone. Sekarang backend FastAPI bisa pakai index ini.")
