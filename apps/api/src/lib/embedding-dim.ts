import { env } from "@/env";

function getEmbeddingDimensions(): number {
	if (env.GOOGLE_API_KEY) {
		return 768;
	}
	if (env.OPENAI_API_KEY) {
		return 1536;
	}
	return 1536;
}

export const EMBEDDING_DIMENSIONS = getEmbeddingDimensions();
