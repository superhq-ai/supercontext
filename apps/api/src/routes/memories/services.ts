import crypto from "node:crypto";
import { eq, type SQL, sql } from "drizzle-orm";
import { db } from "@/db";
import { memory } from "@/db/schema";
import { generateEmbedding } from "./utils";

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

	const [created] = await db
		.insert(memory)
		.values({
			id,
			content,
			spaceId,
			metadata,
			userId,
			apiKeyId,
			embedding: sql`[${embedding.join(",")}]`,
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
	const queryEmbeddingSql = sql`[${queryEmbedding.join(",")}]`;

	const results = await db
		.select({
			id: memory.id,
			content: memory.content,
			metadata: memory.metadata,
			similarity: sql<number>`1 - (embedding <=> ${queryEmbeddingSql})`,
		})
		.from(memory)
		.where(eq(memory.spaceId, spaceId))
		.orderBy(sql`embedding <=> ${queryEmbeddingSql}`)
		.limit(limit);

	return results;
}

export type UpdateMemoryInput = {
	memoryId: string;
	content?: string;
	metadata?: object;
};

export async function updateMemory({
	memoryId,
	content,
	metadata,
}: UpdateMemoryInput) {
	const data: Omit<Partial<typeof memory.$inferInsert>, "embedding"> & {
		embedding?: SQL;
	} = {};

	if (content) {
		data.content = content;
		data.embedding = sql`[${(await generateEmbedding(content)).join(",")}]`;
	}
	if (metadata) {
		data.metadata = metadata;
	}

	const [updated] = await db
		.update(memory)
		.set(data)
		.where(eq(memory.id, memoryId))
		.returning();

	return updated;
}

export async function deleteMemory(memoryId: string) {
	const result = await db
		.delete(memory)
		.where(eq(memory.id, memoryId))
		.execute();
	return !!result?.rowCount;
}
