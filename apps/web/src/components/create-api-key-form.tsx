import { useState } from "react";
import { SpaceSelector } from "@/components/space-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Option {
	value: string;
	label: string;
}

interface CreateApiKeyFormProps {
	spaces: Option[];
	onCreate: (name: string, spaceIds: string[]) => Promise<void>;
	isCreating: boolean;
}

export function CreateApiKeyForm({
	spaces,
	onCreate,
	isCreating,
}: CreateApiKeyFormProps) {
	const [name, setName] = useState("");
	const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		await onCreate(name, selectedSpaceIds);
		setName("");
		setSelectedSpaceIds([]);
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div>
				<label
					htmlFor="apiKeyName"
					className="text-sm font-medium text-muted-foreground"
				>
					API Key Name
				</label>
				<Input
					id="apiKeyName"
					placeholder="Enter API key name..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1"
				/>
			</div>
			<div>
				<label
					htmlFor="spaceIds"
					className="text-sm font-medium text-muted-foreground"
				>
					Spaces
				</label>
				<SpaceSelector
					options={spaces}
					selected={selectedSpaceIds}
					onChange={setSelectedSpaceIds}
					className="mt-1"
				/>
			</div>
			<Button type="submit" disabled={isCreating || !name.trim()}>
				{isCreating ? "Creating..." : "Create API Key"}
			</Button>
		</form>
	);
}
