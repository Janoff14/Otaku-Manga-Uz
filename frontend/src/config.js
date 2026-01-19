
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function getUserToken() {
	let token = localStorage.getItem("user_token");
	if (!token) {
		token = crypto.randomUUID();
		localStorage.setItem("user_token", token);
	}
	return token;
}
