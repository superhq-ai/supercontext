import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { API_ENDPOINTS } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchWithAuth } from "@/lib/utils";

interface UserSearchResult {
	id: string;
	name: string;
	email: string;
}

interface SpaceUserManagementFormProps {
	spaceId: string;
}

export const SpaceUserManagementForm = ({
	spaceId,
}: SpaceUserManagementFormProps) => {
	const [search, setSearch] = useState("");
	const [results, setResults] = useState<UserSearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const debouncedSearch = useDebounce(search, 300);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const searchUsers = async () => {
			if (debouncedSearch.trim()) {
				setLoading(true);
				try {
					const response = await fetchWithAuth(
						`${API_ENDPOINTS.USERS}/search?q=${encodeURIComponent(
							debouncedSearch,
						)}`,
						{ signal },
					);
					if (response.ok) {
						const data = await response.json();
						setResults(data);
					}
				} catch (error) {
					if ((error as Error).name !== "AbortError") {
						console.error("Failed to search users:", error);
					}
				} finally {
					setLoading(false);
				}
			} else {
				setResults([]);
				setLoading(false);
			}
		};

		searchUsers();

		return () => {
			controller.abort();
		};
	}, [debouncedSearch]);

	const handleAddUser = async (userId: string) => {
		try {
			const response = await fetchWithAuth(
				`${API_ENDPOINTS.SPACES}/${spaceId}/users`,
				{
					method: "POST",
					body: JSON.stringify({ userId }),
				},
			);

			if (response.ok) {
				toast.success("User added to space successfully");
				setSearch("");
				setResults([]);
			} else {
				toast.error("Failed to add user to space");
			}
		} catch (error) {
			toast.error("Failed to add user to space");
			console.error("Failed to add user to space:", error);
		}
	};

	return (
		<Command shouldFilter={false}>
			<CommandInput
				placeholder="Search for a user..."
				value={search}
				onValueChange={setSearch}
			/>
			<CommandList>
				{!search.trim() && (
					<CommandItem disabled>
						Start typing to search for users...
					</CommandItem>
				)}
				{loading && <CommandItem>Loading...</CommandItem>}
				{!loading && search.trim() && results.length === 0 && (
					<CommandEmpty>No users found.</CommandEmpty>
				)}
				{!loading &&
					results.map((user) => (
						<CommandItem key={user.id} onSelect={() => handleAddUser(user.id)}>
							{user.name} ({user.email})
						</CommandItem>
					))}
			</CommandList>
		</Command>
	);
};
