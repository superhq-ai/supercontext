import { Button } from "@/components/ui/button";
import type { PaginationInfo } from "@/types";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (newOffset: number) => void;
	pagination: PaginationInfo;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	pagination,
}: PaginationProps) {
	return (
		<div className="pt-6">
			{totalPages > 1 && (
				<div className="flex justify-center items-center gap-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pagination.offset - pagination.limit)}
						disabled={pagination.offset === 0}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pagination.offset + pagination.limit)}
						disabled={pagination.offset + pagination.limit >= pagination.total}
					>
						Next
					</Button>
				</div>
			)}
			<div className="text-center text-sm text-muted-foreground mt-2">
				Showing {pagination.offset + 1} to{" "}
				{Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
				{pagination.total} results
			</div>
		</div>
	);
}
