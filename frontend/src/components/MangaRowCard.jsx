import { Link } from "react-router-dom";

export default function MangaRowCard({ manga }) {
  return (
    <Link to={`/manga/${manga.id}`} style={styles.card}>
      <div style={styles.cover}>
        {manga.coverUrl ? (
          <img src={manga.coverUrl} alt="" style={styles.coverImg} />
        ) : (
          <div style={styles.coverFallback} />
        )}
      </div>

      <div style={styles.info}>
        <div style={styles.title}>{manga.title}</div>
        <div style={styles.meta}>
          {manga.genre} • {manga.tag}
        </div>
        <div style={styles.hook}>{manga.hook}</div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: "flex",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    border: "1px solid #222",
    background: "#0f1115",
    textDecoration: "none",
    color: "white",
  },
  cover: {
    width: 78,
    height: 78,
    borderRadius: 16,
    background: "#0b0d11",
    border: "1px solid #222",
    overflow: "hidden",
    flexShrink: 0,
  },
  coverImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  coverFallback: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #1a1f2a, #0b0d11)",
  },
  info: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  title: { fontWeight: 800, fontSize: 15 },
  meta: { opacity: 0.6, fontSize: 12 },
  hook: { opacity: 0.45, fontSize: 12, lineHeight: 1.35 },
};
