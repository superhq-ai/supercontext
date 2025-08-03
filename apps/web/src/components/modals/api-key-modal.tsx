import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ApiKeyModalProps {
	apiKey: string;
	isOpen: boolean;
	onClose: () => void;
}

export function ApiKeyModal({ apiKey, isOpen, onClose }: ApiKeyModalProps) {
	const [hasCopied, setHasCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(apiKey);
			setHasCopied(true);
			setTimeout(() => setHasCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy API key:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>API Key Created Successfully</DialogTitle>
					<DialogDescription>
						Here is your new API key. Please save it securely. You won't be able
						to see it again.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center space-x-2">
					<Input value={apiKey} readOnly className="flex-1" />
					<Button onClick={handleCopy} variant="outline">
						{hasCopied ? "Copied!" : "Copy"}
					</Button>
				</div>
				<DialogFooter>
					<Button onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
