import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";
import { CreateMemoryModal } from "@/components/modals/create-memory-modal";
import { Pagination } from "@/components/shared/pagination";
import { SpaceSelector } from "@/components/shared/space-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DEFAULT_SORT_ORDER } from "@/constants";
import { useMemoriesStore } from "@/stores/memories-store";

export function MemoriesPage() {
	const {
		memories,
		pagination,
		searchQuery,
		isLoading,
		error,
		spaces,
		selectedSpaceIds,
		sortOrder,
		isCreating,
		creationStatus,
		newMemoryContent,
		newMemorySpaceIds,
		setCreationStatus,
		setSearchQuery,
		setSelectedSpaceIds,
		setSortOrder,
		setNewMemoryContent,
		setNewMemorySpaceIds,
		fetchSpaces,
		fetchData,
		createMemory,
		searchMemories,
	} = useMemoriesStore();

	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const [tempSelectedSpaceIds, setTempSelectedSpaceIds] = useState<string[]>(
		[],
	);
	const [isInSearchMode, setIsInSearchMode] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	useEffect(() => {
		fetchSpaces();
		fetchData({ spaceIds: [], sortOrder: DEFAULT_SORT_ORDER });
	}, [fetchSpaces, fetchData]);

	useEffect(() => {
		if (isInSearchMode) return;

		if (spaces.length > 0) {
			fetchData({ spaceIds: selectedSpaceIds, sortOrder });
		}
	}, [selectedSpaceIds, sortOrder, isInSearchMode, spaces.length, fetchData]);

	const handlePageChange = useCallback(
		(newOffset: number) => {
			if (isInSearchMode) {
				searchMemories({
					query: searchQuery,
					spaceIds: selectedSpaceIds,
					offset: newOffset,
					sortOrder,
				});
			} else {
				fetchData({
					spaceIds: selectedSpaceIds,
					offset: newOffset,
					sortOrder,
				});
			}
		},
		[
			fetchData,
			searchMemories,
			selectedSpaceIds,
			searchQuery,
			sortOrder,
			isInSearchMode,
		],
	);

	const handleSearch = () => {
		const trimmedQuery = searchQuery.trim();
		if (trimmedQuery) {
			setIsInSearchMode(true);
			searchMemories({
				query: trimmedQuery,
				spaceIds: selectedSpaceIds,
				sortOrder,
			});
		} else {
			setIsInSearchMode(false);
			fetchData({ spaceIds: selectedSpaceIds, sortOrder });
		}
	};

	const handleSortChange = (value: "asc" | "desc") => {
		setSortOrder(value);
		if (isInSearchMode) {
			searchMemories({
				query: searchQuery,
				sortOrder: value,
				spaceIds: selectedSpaceIds,
				offset: 0,
			});
		}
	};

	const handleApplyFilters = (newSpaceIds: string[]) => {
		setSelectedSpaceIds(newSpaceIds);
		if (isInSearchMode) {
			searchMemories({
				query: searchQuery,
				spaceIds: newSpaceIds,
				offset: 0,
				sortOrder,
			});
		}
		setIsFilterDialogOpen(false);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		setIsInSearchMode(false);
		setSelectedSpaceIds([]);
		fetchData({ spaceIds: [], sortOrder });
	};

	const handleResetForm = () => {
		setNewMemorySpaceIds([]);
		setNewMemoryContent("");
		setCreationStatus(null);
	};

	const totalPages = Math.ceil(pagination.total / pagination.limit);
	const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

	return (
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				{/* Header Section */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Memories
						</h1>
						<p className="text-muted-foreground">
							View, search, and manage your memories.
						</p>
					</div>
					<Button onClick={() => setIsCreateModalOpen(true)}>
						Add Memory
					</Button>
					<CreateMemoryModal
						isOpen={isCreateModalOpen}
						onOpenChange={setIsCreateModalOpen}
						spaces={spaces}
						isCreating={isCreating}
						creationStatus={creationStatus}
						newMemoryContent={newMemoryContent}
						newMemorySpaceIds={newMemorySpaceIds}
						onContentChange={setNewMemoryContent}
						onSpaceIdsChange={setNewMemorySpaceIds}
						onCreateMemory={createMemory}
						onResetForm={handleResetForm}
					/>
				</div>

				{/* Search and Controls Section */}
				<div className="my-6">
					<div className="space-y-4">
						{/* Search Bar */}
						<div className="flex gap-2 items-center max-w-[600px]">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Enter your search query..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSearch();
									}}
								/>
							</div>
							<Button onClick={handleSearch} size="sm">
								Search
							</Button>
							{isInSearchMode && (
								<Button onClick={handleClearSearch} variant="outline" size="sm">
									Clear
								</Button>
							)}
						</div>
						{/* Secondary Controls (Filter and Sort) */}
						<div className="flex items-center gap-4">
							<Dialog
								open={isFilterDialogOpen}
								onOpenChange={(open) => {
									if (open) setTempSelectedSpaceIds(selectedSpaceIds);
									setIsFilterDialogOpen(open);
								}}
							>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="flex items-center gap-1"
									>
										<Filter className="h-4 w-4" />
										{selectedSpaceIds.length > 0
											? `${selectedSpaceIds.length} Space${selectedSpaceIds.length > 1 ? "s" : ""}`
											: "Filter by Space"}
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Filter Spaces</DialogTitle>
										<DialogDescription>
											Select spaces to filter memories.
										</DialogDescription>
									</DialogHeader>
									<SpaceSelector
										options={spaces.map((s) => ({
											value: s.id,
											label: s.name,
										}))}
										selected={tempSelectedSpaceIds}
										onChange={setTempSelectedSpaceIds}
										mode="multiple"
									/>
									<div className="flex justify-end gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												handleApplyFilters([]);
											}}
										>
											Clear Filters
										</Button>
										<Button
											type="button"
											onClick={() => {
												handleApplyFilters(tempSelectedSpaceIds);
											}}
										>
											Apply Filters
										</Button>
									</div>
								</DialogContent>
							</Dialog>
							<Select value={sortOrder} onValueChange={handleSortChange}>
								<SelectTrigger className="w-[140px] text-sm">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="desc">Newest First</SelectItem>
									<SelectItem value="asc">Oldest First</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Error and Memories Display */}
				{error && (
					<Card className="my-6">
						<CardContent className="py-4">
							<p className="text-red-500 text-center">{error}</p>
						</CardContent>
					</Card>
				)}

				<div className="space-y-4">
					{isLoading ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : memories.length === 0 && !error ? (
						<Card>
							<CardContent className="py-8 text-center">
								<p className="text-muted-foreground">
									{isInSearchMode
										? "No memories found matching your search."
										: "No memories found."}
								</p>
							</CardContent>
						</Card>
					) : (
						!error && (
							<>
								{memories.map((memory) => (
									<Link
										to={`/memories/${memory.id}`}
										key={memory.id}
										className="block"
									>
										<Card>
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
												<p className="text-foreground mb-4">
													{memory.content.length > 100
														? `${memory.content.slice(0, 100)}...`
														: memory.content}
												</p>
												{memory.metadata && (
													<div className="text-sm text-muted-foreground">
														<strong>Metadata:</strong>{" "}
														{JSON.stringify(memory.metadata)}
													</div>
												)}
											</CardContent>
										</Card>
									</Link>
								))}
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={handlePageChange}
									pagination={pagination}
								/>
							</>
						)
					)}
				</div>
			</div>
		</MainLayout>
	);
}
