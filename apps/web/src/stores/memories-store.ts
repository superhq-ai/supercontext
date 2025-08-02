import { produce } from "immer";
import { create } from "zustand";
import { API_ENDPOINTS, DEFAULT_PAGINATION } from "@/constants";
import { fetchWithAuth } from "@/lib/utils";
import type { Memory, PaginationInfo, SortOrder, Space } from "@/types";

export interface MemoriesStore {
	memories: Memory[];
	pagination: PaginationInfo;
	searchQuery: string;
	isLoading: boolean;
	error: string | null;
	spaces: Space[];
	selectedSpaceIds: string[];
	sortOrder: "asc" | "desc";
	isCreating: boolean;
	creationStatus: { message: string; type: "success" | "error" } | null;
	newMemoryContent: string;
	newMemorySpaceId: string;
	setSearchQuery: (query: string) => void;
	setSelectedSpaceIds: (spaceIds: string[]) => void;
	setSortOrder: (order: "asc" | "desc") => void;
	setNewMemoryContent: (content: string) => void;
	setNewMemorySpaceId: (spaceId: string) => void;
	fetchSpaces: () => Promise<void>;
	fetchData: (params: {
		spaceIds: string[];
		limit?: number;
		offset?: number;
		query?: string;
		sortOrder?: SortOrder;
	}) => Promise<void>;
	createMemory: () => Promise<void>;
	searchMemories: (params: {
		query: string;
		spaceIds: string[];
		limit?: number;
		offset?: number;
		sortOrder?: SortOrder;
	}) => Promise<void>;
}

export const useMemoriesStore = create<MemoriesStore>((set) => ({
	memories: [],
	pagination: {
		limit: DEFAULT_PAGINATION.LIMIT,
		offset: DEFAULT_PAGINATION.OFFSET,
		total: 0,
	},
	searchQuery: "",
	isLoading: false,
	error: null,
	spaces: [],
	selectedSpaceIds: [],
	sortOrder: "desc",
	isCreating: false,
	creationStatus: null,
	newMemoryContent: "",
	newMemorySpaceId: "",

	setSearchQuery: (query) =>
		set(
			produce((state) => {
				state.searchQuery = query;
			}),
		),

	setSelectedSpaceIds: (spaceIds) =>
		set(
			produce((state) => {
				state.selectedSpaceIds = spaceIds;
			}),
		),

	setSortOrder: (order) =>
		set(
			produce((state) => {
				state.sortOrder = order;
			}),
		),

	setNewMemoryContent: (content) =>
		set(
			produce((state) => {
				state.newMemoryContent = content;
			}),
		),

	setNewMemorySpaceId: (spaceId) =>
		set(
			produce((state) => {
				state.newMemorySpaceId = spaceId;
			}),
		),

	fetchSpaces: async () => {
		try {
			const response = await fetchWithAuth(API_ENDPOINTS.SPACES);
			if (response.ok) {
				const data: Space[] = await response.json();
				set(
					produce((state) => {
						state.spaces = data;
					}),
				);
			}
		} catch (error) {
			console.error("Failed to fetch spaces:", error);
		}
	},

	fetchData: async ({
		spaceIds,
		limit = DEFAULT_PAGINATION.LIMIT,
		offset = DEFAULT_PAGINATION.OFFSET,
		sortOrder,
	}) => {
		set(
			produce((state) => {
				state.isLoading = true;
				state.error = null;
			}),
		);

		try {
			const searchParams = new URLSearchParams({
				limit: String(limit),
				offset: String(offset),
				sortOrder: sortOrder || useMemoriesStore.getState().sortOrder,
				...(spaceIds.length > 0 && { spaceId: spaceIds.join(",") }),
			});

			const response = await fetchWithAuth(
				`${API_ENDPOINTS.MEMORIES}?${searchParams}`,
			);
			if (!response.ok) throw new Error("Failed to fetch memories");
			const data: { memories: Memory[]; pagination: PaginationInfo } =
				await response.json();
			set(
				produce((state) => {
					state.memories = data.memories;
					state.pagination = {
						limit: Number(data.pagination.limit),
						offset: Number(data.pagination.offset),
						total: Number(data.pagination.total),
					};
				}),
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			set(
				produce((state) => {
					state.error = errorMessage;
				}),
			);
		} finally {
			set(
				produce((state) => {
					state.isLoading = false;
				}),
			);
		}
	},

	searchMemories: async ({
		query,
		spaceIds,
		limit = DEFAULT_PAGINATION.LIMIT,
		offset = DEFAULT_PAGINATION.OFFSET,
		sortOrder,
	}) => {
		set(
			produce((state) => {
				state.isLoading = true;
				state.error = null;
			}),
		);

		try {
			const response = await fetchWithAuth(API_ENDPOINTS.SEARCH, {
				method: "POST",
				body: JSON.stringify({
					query,
					spaceId: spaceIds,
					limit,
					offset,
					sortOrder,
				}),
			});

			if (!response.ok) throw new Error("Failed to search memories");
			const data: { results: Memory[]; pagination: PaginationInfo } =
				await response.json();
			set(
				produce((state) => {
					state.memories = data.results;
					state.pagination = data.pagination;
				}),
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			set(
				produce((state) => {
					state.error = errorMessage;
				}),
			);
		} finally {
			set(
				produce((state) => {
					state.isLoading = false;
				}),
			);
		}
	},

	createMemory: async () => {
		const { newMemoryContent, newMemorySpaceId, memories } =
			useMemoriesStore.getState();
		if (!newMemoryContent.trim() || !newMemorySpaceId) return;

		set(
			produce((state) => {
				state.isCreating = true;
				state.creationStatus = null;
			}),
		);

		try {
			const response = await fetchWithAuth(API_ENDPOINTS.MEMORIES, {
				method: "POST",
				body: JSON.stringify({
					content: newMemoryContent,
					spaceId: newMemorySpaceId,
				}),
			});

			if (!response.ok) {
				const errorData: { message?: string } = await response
					.json()
					.catch(() => ({}));
				throw new Error(errorData.message || "Failed to create memory");
			}

			const newMemory: Memory = await response.json();
			set(
				produce((state) => {
					state.memories = [newMemory, ...memories];
					state.pagination.total += 1;
					state.newMemoryContent = "";
					state.creationStatus = {
						message: "Memory created successfully",
						type: "success",
					};
				}),
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			set(
				produce((state) => {
					state.creationStatus = {
						message: errorMessage,
						type: "error",
					};
				}),
			);
		} finally {
			set(
				produce((state) => {
					state.isCreating = false;
				}),
			);
		}
	},
}));
