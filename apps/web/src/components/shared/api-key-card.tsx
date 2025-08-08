import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Space {
	id: string;
	name: string;
}

interface ApiKey {
	id: string;
	name: string;
	key: string;
	spaces: Space[];
	createdAt: string;
	lastUsedAt?: string;
	status: "active" | "revoked";
}

interface ApiKeyCardProps {
	apiKey: ApiKey;
	onRevoke?: (apiKeyId: string) => void;
	onDelete?: (apiKeyId: string) => void;
	className?: string;
}

export function ApiKeyCard({ apiKey, onRevoke, onDelete, className }: ApiKeyCardProps) {
	return (
		<Card 
			className={`transition-all duration-200 hover:bg-accent/50 hover:border-accent ${className || ""}`}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* API Key Header */}
					<div className="flex justify-between items-start">
						<div className="space-y-1">
							<h3 className="text-lg font-semibold text-foreground">
								{apiKey.name}
							</h3>
							<p className="text-sm text-muted-foreground">
								API Key: {apiKey.key.slice(0, 8)}...
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant={apiKey.status === "active" ? "default" : "secondary"}
								className="text-xs"
							>
								{apiKey.status === "active" ? "Active" : "Revoked"}
							</Badge>
							{apiKey.status === "active" ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => onRevoke?.(apiKey.id)}
								>
									Revoke
								</Button>
							) : (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => onDelete?.(apiKey.id)}
								>
									Delete
								</Button>
							)}
						</div>
					</div>

					{/* API Key Details */}
					<div className="space-y-2 text-sm text-muted-foreground">
						<div>
							<span className="font-medium">Created:</span>{" "}
							{new Date(apiKey.createdAt).toLocaleDateString()}
						</div>
						{apiKey.lastUsedAt && (
							<div>
								<span className="font-medium">Last Used:</span>{" "}
								{new Date(apiKey.lastUsedAt).toLocaleDateString()}
							</div>
						)}
					</div>

					{/* Spaces */}
					{apiKey.spaces && apiKey.spaces.length > 0 && (
						<div>
							<span className="text-sm font-medium text-foreground">Spaces:</span>
							<div className="flex flex-wrap gap-1 mt-1">
								{apiKey.spaces.map((space) => (
									<span
										key={space.id}
										className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded"
									>
										{space.name}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}