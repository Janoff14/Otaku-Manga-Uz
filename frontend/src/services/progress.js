import { API_BASE, getUserToken } from "../config";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-token": getUserToken(),
  };
}

export async function getProgress(mangaId) {
  const url = `${API_BASE}/api/v1/progress/${mangaId}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get progress");
  return res.json();
}

export async function saveProgress(mangaId, chapterId, pageIndex = 1) {
  const url = `${API_BASE}/api/v1/progress/`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ manga_id: mangaId, chapter_id: chapterId, page_index: pageIndex }),
  });
  if (!res.ok) throw new Error("Failed to save progress");
  return res.json();
}
