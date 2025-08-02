import { z } from "zod";

export const createMemorySchema = z.object({
	content: z.string().min(1),
	spaceId: z.string().min(1),
	metadata: z.record(z.any()).optional(),
});

export const searchMemoriesSchema = z.object({
	query: z.string().min(1),
	spaceId: z.string().min(1),
	limit: z.number().int().positive().optional(),
	offset: z.number().int().nonnegative().optional(),
});

export const listMemoriesSchema = z.object({
	spaceId: z.string().min(1),
	limit: z.number().int().positive().optional(),
	offset: z.number().int().nonnegative().optional(),
});
