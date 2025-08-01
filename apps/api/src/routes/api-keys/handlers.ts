import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {
	createApiKey,
	deleteApiKey,
	listApiKeys,
	revokeApiKey,
} from "./services";
import { createApiKeySchema } from "./validators";

export async function handleCreateApiKey(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const body = await c.req.json();
	const parse = createApiKeySchema.safeParse(body);
	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const key = await createApiKey({
		name: parse.data.name,
		spaceId: parse.data.spaceId,
		userId: user.id,
	});
	return c.json(key, 201);
}

export async function handleListApiKeys(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const keys = await listApiKeys(user.id);
	return c.json(keys);
}

export async function handleRevokeApiKey(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const apiKeyId = c.req.param("apiKeyId");
	const success = await revokeApiKey(apiKeyId, user.id);
	if (!success) throw new HTTPException(404, { message: "API key not found" });
	return c.json({ success });
}

export async function handleDeleteApiKey(c: Context) {
	const user = c.get("user");
	if (!user) throw new HTTPException(401, { message: "Unauthorized" });

	const apiKeyId = c.req.param("apiKeyId");
	const success = await deleteApiKey(apiKeyId, user.id);
	if (!success) throw new HTTPException(404, { message: "API key not found" });
	return c.json({ success });
}
