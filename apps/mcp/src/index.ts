import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
	name: "Supercontext MCP",
	version: "0.0.1",
	authenticate: async (request) => {
		const apiKey = request.headers["x-api-key"];

		if (apiKey !== "123") {
			throw new Response(null, {
				status: 401,
				statusText: "Unauthorized",
			});
		}

		// Whatever we return here will be accessible in the `context.session` object.
		return {
			id: 1,
		};
	},
});

server.addTool({
	name: "add",
	description: "Add two numbers",
	parameters: z.object({
		a: z.number(),
		b: z.number(),
	}),
	execute: async (args, { session }) => {
		console.log("Session:", session);
		return String(args.a + args.b);
	},
});

server.start({
	transportType: "httpStream",
	httpStream: {
		endpoint: "/mcp",
		port: 3002,
	},
});
