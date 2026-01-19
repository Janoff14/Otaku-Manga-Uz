import { API_BASE } from "../config";

export async function loadCatalog() {
  const url = `${API_BASE}/manga/catalog.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load catalog");
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items;
}
