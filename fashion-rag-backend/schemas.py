# schemas.py

from typing import List, Optional
from pydantic import BaseModel


class TextSearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResultItem(BaseModel):
    idx: int
    score: float
    image_path: Optional[str] = None
    display_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    rag_text: Optional[str] = None
