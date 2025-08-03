import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateSpaceModal } from "@/components/create-space-modal";
import { MainLayout } from "@/components/layouts/main-layout";
import { SpaceUserManagementModal } from "@/components/space-user-management-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { fetchWithAuth } from "@/lib/utils";

interface Space {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export function SpacesPage() {
	const { user } = useAuth();
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchSpaces = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetchWithAuth("/api/spaces");

			if (response.ok) {
				const data = await response.json();
				setSpaces(data);
			}
		} catch (error) {
			console.error("Failed to fetch spaces:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const createSpace = async (name: string, description?: string) => {
		setIsCreating(true);
		try {
			const response = await fetchWithAuth("/api/spaces", {
				method: "POST",
				body: JSON.stringify({
					name,
					description: description || undefined,
				}),
			});

			if (response.ok) {
				const newSpace = await response.json();
				setSpaces([...spaces, newSpace]);
				toast.success("Space created successfully");
				setIsModalOpen(false);
			}
		} catch (error) {
			toast.error("Failed to create space");
			console.error("Failed to create space:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const deleteSpace = async (spaceId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this space? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetchWithAuth(`/api/spaces/${spaceId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setSpaces(spaces.filter((space) => space.id !== spaceId));
				toast.success("Space deleted successfully");
			}
		} catch (error) {
			console.error("Failed to delete space:", error);
		}
	};

	useEffect(() => {
		fetchSpaces();
	}, [fetchSpaces]);

	return (
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">Spaces</h1>
					<p className="text-muted-foreground">
						Manage your spaces and their settings
					</p>
				</div>

				{/* Create New Space */}
				<div className="mb-6">
					<Button onClick={() => setIsModalOpen(true)}>Create New Space</Button>
					<CreateSpaceModal
						open={isModalOpen}
						onOpenChange={setIsModalOpen}
						onCreate={createSpace}
						isCreating={isCreating}
					/>
				</div>

				{/* Spaces List */}
				<div className="space-y-4">
					{isLoading ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Loading spaces...</p>
						</div>
					) : spaces.length === 0 ? (
						<Card>
							<CardContent className="py-8 text-center">
								<p className="text-muted-foreground">No spaces found.</p>
							</CardContent>
						</Card>
					) : (
						spaces.map((space) => (
							<Card key={space.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg">{space.name}</CardTitle>
											{space.description && (
												<CardDescription className="mt-1">
													{space.description}
												</CardDescription>
											)}
										</div>
										<div className="flex gap-2">
											<Badge variant="outline">
												{new Date(space.createdAt).toLocaleDateString()}
											</Badge>
											{user?.role === "admin" && (
												<>
													<SpaceUserManagementModal spaceId={space.id} />
													<Button
														variant="destructive"
														size="sm"
														onClick={() => deleteSpace(space.id)}
													>
														Delete
													</Button>
												</>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-sm text-muted-foreground">
										<strong>Space ID:</strong> {space.id}
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</MainLayout>
	);
}
