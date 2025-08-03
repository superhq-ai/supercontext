import { produce } from "immer";
import { create } from "zustand";
import { API_ENDPOINTS, DEFAULT_PAGINATION } from "@/constants";
import { fetchWithAuth } from "@/lib/utils";

export interface User {
	id: string;
	name: string;
	email: string;
	role: "user" | "admin";
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UserManagementStore {
	users: User[];
	pagination: {
		page: number;
		limit: number;
		totalPages: number;
	};
	isLoading: boolean;
	isCreating: boolean;
	error: string | null;
	newName: string;
	newEmail: string;
	newPassword: string;
	newRole: "user" | "admin";
	setNewName: (name: string) => void;
	setNewEmail: (email: string) => void;
	setNewPassword: (password: string) => void;
	setNewRole: (role: "user" | "admin") => void;
	fetchUsers: (page?: number) => Promise<void>;
	createUser: () => Promise<void>;
	updateUser: (
		id: string,
		role: "user" | "admin",
		active: boolean,
	) => Promise<void>;
}

export const useUserManagementStore = create<UserManagementStore>(
	(set, get) => ({
		users: [],
		pagination: {
			page: 1,
			limit: DEFAULT_PAGINATION.LIMIT,
			totalPages: 1,
		},
		isLoading: false,
		isCreating: false,
		error: null,
		newName: "",
		newEmail: "",
		newPassword: "",
		newRole: "user",
		setNewName: (name) =>
			set(
				produce((state) => {
					state.newName = name;
				}),
			),
		setNewEmail: (email) =>
			set(
				produce((state) => {
					state.newEmail = email;
				}),
			),
		setNewPassword: (password) =>
			set(
				produce((state) => {
					state.newPassword = password;
				}),
			),
		setNewRole: (role) =>
			set(
				produce((state) => {
					state.newRole = role;
				}),
			),

		fetchUsers: async (page = get().pagination.page) => {
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
					totalPages: number;
				} = await resp.json();
				set(
					produce((state) => {
						state.users = data.users;
						state.pagination = {
							page: data.page,
							limit: data.limit,
							totalPages: data.totalPages,
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

		createUser: async () => {
			const { newName, newEmail, newPassword, newRole, pagination } = get();
			if (!newName || !newEmail || !newPassword) return;
			set(
				produce((state) => {
					state.isCreating = true;
					state.error = null;
				}),
			);
			try {
				const resp = await fetchWithAuth(API_ENDPOINTS.USERS, {
					method: "POST",
					body: JSON.stringify({
						name: newName,
						email: newEmail,
						role: newRole,
						password: newPassword,
					}),
				});
				if (!resp.ok) throw new Error("Failed to create user");
				await get().fetchUsers(pagination.page);
				set(
					produce((state) => {
						state.newName = "";
						state.newEmail = "";
						state.newPassword = "";
						state.newRole = "user";
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
