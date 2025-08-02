import { useEffect } from "react";
import { useParams } from "react-router";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemoriesStore } from "@/stores/memories-store";

export const MemoryPage = () => {
	const { id } = useParams<{ id: string }>();
	const { currentMemory, isLoading, error, fetchMemoryById } =
		useMemoriesStore();

	useEffect(() => {
		if (id) {
			fetchMemoryById(id);
		}
	}, [id, fetchMemoryById]);

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				{isLoading && <p>Loading...</p>}
				{error && <p className="text-red-500">{error}</p>}
				{currentMemory && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="text-2xl">Memory Content</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-foreground whitespace-pre-wrap">
										{currentMemory.content}
									</p>
								</CardContent>
							</Card>
						</div>
						<div>
							<Card>
								<CardHeader>
									<CardTitle className="text-xl">Details</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<h4 className="font-semibold">Memory ID</h4>
										<p className="text-sm text-muted-foreground">
											{currentMemory.id}
										</p>
									</div>
									<div>
										<h4 className="font-semibold">Created At</h4>
										<p className="text-sm text-muted-foreground">
											{new Date(currentMemory.createdAt).toLocaleString()}
										</p>
									</div>
									<div>
										<h4 className="font-semibold">Space</h4>
										<Badge variant="secondary">
											{currentMemory.space.name}
										</Badge>
									</div>
									{currentMemory.metadata && (
										<div>
											<h4 className="font-semibold">Metadata</h4>
											<pre className="bg-muted p-2 rounded-md text-sm mt-1">
												{JSON.stringify(currentMemory.metadata, null, 2)}
											</pre>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};
