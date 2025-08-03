export interface User {
	id: string;
	name: string;
	email: string;
	role: "user" | "admin";
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export type PendingInvite = {
	id: string;
	email: string;
	token: string;
	invitedBy: string;
	createdAt: string;
	expiresAt: string;
};

export interface Memory {
	id: string;
	content: string;
	spaces: Space[];
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	similarity?: number;
}

export interface MemoryAccessLog {
	id: number;
	apiKeyId: string;
	accessedAt: string;
	memoryId: string;
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
