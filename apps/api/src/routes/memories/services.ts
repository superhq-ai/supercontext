import crypto from "node:crypto";
import { cosineDistance, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	memoriesToSpaces,
	memory,
	memoryAccessLog,
	space,
	userSpace,
} from "@/db/schema";
import { generateEmbedding } from "@/lib/embedding";

export type CreateMemoryInput = {
	content: string;
	spaceIds: string[];
	metadata?: object;
	userId: string;
	apiKeyId?: string;
};

export async function createMemory({
	content,
	spaceIds,
	metadata,
	userId,
	apiKeyId,
}: CreateMemoryInput) {
	const embedding = await generateEmbedding(content);
	const id = crypto.randomUUID();

	console.log(embedding);

	const [created] = await db
		.insert(memory)
		.values({
			id,
			content,
			metadata,
			userId,
			apiKeyId,
			embedding,
		})
		.returning();

	if (spaceIds.length > 0) {
		await db.insert(memoriesToSpaces).values(
			spaceIds.map((spaceId) => ({
				memoryId: id,
				spaceId,
			})),
		);
	}

	return created;
}

export async function getMemory(memoryId: string) {
	const [found] = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			createdAt: memory.createdAt,
			userId: memory.userId,
			spaces: sql<{ id: string; name: string }[]>`
			COALESCE(
				json_agg(
					json_build_object('id', ${space.id}, 'name', ${space.name})
				) FILTER (WHERE ${space.id} IS NOT NULL),
				'[]'::json
			)
		`,
		})
		.from(memory)
		.leftJoin(memoriesToSpaces, eq(memory.id, memoriesToSpaces.memoryId))
		.leftJoin(space, eq(memoriesToSpaces.spaceId, space.id))
		.where(eq(memory.id, memoryId))
		.groupBy(memory.id)
		.limit(1);

	return found;
}

export async function listMemories({
	spaceIds,
	userId,
	isAdmin = false,
	limit = 50,
	offset = 0,
	sortOrder = "desc",
}: {
	spaceIds: string[];
	userId?: string;
	isAdmin?: boolean;
	limit?: number;
	offset?: number;
	sortOrder?: "asc" | "desc";
}) {
	const query = db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			createdAt: memory.createdAt,
			userId: memory.userId,
			spaces: sql<{ id: string; name: string }[]>`
			COALESCE(
				json_agg(
					json_build_object('id', ${space.id}, 'name', ${space.name})
				) FILTER (WHERE ${space.id} IS NOT NULL),
				'[]'::json
			)
		`,
		})
		.from(memory)
		.leftJoin(memoriesToSpaces, eq(memory.id, memoriesToSpaces.memoryId))
		.leftJoin(space, eq(memoriesToSpaces.spaceId, space.id));

	const totalQuery = db.select({ count: sql<number>`count(*)` }).from(memory);
	
	if (spaceIds.length > 0) {
		const subquery = db
			.select({ memoryId: memoriesToSpaces.memoryId })
			.from(memoriesToSpaces)
			.where(inArray(memoriesToSpaces.spaceId, spaceIds));
		query.where(inArray(memory.id, subquery));
		totalQuery.where(inArray(memory.id, subquery));
	} else if (userId && !isAdmin) {
		const userSpaces = db
			.select({ spaceId: userSpace.spaceId })
			.from(userSpace)
			.where(eq(userSpace.userId, userId));

		const memoriesInUserSpaces = db
			.select({ memoryId: memoriesToSpaces.memoryId })
			.from(memoriesToSpaces)
			.where(inArray(memoriesToSpaces.spaceId, userSpaces));

		const condition = or(
			eq(memory.userId, userId),
			inArray(memory.id, memoriesInUserSpaces),
		);

		query.where(condition);
		totalQuery.where(condition);
	}

	query.groupBy(memory.id);

	if (sortOrder) {
		query.orderBy(
			sortOrder === "asc" ? memory.createdAt : desc(memory.createdAt),
		);
	}

	const memories = await query.limit(limit).offset(offset);
	const total = await totalQuery;

	return {
		memories,
		pagination: {
			limit,
			offset,
			total: total[0]?.count || 0,
		},
	};
}

