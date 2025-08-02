import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { env } from "@/env";

interface EmbeddingProvider {
	generateEmbedding(content: string): Promise<number[]>;
}

class GoogleGeminiEmbeddingProvider implements EmbeddingProvider {
	private readonly client: GoogleGenAI;

	constructor(apiKey: string) {
		this.client = new GoogleGenAI({
			apiKey,
		});
	}

	async generateEmbedding(content: string): Promise<number[]> {
		const result = await this.client.models.embedContent({
			model: "gemini-embedding-001",
			contents: [content],
			config: {
				outputDimensionality: 1536,
			},
		});

		if (!result.embeddings?.[0]?.values) {
			throw new Error("Failed to generate embedding");
		}

		return result.embeddings[0].values;
	}
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
	private readonly client: OpenAI;

	constructor(apiKey: string) {
		this.client = new OpenAI({ apiKey });
	}

	async generateEmbedding(content: string): Promise<number[]> {
		const response = await this.client.embeddings.create({
			model: "text-embedding-3-small",
			input: content,
			dimensions: 1536,
		});

		if (!response.data?.[0]?.embedding) {
			throw new Error("Failed to generate embedding");
		}

		return response.data[0].embedding;
	}
}

class MockEmbeddingProvider implements EmbeddingProvider {
	async generateEmbedding(content: string): Promise<number[]> {
		console.log(
			`Using mock embedding generator for: "${content.substring(0, 20)}..."`,
		);
		return Array.from({ length: 1536 }, () => Math.random());
	}
}

function getEmbeddingProvider(): EmbeddingProvider {
	if (env.GEMINI_API_KEY) {
		return new GoogleGeminiEmbeddingProvider(env.GEMINI_API_KEY);
	}
	if (env.OPENAI_API_KEY) {
		return new OpenAIEmbeddingProvider(env.OPENAI_API_KEY);
	}
	return new MockEmbeddingProvider();
}

const embeddingProvider = getEmbeddingProvider();

export async function generateEmbedding(content: string): Promise<number[]> {
	return embeddingProvider.generateEmbedding(content);
}
