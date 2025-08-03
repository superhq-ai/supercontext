import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/utils";
import type { User } from "@/types";

const UserProfilePage = () => {
	const { id } = useParams();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			if (!id) return;
			setLoading(true);
			try {
				const response = await fetchWithAuth(`/api/users/${id}`);
				if (response.ok) {
					const data = await response.json();
					setUser(data);
				}
			} catch (error) {
				console.error("Failed to fetch user:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [id]);

	if (loading) {
		return (
			<MainLayout>
				<div className="text-center">Loading...</div>
			</MainLayout>
		);
	}

	if (!user) {
		return (
			<MainLayout>
				<div className="text-center">User not found.</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				<Card>
					<CardHeader>
						<CardTitle>{user.name}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<strong>Email:</strong> {user.email}
						</div>
						<div>
							<strong>Role:</strong> <Badge>{user.role}</Badge>
						</div>
						<div>
							<strong>Status:</strong>{" "}
							<Badge variant={user.active ? "outline" : "destructive"}>
								{user.active ? "Active" : "Deactivated"}
							</Badge>
						</div>
						<div>
							<strong>Joined:</strong>{" "}
							{new Date(user.createdAt).toLocaleDateString()}
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
};

export default UserProfilePage;
