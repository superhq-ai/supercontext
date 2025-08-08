import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Memory } from "@/types";

interface MemoryDetailCardProps {
	memory: Memory;
	className?: string;
}

export function MemoryDetailCard({ memory, className }: MemoryDetailCardProps) {
	return (
		<Card className={`transition-all duration-200 ${className || ""}`}>
			<CardHeader className="pb-4">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<CardTitle className="text-xl font-semibold text-primary">
							Memory {memory.id.slice(0, 8)}...
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							Created {new Date(memory.createdAt).toLocaleString()}
						</p>
					</div>
					{memory.similarity && (
						<Badge variant="secondary" className="text-xs">
							{Math.round(memory.similarity * 100)}% match
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Memory Content */}
				<div>
					<h4 className="text-sm font-semibold text-foreground mb-2">Content</h4>
					<div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-accent/30 p-3 rounded-md border">
						{memory.content}
					</div>
				</div>

				{/* Spaces */}
				{memory.spaces && memory.spaces.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-2">Spaces</h4>
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
					</div>
				)}

				{/* Memory ID */}
				<div>
					<h4 className="text-sm font-semibold text-foreground mb-2">Memory ID</h4>
					<code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
						{memory.id}
					</code>
				</div>

				{/* Metadata */}
				{memory.metadata && (
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-2">Metadata</h4>
						<pre className="bg-muted p-3 rounded-md text-xs text-muted-foreground overflow-x-auto">
							{JSON.stringify(memory.metadata, null, 2)}
						</pre>
					</div>
				)}
			</CardContent>
		</Card>
	);
}