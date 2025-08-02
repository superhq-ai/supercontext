export interface Memory {
	id: string;
	content: string;
	space: Space;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	similarity?: number;
}

export interface Space {
	id: string;
	name: string;
}

export interface PaginationInfo {
	limit: number;
	offset: number;
	total: number;
}

export type SortOrder = "asc" | "desc";
