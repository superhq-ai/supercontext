import type { Context } from "hono";
import { getUserId } from "@/lib/get-user-id";
import { fetchAndStoreLlmsTxtContent, queryLlmsTxtContent } from "./services";
import { fetchAndStoreSchema, querySchema } from "./validators";

export async function handleQueryContent(c: Context) {
	try {
		const userId = getUserId(c);
		const apiKey = c.get("apiKey");
		const body = await c.req.json();
		const parse = querySchema.safeParse(body);
		
		if (!parse.success) {
			return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
		}

		const result = await queryLlmsTxtContent({
			...parse.data,
			userId,
			apiKeyId: apiKey?.id,
		});

		return c.json(result);
	} catch (error) {
		console.error("Error querying llms.txt content:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		return c.json(
			{
				error: true,
				message: errorMessage,
				suggestion:
					"Make sure the website has a publicly accessible llms.txt file at the root level",
			},
			400,
		);
	}
}

export async function handleFetchAndStoreContent(c: Context) {
	try {
		const userId = getUserId(c);
		const apiKey = c.get("apiKey");
		const body = await c.req.json();
		const parse = fetchAndStoreSchema.safeParse(body);
		
		if (!parse.success) {
			return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
		}

		const result = await fetchAndStoreLlmsTxtContent({
			...parse.data,
			userId,
			apiKeyId: apiKey?.id,
		});

		return c.json(result);
	} catch (error) {
		console.error("Error fetching and storing llms.txt content:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		return c.json(
			{
				error: true,
				message: errorMessage,
				suggestion:
					"Make sure the website has a publicly accessible llms.txt file at the root level",
			},
			400,
		);
	}
}
