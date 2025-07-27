import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	DATABASE_URL: z.url(),
	SUPERCONTEXT_CLIENT_URL: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
