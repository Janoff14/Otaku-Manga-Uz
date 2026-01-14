from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import List, Optional
import re

from app.db.session import get_db
from app.db.models.manga_model import Chapter, Page, Comment


# --- Comment Validation Constants ---
COMMENT_MIN_LENGTH = 2
COMMENT_MAX_LENGTH = 2000
# URL pattern to detect links
URL_PATTERN = re.compile(
    r'(https?://|www\.|[a-zA-Z0-9-]+\.(com|org|net|io|co|dev|app|xyz|info|biz|me))',
    re.IGNORECASE
)


# --- Schemas ---
class PageOut(BaseModel):
    id: int
    index: int
    image_url: str

    class Config:
        from_attributes = True


class ChapterDetailOut(BaseModel):
    id: int
    number: int
    title: str | None
    pages: List[PageOut]

    class Config:
        from_attributes = True


class ChapterNav(BaseModel):
    id: int
    number: int
    title: str | None

    class Config:
        from_attributes = True


class LikeResponse(BaseModel):
    like_count: int


class CommentCreate(BaseModel):
    user_name: str = "Anonymous"
    text: str
    # Honeypot field - if this is filled, the request is likely a bot
    website: Optional[str] = None

    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = v.strip()
        if len(v) < COMMENT_MIN_LENGTH:
            raise ValueError(f'Comment must be at least {COMMENT_MIN_LENGTH} characters')
        if len(v) > COMMENT_MAX_LENGTH:
            raise ValueError(f'Comment must not exceed {COMMENT_MAX_LENGTH} characters')
        if URL_PATTERN.search(v):
            raise ValueError('Links are not allowed in comments')
        return v

    @field_validator('user_name')
    @classmethod
    def validate_user_name(cls, v: str) -> str:
        v = v.strip() if v else "Anonymous"
        if len(v) > 50:
            raise ValueError('Username must not exceed 50 characters')
        if URL_PATTERN.search(v):
            raise ValueError('Links are not allowed in username')
        return v if v else "Anonymous"


class CommentOut(BaseModel):
    id: int
    user_name: str
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


router = APIRouter(prefix="/api/v1/chapters", tags=["chapters"])


@router.get("/{chapter_id}", response_model=ChapterDetailOut)
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = (
        db.query(Chapter)
        .filter(Chapter.id == chapter_id)
        .first()
    )
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


@router.post("/{chapter_id}/like", response_model=LikeResponse)
def like_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    chapter.like_count = (chapter.like_count or 0) + 1
    db.commit()
    db.refresh(chapter)

    return LikeResponse(like_count=chapter.like_count)


@router.get("/{chapter_id}/next", response_model=Optional[ChapterNav])
def get_next_chapter(chapter_id: int, db: Session = Depends(get_db)):
    current = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not current:
        raise HTTPException(status_code=404, detail="Chapter not found")

    next_ch = (
        db.query(Chapter)
        .filter(
            Chapter.manga_id == current.manga_id,
            Chapter.number > current.number
        )
        .order_by(Chapter.number.asc())
        .first()
    )

    if not next_ch:
        return None
    return next_ch


@router.get("/{chapter_id}/prev", response_model=Optional[ChapterNav])
def get_prev_chapter(chapter_id: int, db: Session = Depends(get_db)):
    current = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not current:
        raise HTTPException(status_code=404, detail="Chapter not found")

    prev_ch = (
        db.query(Chapter)
        .filter(
            Chapter.manga_id == current.manga_id,
            Chapter.number < current.number
        )
        .order_by(Chapter.number.desc())
        .first()
    )

    if not prev_ch:
        return None
    return prev_ch


@router.get("/{chapter_id}/comments", response_model=list[CommentOut])
def get_chapter_comments(
    chapter_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    comments = (
        db.query(Comment)
        .filter(Comment.chapter_id == chapter_id)
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return comments


@router.post("/{chapter_id}/comments", response_model=CommentOut, status_code=201)
def create_chapter_comment(
    chapter_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
):
    # Honeypot check - if website field is filled, it's likely a bot
    # Silently reject but return a fake success to confuse bots
    if comment_data.website:
        # Return a fake comment response to confuse bots
        fake_comment = Comment(
            id=0,
            chapter_id=chapter_id,
            user_name=comment_data.user_name or "Anonymous",
            text=comment_data.text,
        )
        fake_comment.created_at = datetime.now()
        return fake_comment

    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    comment = Comment(
        chapter_id=chapter_id,
        user_name=comment_data.user_name or "Anonymous",
        text=comment_data.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment

