import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const requireAdmin = createMiddleware(async (c, next) => {
	const user = c.get("user");

	if (!user || user.role !== "admin") {
		throw new HTTPException(403, {
			message: "Forbidden: Admin access required",
		});
	}

	await next();
});
