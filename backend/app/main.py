from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db, engine, SessionLocal
from app.db.base import Base
import app.db.models  # noqa: F401

from app.db.models.manga_model import Manga, Chapter, Page
from app.routers import manga_routes, chapter_routes, progress_routes, admin_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(Manga).count() == 0:
            demo = Manga(
                slug="demo-manga",
                title="Demo Manga",
                description="Placeholder manga for frontend dev.",
                cover_url="https://placehold.co/300x450",
                status="ongoing",
            )
            db.add(demo)
            db.flush()

            ch1 = Chapter(manga_id=demo.id, number=1, title="Chapter 1")
            ch2 = Chapter(manga_id=demo.id, number=2, title="Chapter 2")
            db.add_all([ch1, ch2])
            db.flush()

            # Add demo pages for each chapter
            for ch in [ch1, ch2]:
                for i in range(1, 6):
                    page = Page(
                        chapter_id=ch.id,
                        index=i,
                        image_url=f"https://placehold.co/800x1200?text=Ch{ch.number}+Page{i}"
                    )
                    db.add(page)

            db.commit()
    finally:
        db.close()

    yield  # App runs here


app = FastAPI(title="Otaku Manga API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for launch week
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-health")
def db_health(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar()
    return {"db": "ok" if result == 1 else "bad"}


app.include_router(manga_routes.router)
app.include_router(chapter_routes.router)
app.include_router(progress_routes.router)
app.include_router(admin_routes.router)
