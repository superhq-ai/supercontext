import { useCallback, useEffect, useState } from "react";
import { ApiKeyModal } from "@/components/api-key-modal";
import { Navigation } from "@/components/navigation";
import type { Option } from "@/components/space-selector";
import { SpaceSelector } from "@/components/space-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/utils";

interface ApiKey {
	id: string;
	name: string;
	key: string;
	spaces: Space[];
	createdAt: string;
	lastUsedAt?: string;
	status: "active" | "revoked";
}

interface Space {
	id: string;
	name: string;
}

export function ApiKeysPage() {
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [spaces, setSpaces] = useState<Option[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);
	const [newApiKey, setNewApiKey] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchApiKeys = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetchWithAuth("/api/api-keys");
			if (response.ok) {
				const data = await response.json();
				setApiKeys(data);
			}
		} catch (error) {
			console.error("Failed to fetch API keys:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const fetchSpaces = useCallback(async () => {
		try {
			const response = await fetchWithAuth("/api/spaces");
			if (response.ok) {
				const data: Space[] = await response.json();
				setSpaces(data.map((s) => ({ value: s.id, label: s.name })));
			}
		} catch (error) {
			console.error("Failed to fetch spaces:", error);
		}
	}, []);

	const createApiKey = async () => {
		if (!newKeyName.trim()) return;

		setIsCreating(true);
		try {
			const response = await fetchWithAuth("/api/api-keys", {
				method: "POST",
				body: JSON.stringify({
					name: newKeyName,
					spaceIds: selectedSpaceIds,
				}),
			});

			if (response.ok) {
				const newKey = await response.json();
				setApiKeys([...apiKeys, newKey]);
				setNewApiKey(newKey.key);
				setIsModalOpen(true);
				setNewKeyName("");
				setSelectedSpaceIds([]);
			}
		} catch (error) {
			console.error("Failed to create API key:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const revokeApiKey = async (apiKeyId: string) => {
		try {
			const response = await fetchWithAuth(`/api/api-keys/${apiKeyId}/revoke`, {
				method: "PATCH",
			});

			if (response.ok) {
				setApiKeys(
					apiKeys.map((key) =>
						key.id === apiKeyId ? { ...key, status: "revoked" } : key,
					),
				);
			}
		} catch (error) {
			console.error("Failed to revoke API key:", error);
		}
	};

	const deleteApiKey = async (apiKeyId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this API key? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetchWithAuth(`/api/api-keys/${apiKeyId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setApiKeys(apiKeys.filter((key) => key.id !== apiKeyId));
			}
		} catch (error) {
			console.error("Failed to delete API key:", error);
		}
	};

	useEffect(() => {
		fetchApiKeys();
		fetchSpaces();
	}, [fetchApiKeys, fetchSpaces]);

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							API Keys Management
						</h1>
						<p className="text-muted-foreground">
							Manage your API keys for programmatic access
						</p>
					</div>

					{/* Create New API Key */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Create New API Key</CardTitle>
							<CardDescription>
								Create a new API key for programmatic access to your spaces
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="apiKeyName"
										className="text-sm font-medium text-muted-foreground"
									>
										API Key Name
									</label>
									<Input
										id="apiKeyName"
										placeholder="Enter API key name..."
										value={newKeyName}
										onChange={(e) => setNewKeyName(e.target.value)}
										className="mt-1"
									/>
								</div>
								<div>
									<label
										htmlFor="spaceIds"
										className="text-sm font-medium text-muted-foreground"
									>
										Spaces
									</label>
									<SpaceSelector
										options={spaces}
										selected={selectedSpaceIds}
										onChange={setSelectedSpaceIds}
										className="mt-1"
									/>
								</div>
								<Button
									onClick={createApiKey}
									disabled={isCreating || !newKeyName.trim()}
								>
									{isCreating ? "Creating..." : "Create API Key"}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* API Keys List */}
					<div className="space-y-4">
						{isLoading ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">Loading API keys...</p>
							</div>
						) : apiKeys.length === 0 ? (
							<Card>
								<CardContent className="py-8 text-center">
									<p className="text-muted-foreground">No API keys found.</p>
								</CardContent>
							</Card>
						) : (
							apiKeys.map((apiKey) => (
								<Card key={apiKey.id}>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="text-lg">{apiKey.name}</CardTitle>
												<CardDescription className="mt-1">
													API Key: {apiKey.key.slice(0, 8)}...
												</CardDescription>
											</div>
											<div className="flex gap-2">
												<Badge
													variant={
														apiKey.status === "active" ? "default" : "secondary"
													}
												>
													{apiKey.status === "active" ? "Active" : "Revoked"}
												</Badge>
												{apiKey.status === "active" ? (
													<Button
														variant="outline"
														size="sm"
														onClick={() => revokeApiKey(apiKey.id)}
													>
														Revoke
													</Button>
												) : (
													<Button
														variant="destructive"
														size="sm"
														onClick={() => deleteApiKey(apiKey.id)}
													>
														Delete
													</Button>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="space-y-2 text-sm text-muted-foreground">
											<div>
												<strong>Created:</strong>{" "}
												{new Date(apiKey.createdAt).toLocaleDateString()}
											</div>
											{apiKey.lastUsedAt && (
												<div>
													<strong>Last Used:</strong>{" "}
													{new Date(apiKey.lastUsedAt).toLocaleDateString()}
												</div>
											)}
											{apiKey.spaces && apiKey.spaces.length > 0 && (
												<div>
													<strong>Spaces:</strong>{" "}
													{apiKey.spaces.map((space) => (
														<Badge key={space.id} variant="secondary">
															{space.name}
														</Badge>
													))}
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</div>
			</main>

			{newApiKey && (
				<ApiKeyModal
					apiKey={newApiKey}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	);
}
