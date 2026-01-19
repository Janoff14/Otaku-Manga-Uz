
const normalize = (s) => (s || "").replace(/\/$/, "");

export const API_BASE_URL = normalize(import.meta.env.VITE_API_BASE_URL);
export const MANGA_BASE_URL = normalize(import.meta.env.VITE_MANGA_BASE_URL) || API_BASE_URL;

export function getUserToken() {
	let token = localStorage.getItem("user_token");
	if (!token) {
		token = crypto.randomUUID();
		localStorage.setItem("user_token", token);
	}
	return token;
}
