import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "http";
import { z } from "zod";

function getServer() {
	const server = new McpServer(
		{
			name: "supercontext-mcp",
			version: "0.0.1",
		},
		{
			capabilities: {
				tools: {},
			},
		},
	);
	
	server.tool(
		"echo",
		"Echoes back the input",
		{
			message: z.string(),
		},
		async ({ message }) => {
			return {
				content: [
					{
						type: "text",
						text: message,
					},
				],
			};
		}
	);

	return server;
}

const httpServer = createServer(async (request, response) => {
	if (request.url === "/") {
		if (request.method === "GET") {
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(
				JSON.stringify({
					status: "MCP server running",
				}),
			);
		} else {
			response.writeHead(405, { "Content-Type": "application/json" });
			response.end(
				JSON.stringify({
					jsonrpc: "2.0",
					error: { code: -32000, message: "Method not allowed." },
					id: null,
				}),
			);
		}
		return;
	}

	if (request.url !== "/mcp") {
		response.writeHead(404, { "Content-Type": "application/json" });
		response.end(
			JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32000, message: "Not found." },
				id: null,
			}),
		);
		return;
	}

	if (request.method === "POST") {
    const server = getServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    // Add error handling for transport
    transport.onerror = console.error.bind(console);

    response.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);
    
		const chunks: Buffer[] = [];
		for await (const chunk of request) {
			chunks.push(chunk);
		}

		try {
      const parsedBody = JSON.parse(Buffer.concat(chunks).toString());
      
			await transport.handleRequest(
				request,
				response,
				parsedBody,
			);
		} catch (e) {
			response.writeHead(500, { "Content-Type": "application/json" });
			response.end(
				JSON.stringify({
					jsonrpc: "2.0",
					error: { code: -32603, message: "Internal server error" },
					id: null,
				}),
			);
		}
	} else {
		response.writeHead(405, { "Content-Type": "application/json" });
		response.end(
			JSON.stringify({
				jsonrpc: "2.0",
				error: { code: -32000, message: "Method not allowed." },
				id: null,
			}),
		);
	}
});

const PORT = 3002;
httpServer.listen(PORT, () => {
	console.log(`MCP server listening on http://localhost:${PORT}/mcp`);
});
