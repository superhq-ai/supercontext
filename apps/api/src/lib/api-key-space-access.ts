import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKeyToSpace } from "@/db/schema";

export interface ApiKeySpaceAccess {
  getAllowedSpacesForApiKey(apiKeyId: string): Promise<string[]>;
  hasApiKeyAccessToSpace(apiKeyId: string, spaceId: string): Promise<boolean>;
}

export async function getAllowedSpacesForApiKey(apiKeyId: string): Promise<string[]> {
  try {
    const result = await db
      .select({
        spaceId: apiKeyToSpace.spaceId,
      })
      .from(apiKeyToSpace)
      .where(eq(apiKeyToSpace.apiKeyId, apiKeyId));

    return result.map(row => row.spaceId);
  } catch (error) {
    console.error(`Error getting allowed spaces for API key ${apiKeyId}:`, error);
    throw new Error("Failed to retrieve allowed spaces for API key");
  }
}

export async function hasApiKeyAccessToSpace(apiKeyId: string, spaceId: string): Promise<boolean> {
  try {
    const result = await db
      .select({
        spaceId: apiKeyToSpace.spaceId,
      })
      .from(apiKeyToSpace)
      .where(and(
        eq(apiKeyToSpace.apiKeyId, apiKeyId),
        eq(apiKeyToSpace.spaceId, spaceId)
      ))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error(`Error checking API key ${apiKeyId} access to space ${spaceId}:`, error);
    throw new Error("Failed to check API key space access");
  }
}