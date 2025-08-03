export const API_ENDPOINTS = {
	SPACES: "/api/spaces",
	MEMORIES: "/api/memories",
	USERS: "/api/users",
	SEARCH: "/api/memories/search",
} as const;

export const DEFAULT_PAGINATION = {
	LIMIT: 10,
	OFFSET: 0,
} as const;

export const DEFAULT_SORT_ORDER = "desc" as const;
