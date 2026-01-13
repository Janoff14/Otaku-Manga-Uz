import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import "../styles/mangaInfo.css";
import { loadMangaManifest } from "../services/manifest";
import { mangaAsset } from "../services/mangaUrl";

export default function MangaInfo() {
  const { mangaId } = useParams();
  const [manga, setManga] = useState(null);

  useEffect(() => {
    loadMangaManifest(mangaId).then(setManga).catch(console.error);
  }, [mangaId]);

  if (!manga) return <div className="mangaInfoPage"><TopBar /></div>;

  return (
    <div className="mangaInfoPage">
      <TopBar />

      <main className="mangaInfoMain">
        <section className="mangaInfoHero">
          <div className="mangaCoverWrap">
            <img
              className="mangaCoverImg"
              src={mangaAsset(`manga/${manga.id}/${manga.chapters[0].id}/001.png`)}
              alt=""
            />
            <div className="mangaCoverFallback" />
          </div>

          <div className="mangaMeta">
            <h1>{manga.title}</h1>

            <div className="mangaTags">
              {manga.tags.map((t) => (
                <span key={t} className="mangaTag">{t}</span>
              ))}
            </div>

            <p className="mangaDesc">{manga.description}</p>

            <div className="mangaActions">
              <Link
                className="mangaBtn mangaBtnLink"
                to={`/read/${manga.id}/${manga.chapters[0].id}`}
              >
                Read Chapter 1
              </Link>
            </div>
          </div>
        </section>

        <section className="chapterSection">
          <div className="chapterHeader">Chapters</div>

          <div className="chapterList">
            {manga.chapters.map((ch) => (
              <Link
                key={ch.id}
                className="chapterRow"
                to={`/read/${manga.id}/${ch.id}`}
              >
                <div className="chapterTitle">{ch.title}</div>
                <div className="chapterRight">{ch.date}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
