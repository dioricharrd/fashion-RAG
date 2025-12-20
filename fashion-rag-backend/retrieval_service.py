# retrieval_service.py

import io
import os
from typing import Tuple, List

import torch
import numpy as np
from PIL import Image
import pandas as pd

from models import DEVICE, clip_model, clip_processor, faiss_index, metadata, metadata_text_embeddings


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


def search_text_rerank(
    query_embedding: np.ndarray,
    top_k: int = 5,
    alpha: float = 0.6,
    candidate_multiplier: int = 5,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Search by text embedding but rerank candidates by combining image similarity
    (from FAISS) and text similarity against product metadata texts.

    Returns combined_scores (higher is better) and indices.
    """
    if faiss_index is None:
        raise RuntimeError("FAISS index belum dimuat. Pastikan file index tersedia.")

    # get initial candidate set (increase k to allow reranking)
    cand_k = max(top_k * candidate_multiplier, top_k)
    image_sims, cand_indices = faiss_index.search(query_embedding, cand_k)
    image_sims = image_sims[0]
    cand_indices = cand_indices[0]

    # If we don't have metadata text embeddings, fallback to image sims
    if metadata_text_embeddings is None:
        # return top-k image sims
        return image_sims[:top_k], cand_indices[:top_k]

    # compute text similarity between query and metadata texts for candidates
    # metadata_text_embeddings shape: (N, d)
    # query_embedding shape: (1, d)
    # both should be normalized already
    cand_text_embs = metadata_text_embeddings[cand_indices]
    # dot product -> similarity
    text_sims = np.dot(cand_text_embs, query_embedding.reshape(-1)).astype("float32")

    # combine similarities (weighted)
    combined = alpha * image_sims + (1.0 - alpha) * text_sims

    # pick top_k from candidates by combined score
    order = np.argsort(-combined)
    top_order = order[:top_k]
    top_indices = cand_indices[top_order]
    top_scores = combined[top_order]

    return top_scores, top_indices


def merge_search_results(
    text_distances: np.ndarray,
    text_indices: np.ndarray,
    image_distances: np.ndarray,
    image_indices: np.ndarray,
    top_k: int = 5,
    alpha: float = 0.5,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Merge results from text search and image search by combining scores.
    alpha: weight for text score (1-alpha for image score)
    Returns combined_distances and merged_indices sorted by combined score.
    """
    # Create a dict to track all unique indices with their scores
    merged_scores = {}

    # handle empty cases: if one side is empty, return the other directly
    if (text_indices is None or len(text_indices) == 0) and (image_indices is not None and len(image_indices) > 0):
        return image_distances[:top_k], image_indices[:top_k]
    if (image_indices is None or len(image_indices) == 0) and (text_indices is not None and len(text_indices) > 0):
        return text_distances[:top_k], text_indices[:top_k]

    # Add text search results
    for idx, dist in zip(text_indices, text_distances):
        idx_int = int(idx)
        merged_scores[idx_int] = {"text_score": float(dist), "image_score": 0.0}

    # Add image search results
    for idx, dist in zip(image_indices, image_distances):
        idx_int = int(idx)
        if idx_int in merged_scores:
            merged_scores[idx_int]["image_score"] = float(dist)
        else:
            merged_scores[idx_int] = {"text_score": 0.0, "image_score": float(dist)}

    # Calculate combined score and sort
    combined = []
    for idx_int, scores in merged_scores.items():
        combined_score = (
            alpha * scores["text_score"] + (1.0 - alpha) * scores["image_score"]
        )
        combined.append((idx_int, combined_score))

    # Sort by combined score descending
    combined.sort(key=lambda x: x[1], reverse=True)

    # Take top_k
    top_combined = combined[:top_k]
    final_indices = np.array([x[0] for x in top_combined], dtype=np.int64)
    final_distances = np.array([x[1] for x in top_combined], dtype=np.float32)

    return final_distances, final_indices


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
