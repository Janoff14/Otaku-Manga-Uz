export default function TabPills({ value, onChange }) {
  return (
    <div style={styles.wrap}>
      <button
        style={{ ...styles.pill, ...(value === "ongoing" ? styles.active : {}) }}
        onClick={() => onChange("ongoing")}
      >
        Ongoing
      </button>
      <button
        style={{ ...styles.pill, ...(value === "completed" ? styles.active : {}) }}
        onClick={() => onChange("completed")}
      >
        Completed
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", gap: 10 },
  pill: {
    height: 28,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid #222",
    background: "#0f1115",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: 12,
  },
  active: {
    color: "white",
    borderColor: "#2a2f3a",
    background: "#11151d",
  },
};
