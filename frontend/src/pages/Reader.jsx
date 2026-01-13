import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChapterPages } from "../services/localChapter";

import ChaptersDrawer from "../components/ChaptersDrawer";
import CommentsPanel from "../components/CommentsPanel";
import MenuOverlay from "../components/MenuOverlay";

// Keep this list consistent with your available local chapters.
// pages value should match real page count for each chapter.
const chapters = [
  { id: "ch1", title: "Chapter 1", pages: 17, date: "Jan 2026" },
  { id: "ch2", title: "Chapter 2", pages: 19, date: "Jan 2026" },
  { id: "ch3", title: "Chapter 3", pages: 21, date: "Jan 2026" },
];

export default function Reader() {
  const { mangaId, chapter } = useParams();
  const navigate = useNavigate();

  const [activeOverlay, setActiveOverlay] = useState(null);
  // null | "chapters" | "comments" | "menu"
  const [chromeVisible, setChromeVisible] = useState(true);

  const currentIndex = chapters.findIndex((c) => c.id === chapter);
  const prev = chapters[currentIndex - 1] || null;
  const next = chapters[currentIndex + 1] || null;

  // Match your local file format
  const EXT = "png";
  const PAGE_COUNT = chapters[currentIndex]?.pages ?? 1;

  const pages = useMemo(() => {
    return getChapterPages(mangaId, chapter, PAGE_COUNT, EXT);
  }, [mangaId, chapter, PAGE_COUNT]);

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setActiveOverlay(null);
      if (e.key === "ArrowLeft" && prev) navigate(`/read/${mangaId}/${prev.id}`);
      if (e.key === "ArrowRight" && next) navigate(`/read/${mangaId}/${next.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mangaId, prev, next, navigate]);

  // Tap zones + swipe support
  const touch = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startT: 0,
  });

  const closeOverlays = () => {
    if (activeOverlay) setActiveOverlay(null);
  };

  const goPrev = () => {
    if (prev) navigate(`/read/${mangaId}/${prev.id}`);
  };

  const goNext = () => {
    if (next) navigate(`/read/${mangaId}/${next.id}`);
  };

  const onPointerDown = (e) => {
    // If overlay open, any tap closes it (matches prototype feel)
    if (activeOverlay) {
      setActiveOverlay(null);
      return;
    }

    // record for swipe
    touch.current.active = true;
    touch.current.startX = e.clientX ?? 0;
    touch.current.startY = e.clientY ?? 0;
    touch.current.startT = Date.now();
  };

  const onPointerUp = (e) => {
    if (!touch.current.active) return;
    touch.current.active = false;

    const endX = e.clientX ?? 0;
    const endY = e.clientY ?? 0;

    const dx = endX - touch.current.startX;
    const dy = endY - touch.current.startY;
    const dt = Date.now() - touch.current.startT;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // SWIPE: horizontal swipe with enough distance, not mostly vertical
    // thresholds tuned to feel right on phones
    const SWIPE_MIN = 60;
    const SWIPE_MAX_TIME = 600;

    if (absX >= SWIPE_MIN && absX > absY * 1.2 && dt <= SWIPE_MAX_TIME) {
      if (dx < 0) {
        // swipe left => next
        goNext();
      } else {
        // swipe right => prev
        goPrev();
      }
      return;
    }

    // TAP ZONES (only if it's not a swipe)
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = endX - rect.left;
    const w = rect.width;

    const leftZone = w * 0.30;
    const rightZoneStart = w * 0.70;

    if (x <= leftZone) {
      goPrev();
      return;
    }
    if (x >= rightZoneStart) {
      goNext();
      return;
    }

    // center tap toggles chrome
    setChromeVisible((v) => !v);
  };

  return (
    <div style={styles.page}>
      {/* Hamburger (chrome) */}
      {chromeVisible && (
        <div style={styles.topLeft}>
          <button style={styles.iconBtn} onClick={() => setActiveOverlay("menu")}>
            ☰
          </button>
        </div>
      )}

      {/* Pages scroll area: supports pointer gestures */}
      <div
        style={styles.scroll}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (touch.current.active = false)}
        onMouseDown={closeOverlays}
      >
        <div style={styles.pageFrame}>
          {pages.map((src) => (
            <img
              key={src}
              src={src}
              loading="lazy"
              style={styles.img}
              alt=""
              draggable={false}
              onError={(e) => {
                // hide broken images (for partial uploads)
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom controls (chrome) */}
      {chromeVisible && (
        <>
          <div style={styles.bottomLeft}>
            <button style={styles.pill} onClick={() => setActiveOverlay("chapters")}>
              ☰ Chapters
            </button>
            <button style={styles.pill} onClick={() => setActiveOverlay("comments")}>
              💬 Comments
            </button>
          </div>

          <div style={styles.bottomRight}>
            <button style={styles.pill} disabled={!prev} onClick={goPrev}>
              ◀ Prev
            </button>
            <button style={styles.pill} disabled={!next} onClick={goNext}>
              Next ▶
            </button>
          </div>
        </>
      )}

      {/* Overlays */}
      <MenuOverlay open={activeOverlay === "menu"} onClose={() => setActiveOverlay(null)} />
      <ChaptersDrawer open={activeOverlay === "chapters"} chapters={chapters} onClose={() => setActiveOverlay(null)} />
      <CommentsPanel open={activeOverlay === "comments"} onClose={() => setActiveOverlay(null)} />
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#090a0c",
    color: "white",
    position: "relative",
    overflow: "hidden",
    touchAction: "pan-y", // allow vertical scroll; we handle horizontal swipe
  },
  topLeft: {
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 30,
  },
  iconBtn: {
    height: 34,
    width: 34,
    borderRadius: 12,
    border: "1px solid #222",
    background: "#0f1115",
    color: "white",
    cursor: "pointer",
    fontSize: 16,
  },
  scroll: {
    position: "absolute",
    inset: 0,
    overflowY: "auto",
    padding: "80px 16px 80px",
  },
  pageFrame: {
    maxWidth: 860,
    margin: "0 auto",
    borderRadius: 18,
    border: "1px solid #222",
    background: "#0f1115",
    padding: 14,
  },
  img: {
    width: "100%",
    display: "block",
    borderRadius: 12,
    marginBottom: 10,
    background: "#0b0d11",
    userSelect: "none",
  },
  bottomLeft: {
    position: "fixed",
    left: 16,
    bottom: 16,
    display: "flex",
    gap: 10,
    zIndex: 30,
  },
  bottomRight: {
    position: "fixed",
    right: 16,
    bottom: 16,
    display: "flex",
    gap: 10,
    zIndex: 30,
  },
  pill: {
    height: 34,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #222",
    background: "#0f1115",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    opacity: 0.95,
  },
};
