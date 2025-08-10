import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	DATABASE_URL: z.string().url(),
	SUPERCONTEXT_CLIENT_URL: z.string().url().default("http://localhost:3000"),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string().url().default("http://localhost:3001"),
	OPENAI_API_KEY: z.string().optional(),
	GEMINI_API_KEY: z.string().optional(),
	REDIS_URL: z.string().url(),
	VALIDATE_PHONE_NUMBER: z.string(),
});

export const env = envSchema.parse(process.env);
