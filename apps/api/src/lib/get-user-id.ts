import type { Context } from "hono";

// A helper to get the userId from the user or API key
export function getUserId(c: Context): string {
	const user = c.get("user");
	const apiKey = c.get("apiKey");

	if (user) {
		return user.id;
	}

	return apiKey.userId;
}
