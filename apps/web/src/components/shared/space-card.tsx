import { SpaceUserManagementModal } from "@/components/modals/space-user-management-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Space {
	id: string;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

interface SpaceCardProps {
	space: Space;
	onDelete?: (spaceId: string) => void;
	showAdminActions?: boolean;
	className?: string;
}

export function SpaceCard({
	space,
	onDelete,
	showAdminActions,
	className,
}: SpaceCardProps) {
	return (
		<Card
			className={`transition-all duration-200 hover:bg-accent/50 hover:border-accent ${className || ""}`}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* Space Header */}
					<div className="flex justify-between items-start">
						<div className="space-y-1">
							<h3 className="text-lg font-semibold text-foreground">
								{space.name}
							</h3>
							{space.description && (
								<p className="text-sm text-muted-foreground">
									{space.description}
								</p>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="text-xs">
								{new Date(space.createdAt).toLocaleDateString()}
							</Badge>
							{showAdminActions && (
								<div className="flex gap-1">
									<SpaceUserManagementModal spaceId={space.id} />
									<Button
										variant="destructive"
										size="sm"
										onClick={() => onDelete?.(space.id)}
									>
										Delete
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Space ID */}
					<div>
						<span className="text-xs text-muted-foreground">Space ID: </span>
						<code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
							{space.id}
						</code>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
