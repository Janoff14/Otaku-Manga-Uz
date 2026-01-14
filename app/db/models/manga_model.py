from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class Manga(Base):
    __tablename__ = "manga"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String(512), nullable=True)
    status = Column(String(50), nullable=True)  # "ongoing" | "completed"
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    chapters = relationship("Chapter", back_populates="manga")
    comments = relationship("Comment", back_populates="manga")


class Chapter(Base):
    __tablename__ = "chapter"

    id = Column(Integer, primary_key=True, index=True)
    manga_id = Column(Integer, ForeignKey("manga.id"), nullable=False)
    number = Column(Integer, nullable=False)  # chapter number
    title = Column(String(255), nullable=True)
    like_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), default=utc_now)

    manga = relationship("Manga", back_populates="chapters")
    pages = relationship("Page", back_populates="chapter", order_by="Page.index")
    comments = relationship("Comment", back_populates="chapter")


class Page(Base):
    __tablename__ = "page"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapter.id"), nullable=False)
    index = Column(Integer, nullable=False)  # 1,2,3...
    image_url = Column(String(512), nullable=False)

    chapter = relationship("Chapter", back_populates="pages")


class Comment(Base):
    __tablename__ = "comment"

    id = Column(Integer, primary_key=True, index=True)
    manga_id = Column(Integer, ForeignKey("manga.id"), nullable=True)
    chapter_id = Column(Integer, ForeignKey("chapter.id"), nullable=True)
    user_name = Column(String(100), default="Anonymous")
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    manga = relationship("Manga", back_populates="comments")
    chapter = relationship("Chapter", back_populates="comments")


class ReadingProgress(Base):
    __tablename__ = "reading_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_token = Column(String(255), nullable=False, index=True)
    manga_id = Column(Integer, ForeignKey("manga.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapter.id"), nullable=False)
    page_index = Column(Integer, default=1)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

