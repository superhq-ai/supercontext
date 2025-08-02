import { cn } from "@/lib/utils";

interface LoadingProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function Loading({ className, size = "md" }: LoadingProps) {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<div
				className={cn(
					"animate-spin rounded-full border-b-2 border-gray-900",
					sizeClasses[size]
				)}
			/>
		</div>
	);
} 