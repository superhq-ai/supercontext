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
import { createMemorySchema, searchMemoriesSchema } from "./validators";

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

	const hasAccess = await checkSpaceAccess(c, parse.data.spaceId);
	if (!hasAccess) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	const memory = await createMemory({ ...parse.data, userId });
	return c.json(memory, 201);
}

export async function handleGetMemory(c: Context) {
	const memoryId = c.req.param("memoryId");
	const memory = await getMemory(memoryId);
	if (!memory) {
		throw new HTTPException(404, { message: "Memory not found" });
	}

	const hasAccess = await checkSpaceAccess(c, memory.spaceId);
	if (!hasAccess) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	return c.json(memory);
}

export async function handleListMemories(c: Context) {
	const spaceId = c.req.query("spaceId");
	if (!spaceId) {
		return c.json({ error: "spaceId is required" }, 400);
	}

	const hasAccess = await checkSpaceAccess(c, spaceId);
	if (!hasAccess) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	const memories = await listMemories(spaceId);
	return c.json(memories);
}

export async function handleSearchMemories(c: Context) {
	const body = await c.req.json();
	const parse = searchMemoriesSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const hasAccess = await checkSpaceAccess(c, parse.data.spaceId);
	if (!hasAccess) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	const results = await searchMemories(parse.data);
	return c.json(results);
}

export async function handleDeleteMemory(c: Context) {
	const memoryId = c.req.param("memoryId");
	const memory = await getMemory(memoryId);
	if (!memory) {
		throw new HTTPException(404, { message: "Memory not found" });
	}

	const hasAccess = await checkSpaceAccess(c, memory.spaceId);
	if (!hasAccess) {
		throw new HTTPException(403, { message: "Forbidden" });
	}

	await deleteMemory(memoryId);
	return c.json({ success: true });
}
