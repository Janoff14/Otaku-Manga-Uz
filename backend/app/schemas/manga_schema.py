from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ChapterSummary(BaseModel):
    id: int
    number: int
    title: Optional[str] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # allow ORM -> schema


class MangaSummary(BaseModel):
    id: int
    slug: str
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None

    class Config:
        from_attributes = True


class MangaDetail(MangaSummary):
    chapters: List[ChapterSummary] = []
