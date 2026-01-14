from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.db.models.manga_model import ReadingProgress, Manga


# --- Schemas ---
class ProgressCreate(BaseModel):
    manga_id: int
    chapter_id: int
    page_index: int = 1


class ProgressOut(BaseModel):
    manga_id: int
    chapter_id: int
    page_index: int
    updated_at: datetime

    class Config:
        from_attributes = True


router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


def get_user_token(x_user_token: str = Header(default="anonymous")) -> str:
    """Extract user token from header. Frontend stores this in localStorage."""
    return x_user_token


@router.get("/{manga_id}", response_model=Optional[ProgressOut])
def get_progress(
    manga_id: int,
    user_token: str = Depends(get_user_token),
    db: Session = Depends(get_db),
):
    """Get reading progress for a manga."""
    progress = (
        db.query(ReadingProgress)
        .filter(
            ReadingProgress.user_token == user_token,
            ReadingProgress.manga_id == manga_id
        )
        .first()
    )

    if not progress:
        return None
    return progress


@router.post("/", response_model=ProgressOut, status_code=201)
def save_progress(
    data: ProgressCreate,
    user_token: str = Depends(get_user_token),
    db: Session = Depends(get_db),
):
    """Save or update reading progress. Upsert behavior."""
    # Check if manga exists
    manga = db.query(Manga).filter(Manga.id == data.manga_id).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")

    # Find existing progress
    progress = (
        db.query(ReadingProgress)
        .filter(
            ReadingProgress.user_token == user_token,
            ReadingProgress.manga_id == data.manga_id
        )
        .first()
    )

    if progress:
        # Update existing
        progress.chapter_id = data.chapter_id
        progress.page_index = data.page_index
    else:
        # Create new
        progress = ReadingProgress(
            user_token=user_token,
            manga_id=data.manga_id,
            chapter_id=data.chapter_id,
            page_index=data.page_index,
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)

    return progress


@router.delete("/{manga_id}", status_code=204)
def delete_progress(
    manga_id: int,
    user_token: str = Depends(get_user_token),
    db: Session = Depends(get_db),
):
    """Delete reading progress for a manga."""
    progress = (
        db.query(ReadingProgress)
        .filter(
            ReadingProgress.user_token == user_token,
            ReadingProgress.manga_id == manga_id
        )
        .first()
    )

    if progress:
        db.delete(progress)
        db.commit()

    return None

