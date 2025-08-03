import { CreateSpaceForm } from "@/components/create-space-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface CreateSpaceModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (name: string, description?: string) => Promise<void>;
	isCreating: boolean;
}

export function CreateSpaceModal({
	open,
	onOpenChange,
	onCreate,
	isCreating,
}: CreateSpaceModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Space</DialogTitle>
					<DialogDescription>
						Create a new space for organizing memories
					</DialogDescription>
				</DialogHeader>
				<CreateSpaceForm onCreate={onCreate} isCreating={isCreating} />
			</DialogContent>
		</Dialog>
	);
}
