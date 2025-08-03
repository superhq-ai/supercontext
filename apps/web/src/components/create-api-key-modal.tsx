import { CreateApiKeyForm } from "@/components/create-api-key-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface Option {
	value: string;
	label: string;
}

interface CreateApiKeyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	spaces: Option[];
	onCreate: (name: string, spaceIds: string[]) => Promise<void>;
	isCreating: boolean;
}

export function CreateApiKeyModal({
	open,
	onOpenChange,
	spaces,
	onCreate,
	isCreating,
}: CreateApiKeyModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New API Key</DialogTitle>
					<DialogDescription>
						Create a new API key for programmatic access to your spaces
					</DialogDescription>
				</DialogHeader>
				<CreateApiKeyForm
					spaces={spaces}
					onCreate={onCreate}
					isCreating={isCreating}
				/>
			</DialogContent>
		</Dialog>
	);
}
