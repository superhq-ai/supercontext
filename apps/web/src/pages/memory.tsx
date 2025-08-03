import { useEffect } from "react";
import { useParams } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMemoriesStore } from "@/stores/memories-store";

export const MemoryPage = () => {
	const { id } = useParams<{ id: string }>();
	const {
		currentMemory,
		currentMemoryLogs,
		isLoading,
		error,
		fetchMemoryById,
		fetchMemoryLogs,
	} = useMemoriesStore();

	const handleLogsPageChange = (newOffset: number) => {
		if (id) {
			fetchMemoryLogs({
				id,
				offset: newOffset,
				limit: currentMemoryLogs.pagination.limit,
			});
		}
	};

	const logsPagination = currentMemoryLogs.pagination;
	const logsCurrentPage =
		Math.floor(logsPagination.offset / logsPagination.limit) + 1;
	const logsTotalPages = Math.ceil(logsPagination.total / logsPagination.limit);

	useEffect(() => {
		if (id) {
			fetchMemoryById(id);
			fetchMemoryLogs({ id });
		}
	}, [id, fetchMemoryById, fetchMemoryLogs]);

	return (
		<MainLayout>
			{isLoading && <p>Loading...</p>}
			{error && <p className="text-red-500">{error}</p>}
			{currentMemory && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-2">
						<Card className="h-full">
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
						<Card className="h-full">
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
									<h4 className="font-semibold">Spaces</h4>
									<div className="flex flex-wrap gap-2 mt-1">
										{currentMemory.spaces.map((space) => (
											<Badge key={space.id} variant="secondary">
												{space.name}
											</Badge>
										))}
									</div>
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
					<div className="md:col-span-3">
						<Card>
							<CardHeader>
								<CardTitle className="text-xl">Access Logs</CardTitle>
							</CardHeader>
							<CardContent>
								{currentMemoryLogs.logs.length > 0 ? (
									<>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>API Key ID</TableHead>
													<TableHead>Accessed At</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{currentMemoryLogs.logs.map((log) => (
													<TableRow key={log.id}>
														<TableCell>{log.apiKeyId}</TableCell>
														<TableCell>
															{new Date(log.accessedAt).toLocaleString()}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
										<Pagination
											currentPage={logsCurrentPage}
											totalPages={logsTotalPages}
											onPageChange={handleLogsPageChange}
											pagination={logsPagination}
										/>
									</>
								) : (
									<p>No access logs yet.</p>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</MainLayout>
	);
};
