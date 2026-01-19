import { API_BASE } from "../config";

export async function getMangaDetail(slug) {
  const url = `${API_BASE}/api/v1/manga/${slug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch manga detail");
  return res.json();
}

export async function getChapterDetail(id) {
  const url = `${API_BASE}/api/v1/chapters/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch chapter detail");
  return res.json();
}
