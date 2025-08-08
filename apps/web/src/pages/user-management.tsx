import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layouts/main-layout";
import { Pagination } from "@/components/shared/pagination";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useUserManagementStore } from "@/stores/user-management-store";
import type { User } from "@/types";

export function UserManagementPage() {
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";

	const {
		users,
		pagination,
		pendingInvites,
		invitesPagination,
		isLoading,
		isCreating,
		newEmail,
		latestInvite,
		setNewEmail,
		clearLatestInvite,
		fetchUsers,
		fetchPendingInvites,
		inviteUser,
		updateUser,
		revokeInvite,
	} = useUserManagementStore();

	const [isInviteUserModalOpen, setInviteUserModalOpen] = useState(false);

	useEffect(() => {
		if (isAdmin) {
			fetchUsers();
			fetchPendingInvites();
		}
	}, [isAdmin, fetchUsers, fetchPendingInvites]);

	const resetInviteForm = () => {
		setNewEmail("");
	};

	const handleInvite = async () => {
		await inviteUser();
		if (!isCreating) {
			resetInviteForm();
			setInviteUserModalOpen(false);
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

	const handleInvitePageChange = (newOffset: number) => {
		fetchPendingInvites(Math.floor(newOffset / invitesPagination.limit) + 1);
	};

	const handleRevokeInvite = async (inviteId: string) => {
		if (confirm("Are you sure you want to revoke this invite?")) {
			await revokeInvite(inviteId);
		}
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
							open={isInviteUserModalOpen}
							onOpenChange={(open) => {
								if (!open) resetInviteForm();
								setInviteUserModalOpen(open);
							}}
						>
							<DialogTrigger asChild>
								<Button>Invite User</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite New User</DialogTitle>
									<DialogDescription>
										Enter the email address to send an invite. The invite will
										expire after the specified number of days.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
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
										<Label className="text-right col-span-1">
											Invite Expiry
										</Label>
										<div className="col-span-3 text-muted-foreground">
											Invites expire in 7 days.
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button onClick={handleInvite} disabled={isCreating}>
										{isCreating ? "Sending..." : "Send Invite"}
									</Button>
								</DialogFooter>
							</DialogContent>
							{/* Show invite link after successful invite */}
							{latestInvite && (
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Invite Link</DialogTitle>
									</DialogHeader>
									<div className="py-4">
										<p>
											Share this link with the invited user. The invite will
											expire in 7 days.
										</p>
										<div className="flex items-center mt-2">
											<Input
												readOnly
												value={`${window.location.origin}/invite/${latestInvite.token}`}
												className="mr-2"
											/>
											<Button
												onClick={() => {
													navigator.clipboard.writeText(
														`${window.location.origin}/invite/${latestInvite.token}`,
													);
													toast.success("Invite link copied to clipboard");
												}}
												variant="outline"
											>
												Copy Link
											</Button>
										</div>
									</div>
									<DialogFooter>
										<Button
											onClick={() => {
												clearLatestInvite();
												setInviteUserModalOpen(false);
											}}
										>
											Close
										</Button>
									</DialogFooter>
								</DialogContent>
							)}
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
					<Tabs defaultValue="users" className="space-y-6">
						<TabsList className="w-fit">
							<TabsTrigger value="users">Users</TabsTrigger>
							<TabsTrigger value="invites">
								Pending Invites
								{pendingInvites.length > 0 && (
									<Badge variant="secondary" className="ml-2">
										{pendingInvites.length}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="users" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Active Users</CardTitle>
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
										currentPage={
											Math.floor(pagination.offset / pagination.limit) + 1
										}
										totalPages={Math.ceil(pagination.total / pagination.limit)}
										onPageChange={handlePageChange}
										pagination={pagination}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="invites" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Pending Invitations</CardTitle>
								</CardHeader>
								<CardContent>
									{pendingInvites.length === 0 ? (
										<div className="text-center py-8">
											<p className="text-muted-foreground">No pending invites.</p>
										</div>
									) : (
										<>
											<div className="overflow-x-auto">
												<table className="min-w-full">
													<thead>
														<tr className="border-b">
															<th className="text-left p-4">Email</th>
															<th className="text-left p-4">Invited By</th>
															<th className="text-left p-4">Created</th>
															<th className="text-left p-4">Expires At</th>
															<th className="text-left p-4">Actions</th>
														</tr>
													</thead>
													<tbody>
														{pendingInvites.map((invite) => (
															<tr key={invite.id} className="border-b">
																<td className="p-4 font-medium">{invite.email}</td>
																<td className="p-4 text-muted-foreground">{invite.invitedBy}</td>
																<td className="p-4 text-muted-foreground">
																	{new Date(invite.createdAt).toLocaleDateString()}
																</td>
																<td className="p-4">
																	<Badge 
																		variant={new Date(invite.expiresAt) > new Date() ? "outline" : "destructive"}
																	>
																		{new Date(invite.expiresAt).toLocaleDateString()}
																	</Badge>
																</td>
																<td className="p-4 space-x-2">
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={() => {
																			navigator.clipboard.writeText(
																				`${window.location.origin}/invite/${invite.token}`,
																			);
																			toast.success(
																				"Invite link copied to clipboard",
																			);
																		}}
																	>
																		Copy Link
																	</Button>
																	<Button
																		size="sm"
																		variant="destructive"
																		onClick={() => handleRevokeInvite(invite.id)}
																		disabled={isLoading}
																	>
																		Revoke
																	</Button>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
											{invitesPagination.total > 0 && (
												<Pagination
													currentPage={
														Math.floor(
															invitesPagination.offset / invitesPagination.limit,
														) + 1
													}
													totalPages={Math.ceil(
														invitesPagination.total / invitesPagination.limit,
													)}
													onPageChange={handleInvitePageChange}
													pagination={invitesPagination}
												/>
											)}
										</>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</MainLayout>
	);
}
