# routes.py

import io
import numpy as np
from fastapi import APIRouter, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from PIL import Image

from schemas import TextSearchRequest, SearchResponse, SearchResultItem

from retrieval_service import (
    get_text_embedding,
    get_image_embedding,
    search_faiss,
    search_text_rerank,
    merge_search_results,
    build_response_items,
    get_image_bytes_by_idx,
)
from generative_service import (
    build_context_from_indices,
    generate_rag_description,
)
from pollinations_service import (
    generate_recommendation_via_pollinations,
)

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Fashion RAG API is running"}


@router.post("/search/text", response_model=SearchResponse)
def search_by_text(req: TextSearchRequest):
    # === RETRIEVAL PART ===
    emb = get_text_embedding(req.query)
    distances, indices = search_text_rerank(emb, top_k=req.top_k)
    items = build_response_items(indices, distances)

    # === GENERATIVE (RAG) PART - Using Pollinations.ai ===
    context = build_context_from_indices(indices)
    rag_text = generate_recommendation_via_pollinations(req.query, context)

    return SearchResponse(
        query=req.query,
        results=[SearchResultItem(**item) for item in items],
        rag_text=rag_text,
    )


@router.post("/search/image", response_model=SearchResponse)
async def search_by_image(
    file: UploadFile = File(...),
    top_k: int = 5,
):
    # === RETRIEVAL PART ===
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    emb = get_image_embedding(image)
    distances, indices = search_faiss(emb, top_k=top_k)
    items = build_response_items(indices, distances)

    # === GENERATIVE (RAG) PART - Using Pollinations.ai ===
    context = build_context_from_indices(indices)
    rag_text = generate_recommendation_via_pollinations("image-based search", context)

    return SearchResponse(
        query="image_query",
        results=[SearchResultItem(**item) for item in items],
        rag_text=rag_text,
    )


@router.post("/search/ai", response_model=SearchResponse)
async def search_by_ai(
    request: Request,
    file: UploadFile = File(None),
    query: str = None,
    top_k: int = 5,
    text_weight: float = 0.5,
):
    """
    Hybrid AI search: combines both text and image search results.
    Pass either a query string, an image file, or both.
    text_weight: how much to weight text results (0.0-1.0, default 0.5)
    Returns merged results ranked by combined score.
    Uses Pollinations.ai for recommendation generation.
    """
    # If client sent JSON body (application/json), try to extract `query` from it
    if query is None:
        try:
            body = await request.json()
            if isinstance(body, dict) and "query" in body:
                query = body.get("query")
                # also allow top_k in body
                if "top_k" in body:
                    try:
                        top_k = int(body.get("top_k"))
                    except Exception:
                        pass
        except Exception:
            # not JSON or empty body — ignore
            pass

    # Check that at least one input is provided
    if file is None and (query is None or str(query).strip() == ""):
        return SearchResponse(
            query="",
            results=[],
            rag_text="Please provide either a search query or an image.",
        )

    # === RETRIEVAL PART ===
    text_distances = np.array([], dtype="float32")
    text_indices = np.array([], dtype="int64")
    image_distances = np.array([], dtype="float32")
    image_indices = np.array([], dtype="int64")
    combined_query = query or "image search"

    # Text search if query provided
    if query and query.strip():
        emb_text = get_text_embedding(query)
        text_distances, text_indices = search_text_rerank(emb_text, top_k=top_k)
        print(f"[search/ai] text results: n={len(text_indices)}")

    # Image search if file provided
    if file is not None:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        emb_image = get_image_embedding(image)
        image_distances, image_indices = search_faiss(emb_image, top_k=top_k)
        print(f"[search/ai] image results: n={len(image_indices)}")
        if query is None or query.strip() == "":
            combined_query = "image search"

    # Merge results
    distances, indices = merge_search_results(
        text_distances,
        text_indices,
        image_distances,
        image_indices,
        top_k=top_k,
        alpha=text_weight,
    )

    items = build_response_items(indices, distances)

    # === GENERATIVE (RAG) PART - Using Pollinations.ai ===
    context = build_context_from_indices(indices)
    rag_text = generate_recommendation_via_pollinations(combined_query, context)

    return SearchResponse(
        query=combined_query,
        results=[SearchResultItem(**item) for item in items],
        rag_text=rag_text,
    )


@router.get("/image/{idx}")
def get_image(idx: int):
    try:
        buf = get_image_bytes_by_idx(idx)
    except IndexError:
        return {"error": "Index di luar jangkauan"}
    except FileNotFoundError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Terjadi error: {e}"}

    return StreamingResponse(buf, media_type="image/jpeg")
