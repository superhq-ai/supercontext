// In a real application, this would use a proper embedding model
// like OpenAI's text-embedding-ada-002 or a local model.
export async function generateEmbedding(content: string): Promise<number[]> {
	// Dummy implementation for now
	console.log(`Generating embedding for: "${content.substring(0, 20)}..."`);
	const embedding = Array.from({ length: 1536 }, () => Math.random());
	return embedding;
}
