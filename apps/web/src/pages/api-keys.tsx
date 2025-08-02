import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
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
import { useAuth } from "@/contexts/auth-context";

interface ApiKey {
	id: string;
	name: string;
	key: string;
	spaceId?: string;
	createdAt: string;
	lastUsedAt?: string;
	status: "active" | "revoked";
}

export function ApiKeysPage() {
	const { session } = useAuth();
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [newKeySpaceId, setNewKeySpaceId] = useState("");

	const fetchApiKeys = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/api-keys", {
				headers: {
					Authorization: `Bearer ${session?.token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setApiKeys(data);
			}
		} catch (error) {
			console.error("Failed to fetch API keys:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const createApiKey = async () => {
		if (!newKeyName.trim()) return;

		setIsCreating(true);
		try {
			const response = await fetch("/api/api-keys", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session?.token}`,
				},
				body: JSON.stringify({
					name: newKeyName,
					spaceId: newKeySpaceId || undefined,
				}),
			});

			if (response.ok) {
				const newApiKey = await response.json();
				setApiKeys([...apiKeys, newApiKey]);
				setNewKeyName("");
				setNewKeySpaceId("");
			}
		} catch (error) {
			console.error("Failed to create API key:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const revokeApiKey = async (apiKeyId: string) => {
		try {
			const response = await fetch(`/api/api-keys/${apiKeyId}/revoke`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${session?.token}`,
				},
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
			const response = await fetch(`/api/api-keys/${apiKeyId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session?.token}`,
				},
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
	}, []);

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
									<label className="text-sm font-medium text-muted-foreground">
										API Key Name
									</label>
									<Input
										placeholder="Enter API key name..."
										value={newKeyName}
										onChange={(e) => setNewKeyName(e.target.value)}
										className="mt-1"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Space ID (Optional)
									</label>
									<Input
										placeholder="Enter space ID for restricted access..."
										value={newKeySpaceId}
										onChange={(e) => setNewKeySpaceId(e.target.value)}
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
											{apiKey.spaceId && (
												<div>
													<strong>Space ID:</strong> {apiKey.spaceId}
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
		</div>
	);
}
