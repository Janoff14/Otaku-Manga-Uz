export default function MenuOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      style={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.panel}>
        <div style={styles.topRow}>
          <div style={styles.brand}>Otaku Manga Uz</div>
          <button style={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.links}>
          <a style={styles.link} href="#about" onClick={(e) => e.preventDefault()}>
            About Us
          </a>
          <a style={styles.link} href="#socials" onClick={(e) => e.preventDefault()}>
            Our socials
          </a>
          <a style={styles.link} href="#contact" onClick={(e) => e.preventDefault()}>
            Contact Us
          </a>
        </div>

        <div style={styles.footer}>© 2026 Otaku Manga Uz</div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 80,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 18,
  },
  panel: {
    width: "min(420px, calc(100vw - 32px))",
    height: "calc(100vh - 36px)",
    background: "#0f1115",
    border: "1px solid #222",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    position: "relative",
  },
  topRow: {
    height: 56,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(to bottom, #141821, #0f1115)",
  },
  brand: {
    fontWeight: 700,
    color: "white",
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
  divider: {
    height: 1,
    background: "#222",
  },
  links: {
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  link: {
    color: "white",
    textDecoration: "underline",
    fontSize: 18,
    fontWeight: 600,
    width: "fit-content",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 18,
    opacity: 0.35,
    fontSize: 12,
  },
};
