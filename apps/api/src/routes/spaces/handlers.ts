import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { User } from "@/types";

import {
	addUserToSpace,
	createSpace,
	deleteSpace,
	getSpaceWithAccess,
	listSpacesForUser,
	removeUserFromSpace,
	updateSpace,
} from "./services";
import {
	addUserToSpaceSchema,
	createSpaceSchema,
	updateSpaceSchema,
} from "./validators";

export async function handleCreateSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const body = await c.req.json();
	const parse = createSpaceSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const space = await createSpace({ ...parse.data, createdBy: user.id });
	return c.json(space, 201);
}

export async function handleGetSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const spaceId = c.req.param("spaceId");
	const space = await getSpaceWithAccess({ spaceId, userId: user.id });
	if (!space)
		throw new HTTPException(404, {
			message: "Space not found or access denied",
		});
	return c.json(space);
}

export async function handleListSpaces(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });
	const spaces = await listSpacesForUser(user.id);
	return c.json(spaces);
}

function hasManagePermission(user: User, spaceCreatedBy: string) {
	return user.role === "admin" || user.id === spaceCreatedBy;
}

export async function handleUpdateSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const spaceId = c.req.param("spaceId");
	const existing = await getSpaceWithAccess({ spaceId, userId: user.id });
	if (!existing)
		throw new HTTPException(404, {
			message: "Space not found or access denied",
		});

	if (!hasManagePermission(user, existing.createdBy)) {
		throw new HTTPException(403, {
			message: "Forbidden: not space owner or admin",
		});
	}

	const body = await c.req.json();
	const parse = updateSpaceSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const updated = await updateSpace({ spaceId, ...parse.data });
	if (!updated) throw new HTTPException(404, { message: "Space not found" });
	return c.json(updated);
}

export async function handleDeleteSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const spaceId = c.req.param("spaceId");
	const existing = await getSpaceWithAccess({ spaceId, userId: user.id });
	if (!existing)
		throw new HTTPException(404, {
			message: "Space not found or access denied",
		});

	if (!hasManagePermission(user, existing.createdBy)) {
		throw new HTTPException(403, {
			message: "Forbidden: not space owner or admin",
		});
	}

	const success = await deleteSpace({ spaceId });
	if (!success) {
		throw new HTTPException(404, { message: "Space not found" });
	}
	return c.json({ success });
}

export async function handleAddUserToSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const spaceId = c.req.param("spaceId");
	const existing = await getSpaceWithAccess({ spaceId, userId: user.id });
	if (!existing)
		throw new HTTPException(404, {
			message: "Space not found or access denied",
		});

	if (!hasManagePermission(user, existing.createdBy)) {
		throw new HTTPException(403, {
			message: "Forbidden: not space owner or admin",
		});
	}

	const body = await c.req.json();
	const parse = addUserToSpaceSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const success = await addUserToSpace({
		spaceId,
		userIdToAdd: parse.data.userId,
	});
	return c.json({ success });
}

export async function handleRemoveUserFromSpace(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const spaceId = c.req.param("spaceId");
	const userId = c.req.param("userId");
	const existing = await getSpaceWithAccess({ spaceId, userId: user.id });
	if (!existing)
		throw new HTTPException(404, {
			message: "Space not found or access denied",
		});

	if (!hasManagePermission(user, existing.createdBy)) {
		throw new HTTPException(403, {
			message: "Forbidden: not space owner or admin",
		});
	}

	const success = await removeUserFromSpace({
		spaceId,
		userIdToRemove: userId,
	});
	return c.json({ success });
}
