import crypto from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { apiKey, apiKeyToSpace, memory, userSpace } from "@/db/schema";

export type CreateApiKeyInput = {
	name: string;
	spaceIds: string[];
	userId: string;
};

export async function createApiKey({
	name,
	spaceIds,
	userId,
}: CreateApiKeyInput) {
	// Verify user has access to all spaces
	if (spaceIds.length > 0) {
		const assignedSpaces = await db
			.select({ spaceId: userSpace.spaceId })
			.from(userSpace)
			.where(
				and(inArray(userSpace.spaceId, spaceIds), eq(userSpace.userId, userId)),
			);

		if (assignedSpaces.length !== spaceIds.length) {
			throw new Error("Forbidden: no access to one or more spaces");
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
			userId,
		})
		.returning();

	if (!created) {
		throw new Error("Failed to create API key");
	}

	if (spaceIds.length > 0) {
		await db.insert(apiKeyToSpace).values(
			spaceIds.map((spaceId) => ({
				apiKeyId: created.id,
				spaceId,
			})),
		);
	}

	return {
		id: created.id,
		key: rawKey,
		name: created.name,
		status: created.status,
		userId: created.userId,
		createdAt: created.createdAt,
		spaceIds,
	};
}

export async function listApiKeys(userId: string) {
	const rows = await db.query.apiKey.findMany({
		where: eq(apiKey.userId, userId),
		with: {
			spaces: {
				columns: {
					spaceId: true,
				},
			},
		},
		orderBy: apiKey.createdAt,
	});

	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		key: `${row.key.slice(0, 8)}${"*".repeat(row.key.length - 8)}`,
		status: row.status,
		createdAt: row.createdAt,
		lastUsedAt: row.lastUsedAt,
		spaceIds: row.spaces.map((s) => s.spaceId),
	}));
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
