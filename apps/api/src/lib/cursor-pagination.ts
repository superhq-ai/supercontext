export interface CursorPaginationOptions {
	limit?: number;
	cursor?: string;
}

export interface CursorPaginatedResponse<T> {
	data: T[];
	nextCursor: string | null;
	hasMore: boolean;
}

export interface CursorData {
	createdAt: string;
	id: string | number;
}

/**
 * Encodes cursor data to a base64 string
 */
export function encodeCursor(data: CursorData): string {
	return Buffer.from(JSON.stringify(data)).toString("base64");
}

/**
 * Decodes a base64 cursor string back to cursor data
 */
export function decodeCursor(cursor: string): CursorData {
	try {
		return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
	} catch {
		throw new Error("Invalid cursor format");
	}
}

/**
 * Creates a paginated response with cursor-based pagination
 */
export function createCursorPaginatedResponse<
	T extends { id: string | number; createdAt: Date },
>(items: T[], limit: number): CursorPaginatedResponse<T> {
	const hasMore = items.length > limit;
	const data = hasMore ? items.slice(0, limit) : items;

	let nextCursor: string | null = null;
	if (hasMore && data.length > 0) {
		const lastItem = data[data.length - 1];
		if (lastItem) {
			nextCursor = encodeCursor({
				createdAt: lastItem.createdAt.toISOString(),
				id: lastItem.id,
			});
		}
	}

	return {
		data,
		nextCursor,
		hasMore,
	};
}

/**
 * Validates and normalizes pagination parameters
 */
export function normalizeCursorPaginationParams(
	options: CursorPaginationOptions = {},
): {
	limit: number;
	cursor: CursorData | null;
} {
	const limit = Math.min(Math.max(options.limit || 20, 1), 100); // Default 20, max 100

	let cursor: CursorData | null = null;
	if (options.cursor) {
		cursor = decodeCursor(options.cursor);
	}

	return { limit, cursor };
}
