import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";

export const auth = betterAuth({
	trustedOrigins: [env.SUPERCONTEXT_CLIENT_URL],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
		},
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
				input: false,
			},
			active: {
				type: "boolean",
				required: false,
				defaultValue: true,
				input: false,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path === "/sign-up/email") {
				const { email, inviteToken } = ctx.body || {};
				if (!inviteToken) {
					throw new APIError("BAD_REQUEST", {
						message: "Invite token is required",
					});
				}

				const invite = await db
					.select()
					.from(schema.invite)
					.where(
						and(
							eq(schema.invite.token, inviteToken),
							eq(schema.invite.status, "pending"),
							eq(schema.invite.email, email),
							gt(schema.invite.expiresAt, new Date()),
						),
					)
					.limit(1);

				if (!invite || invite.length === 0) {
					throw new APIError("BAD_REQUEST", {
						message: "Invalid, used, or expired invite token",
					});
				}

				return {
					context: {
						...ctx,
						body: {
							...ctx.body,
							inviteId: invite[0]?.id,
						},
					},
				};
			}
			if (ctx.path === "/sign-in/email") {
				const { email } = ctx.body || {};
				if (email) {
					const [user] = await db
						.select()
						.from(schema.user)
						.where(eq(schema.user.email, email));
					if (user && !user.active) {
						throw new APIError("UNAUTHORIZED", {
							message: "Your account has been deactivated.",
						});
					}
				}
			}
		}),
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path === "/sign-up/email" && ctx.context.newSession) {
				const { inviteId } = ctx.body || {};
				const user = ctx.context.newSession.user;
				if (inviteId) {
					const [invite] = await db
						.select()
						.from(schema.invite)
						.where(eq(schema.invite.id, inviteId));

					if (invite && user) {
						await db
							.update(schema.user)
							.set({ role: invite.role })
							.where(eq(schema.user.id, user.id));
						await db
							.update(schema.invite)
							.set({
								status: "used",
								usedAt: new Date(),
							})
							.where(eq(schema.invite.id, inviteId));
					}
				}
			}
		}),
	},
});
