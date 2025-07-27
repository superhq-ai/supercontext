import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
});

export const env = envSchema.parse(process.env);
