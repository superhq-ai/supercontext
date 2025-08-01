import { z } from "zod";

export const createApiKeySchema = z.object({
	name: z.string().min(1).max(100),
	spaceId: z.string().min(1),
});
