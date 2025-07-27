import type { Context, Next } from "hono";
import type { AppVariables, ProtectedAppVariables } from "@/types";

export const requireAuth = async (
	c: Context<{ Variables: AppVariables }>,
	next: Next,
) => {
	const session = c.get("session");
	const user = c.get("user");
	if (!session || !user) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	(c as Context<{ Variables: ProtectedAppVariables }>).set("user", user);
	(c as Context<{ Variables: ProtectedAppVariables }>).set("session", session);
	await next();
};
