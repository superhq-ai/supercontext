import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { space, userSpace } from "@/db/schema";

// Infer types
type Space = typeof space.$inferSelect;

// Input types
export type CreateSpaceInput = {
	name: string;
	description?: string;
	createdBy: string;
};

export type GetSpaceInput = {
	spaceId: string;
	userId: string;
};

export type UpdateSpaceInput = {
	spaceId: string;
	name?: string;
	description?: string;
};

export type DeleteSpaceInput = {
	spaceId: string;
};

export type AddUserToSpaceInput = {
	spaceId: string;
	userIdToAdd: string;
};

export type RemoveUserFromSpaceInput = {
	spaceId: string;
	userIdToRemove: string;
};

// Create a new space and assign creator
export async function createSpace({
	name,
	description,
	createdBy,
}: CreateSpaceInput) {
	const id = crypto.randomUUID();
	const [created] = await db
		.insert(space)
		.values({ id, name, description, createdBy })
		.returning();

	if (!created) return null;

	await db.insert(userSpace).values({
		userId: createdBy,
		spaceId: created.id,
	});

	return {
		id: created.id,
		name: created.name,
		description: created.description,
		createdAt: created.createdAt,
		updatedAt: created.updatedAt,
		createdBy: created.createdBy,
	};
}

// Get space if user is assigned
export async function getSpaceWithAccess({ spaceId, userId }: GetSpaceInput) {
	const assigned = await db.query.userSpace.findFirst({
		where: (us, { eq, and }) =>
			and(eq(us.spaceId, spaceId), eq(us.userId, userId)),
	});
	if (!assigned) return null;

	const found = await db.query.space.findFirst({
		where: (s, { eq }) => eq(s.id, spaceId),
	});
	if (!found) return null;

	return {
		id: found.id,
		name: found.name,
		description: found.description,
		createdAt: found.createdAt,
		updatedAt: found.updatedAt,
		createdBy: found.createdBy,
	};
}

// List spaces for a user
export async function listSpacesForUser(userId: string) {
	const rows = await db
		.select({ sp: space })
		.from(space)
		.innerJoin(userSpace, eq(space.id, userSpace.spaceId))
		.where(eq(userSpace.userId, userId))
		.orderBy(space.createdAt);

	return rows.map((r) => {
		const s = r.sp;
		return {
			id: s.id,
			name: s.name,
			description: s.description,
			createdAt: s.createdAt,
			updatedAt: s.updatedAt,
			createdBy: s.createdBy,
		};
	});
}

// Update space fields
export async function updateSpace({
	spaceId,
	name,
	description,
}: UpdateSpaceInput) {
	const data: Partial<Pick<Space, "name" | "description">> = {};
	if (name !== undefined) data.name = name;
	if (description !== undefined) data.description = description;
	if (Object.keys(data).length === 0) throw new Error("No fields to update");

	const [updated] = await db
		.update(space)
		.set(data)
		.where(eq(space.id, spaceId))
		.returning({
			id: space.id,
			name: space.name,
			description: space.description,
			createdAt: space.createdAt,
			updatedAt: space.updatedAt,
			createdBy: space.createdBy,
		});
	if (!updated) return null;

	return updated;
}

// Delete a space
export async function deleteSpace({ spaceId }: DeleteSpaceInput) {
	const result = await db.delete(space).where(eq(space.id, spaceId)).execute();
	return !!result?.rowCount;
}

// Add a user to a space
export async function addUserToSpace({
	spaceId,
	userIdToAdd,
}: AddUserToSpaceInput) {
	await db.insert(userSpace).values({
		userId: userIdToAdd,
		spaceId,
	});
	return true;
}

// Remove a user from a space
export async function removeUserFromSpace({
	spaceId,
	userIdToRemove,
}: RemoveUserFromSpaceInput) {
	const result = await db
		.delete(userSpace)
		.where(
			and(eq(userSpace.spaceId, spaceId), eq(userSpace.userId, userIdToRemove)),
		)
		.execute();
	return !!result?.rowCount;
}
