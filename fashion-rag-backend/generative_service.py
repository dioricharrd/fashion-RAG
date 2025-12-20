# generative_service.py

from typing import List

import re
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
    Output: ONE concise sentence describing the product match for the user query,
    without labels or prefixes.
    """
    # Build a smart prompt that asks the model to match the query with retrieved products
    # and generate a natural single-line recommendation
    prompt = (
        "You are a fashion stylist. Based on the user's search query and the relevant "
        "products found, write ONE concise single-line recommendation in English. "
        "Describe what the product is, why it matches the query, and key features. "
        "Do NOT include labels (Name:, Composition:, etc.), product names, or extra text. "
        "Example query: 'red hat' -> Output: 'Red baseball cap with adjustable strap and curved visor'\n\n"
        f"User search: {user_query}\n\n"
        f"Matching products:\n{context}\n\n"
        "Recommendation:"
    )

    inputs = t5_tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(DEVICE)

    with torch.no_grad():
        outputs = t5_model.generate(
            **inputs,
            max_new_tokens=min(max_new_tokens, 50),
            num_beams=4,
            temperature=0.7,
            early_stopping=True,
            do_sample=True,
        )

    text = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
    # keep only first line and clean it
    first_line = text.strip().splitlines()[0] if text else ""

    # remove common unwanted prefixes/labels
    cleaned = re.sub(
        r"^\s*(Composition:?\s*|Name:?\s*|Recommendation:?\s*|Output:?\s*)",
        "",
        first_line,
        flags=re.IGNORECASE
    ).strip()

    # ensure it doesn't start with extra symbols
    cleaned = re.sub(r"^[\s\-\*\.]+", "", cleaned).strip()

    if cleaned and len(cleaned) > 5:
        return cleaned

    # fallback: extract first product description and combine with query
    try:
        # extract top product info from context
        first_line_ctx = context.splitlines()[0] if context else ""
        # remove Name:, Category:, Description: labels
        first_line_ctx = re.sub(
            r"(Name:|Category:|Description:)\s*",
            "",
            first_line_ctx
        ).strip()
        
        if first_line_ctx:
            return first_line_ctx
    except Exception:
        pass

    return f"Perfect match for your '{user_query}' search" if user_query else "Recommended fashion item"
