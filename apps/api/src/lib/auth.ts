import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

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
