import crypto from "node:crypto";
import { cosineDistance, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { memory, space } from "@/db/schema";
import { generateEmbedding } from "@/lib/embedding";

export type CreateMemoryInput = {
	content: string;
	spaceId: string;
	metadata?: object;
	userId: string;
	apiKeyId?: string;
};

export async function createMemory({
	content,
	spaceId,
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
			spaceId,
			metadata,
			userId,
			apiKeyId,
			embedding,
		})
		.returning();

	return created;
}

export async function getMemory(memoryId: string) {
	const [found] = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			createdAt: memory.createdAt,
			space: {
				id: space.id,
				name: space.name,
			},
		})
		.from(memory)
		.leftJoin(space, eq(memory.spaceId, space.id))
		.where(eq(memory.id, memoryId))
		.limit(1);
	return found;
}

export async function listMemories({
	spaceIds,
	limit = 50,
	offset = 0,
	sortOrder = "desc",
}: {
	spaceIds: string[];
	limit?: number;
	offset?: number;
	sortOrder?: "asc" | "desc";
}) {
	const query = db.select().from(memory);
	const totalQuery = db.select({ count: sql<number>`count(*)` }).from(memory);

	if (spaceIds.length > 0) {
		query.where(inArray(memory.spaceId, spaceIds));
		totalQuery.where(inArray(memory.spaceId, spaceIds));
	}

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
	limit?: number;
	offset?: number;
};

export async function searchMemories({
	query,
	spaceIds,
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
		conditions.push(inArray(memory.spaceId, spaceIds));
	}

	const results = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			createdAt: memory.createdAt,
			spaceId: memory.spaceId,
			similarity,
		})
		.from(memory)
		.where(sql.join(conditions, sql.raw(" AND ")))
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
