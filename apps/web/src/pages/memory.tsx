import { useEffect } from "react";
import { useParams } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";
import { MemoryDetailCard } from "@/components/shared/memory-detail-card";
import { Pagination } from "@/components/shared/pagination";
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
			<div className="px-4 py-6 sm:px-0">
				{isLoading && <p>Loading...</p>}
				{error && <p className="text-red-500">{error}</p>}
				{currentMemory && (
					<div className="space-y-8">
						<MemoryDetailCard memory={currentMemory} />
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
				)}
			</div>
		</MainLayout>
	);
};
