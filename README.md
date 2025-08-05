<p align="center">
  <a href="https://github.com/rooveterinary/supercontext">
    <img src="assets/logo.svg" alt="Supercontext" width="100" height="100">
  </a>
</p>

<h1 align="center">Supercontext</h1>

<p align="center">
  Open-Source, Centralized Memory Store for AI Teams
</p>

SuperContext eliminates context silos in AI-powered development. When your team uses Claude Code, Cursor, or Windsurf, everyone stays in sync with a centralized memory store that connects to your existing tools. It's the open-source solution for sharing AI context across your development workflow.

<h2>Features</h2>

- **Scalable Context Management:** Efficiently manage and store large volumes of contextual data.
- **Flexible Integration:** Easily integrate with your existing AI agents and applications.
- **Extensible Architecture:** Customize and extend the engine to meet your specific needs.
- **High Performance:** Optimized for speed and efficiency, ensuring low-latency access to context.

<h2>Getting Started</h2>

To get started with Supercontext, clone the repository and install the dependencies:

```bash
git clone https://github.com/rooveterinary/supercontext.git
cd supercontext
bun install
bun dev
```

The web client should be available at http://localhost:3000 and the MCP server should be available at http://localhost:3002/mcp.

<h2>Usage</h2>

Detailed usage instructions can be found in the respective `README.md` files within the `apps` directory.

<h2>AI Tool Integration</h2>

You can add the Supercontext MCP server to any AI tool that supports MCP. For example, in Cursor, Roo Code, or other compatible tools, you would add the following configuration to your settings:

```json
{
  "mcpServers": {
    "supercontext": {
      "type": "streamable-http",
      "url": "<YOUR_SUPERCONTEXT_MCP_ENDPOINT>/mcp",
      "headers": {
        "x-api-key": "<YOUR_SUPERCONTEXT_API_KEY>"
      }
    }
  }
}
```

<h2>Contributing</h2>

We welcome contributions from the community! If you'd like to contribute, please fork the repository and submit a pull request.

<h2>License</h2>

Supercontext is licensed under the [MIT License](LICENSE).
