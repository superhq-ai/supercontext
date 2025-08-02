import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
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
				enum: schema.roleEnum.enumValues,
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
});
