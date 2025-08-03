import { randomUUID } from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invite, user } from "@/db/schema";
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

type CreateInviteInput = {
	email: string;
	invitedBy: string;
	expiresInDays?: number;
};

export async function createInvite({
	email,
	invitedBy,
	expiresInDays = 7,
}: CreateInviteInput) {
	const token = randomUUID();
	const now = new Date();
	const expiresAt = new Date(
		now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
	);

	// Check if invite already exists for this email and is still pending
	const [existing] = await db
		.select()
		.from(invite)
		.where(sql`${invite.email} = ${email} AND ${invite.status} = 'pending'`)
		.limit(1);

	if (existing) {
		throw new Error("An active invite already exists for this email.");
	}

	const [newInvite] = await db
		.insert(invite)
		.values({
			email,
			token,
			status: "pending",
			invitedBy,
			createdAt: now,
			expiresAt,
		})
		.returning();

	if (!newInvite) {
		throw new Error("Failed to create invite");
	}

	return {
		id: newInvite.id,
		email: newInvite.email,
		token: newInvite.token,
		status: newInvite.status,
		invitedBy: newInvite.invitedBy,
		createdAt: newInvite.createdAt,
		expiresAt: newInvite.expiresAt,
	};
}
export async function getPendingInvites({
	page,
	limit,
}: {
	page: number;
	limit: number;
}) {
	const offset = (page - 1) * limit;
	const [total] = await db
		.select({ value: count() })
		.from(invite)
		.where(sql`${invite.status} = 'pending'`);
	const invites = await db
		.select()
		.from(invite)
		.where(sql`${invite.status} = 'pending'`)
		.limit(limit)
		.offset(offset)
		.orderBy(invite.createdAt);

	return {
		invites: invites.map((inv) => ({
			id: inv.id,
			email: inv.email,
			token: inv.token,
			invitedBy: inv.invitedBy,
			createdAt: inv.createdAt,
			expiresAt: inv.expiresAt,
		})),
		total: total?.value ?? 0,
	};
}
type AcceptInviteInput = {
	token: string;
	name: string;
	password: string;
};

export async function acceptInvite({
	token,
	name,
	password,
}: AcceptInviteInput) {
	// 1. Find invite by token
	const [inv] = await db
		.select()
		.from(invite)
		.where(eq(invite.token, token))
		.limit(1);

	if (!inv) {
		throw new Error("Invalid invite token");
	}
	if (inv.status !== "pending") {
		throw new Error("Invite is not pending");
	}
	if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) {
		throw new Error("Invite has expired");
	}

	// 2. Create user with invite email, provided name/password, role: "user"
	const createdUser = await createUser({
		email: inv.email,
		name,
		role: "user",
		password,
	});

	// 3. Mark invite as accepted
	await db.update(invite).set({ status: "used" }).where(eq(invite.id, inv.id));

	// 4. Return created user
	return createdUser;
}

export async function searchUsers(query: string) {
	const users = await db
		.select()
		.from(user)
		.where(sql`name ILIKE ${`%${query}%`} OR email ILIKE ${`%${query}%`}`)
		.limit(10);

	return users.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
	}));
}

export async function getUserById(userId: string) {
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
