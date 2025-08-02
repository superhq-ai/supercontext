export const API_ENDPOINTS = {
	SPACES: "/api/spaces",
	MEMORIES: "/api/memories",
	SEARCH: "/api/memories/search",
} as const;

export const DEFAULT_PAGINATION = {
	LIMIT: 20,
	OFFSET: 0,
} as const;

export const DEFAULT_SORT_ORDER = "desc" as const;
