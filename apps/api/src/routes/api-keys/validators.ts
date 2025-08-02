import { z } from "zod";

export const createApiKeySchema = z.object({
	name: z.string().min(1).max(100),
	spaceIds: z.array(z.string().min(1)),
});
