import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserId } from "@/lib/get-user-id";
import { getSpaceWithAccess } from "../spaces/services";
import {
	createMemory,
	deleteMemory,
	getMemory,
	listMemories,
	searchMemories,
} from "./services";
import {
	createMemorySchema,
	listMemoriesSchema,
	searchMemoriesSchema,
} from "./validators";

// A helper to check if the user or API key has access to the space
async function checkSpaceAccess(c: Context, spaceId: string) {
	const user = c.get("user");
	const apiKey = c.get("apiKey");

	if (user && user.role === "admin") {
		return true;
	}

	if (apiKey && apiKey.spaceId === spaceId) {
		return true;
	}

	if (!user) {
		return false;
	}

	const space = await getSpaceWithAccess({ spaceId, userId: user.id });
	return !!space;
}

export async function handleCreateMemory(c: Context) {
	const userId = getUserId(c);
	const body = await c.req.json();
	const parse = createMemorySchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	for (const spaceId of parse.data.spaceIds) {
		const hasAccess = await checkSpaceAccess(c, spaceId);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	const memory = await createMemory({
		content: parse.data.content,
		spaceIds: parse.data.spaceIds,
		metadata: parse.data.metadata,
		userId,
	});
	return c.json(memory, 201);
}

export async function handleGetMemory(c: Context) {
	const memoryId = c.req.param("memoryId");
	const memory = await getMemory(memoryId);
	if (!memory) {
		throw new HTTPException(404, { message: "Memory not found" });
	}

	if (!memory.spaces || memory.spaces.length === 0) {
		throw new HTTPException(404, { message: "Space not found for memory" });
	}
	for (const space of memory.spaces) {
		const hasAccess = await checkSpaceAccess(c, space.id);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	return c.json(memory);
}

export async function handleListMemories(c: Context) {
	const spaceId = c.req.queries("spaceId") || [];
	const limit = parseInt(c.req.query("limit") || "50");
	const offset = parseInt(c.req.query("offset") || "0");
	const sortOrder = c.req.query("sortOrder") || "desc";

	const parse = listMemoriesSchema.safeParse({
		spaceId,
		limit,
		offset,
		sortOrder,
	});
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	for (const spaceId of parse.data.spaceId) {
		const hasAccess = await checkSpaceAccess(c, spaceId);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	const result = await listMemories({
		spaceIds: parse.data.spaceId,
		limit: parse.data.limit,
		offset: parse.data.offset,
		sortOrder: parse.data.sortOrder,
	});
	return c.json(result);
}

export async function handleSearchMemories(c: Context) {
	const body = await c.req.json();
	const parse = searchMemoriesSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	for (const spaceId of parse.data.spaceId) {
		const hasAccess = await checkSpaceAccess(c, spaceId);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	const result = await searchMemories({
		query: parse.data.query,
		spaceIds: parse.data.spaceId,
		limit: parse.data.limit,
		offset: parse.data.offset,
	});
	return c.json(result);
}

export async function handleDeleteMemory(c: Context) {
	const memoryId = c.req.param("memoryId");
	const memory = await getMemory(memoryId);
	if (!memory) {
		throw new HTTPException(404, { message: "Memory not found" });
	}

	if (!memory.spaces || memory.spaces.length === 0) {
		throw new HTTPException(404, { message: "Space not found for memory" });
	}
	for (const space of memory.spaces) {
		const hasAccess = await checkSpaceAccess(c, space.id);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	await deleteMemory(memoryId);
	return c.json({ success: true });
}
