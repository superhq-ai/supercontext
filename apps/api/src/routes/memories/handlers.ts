import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db";
import { apiKeyToSpace, memoryAccessLog } from "@/db/schema";
import { getUserId } from "@/lib/get-user-id";
import { getSpaceWithAccess, listSpacesForUser } from "../spaces/services";
import {
	createMemory,
	deleteMemory,
	getMemory,
	getMemoryLogs,
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

	if (apiKey) {
		const [keyToSpace] = await db
			.select()
			.from(apiKeyToSpace)
			.where(
				and(
					eq(apiKeyToSpace.apiKeyId, apiKey.id),
					eq(apiKeyToSpace.spaceId, spaceId),
				),
			)
			.limit(1);
		if (keyToSpace) {
			return true;
		}
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

	if (memory.spaces && memory.spaces.length > 0 && memory.spaces[0] !== null) {
		for (const space of memory.spaces) {
			console.log("Checking access for space:", space);
			if (!(await checkSpaceAccess(c, space.id))) {
				throw new HTTPException(403, { message: "Forbidden" });
			}
		}
	}

	// Log memory access for API key
	const apiKey = c.get("apiKey");
	if (apiKey) {
		await db
			.insert(memoryAccessLog)
			.values({ memoryId, apiKeyId: apiKey.id })
			.execute();
	}
	return c.json(memory);
}

export async function handleListMemories(c: Context) {
	let spaceId = c.req.queries("spaceId") || [];
	const userId = getUserId(c);

	if (spaceId.length === 0) {
		const userSpaces = await listSpacesForUser(userId);
		spaceId = userSpaces.map((s) => s.id);
	}
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
	const apiKey = c.get("apiKey");
	if (apiKey && result.memories) {
		for (const memory of result.memories) {
			await db
				.insert(memoryAccessLog)
				.values({ memoryId: memory.id, apiKeyId: apiKey.id })
				.execute();
		}
	}
	return c.json(result);
}

export async function handleSearchMemories(c: Context) {
	const body = await c.req.json();
	const parse = searchMemoriesSchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	let spaceIds = parse.data.spaceId;
	if (spaceIds.length === 0) {
		const userId = getUserId(c);
		const userSpaces = await listSpacesForUser(userId);
		spaceIds = userSpaces.map((s) => s.id);
	}

	for (const spaceId of spaceIds) {
		const hasAccess = await checkSpaceAccess(c, spaceId);
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}

	const result = await searchMemories({
		query: parse.data.query,
		spaceIds: spaceIds,
		limit: parse.data.limit,
		offset: parse.data.offset,
	});
	const apiKey = c.get("apiKey");
	if (apiKey && result) {
		for (const memory of result.results) {
			await db
				.insert(memoryAccessLog)
				.values({ memoryId: memory.id, apiKeyId: apiKey.id })
				.execute();
		}
	}
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

export async function handleGetMemoryLogs(c: Context) {
	const memoryId = c.req.param("memoryId");
	const limit = parseInt(c.req.query("limit") || "10");
	const offset = parseInt(c.req.query("offset") || "0");

	// verify access as in GET memory
	const memory = await getMemory(memoryId);
	if (!memory) throw new HTTPException(404, { message: "Memory not found" });
	if (memory.spaces && memory.spaces.length > 0 && memory.spaces[0] !== null) {
		let hasAccess = false;
		for (const space of memory.spaces) {
			if (await checkSpaceAccess(c, space.id)) {
				hasAccess = true;
				break;
			}
		}
		if (!hasAccess) {
			throw new HTTPException(403, { message: "Forbidden" });
		}
	}
	const logs = await getMemoryLogs({ memoryId, limit, offset });
	return c.json(logs);
}
