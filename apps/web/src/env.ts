import { z } from "zod";

const envSchema = z.object({
	API_URL: z.string().url().default("http://localhost:3001"),
});

export const env = envSchema.parse(process.env);
