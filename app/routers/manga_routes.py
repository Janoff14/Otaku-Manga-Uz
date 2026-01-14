from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator
import re

from app.db.session import get_db
from app.db.models.manga_model import Manga, Comment
from app.schemas.manga_schema import MangaSummary, MangaDetail


# --- Comment Validation Constants ---
COMMENT_MIN_LENGTH = 2
COMMENT_MAX_LENGTH = 2000
URL_PATTERN = re.compile(
    r'(https?://|www\.|[a-zA-Z0-9-]+\.(com|org|net|io|co|dev|app|xyz|info|biz|me))',
    re.IGNORECASE
)


router = APIRouter(
    prefix="/api/v1/manga",
    tags=["manga"],
)


# --- Schemas for this router ---
class PaginatedMangaResponse(BaseModel):
    items: list[MangaSummary]
    total: int
    page: int
    page_size: int
    pages: int


class LikeResponse(BaseModel):
    like_count: int


class CommentCreate(BaseModel):
    user_name: str = "Anonymous"
    text: str
    # Honeypot field - if filled, likely a bot
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


# --- Endpoints ---
@router.get("/", response_model=PaginatedMangaResponse)
def list_manga(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Manga)

    if search:
        pattern = f"%{search}%"
        q = q.filter(
            or_(Manga.title.ilike(pattern), Manga.description.ilike(pattern))
        )

    total = q.count()
    pages = (total + page_size - 1) // page_size  # ceiling division

    items = q.order_by(Manga.id).offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedMangaResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{slug}", response_model=MangaDetail)
def get_manga(slug: str, db: Session = Depends(get_db)):
    manga = (
        db.query(Manga)
        .filter(Manga.slug == slug)
        .first()
    )
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")
    return manga


@router.post("/{slug}/like", response_model=LikeResponse)
def like_manga(slug: str, db: Session = Depends(get_db)):
    manga = db.query(Manga).filter(Manga.slug == slug).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")

    manga.like_count = (manga.like_count or 0) + 1
    db.commit()
    db.refresh(manga)

    return LikeResponse(like_count=manga.like_count)


@router.get("/{slug}/comments", response_model=list[CommentOut])
def get_manga_comments(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    manga = db.query(Manga).filter(Manga.slug == slug).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")

    comments = (
        db.query(Comment)
        .filter(Comment.manga_id == manga.id)
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return comments


@router.post("/{slug}/comments", response_model=CommentOut, status_code=201)
def create_manga_comment(
    slug: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
):
    # Honeypot check - if website field is filled, it's likely a bot
    # Silently reject but return a fake success to confuse bots
    if comment_data.website:
        fake_comment = Comment(
            id=0,
            manga_id=0,
            user_name=comment_data.user_name or "Anonymous",
            text=comment_data.text,
        )
        fake_comment.created_at = datetime.now()
        return fake_comment

    manga = db.query(Manga).filter(Manga.slug == slug).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")

    comment = Comment(
        manga_id=manga.id,
        user_name=comment_data.user_name or "Anonymous",
        text=comment_data.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment

