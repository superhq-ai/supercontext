import { z } from "zod";

export const querySchema = z.object({
	website: z.string().min(1, "Website URL is required"),
	question: z.string().min(1, "Question is required"),
	createMemories: z.boolean().optional().default(true),
	spaceIds: z.array(z.string()).optional().default([]),
});

export const fetchAndStoreSchema = z.object({
	website: z.string().min(1, "Website URL is required"),
	spaceIds: z.array(z.string()).optional().default([]),
	customTags: z.array(z.string()).optional().default([]),
});

export type QueryLlmsTxtInput = z.infer<typeof querySchema>;
export type FetchAndStoreLlmsTxtInput = z.infer<typeof fetchAndStoreSchema>;