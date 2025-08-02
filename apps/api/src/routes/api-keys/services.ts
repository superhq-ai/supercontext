import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKey, memory, userSpace } from "@/db/schema";

export type CreateApiKeyInput = {
	name: string;
	spaceId?: string;
	userId: string;
};

export async function createApiKey({
	name,
	spaceId,
	userId,
}: CreateApiKeyInput) {
	// Verify user has access to the space if spaceId is provided
	if (spaceId) {
		const assigned = await db
			.select()
			.from(userSpace)
			.where(and(eq(userSpace.spaceId, spaceId), eq(userSpace.userId, userId)))
			.limit(1);
		if (assigned.length === 0) {
			throw new Error("Forbidden: no access to space");
		}
	}

	const id = crypto.randomUUID();
	const rawKey = crypto.randomBytes(32).toString("hex");
	const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

	const [created] = await db
		.insert(apiKey)
		.values({
			id,
			key: hashedKey,
			name,
			status: "active",
			spaceId,
			userId,
		})
		.returning();

	if (!created) {
		throw new Error("Failed to create API key");
	}

	return {
		id: created.id,
		key: rawKey,
		name: created.name,
		status: created.status,
		spaceId: created.spaceId,
		userId: created.userId,
		createdAt: created.createdAt,
	};
}

export async function listApiKeys(userId: string) {
	const rows = await db
		.select({
			id: apiKey.id,
			name: apiKey.name,
			status: apiKey.status,
			spaceId: apiKey.spaceId,
			createdAt: apiKey.createdAt,
			lastUsedAt: apiKey.lastUsedAt,
		})
		.from(apiKey)
		.where(eq(apiKey.userId, userId))
		.orderBy(apiKey.createdAt);

	return rows;
}

export async function revokeApiKey(apiKeyId: string, userId: string) {
	const [updated] = await db
		.update(apiKey)
		.set({ status: "revoked" })
		.where(and(eq(apiKey.id, apiKeyId), eq(apiKey.userId, userId)))
		.returning();
	return updated != null;
}

export async function deleteApiKey(apiKeyId: string, userId: string) {
	// Nullify apiKeyId on related memories
	await db
		.update(memory)
		.set({ apiKeyId: null })
		.where(eq(memory.apiKeyId, apiKeyId))
		.execute();

	const result = await db
		.delete(apiKey)
		.where(and(eq(apiKey.id, apiKeyId), eq(apiKey.userId, userId)))
		.execute();
	return !!result?.rowCount;
}
