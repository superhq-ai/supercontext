import { useCallback, useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { fetchWithAuth } from "@/lib/utils";

interface Memory {
	id: string;
	content: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	similarity?: number;
}

interface PaginationInfo {
	limit: number;
	offset: number;
	total: number;
}

interface MemoriesResponse {
	memories: Memory[];
	pagination: PaginationInfo;
}

interface SearchResponse {
	results: Array<Memory & { similarity: number }>;
	pagination: PaginationInfo;
}

export function MemoriesPage() {
	const { session } = useAuth();
	const [memories, setMemories] = useState<Memory[]>([]);
	const [searchResults, setSearchResults] = useState<
		Array<Memory & { similarity: number }>
	>([]);
	const [pagination, setPagination] = useState<PaginationInfo>({
		limit: 20,
		offset: 0,
		total: 0,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSpaceId, setSelectedSpaceId] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [newMemoryContent, setNewMemoryContent] = useState("");
	const [newMemorySpaceId, setNewMemorySpaceId] = useState("");

	// For demo purposes, using a default space ID
	// In a real app, this would come from user's spaces or be selectable
	useEffect(() => {
		setSelectedSpaceId("demo-space-id");
		setNewMemorySpaceId("demo-space-id");
	}, []);

	const fetchMemories = useCallback(
		async (spaceId: string, limit = 20, offset = 0) => {
			if (!spaceId) return;

			setIsLoading(true);
			try {
				const response = await fetchWithAuth(
					`/api/memories?spaceId=${spaceId}&limit=${limit}&offset=${offset}`,
					session?.token,
				);

				if (response.ok) {
					const data: MemoriesResponse = await response.json();
					setMemories(data.memories);
					setPagination(data.pagination);
				}
			} catch (error) {
				console.error("Failed to fetch memories:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[session?.token],
	);

	const searchMemories = useCallback(
		async (query: string, spaceId: string, limit = 20, offset = 0) => {
			if (!query.trim() || !spaceId) return;

			setIsSearching(true);
			try {
				const response = await fetchWithAuth(
					"/api/memories/search",
					session?.token,
					{
						method: "POST",
						body: JSON.stringify({
							query,
							spaceId,
							limit,
							offset,
						}),
					},
				);

				if (response.ok) {
					const data: SearchResponse = await response.json();
					setSearchResults(data.results);
					setPagination(data.pagination);
				}
			} catch (error) {
				console.error("Failed to search memories:", error);
			} finally {
				setIsSearching(false);
			}
		},
		[session?.token],
	);

	const createMemory = async () => {
		if (!newMemoryContent.trim() || !newMemorySpaceId) return;

		setIsCreating(true);
		try {
			const response = await fetchWithAuth("/api/memories", session?.token, {
				method: "POST",
				body: JSON.stringify({
					content: newMemoryContent,
					spaceId: newMemorySpaceId,
				}),
			});

			if (response.ok) {
				const newMemory = await response.json();
				setMemories([newMemory, ...memories]);
				setNewMemoryContent("");
			}
		} catch (error) {
			console.error("Failed to create memory:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleSearch = () => {
		if (searchQuery.trim()) {
			searchMemories(searchQuery, selectedSpaceId);
		} else {
			fetchMemories(selectedSpaceId);
		}
	};

	const handlePageChange = (newOffset: number) => {
		if (searchQuery.trim()) {
			searchMemories(searchQuery, selectedSpaceId, pagination.limit, newOffset);
		} else {
			fetchMemories(selectedSpaceId, pagination.limit, newOffset);
		}
	};

	useEffect(() => {
		if (selectedSpaceId) {
			fetchMemories(selectedSpaceId);
		}
	}, [selectedSpaceId, fetchMemories]);

	const displayMemories = searchQuery.trim() ? searchResults : memories;
	const totalPages = Math.ceil(pagination.total / pagination.limit);
	const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Memories
						</h1>
						<p className="text-muted-foreground">
							View and search through your memories
						</p>
					</div>

					{/* Create New Memory */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Create New Memory</CardTitle>
							<CardDescription>Add a new memory to your space</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="newMemorySpaceId"
										className="text-sm font-medium text-muted-foreground"
									>
										Space ID
									</label>
									<Input
										id="newMemorySpaceId"
										placeholder="Enter space ID..."
										value={newMemorySpaceId}
										onChange={(e) => setNewMemorySpaceId(e.target.value)}
										className="mt-1"
									/>
								</div>
								<div>
									<label
										htmlFor="newMemoryContent"
										className="text-sm font-medium text-muted-foreground"
									>
										Memory Content
									</label>
									<Textarea
										id="newMemoryContent"
										placeholder="Enter your memory content..."
										value={newMemoryContent}
										onChange={(e) => setNewMemoryContent(e.target.value)}
										className="mt-1"
										rows={3}
									/>
								</div>
								<Button
									onClick={createMemory}
									disabled={
										isCreating || !newMemoryContent.trim() || !newMemorySpaceId
									}
								>
									{isCreating ? "Creating..." : "Create Memory"}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Search Section */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Search Memories</CardTitle>
							<CardDescription>
								Search through your memories using semantic search
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<Input
									placeholder="Enter your search query..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSearch()}
									className="flex-1"
								/>
								<Button onClick={handleSearch} disabled={isSearching}>
									{isSearching ? "Searching..." : "Search"}
								</Button>
								{searchQuery && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchQuery("");
											fetchMemories(selectedSpaceId);
										}}
									>
										Clear
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Memories List */}
					<div className="space-y-4">
						{isLoading ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">Loading memories...</p>
							</div>
						) : displayMemories.length === 0 ? (
							<Card>
								<CardContent className="py-8 text-center">
									<p className="text-muted-foreground">
										{searchQuery
											? "No memories found matching your search."
											: "No memories found."}
									</p>
								</CardContent>
							</Card>
						) : (
							<>
								{displayMemories.map((memory) => (
									<Card key={memory.id}>
										<CardHeader>
											<div className="flex justify-between items-start">
												<CardTitle className="text-lg">
													Memory {memory.id.slice(0, 8)}...
												</CardTitle>
												<div className="flex gap-2">
													{memory.similarity && (
														<Badge variant="secondary">
															{Math.round(memory.similarity * 100)}% match
														</Badge>
													)}
													<Badge variant="outline">
														{new Date(memory.createdAt).toLocaleDateString()}
													</Badge>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<p className="text-foreground mb-4">{memory.content}</p>
											{memory.metadata && (
												<div className="text-sm text-muted-foreground">
													<strong>Metadata:</strong>{" "}
													{JSON.stringify(memory.metadata)}
												</div>
											)}
										</CardContent>
									</Card>
								))}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex justify-center items-center gap-2 mt-6">
										<Button
											variant="outline"
											onClick={() =>
												handlePageChange(pagination.offset - pagination.limit)
											}
											disabled={pagination.offset === 0}
										>
											Previous
										</Button>

										<span className="text-sm text-muted-foreground">
											Page {currentPage} of {totalPages}
										</span>

										<Button
											variant="outline"
											onClick={() =>
												handlePageChange(pagination.offset + pagination.limit)
											}
											disabled={
												pagination.offset + pagination.limit >= pagination.total
											}
										>
											Next
										</Button>
									</div>
								)}

								{/* Results Summary */}
								<div className="text-center text-sm text-muted-foreground mt-4">
									Showing {pagination.offset + 1} to{" "}
									{Math.min(
										pagination.offset + pagination.limit,
										pagination.total,
									)}{" "}
									of {pagination.total} memories
								</div>
							</>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
