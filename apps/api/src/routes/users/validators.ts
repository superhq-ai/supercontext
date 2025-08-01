import { z } from "zod";

export const updateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	image: z.string().url().optional(),
});
