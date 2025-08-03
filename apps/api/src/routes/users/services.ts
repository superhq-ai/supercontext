import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updateUserRole } from "@/lib/update-user-role";

type UpdateUserInput = {
	id: string;
	role?: "user" | "admin";
	active?: boolean;
};
type User = typeof user.$inferSelect;

export async function getCurrentUser(userId: string) {
	const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

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
		active: u.active,
	};
}

export async function getAllUsers({
	page,
	limit,
}: {
	page: number;
	limit: number;
}) {
	const offset = (page - 1) * limit;
	const [total] = await db.select({ value: count() }).from(user);
	const users = await db.select().from(user).limit(limit).offset(offset);
	return {
		users: users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role,
			emailVerified: u.emailVerified,
			image: u.image,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
			active: u.active,
		})),
		total: total?.value ?? 0,
	};
}

type CreateUserInput = {
	email: string;
	name: string;
	role: "user" | "admin";
	password?: string;
};

export async function createUser({
	email,
	name,
	role,
	password,
}: CreateUserInput) {
	if (!password) {
		throw new Error("Password is required");
	}
	const {
		user: { id: userId },
	} = await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
		},
	});

	if (!userId) {
		throw new Error("Failed to create user");
	}

	if (role === "admin") {
		await updateUserRole(userId, "admin");
	}

	const newUser = await getCurrentUser(userId);
	if (!newUser) {
		throw new Error("Failed to retrieve created user");
	}
	return newUser;
}

export async function updateUserProfile({ id, role, active }: UpdateUserInput) {
	const updateData: Partial<Pick<User, "role" | "active">> = {};
	if (role) updateData.role = role;
	if (active !== undefined) updateData.active = active;

	if (Object.keys(updateData).length === 0) {
		throw new Error("No valid fields to update");
	}

	const [u] = await db
		.update(user)
		.set(updateData)
		.where(eq(user.id, id))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			emailVerified: user.emailVerified,
			image: user.image,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			active: user.active,
		});

	if (!u) return null;

	return u;
}
