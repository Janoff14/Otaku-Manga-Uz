import { API_BASE } from "../config";

export async function loadMangaManifest(mangaId) {
  const url = `${API_BASE}/manga/${mangaId}/manifest.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load manifest");
  return res.json();
}
