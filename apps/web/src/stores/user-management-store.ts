import { produce } from "immer";
import { toast } from "sonner";
import { create } from "zustand";
import { API_ENDPOINTS, DEFAULT_PAGINATION } from "@/constants";
import { fetchWithAuth } from "@/lib/utils";
import type { PaginationInfo, PendingInvite, User } from "@/types";

export interface UserManagementStore {
	users: User[];
	pendingInvites: PendingInvite[];
	pagination: PaginationInfo;
	invitesPagination: PaginationInfo;
	isLoading: boolean;
	isCreating: boolean;
	error: string | null;
	newEmail: string;
	latestInvite: { email: string; token: string } | null;
	setNewEmail: (email: string) => void;
	clearLatestInvite: () => void;
	fetchUsers: (page?: number) => Promise<void>;
	fetchPendingInvites: (page?: number) => Promise<void>;
	inviteUser: () => Promise<void>;
	updateUser: (
		id: string,
		role: "user" | "admin",
		active: boolean,
	) => Promise<void>;
}

export const useUserManagementStore = create<UserManagementStore>(
	(set, get) => ({
		users: [],
		pendingInvites: [],
		pagination: {
			offset: 0,
			limit: DEFAULT_PAGINATION.LIMIT,
			total: 0,
		},
		invitesPagination: {
			offset: 0,
			limit: DEFAULT_PAGINATION.LIMIT,
			total: 0,
		},
		isLoading: false,
		isCreating: false,
		error: null,
		newEmail: "",
		latestInvite: null,
		setNewEmail: (email) =>
			set(
				produce((state) => {
					state.newEmail = email;
				}),
			),
		clearLatestInvite: () =>
			set(
				produce((state) => {
					state.latestInvite = null;
				}),
			),

		fetchUsers: async (page = 1) => {
			set(
				produce((state) => {
					state.isLoading = true;
					state.error = null;
				}),
			);
			try {
				const limit = get().pagination.limit;
				const resp = await fetchWithAuth(
					`${API_ENDPOINTS.USERS}?page=${page}&limit=${limit}`,
				);
				if (!resp.ok) throw new Error("Failed to fetch users");
				const data: {
					users: User[];
					total: number;
					page: number;
					limit: number;
				} = await resp.json();
				set(
					produce((state) => {
						state.users = data.users;
						state.pagination = {
							offset: (data.page - 1) * data.limit,
							limit: data.limit,
							total: data.total,
						};
					}),
				);
			} catch (err: unknown) {
				set(
					produce((state) => {
						state.error = err instanceof Error ? err.message : "Unknown error";
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

		inviteUser: async () => {
			const { newEmail } = get();
			if (!newEmail) return;
			set(
				produce((state) => {
					state.isCreating = true;
					state.error = null;
				}),
			);
			try {
				const resp = await fetchWithAuth(`${API_ENDPOINTS.USERS}/invite`, {
					method: "POST",
					body: JSON.stringify({
						email: newEmail,
					}),
				});
				const data = await resp.json();
				if (!resp.ok) {
					throw new Error(data?.error || "Failed to create invite");
				}
				set(
					produce((state) => {
						state.latestInvite = { email: data.email, token: data.token };
						state.newEmail = "";
						state.pendingInvites.unshift(data);
						state.invitesPagination.total += 1;
					}),
				);
				toast.success("Invite generated successfully");
			} catch (err: unknown) {
				set(
					produce((state) => {
						state.error = err instanceof Error ? err.message : "Unknown error";
					}),
				);
				toast.error(
					err instanceof Error ? err.message : "Failed to create invite",
				);
			} finally {
				set(
					produce((state) => {
						state.isCreating = false;
					}),
				);
			}
		},

		updateUser: async (id, role, active) => {
			set(
				produce((state) => {
					state.isLoading = true;
					state.error = null;
				}),
			);
			try {
				const resp = await fetchWithAuth(`${API_ENDPOINTS.USERS}/${id}`, {
					method: "PATCH",
					body: JSON.stringify({ role, active }),
				});
				if (!resp.ok) throw new Error("Failed to update user");
				const updated: User = await resp.json();
				set(
					produce((state) => {
						state.users = state.users.map((u: User) =>
							u.id === updated.id ? updated : u,
						);
					}),
				);
				toast.success("User updated successfully");
			} catch (err: unknown) {
				set(
					produce((state) => {
						state.error = err instanceof Error ? err.message : "Unknown error";
					}),
				);
				toast.error(
					err instanceof Error ? err.message : "Failed to update user",
				);
			} finally {
				set(
					produce((state) => {
						state.isLoading = false;
					}),
				);
			}
		},
		fetchPendingInvites: async (page = 1) => {
			set(
				produce((state) => {
					state.isLoading = true;
					state.error = null;
				}),
			);
			try {
				const limit = get().invitesPagination.limit;
				const resp = await fetchWithAuth(
					`${API_ENDPOINTS.USERS}/invites?page=${page}&limit=${limit}`,
				);
				if (!resp.ok) throw new Error("Failed to fetch pending invites");
				const data: {
					invites: PendingInvite[];
					total: number;
					page: number;
					limit: number;
				} = await resp.json();
				set(
					produce((state) => {
						state.pendingInvites = data.invites;
						state.invitesPagination = {
							offset: (data.page - 1) * data.limit,
							limit: data.limit,
							total: data.total,
						};
					}),
				);
			} catch (err: unknown) {
				set(
					produce((state) => {
						state.error = err instanceof Error ? err.message : "Unknown error";
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
	}),
);
