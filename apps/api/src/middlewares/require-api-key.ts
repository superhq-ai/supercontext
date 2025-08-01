import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { bearerAuth } from "hono/bearer-auth";
import { db } from "@/db";
import { apiKey } from "@/db/schema";

export const requireApiKey = bearerAuth({
	verifyToken: async (token, c) => {
		const hashedKey = crypto.createHash("sha256").update(token).digest("hex");
		const [keyRecord] = await db
			.select()
			.from(apiKey)
			.where(eq(apiKey.key, hashedKey))
			.limit(1);

		if (!keyRecord) {
			return false;
		}

		c.set("apiKey", keyRecord);
		return true;
	},
});
