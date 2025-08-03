import { FastMCP } from "fastmcp";
import { z } from "zod";

type ApiOptions<T> = {
	path: string;
	method: "GET" | "POST" | "PATCH" | "DELETE";
	apiKey: string;
	body?: T;
};

async function callApi<T>(options: ApiOptions<T>): Promise<string> {
	const { path, method, apiKey, body } = options;

	const apiUrl = process.env.API_URL || "http://localhost:3001/api";
	const response = await fetch(`${apiUrl}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const responseText = await response.text();

	if (!response.ok) {
		throw new Error(
			`API call failed with status ${response.status}: ${responseText}`,
		);
	}

	return responseText;
}

const server = new FastMCP({
	name: "Supercontext MCP",
	version: "0.0.1",
	authenticate: async (request) => {
		const apiKeyHeader = request.headers["x-api-key"];
		const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

		return {
			apiKey,
		};
	},
});

server.addTool({
	name: "add_memories",
	description: "Adds new memory entries based on user input.",
	parameters: z.object({
		text: z.string(),
		spaceIds: z.array(z.string()),
	}),
	execute: async ({ text, spaceIds }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories",
			method: "POST",
			apiKey: session.apiKey,
			body: { content: text, spaceIds },
		});
	},
});

server.addTool({
	name: "search_memory",
	description: "Searches stored memories using a query string.",
	parameters: z.object({
		query: z.string(),
		spaceIds: z.array(z.string()),
	}),
	execute: async ({ query, spaceIds }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories/search",
			method: "POST",
			apiKey: session.apiKey,
			body: { query, spaceIds },
		});
	},
});

server.addTool({
	name: "list_memories",
	description: "Lists all memories stored for the user.",
	parameters: z.object({
		spaceIds: z.array(z.string()),
	}),
	execute: async ({ spaceIds }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		const searchParams = new URLSearchParams();
		if (spaceIds.length > 0) {
			spaceIds.forEach((id) => searchParams.append("spaceId", id));
		}
		return callApi({
			path: `/memories?${searchParams}`,
			method: "GET",
			apiKey: session.apiKey,
		});
	},
});

server.addTool({
	name: "list_spaces",
	description: "Lists all spaces accessible to the user.",
	parameters: z.object({}),
	execute: async (_args, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/spaces",
			method: "GET",
			apiKey: session.apiKey,
		});
	},
});

server.start({
	transportType: "httpStream",
	httpStream: {
		endpoint: "/mcp",
		port: 3002,
	},
});
