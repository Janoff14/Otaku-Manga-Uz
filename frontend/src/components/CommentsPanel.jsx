export default function CommentsPanel({ open, onClose }) {
  if (!open) return null;

  const comments = Array.from({ length: 8 }, (_, i) => ({
    user: `User${i + 1}`,
    text: "Comment placeholder text.",
    time: "2h",
  }));

  return (
    <div
      style={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>Comments</div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        {/* Composer */}
        <div style={styles.composer}>
          <input style={styles.input} placeholder="Write a comment..." />
          <button style={styles.send}>Send</button>
        </div>

        {/* List */}
        <div style={styles.list}>
          {comments.map((c) => (
            <div key={c.user} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ fontWeight: 700 }}>{c.user}</div>
                <div style={{ opacity: 0.6, fontSize: 12 }}>{c.time}</div>
              </div>
              <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
                {c.text}
              </div>
            </div>
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
    zIndex: 70,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 70,
  },
  panel: {
    width: "min(980px, calc(100vw - 48px))",
    maxHeight: "calc(100vh - 120px)",
    background: "#0f1115",
    border: "1px solid #222",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  header: {
    padding: "16px 18px",
    borderBottom: "1px solid #222",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
  },
  close: {
    height: 32,
    width: 32,
    borderRadius: 10,
    border: "1px solid #222",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  composer: {
    padding: 16,
    borderBottom: "1px solid #222",
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    border: "1px solid #222",
    background: "#111",
    color: "white",
    padding: "0 12px",
    outline: "none",
  },
  send: {
    height: 34,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #222",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  list: {
    padding: 16,
    overflowY: "auto",
    maxHeight: "calc(100vh - 260px)",
  },
  card: {
    border: "1px solid #222",
    background: "#111",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
  },
};
