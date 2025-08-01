import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCurrentUser, updateUserProfile } from "./services";
import { updateUserSchema } from "./validators";

export async function handleGetCurrentUser(c: Context) {
	const user = c.get("user");
	if (!user) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	const result = await getCurrentUser(user.id);
	if (!result) {
		throw new HTTPException(404, { message: "User not found" });
	}
	return c.json(result);
}

export async function handleUpdateCurrentUser(c: Context) {
	const user = c.get("user");
	if (!user) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	const body = await c.req.json();
	const parse = updateUserSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}
	try {
		const updated = await updateUserProfile({ id: user.id, ...parse.data });
		if (!updated) {
			throw new HTTPException(404, { message: "User not found" });
		}
		return c.json(updated);
	} catch (err) {
		if (err instanceof Error) {
			return c.json({ error: err.message }, 400);
		}
		return c.json({ error: "An unknown error occurred" }, 500);
	}
}
