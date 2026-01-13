import { MANGA_BASE_URL } from "../config";

export function getChapterPages(mangaId, chapter, count, ext = "png") {
  const prefix = MANGA_BASE_URL ? `${MANGA_BASE_URL}` : "";
  const base = `${prefix}/manga/${mangaId}/${chapter}`;

  return Array.from({ length: count }, (_, i) => {
    const page = String(i + 1).padStart(3, "0");
    return `${base}/${page}.${ext}`;
  });
}
