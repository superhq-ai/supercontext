import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Memory } from "@/types";

interface MemoryCardProps {
	memory: Memory;
	onClick?: () => void;
	className?: string;
}

export function MemoryCard({ memory, onClick, className }: MemoryCardProps) {
	return (
		<Card 
			className={`transition-all duration-200 hover:bg-accent/50 hover:border-accent cursor-pointer ${className || ""}`}
			onClick={onClick}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* Memory Header */}
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-primary">
								Memory {memory.id.slice(0, 8)}...
							</span>
							{memory.similarity && (
								<Badge variant="secondary" className="text-xs">
									{Math.round(memory.similarity * 100)}% match
								</Badge>
							)}
						</div>
						<Badge variant="outline" className="text-xs">
							{new Date(memory.createdAt).toLocaleDateString()}
						</Badge>
					</div>

					{/* Memory Content */}
					<div className="text-sm text-foreground leading-relaxed">
						{memory.content.length > 150
							? `${memory.content.slice(0, 150)}...`
							: memory.content}
					</div>

					{/* Spaces */}
					{memory.spaces && memory.spaces.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{memory.spaces.map((space) => (
								<span
									key={space.id}
									className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded"
								>
									{space.name}
								</span>
							))}
						</div>
					)}

					{/* Metadata (if exists) */}
					{memory.metadata && (
						<div className="text-xs text-muted-foreground">
							<strong>Metadata:</strong> {JSON.stringify(memory.metadata)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}