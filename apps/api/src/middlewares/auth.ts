import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
import type { AppVariables, AuthType, ProtectedAppVariables } from "@/types";

type AuthOptions = {
	requireAdmin?: boolean; // Enforce admin role
	allowApiKey?: boolean; // Allow API key authentication
	allowSession?: boolean; // Allow user session authentication
};

export const auth = (options: AuthOptions = {}) =>
	createMiddleware(
		async (c: Context<{ Variables: AppVariables }>, next: Next) => {
			const {
				requireAdmin = false,
				allowApiKey = true,
				allowSession = true,
			} = options;

			let isAuthenticated = false;
			let authType: AuthType = null;

			// 1. Try API key authentication if allowed
			if (allowApiKey) {
				const authHeader = c.req.header("Authorization");
				console.log("Authorization Header:", authHeader);
				if (authHeader?.startsWith("Bearer ")) {
					const token = authHeader.replace("Bearer ", "");
					console.log("API Key Token:", token);
					const hashedKey = crypto
						.createHash("sha256")
						.update(token)
						.digest("hex");
					console.log("Hashed API Key:", hashedKey);
					const [keyRecord] = await db
						.select()
						.from(apiKey)
						.where(eq(apiKey.key, hashedKey))
						.limit(1);

					console.log("Key Record:", keyRecord);

					if (keyRecord) {
						c.set("apiKey", keyRecord);
						isAuthenticated = true;
						authType = "apiKey";
					}
				}
			}

			// 2. Try session-based authentication if allowed and not already authenticated
			if (allowSession && !isAuthenticated) {
				const session = c.get("session");
				const user = c.get("user");
				if (session && user) {
					// If admin is required, check the role
					if (requireAdmin && user.role !== "admin") {
						throw new HTTPException(403, {
							message: "Forbidden: Admin access required",
						});
					}
					(c as Context<{ Variables: ProtectedAppVariables }>).set(
						"user",
						user,
					);
					(c as Context<{ Variables: ProtectedAppVariables }>).set(
						"session",
						session,
					);
					isAuthenticated = true;
					authType = "session";
				}
			}

			// 3. If no authentication method succeeded, reject the request
			if (!isAuthenticated) {
				throw new HTTPException(401, {
					message: "Unauthorized: Valid authentication required",
				});
			}

			// Set authType in context for downstream use
			c.set("authType", authType);

			await next();
		},
	);
