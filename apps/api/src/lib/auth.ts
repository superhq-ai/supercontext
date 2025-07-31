import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";

const db = createDb(env.DATABASE_URL);

export const auth = betterAuth({
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
		},
	},
	emailAndPassword: {
		enabled: true,
	},
});
