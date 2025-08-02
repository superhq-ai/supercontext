import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";

interface Space {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export function SpacesPage() {
	const { session, user } = useAuth();
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newSpaceName, setNewSpaceName] = useState("");
	const [newSpaceDescription, setNewSpaceDescription] = useState("");

	const fetchSpaces = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/spaces", {
				headers: {
					Authorization: `Bearer ${session?.accessToken}`,
				},
			});
			
			if (response.ok) {
				const data = await response.json();
				setSpaces(data);
			}
		} catch (error) {
			console.error("Failed to fetch spaces:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const createSpace = async () => {
		if (!newSpaceName.trim()) return;
		
		setIsCreating(true);
		try {
			const response = await fetch("/api/spaces", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session?.accessToken}`,
				},
				body: JSON.stringify({
					name: newSpaceName,
					description: newSpaceDescription || undefined,
				}),
			});
			
			if (response.ok) {
				const newSpace = await response.json();
				setSpaces([...spaces, newSpace]);
				setNewSpaceName("");
				setNewSpaceDescription("");
			}
		} catch (error) {
			console.error("Failed to create space:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const deleteSpace = async (spaceId: string) => {
		if (!confirm("Are you sure you want to delete this space? This action cannot be undone.")) {
			return;
		}
		
		try {
			const response = await fetch(`/api/spaces/${spaceId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session?.accessToken}`,
				},
			});
			
			if (response.ok) {
				setSpaces(spaces.filter(space => space.id !== spaceId));
			}
		} catch (error) {
			console.error("Failed to delete space:", error);
		}
	};

	useEffect(() => {
		fetchSpaces();
	}, []);

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Spaces Management
						</h1>
						<p className="text-muted-foreground">
							Manage your spaces and their settings
						</p>
					</div>

					{/* Create New Space */}
					{user?.role === "admin" && (
						<Card className="mb-6">
							<CardHeader>
								<CardTitle>Create New Space</CardTitle>
								<CardDescription>
									Create a new space for organizing memories
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Space Name
										</label>
										<Input
											placeholder="Enter space name..."
											value={newSpaceName}
											onChange={(e) => setNewSpaceName(e.target.value)}
											className="mt-1"
										/>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Description (Optional)
										</label>
										<Input
											placeholder="Enter space description..."
											value={newSpaceDescription}
											onChange={(e) => setNewSpaceDescription(e.target.value)}
											className="mt-1"
										/>
									</div>
									<Button 
										onClick={createSpace} 
										disabled={isCreating || !newSpaceName.trim()}
									>
										{isCreating ? "Creating..." : "Create Space"}
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

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
													<Button
														variant="destructive"
														size="sm"
														onClick={() => deleteSpace(space.id)}
													>
														Delete
													</Button>
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
			</main>
		</div>
	);
} 