import { useEffect } from "react";
import { SpaceSelector } from "@/components/shared/space-selector";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Space } from "@/types";

interface CreateMemoryModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	spaces: Space[];
	isCreating: boolean;
	creationStatus: { message: string; type: "success" | "error" } | null;
	newMemoryContent: string;
	newMemorySpaceIds: string[];
	onContentChange: (content: string) => void;
	onSpaceIdsChange: (spaceIds: string[]) => void;
	onCreateMemory: () => void;
	onResetForm: () => void;
}

export function CreateMemoryModal({
	isOpen,
	onOpenChange,
	spaces,
	isCreating,
	creationStatus,
	newMemoryContent,
	newMemorySpaceIds,
	onContentChange,
	onSpaceIdsChange,
	onCreateMemory,
	onResetForm,
}: CreateMemoryModalProps) {
	// Handle automatic modal closing on successful creation
	useEffect(() => {
		if (creationStatus?.type === "success") {
			// Close modal automatically on success
			onOpenChange(false);
		}
	}, [creationStatus, onOpenChange]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onResetForm();
		}
		onOpenChange(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Memory</DialogTitle>
					<DialogDescription>
						Add a new memory to your space.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="newMemorySpaceIds"
							className="text-sm font-medium text-muted-foreground"
						>
							Spaces
						</label>
						<SpaceSelector
							options={spaces.map((s) => ({
								value: s.id,
								label: s.name,
							}))}
							selected={newMemorySpaceIds}
							onChange={onSpaceIdsChange}
							className="mt-1"
							mode="multiple"
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
							onChange={(e) => onContentChange(e.target.value)}
							className="mt-1"
							rows={3}
						/>
					</div>
					<div className="flex items-center gap-4">
						<Button
							onClick={onCreateMemory}
							disabled={isCreating || !newMemoryContent.trim()}
						>
							{isCreating ? "Creating..." : "Create Memory"}
						</Button>
						{creationStatus?.type === "error" && (
							<p className="text-sm text-red-500">
								{creationStatus.message}
							</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}