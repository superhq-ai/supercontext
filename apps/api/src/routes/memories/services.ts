import crypto from "node:crypto";
import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { memory } from "@/db/schema";
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
		.select()
		.from(memory)
		.where(eq(memory.id, memoryId))
		.limit(1);
	return found;
}

export async function listMemories(spaceId: string) {
	return db.select().from(memory).where(eq(memory.spaceId, spaceId));
}

export type SearchMemoriesInput = {
	query: string;
	spaceId: string;
	limit?: number;
};

export async function searchMemories({
	query,
	spaceId,
	limit = 10,
}: SearchMemoriesInput) {
	const queryEmbedding = await generateEmbedding(query);
	const similarity = sql<number>`1 - (${cosineDistance(memory.embedding, queryEmbedding)})`;

	const results = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			similarity,
		})
		.from(memory)
		.where(sql`${eq(memory.spaceId, spaceId)} AND ${gt(similarity, 0.5)}`)
		.orderBy((t) => desc(t.similarity))
		.limit(limit);

	return results;
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
