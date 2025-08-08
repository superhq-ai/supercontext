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
		const authHeader = request.headers.authorization;
		const bearerToken = Array.isArray(authHeader) ? authHeader[0] : authHeader;
		
		if (bearerToken?.startsWith("Bearer ")) {
			const apiKey = bearerToken.replace("Bearer ", "");
			return { apiKey };
		}

		const apiKeyHeader = request.headers["x-api-key"];
		const headerApiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
		
		if (headerApiKey) {
			return { apiKey: headerApiKey };
		}

		throw new Error("Authentication required: provide either Bearer token or x-api-key header");
	},
});

server.addTool({
	name: "add_memories",
	description:
		"Store important information, insights, user preferences, decisions, or context for future reference. Use this to remember key details from conversations, user instructions, project requirements, learned patterns, or any information that would be valuable to recall later. This creates persistent memory that survives across sessions and can be shared with other agents. Essential for maintaining continuity and personalization. Use list_spaces first to see available organizational spaces.",
	parameters: z.object({
		text: z
			.string()
			.describe(
				"The content to remember - can be facts, preferences, instructions, insights, decisions, or any contextually important information that should be preserved for future interactions",
			),
		spaceIds: z
			.array(z.string())
			.optional()
			.describe(
				"Space IDs to categorize this memory - use list_spaces to see available spaces created by admins/users. If not provided, memory will be stored in the default/global space. Choose relevant spaces for better organization",
			),
		metadata: z
			.record(z.any())
			.optional()
			.describe(
				'Key-value metadata to attach additional structured information (e.g., {"priority": "high", "category": "user-preference", "source": "conversation", "tags": ["important", "recurring"]})',
			),
	}),
	execute: async ({ text, spaceIds, metadata }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories",
			method: "POST",
			apiKey: session.apiKey,
			body: { content: text, spaceIds: spaceIds || [], metadata },
		});
	},
});

server.addTool({
	name: "search_memory",
	description:
		"Find relevant memories, past decisions, learned information, or context using semantic search. This is crucial for maintaining consistency, avoiding repetition, and building upon previous interactions. Use this before making decisions, providing recommendations, or when you need context from past conversations. Searches across stored knowledge to find the most relevant memories for the current situation.",
	parameters: z.object({
		query: z
			.string()
			.describe(
				"What you're looking for - describe the information, topic, or context you need. Can be keywords, questions, or descriptions of the type of memory you want to retrieve (e.g., 'user's coding preferences', 'previous project decisions', 'learning goals')",
			),
		spaceIds: z
			.array(z.string())
			.optional()
			.describe(
				"Limit search to specific spaces for more focused results. Use list_spaces to see available spaces. Leave empty or omit to search all accessible memories across all spaces",
			),
	}),
	execute: async ({ query, spaceIds }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		return callApi({
			path: "/memories/search",
			method: "POST",
			apiKey: session.apiKey,
			body: { query, spaceIds: spaceIds || [] },
		});
	},
});

server.addTool({
	name: "list_memories",
	description:
		"Browse and review all stored memories to get an overview of available context, refresh your knowledge about a user or project, or audit what information has been preserved. Useful for understanding the full scope of stored information, identifying patterns, or preparing for complex tasks that might benefit from multiple pieces of stored context.",
	parameters: z.object({
		spaceIds: z
			.array(z.string())
			.optional()
			.describe(
				"Filter memories by specific spaces. Use list_spaces to see available spaces created by admins/users. Leave empty or omit to see all memories across all spaces",
			),
	}),
	execute: async ({ spaceIds }, { session }) => {
		if (!session?.apiKey) throw new Error("API key is missing");
		const searchParams = new URLSearchParams();
		if (spaceIds && spaceIds.length > 0) {
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
	description:
		"Discover available memory spaces/contexts to understand how information is organized and determine appropriate spaces for new memories. Spaces represent different contexts, projects, or domains where memories are categorized. Use this to understand the existing organization structure and choose appropriate spaces when adding new memories.",
	parameters: z
		.object({})
		.describe(
			"No parameters required - returns all accessible memory spaces with their identifiers and metadata",
		),
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
