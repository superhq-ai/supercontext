import { z } from "zod";

export const createUserSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1).max(100),
	password: z.string().min(8),
	role: z.enum(["user", "admin"]).default("user"),
});

export const adminUpdateUserSchema = z.object({
	role: z.enum(["user", "admin"]).optional(),
	active: z.boolean().optional(),
});

export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
});
