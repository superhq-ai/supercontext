import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createUser, getAllUsers, updateUserProfile } from "./services";
import {
	adminUpdateUserSchema,
	createUserSchema,
	paginationSchema,
} from "./validators";

export async function handleGetAllUsers(c: Context) {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new HTTPException(403, { message: "Forbidden" });
	}
	const { page, limit } = paginationSchema.parse(c.req.query());
	const { users, total } = await getAllUsers({ page, limit });
	return c.json({
		users,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
	});
}

export async function handleCreateUser(c: Context) {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new HTTPException(403, { message: "Forbidden" });
	}
	const body = await c.req.json();
	const parse = createUserSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}
	const newUser = await createUser(parse.data);
	return c.json(newUser, 201);
}

export async function handleUpdateUser(c: Context) {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new HTTPException(403, { message: "Forbidden" });
	}
	const userId = c.req.param("id");
	const body = await c.req.json();
	const parse = adminUpdateUserSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}
	const updated = await updateUserProfile({ id: userId, ...parse.data });
	if (!updated) {
		throw new HTTPException(404, { message: "User not found" });
	}
	return c.json(updated);
}
