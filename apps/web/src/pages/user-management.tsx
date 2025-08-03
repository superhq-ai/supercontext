import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useUserManagementStore } from "@/stores/user-management-store";
import type { User } from "@/types";

export function UserManagementPage() {
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";

	const {
		users,
		pagination,
		isLoading,
		isCreating,
		newName,
		newEmail,
		newPassword,
		newRole,
		setNewName,
		setNewEmail,
		setNewPassword,
		setNewRole,
		fetchUsers,
		createUser,
		updateUser,
	} = useUserManagementStore();

	const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);

	useEffect(() => {
		if (isAdmin) {
			fetchUsers();
		}
	}, [isAdmin, fetchUsers]);

	const resetCreateForm = () => {
		setNewName("");
		setNewEmail("");
		setNewRole("user");
		setNewPassword("");
	};

	const handleCreate = async () => {
		await createUser();
		if (!isCreating) {
			resetCreateForm();
			setCreateUserModalOpen(false);
		}
	};

	const handleUpdate = (u: User) => {
		updateUser(u.id, u.role, u.active);
	};

	const handleRoleChange = (id: string, role: "user" | "admin") => {
		useUserManagementStore.setState((state) => ({
			users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
		}));
	};

	const handleToggleActive = (id: string) => () => {
		useUserManagementStore.setState((state) => ({
			users: state.users.map((u) =>
				u.id === id ? { ...u, active: !u.active } : u,
			),
		}));
	};

	const handlePageChange = (newOffset: number) => {
		fetchUsers(Math.floor(newOffset / pagination.limit) + 1);
	};

	const paginationInfo = {
		offset: (pagination.page - 1) * pagination.limit,
		limit: pagination.limit,
		total: pagination.totalPages * pagination.limit, // Approximation
	};

	return (
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							User Management
						</h1>
						<p className="text-muted-foreground">
							Create, view, and manage users.
						</p>
					</div>
					{isAdmin && (
						<Dialog
							open={isCreateUserModalOpen}
							onOpenChange={(open) => {
								if (!open) resetCreateForm();
								setCreateUserModalOpen(open);
							}}
						>
							<DialogTrigger asChild>
								<Button>Create User</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create New User</DialogTitle>
									<DialogDescription>
										Enter the details for the new user.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="name" className="text-right">
											Name
										</Label>
										<Input
											id="name"
											value={newName}
											onChange={(e) => setNewName(e.target.value)}
											className="col-span-3"
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="email" className="text-right">
											Email
										</Label>
										<Input
											id="email"
											type="email"
											value={newEmail}
											onChange={(e) => setNewEmail(e.target.value)}
											className="col-span-3"
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="password" className="text-right">
											Password
										</Label>
										<Input
											id="password"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="col-span-3"
										/>
									</div>
									<div className="grid grid-cols-4 items-center gap-4">
										<Label htmlFor="role" className="text-right">
											Role
										</Label>
										<Select
											value={newRole}
											onValueChange={(value: "user" | "admin") =>
												setNewRole(value)
											}
										>
											<SelectTrigger className="col-span-3">
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="user">User</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<DialogFooter>
									<Button onClick={handleCreate} disabled={isCreating}>
										{isCreating ? "Creating..." : "Create User"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{!isAdmin ? (
					<Card>
						<CardHeader>
							<CardTitle>Access Denied</CardTitle>
						</CardHeader>
						<CardContent>
							<p>You do not have permission to manage users.</p>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Users</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="min-w-full">
									<thead>
										<tr className="border-b">
											<th className="text-left p-4">Name</th>
											<th className="text-left p-4">Email</th>
											<th className="text-left p-4">Role</th>
											<th className="text-left p-4">Status</th>
											<th className="text-left p-4">Created</th>
											<th className="text-left p-4">Actions</th>
										</tr>
									</thead>
									<tbody>
										{isLoading ? (
											<tr>
												<td colSpan={6} className="text-center p-4">
													Loading users...
												</td>
											</tr>
										) : users.length === 0 ? (
											<tr>
												<td colSpan={6} className="text-center p-4">
													No users found.
												</td>
											</tr>
										) : (
											users.map((u) => (
												<tr key={u.id} className="border-b">
													<td className="p-4">{u.name}</td>
													<td className="p-4">{u.email}</td>
													<td className="p-4">
														<Select
															value={u.role}
															onValueChange={(role: "user" | "admin") =>
																handleRoleChange(u.id, role)
															}
														>
															<SelectTrigger className="w-[100px]">
																<SelectValue placeholder="Select role" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="user">User</SelectItem>
																<SelectItem value="admin">Admin</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="p-4">
														<Badge
															variant={u.active ? "outline" : "destructive"}
														>
															{u.active ? "Active" : "Deactivated"}
														</Badge>
													</td>
													<td className="p-4">
														{new Date(u.createdAt).toLocaleDateString()}
													</td>
													<td className="p-4 space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={handleToggleActive(u.id)}
														>
															{u.active ? "Deactivate" : "Activate"}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleUpdate(u)}
														>
															Save
														</Button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
							<Pagination
								currentPage={pagination.page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
								pagination={paginationInfo}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</MainLayout>
	);
}
