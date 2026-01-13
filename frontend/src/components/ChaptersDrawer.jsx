import { useNavigate, useParams } from "react-router-dom";

export default function ChaptersDrawer({ open, chapters, onClose }) {
  const navigate = useNavigate();
  const { mangaId } = useParams();

  if (!open) return null;

  return (
    <div
      style={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.drawer}>
        <div style={styles.header}>
          <div style={styles.title}>Chapters</div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.list}>
          {chapters.map((ch) => (
            <button
              key={ch.id}
              style={styles.item}
              onClick={() => {
                navigate(`/read/${mangaId}/${ch.id}`);
                onClose();
              }}
            >
              <div style={{ fontWeight: 600 }}>{ch.title}</div>
              <div style={styles.meta}>
                <span>{ch.pages} pgs</span>
                <span>{ch.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(0,0,0,0.25)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 40,
  },
  drawer: {
    width: 320,
    maxHeight: "calc(100vh - 80px)",
    background: "#0f1115",
    border: "1px solid #222",
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #222",
    display: "flex",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: 700 },
  close: {
    height: 32,
    width: 32,
    borderRadius: 10,
    border: "1px solid #222",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  list: {
    padding: 12,
    overflowY: "auto",
  },
  item: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    borderRadius: 14,
    border: "1px solid #222",
    background: "#111",
    color: "white",
    marginBottom: 10,
    cursor: "pointer",
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.6,
    display: "flex",
    justifyContent: "space-between",
  },
};
