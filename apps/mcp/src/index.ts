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

	const apiUrl = process.env.API_URL || "http://localhost:3000";
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
		spaceId: z.string(),
	}),
	execute: async ({ text, spaceId }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories",
			method: "POST",
			apiKey: session.apiKey,
			body: { content: text, spaceId },
		});
	},
});

server.addTool({
	name: "search_memory",
	description: "Searches stored memories using a query string.",
	parameters: z.object({
		query: z.string(),
		spaceId: z.string(),
	}),
	execute: async ({ query, spaceId }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories/search",
			method: "POST",
			apiKey: session.apiKey,
			body: { query, spaceId },
		});
	},
});

server.addTool({
	name: "list_memories",
	description: "Lists all memories stored for the user.",
	parameters: z.object({
		spaceId: z.string(),
	}),
	execute: async ({ spaceId }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: `/memories?spaceId=${spaceId}`,
			method: "GET",
			apiKey: session.apiKey,
		});
	},
});

server.addTool({
	name: "delete_all_memories",
	description: "Deletes all memories for the user.",
	parameters: z.object({
		spaceId: z.string(),
	}),
	execute: async ({ spaceId }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: `/memories?spaceId=${spaceId}`,
			method: "DELETE",
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