export type SearchMemoriesInput = {
	query: string;
	spaceIds: string[];
	userId?: string;
	isAdmin?: boolean;
	limit?: number;
	offset?: number;
};

export async function searchMemories({
	query,
	spaceIds,
	userId,
	isAdmin = false,
	limit = 10,
	offset = 0,
}: SearchMemoriesInput) {
	const queryEmbedding = await generateEmbedding(query);
	const similarity = sql<number>`1 - (${cosineDistance(
		memory.embedding,
		queryEmbedding,
	)})`;

	const conditions = [gt(similarity, 0.5)];
	if (spaceIds.length > 0) {
		const subquery = db
			.select({ memoryId: memoriesToSpaces.memoryId })
			.from(memoriesToSpaces)
			.where(inArray(memoriesToSpaces.spaceId, spaceIds));
		conditions.push(inArray(memory.id, subquery));
	} else if (userId && !isAdmin) {
		const userSpaces = db
			.select({ spaceId: userSpace.spaceId })
			.from(userSpace)
			.where(eq(userSpace.userId, userId));

		const memoriesInUserSpaces = db
			.select({ memoryId: memoriesToSpaces.memoryId })
			.from(memoriesToSpaces)
			.where(inArray(memoriesToSpaces.spaceId, userSpaces));

		const condition = or(
			eq(memory.userId, userId),
			inArray(memory.id, memoriesInUserSpaces),
		);

		if (condition) {
			conditions.push(condition);
		}
	}

	const results = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			createdAt: memory.createdAt,
			similarity,
			spaces: sql<{ id: string; name: string }[]>`
			COALESCE(
				json_agg(
					json_build_object('id', ${space.id}, 'name', ${space.name})
				) FILTER (WHERE ${space.id} IS NOT NULL),
				'[]'::json
			)
		`,
		})
		.from(memory)
		.leftJoin(memoriesToSpaces, eq(memory.id, memoriesToSpaces.memoryId))
		.leftJoin(space, eq(memoriesToSpaces.spaceId, space.id))
		.where(sql.join(conditions, sql.raw(" AND ")))
		.groupBy(memory.id, similarity)
		.orderBy((t) => desc(t.similarity))
		.limit(limit)
		.offset(offset);

	const total = await db
		.select({ count: sql<number>`count(*)` })
		.from(memory)
		.where(sql.join(conditions, sql.raw(" AND ")));

	return {
		results,
		pagination: {
			limit,
			offset,
			total: total[0]?.count || 0,
		},
	};
}

export type UpdateMemoryInput = {
	memoryId: string;
	content?: string;
	metadata?: object;
};

export async function deleteMemory(memoryId: string) {
	const result = await db
		.delete(memory)
		.where(eq(memory.id, memoryId))
		.execute();
	return !!result?.rowCount;
}

export async function getMemoryLogs({
	memoryId,
	limit = 10,
	offset = 0,
}: {
	memoryId: string;
	limit?: number;
	offset?: number;
}) {
	const logsQuery = db
		.select({
			id: memoryAccessLog.id,
			apiKeyId: memoryAccessLog.apiKeyId,
			accessedAt: memoryAccessLog.accessedAt,
		})
		.from(memoryAccessLog)
		.where(eq(memoryAccessLog.memoryId, memoryId))
		.orderBy(desc(memoryAccessLog.accessedAt))
		.limit(limit)
		.offset(offset);

	const totalQuery = db
		.select({ count: sql<number>`count(*)` })
		.from(memoryAccessLog)
		.where(eq(memoryAccessLog.memoryId, memoryId));

	const [logs, total] = await Promise.all([logsQuery, totalQuery]);

	return {
		logs,
		pagination: {
			limit,
			offset,
			total: total[0]?.count || 0,
		},
	};
}
