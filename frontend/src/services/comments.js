import { API_BASE_URL, getUserToken } from "../config";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-token": getUserToken(),
  };
}

// Manga Comments
export async function getMangaComments(slug) {
  const url = `${API_BASE_URL}/api/v1/manga/${slug}/comments`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch manga comments");
  return res.json();
}

export async function postMangaComment(slug, text) {
  const url = `${API_BASE_URL}/api/v1/manga/${slug}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to post manga comment");
  return res.json();
}

// Chapter Comments
export async function getChapterComments(id) {
  const url = `${API_BASE_URL}/api/v1/chapters/${id}/comments`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch chapter comments");
  return res.json();
}

export async function postChapterComment(id, text) {
  const url = `${API_BASE_URL}/api/v1/chapters/${id}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to post chapter comment");
  return res.json();
}
