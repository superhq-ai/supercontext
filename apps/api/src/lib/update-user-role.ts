import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function updateUserRole(userId: string, role: "admin" | "user") {
	await db.update(user).set({ role }).where(eq(user.id, userId));
}
