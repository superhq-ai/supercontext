# Supercontext MCP Server

A Model Context Protocol (MCP) server for the Supercontext memory system, providing tools for storing, searching, and managing contextual memories across conversations and sessions.

## Installation

To install dependencies:

```bash
bun install
```

## Configuration

Copy the environment example and configure your API endpoint:

```bash
cp env.example .env
```

Edit `.env` to set your API URL:
```
API_URL=http://localhost:3001/api
```

## Authentication

The MCP server supports two authentication methods that are automatically detected:

### Bearer Token Authentication
Send requests with an `Authorization` header:
```
Authorization: Bearer your-api-token-here
```

### Custom Header Authentication  
Send requests with an `x-api-key` header:
```
x-api-key: your-api-key-here
```

The server will automatically detect which method you're using based on the presence of the `Authorization` header with a "Bearer " prefix. If not found, it falls back to the `x-api-key` header.

## Running

To run in development mode:

```bash
bun run dev
```

To build:

```bash
bun run build
```

## Available Tools

- **add_memories**: Store important information, insights, and context for future reference
- **search_memory**: Find relevant memories using semantic search
- **list_memories**: Browse all stored memories with optional space filtering
- **list_spaces**: Discover available memory spaces for organization

## API Integration

The server communicates with the Supercontext API and forwards the authentication method used by the client, supporting both bearer tokens and custom header authentication seamlessly.
