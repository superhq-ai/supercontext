import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {
	acceptInvite,
	createInvite,
	createUser,
	getAllUsers,
	getPendingInvites,
	getUserById,
	searchUsers,
	updateUserProfile,
} from "./services";
import {
	acceptInviteSchema,
	adminUpdateUserSchema,
	createInviteSchema,
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

export async function handleCreateInvite(c: Context) {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new HTTPException(403, { message: "Forbidden" });
	}
	const body = await c.req.json();
	const parse = createInviteSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}
	const { email, expiresInDays } = parse.data;
	const invite = await createInvite({
		email,
		invitedBy: user.id,
		expiresInDays,
	});
	return c.json(invite, 201);
}
export async function handleAcceptInvite(c: Context) {
	const body = await c.req.json();
	const parse = acceptInviteSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}
	const user = await acceptInvite(parse.data);
	return c.json(user, 201);
}

export async function handleGetPendingInvites(c: Context) {
	const user = c.get("user");
	if (!user || user.role !== "admin") {
		throw new HTTPException(403, { message: "Forbidden" });
	}
	const { page, limit } = paginationSchema.parse(c.req.query());
	const { invites, total } = await getPendingInvites({ page, limit });
	return c.json({
		invites,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
	});
}

export async function handleSearchUsers(c: Context) {
	const query = c.req.query("q");
	if (!query) {
		return c.json({ error: "Query parameter 'q' is required" }, 400);
	}

	const users = await searchUsers(query);
	return c.json(users);
}

export async function handleGetUser(c: Context) {
	const userId = c.req.param("id");
	const user = await getUserById(userId);
	if (!user) {
		throw new HTTPException(404, { message: "User not found" });
	}
	return c.json(user);
}
