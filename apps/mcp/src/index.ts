import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
	name: "Supercontext MCP",
	version: "0.0.1",
});

server.addTool({
	name: "add",
	description: "Add two numbers",
	parameters: z.object({
		a: z.number(),
		b: z.number(),
	}),
	execute: async (args) => {
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
