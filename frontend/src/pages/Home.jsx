import { useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import TabPills from "../components/TabPills";
import MangaRowCard from "../components/MangaRowCard";
import { mangas } from "../services/fakeData";

export default function Home() {
  const [tab, setTab] = useState("ongoing");

  const list = useMemo(() => mangas.filter((m) => m.status === tab), [tab]);

  return (
    <div style={styles.page}>
      <TopBar />

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <div style={styles.h1}>Popular</div>
          <TabPills value={tab} onChange={setTab} />
        </div>

        <div style={styles.list}>
          {list.map((m) => (
            <MangaRowCard key={m.id} manga={m} />
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#090a0c", color: "white" },
  main: { padding: 24, maxWidth: 1100, margin: "0 auto" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  h1: { fontSize: 22, fontWeight: 900 },
  list: { display: "flex", flexDirection: "column", gap: 14 },
};
