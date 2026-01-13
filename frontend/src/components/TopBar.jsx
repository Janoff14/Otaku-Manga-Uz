import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <header style={styles.bar}>
      <div style={styles.left}>
        <div style={styles.logoDot} />
        <Link to="/" style={styles.brand}>
          Otaku Manga Uz
        </Link>
      </div>

      <div style={styles.center}>
        <div style={styles.searchWrap}>
          <div style={styles.searchIcon} />
          <input style={styles.search} placeholder="Search manga..." />
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.profileBtn}>👤 Profile</button>
      </div>
    </header>
  );
}

const styles = {
  bar: {
    height: 64,
    padding: "0 18px",
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    alignItems: "center",
    borderBottom: "1px solid #222",
    background: "linear-gradient(to bottom, #141821, #0f1115)",
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  logoDot: { width: 26, height: 26, borderRadius: 8, background: "#4b88ff" },
  brand: { color: "white", textDecoration: "none", fontWeight: 700 },
  center: { display: "flex", justifyContent: "center" },
  searchWrap: {
    width: "min(720px, 100%)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    height: 42,
    borderRadius: 14,
    border: "1px solid #222",
    background: "#0d0f13",
  },
  searchIcon: { width: 14, height: 14, borderRadius: 4, background: "#444" },
  search: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "white",
    fontSize: 13,
  },
  right: { display: "flex", justifyContent: "flex-end" },
  profileBtn: {
    height: 34,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid #222",
    background: "#0f1115",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
  },
};
