from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.manga_model import Manga, Chapter, Page
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/seed")
def seed_content(
    payload: dict,
    x_admin_key: str = Header(...),
    db: Session = Depends(get_db),
):
    if x_admin_key != settings.admin_seed_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    manga = Manga(**payload["manga"])
    db.add(manga)
    db.flush()

    chapter = Chapter(manga_id=manga.id, **payload["chapter"])
    db.add(chapter)
    db.flush()

    pages = [
        Page(chapter_id=chapter.id, index=i + 1, image_url=url)
        for i, url in enumerate(payload["pages"])
    ]
    db.add_all(pages)

    db.commit()
    return {"manga_id": manga.id, "chapter_id": chapter.id, "pages": len(pages)}
