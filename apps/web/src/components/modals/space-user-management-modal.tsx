import {
	Crown,
	Loader2,
	User as UserIcon,
	UserPlus,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SpaceUserManagementForm } from "@/components/forms/space-user-management-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchWithAuth } from "@/lib/utils";
import type { User } from "@/types";

interface SpaceUserManagementModalProps {
	spaceId: string;
}

interface SpaceUser extends User {
	spaceRole: "owner" | "member";
}

const SpaceUsersList = ({ spaceId }: { spaceId: string }) => {
	const [users, setUsers] = useState<SpaceUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [removingUserId, setRemovingUserId] = useState<string | null>(null);

	const fetchUsers = useCallback(
		async (cursor?: string, isInitial = false) => {
			if (isInitial) {
				setInitialLoading(true);
			} else {
				setLoading(true);
			}

			try {
				const params = new URLSearchParams();
				if (cursor) {
					params.set("cursor", cursor);
				}
				const url = `/api/spaces/${spaceId}/users?${params}`;
				const response = await fetchWithAuth(url);
				if (response.ok) {
					const data = await response.json();
					if (cursor) {
						setUsers((prev) => [...prev, ...data.data]);
					} else {
						setUsers(data.data);
					}
					setNextCursor(data.nextCursor);
				}
			} catch (error) {
				console.error("Failed to fetch space users:", error);
			} finally {
				setLoading(false);
				setInitialLoading(false);
			}
		},
		[spaceId],
	);

	const handleRemoveUser = useCallback(
		async (userId: string) => {
			setRemovingUserId(userId);
			try {
				const response = await fetchWithAuth(
					`/api/spaces/${spaceId}/users/${userId}`,
					{
						method: "DELETE",
					},
				);

				if (response.ok) {
					setUsers((prev) => prev.filter((u) => u.id !== userId));
				} else {
					console.error("Failed to remove user");
					// TODO: Add toast notification
				}
			} catch (error) {
				console.error("Failed to remove user:", error);
			} finally {
				setRemovingUserId(null);
			}
		},
		[spaceId],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Initial fetch on mount
	useEffect(() => {
		fetchUsers(undefined, true);
	}, [spaceId]);

	if (initialLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin" />
				<span className="ml-2 text-sm text-muted-foreground">
					Loading users...
				</span>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<Users className="h-12 w-12 text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium">No users found</h3>
				<p className="text-sm text-muted-foreground">
					This space doesn't have any users yet.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-muted-foreground">
					{users.length} {users.length === 1 ? "user" : "users"}
				</h3>
			</div>

			<div className="space-y-3">
				{users.map((user) => (
					<Card key={user.id} className="p-4">
						<CardContent className="p-0">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
											<UserIcon className="h-5 w-5 text-primary" />
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center space-x-2">
											<p className="text-sm font-medium text-foreground truncate">
												{user.name}
											</p>
											<Badge
												variant={
													user.spaceRole === "owner" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{user.spaceRole === "owner" && (
													<Crown className="h-3 w-3 mr-1" />
												)}
												{user.spaceRole}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground truncate">
											{user.email}
										</p>
									</div>
								</div>
								{user.spaceRole !== "owner" && (
									<Button
										variant="destructive"
										size="sm"
										className="flex-shrink-0"
										onClick={() => handleRemoveUser(user.id)}
										disabled={removingUserId === user.id}
									>
										{removingUserId === user.id ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Removing...
											</>
										) : (
											"Remove"
										)}
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{nextCursor && (
				<div className="pt-4 border-t">
					<Button
						onClick={() => fetchUsers(nextCursor)}
						disabled={loading}
						variant="outline"
						className="w-full"
					>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Loading...
							</>
						) : (
							"Load More Users"
						)}
					</Button>
				</div>
			)}
		</div>
	);
};

export const SpaceUserManagementModal = ({
	spaceId,
}: SpaceUserManagementModalProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Users className="h-4 w-4" />
					Manage Users
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px] max-h-[80vh] min-h-[500px] flex flex-col">
				<DialogHeader className="pb-4">
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Manage Space Users
					</DialogTitle>
					<DialogDescription>
						Add or remove users from this space and manage their roles.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					<Tabs defaultValue="users" className="h-full flex flex-col">
						<TabsList className="grid w-full grid-cols-2 mb-6">
							<TabsTrigger value="users" className="flex items-center gap-2">
								<Users className="h-4 w-4" />
								Current Users
							</TabsTrigger>
							<TabsTrigger value="add" className="flex items-center gap-2">
								<UserPlus className="h-4 w-4" />
								Add User
							</TabsTrigger>
						</TabsList>

						<div className="flex-1 overflow-auto">
							<TabsContent value="users" className="mt-0 h-full">
								<SpaceUsersList spaceId={spaceId} />
							</TabsContent>
							<TabsContent value="add" className="mt-0 h-full">
								<SpaceUserManagementForm spaceId={spaceId} />
							</TabsContent>
						</div>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
};
