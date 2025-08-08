import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layouts/main-layout";
import { ApiKeyModal } from "@/components/modals/api-key-modal";
import { CreateApiKeyModal } from "@/components/modals/create-api-key-modal";
import { ApiKeyCard } from "@/components/shared/api-key-card";
import type { Option } from "@/components/shared/space-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

	const createApiKey = async (name: string, spaceIds: string[]) => {
		setIsCreating(true);
		try {
			const response = await fetchWithAuth("/api/api-keys", {
				method: "POST",
				body: JSON.stringify({
					name,
					spaceIds,
				}),
			});

			if (response.ok) {
				const newKey = await response.json();
				setApiKeys([...apiKeys, newKey]);
				setNewApiKey(newKey.key);
				setIsModalOpen(true);
				setIsCreateModalOpen(false);
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
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">API Keys</h1>
					<p className="text-muted-foreground">
						Manage your API keys for programmatic access
					</p>
				</div>

				{/* Create New API Key */}
				<div className="mb-6">
					<Button onClick={() => setIsCreateModalOpen(true)}>
						Create New API Key
					</Button>
					<CreateApiKeyModal
						open={isCreateModalOpen}
						onOpenChange={setIsCreateModalOpen}
						spaces={spaces}
						onCreate={createApiKey}
						isCreating={isCreating}
					/>
				</div>

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
							<ApiKeyCard
								key={apiKey.id}
								apiKey={apiKey}
								onRevoke={revokeApiKey}
								onDelete={deleteApiKey}
							/>
						))
					)}
				</div>
			</div>

			{newApiKey && (
				<ApiKeyModal
					apiKey={newApiKey}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</MainLayout>
	);
}
