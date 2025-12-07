# generative_service.py

from typing import List


import numpy as np
import pandas as pd
import torch


from models import DEVICE, t5_tokenizer, t5_model, metadata


def build_context_from_indices(indices: np.ndarray) -> str:
    """
    Menggabungkan informasi metadata dari item yang didapat menjadi satu context string
    untuk dimasukkan ke model T5.
    """
    global metadata

    if metadata is None:
        return ""

    # Jika metadata berupa DataFrame
    if isinstance(metadata, pd.DataFrame):
        rows = metadata.iloc[indices]
        context_parts: List[str] = []
        for _, row in rows.iterrows():
            part = (
                f"Name: {row.get('display_name', '')}. "
                f"Category: {row.get('category', '')}. "
                f"Description: {row.get('description', '')}."
            )
            context_parts.append(part)
        context = "\n".join(context_parts)

    # Jika metadata list of dict
    elif isinstance(metadata, list):
        context_parts = []
        for idx in indices:
            item = metadata[int(idx)]
            part = (
                f"Name: {item.get('display_name', '')}. "
                f"Category: {item.get('category', '')}. "
                f"Description: {item.get('description', '')}."
            )
            context_parts.append(part)
        context = "\n".join(context_parts)
    else:
        context = ""

    return context


def generate_rag_description(
    user_query: str,
    context: str,
    max_new_tokens: int = 128,
) -> str:
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
