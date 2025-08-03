import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateSpaceFormProps {
	onCreate: (name: string, description?: string) => Promise<void>;
	isCreating: boolean;
}

export function CreateSpaceForm({
	onCreate,
	isCreating,
}: CreateSpaceFormProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		await onCreate(name, description);
		setName("");
		setDescription("");
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<label
					htmlFor="spaceName"
					className="text-sm font-medium text-muted-foreground"
				>
					Space Name
				</label>
				<Input
					id="spaceName"
					placeholder="Enter space name..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1"
				/>
			</div>
			<div>
				<label
					htmlFor="spaceDescription"
					className="text-sm font-medium text-muted-foreground"
				>
					Description (Optional)
				</label>
				<Input
					id="spaceDescription"
					placeholder="Enter space description..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="mt-1"
				/>
			</div>
			<Button type="submit" disabled={isCreating || !name.trim()}>
				{isCreating ? "Creating..." : "Create Space"}
			</Button>
		</form>
	);
}
