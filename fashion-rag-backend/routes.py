# routes.py

import io
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from PIL import Image

from schemas import TextSearchRequest, SearchResponse, SearchResultItem

from retrieval_service import (
    get_text_embedding,
    get_image_embedding,
    search_faiss,
    build_response_items,
    get_image_bytes_by_idx,
)
from generative_service import (
    build_context_from_indices,
    generate_rag_description,
)

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Fashion RAG API is running"}


@router.post("/search/text", response_model=SearchResponse)
def search_by_text(req: TextSearchRequest):
    # === RETRIEVAL PART ===
    emb = get_text_embedding(req.query)
    distances, indices = search_faiss(emb, top_k=req.top_k)
    items = build_response_items(indices, distances)

    # === GENERATIVE (RAG) PART ===
    context = build_context_from_indices(indices)
    rag_text = generate_rag_description(req.query, context)

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

    # === GENERATIVE (RAG) PART ===
    context = build_context_from_indices(indices)
    rag_text = generate_rag_description("Pencarian berdasarkan gambar", context)

    return SearchResponse(
        query="image_query",
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
