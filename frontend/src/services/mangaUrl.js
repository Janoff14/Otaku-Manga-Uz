import { MANGA_BASE_URL } from "../config";

export function mangaAsset(path) {
  const prefix = MANGA_BASE_URL ? `${MANGA_BASE_URL}` : "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${clean}`;
}
