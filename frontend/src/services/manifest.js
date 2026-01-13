import { MANGA_BASE_URL } from "../config";

export async function loadMangaManifest(mangaId) {
  const base = MANGA_BASE_URL ? `${MANGA_BASE_URL}` : "";
  const url = `${base}/manga/${mangaId}/manifest.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load manifest");
  return res.json();
}
