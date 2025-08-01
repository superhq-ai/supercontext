import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

type UpdateUserInput = {
	id: string;
	name?: string;
	image?: string;
};
type User = typeof user.$inferSelect;

export async function getCurrentUser(userId: string) {
	const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

	if (!u) return null;

	// Exclude sensitive fields if any
	return {
		id: u.id,
		name: u.name,
		email: u.email,
		role: u.role,
		emailVerified: u.emailVerified,
		image: u.image,
		createdAt: u.createdAt,
		updatedAt: u.updatedAt,
	};
}

export async function updateUserProfile({ id, name, image }: UpdateUserInput) {
	const updateData: Partial<Pick<User, "name" | "image">> = {};
	if (name !== undefined) updateData.name = name;
	if (image !== undefined) updateData.image = image;

	if (Object.keys(updateData).length === 0) {
		throw new Error("No valid fields to update");
	}

	const [u] = await db
		.update(user)
		.set(updateData)
		.where(eq(user.id, id))
		.returning();

	if (!u) return null;

	return {
		id: u.id,
		name: u.name,
		email: u.email,
		role: u.role,
		emailVerified: u.emailVerified,
		image: u.image,
		createdAt: u.createdAt,
		updatedAt: u.updatedAt,
	};
}
