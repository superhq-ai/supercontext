import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";

export function AdminPage() {
	const { session, user } = useAuth();

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Admin Panel
						</h1>
						<p className="text-muted-foreground">
							Administrative tools and system management
						</p>
					</div>

					{/* Admin Actions Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Spaces Management */}
						<Card>
							<CardHeader>
								<CardTitle>Spaces Management</CardTitle>
								<CardDescription>
									Manage user spaces and content
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link to="/spaces">
									<Button className="w-full justify-start" variant="outline">
										View All Spaces
									</Button>
								</Link>
								<Link to="/spaces">
									<Button className="w-full justify-start" variant="outline">
										Create New Space
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* API Management */}
						<Card>
							<CardHeader>
								<CardTitle>API Management</CardTitle>
								<CardDescription>
									Manage API keys and endpoints
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link to="/api-keys">
									<Button className="w-full justify-start" variant="outline">
										View All API Keys
									</Button>
								</Link>
								<Link to="/api-keys">
									<Button className="w-full justify-start" variant="outline">
										Create New API Key
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Memories Management */}
						<Card>
							<CardHeader>
								<CardTitle>Memories Management</CardTitle>
								<CardDescription>
									View and manage memories across spaces
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link to="/memories">
									<Button className="w-full justify-start" variant="outline">
										View All Memories
									</Button>
								</Link>
								<Link to="/memories">
									<Button className="w-full justify-start" variant="outline">
										Search Memories
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>

					{/* Admin Info */}
					<div className="mt-8">
						<Card>
							<CardHeader>
								<CardTitle>Admin Information</CardTitle>
								<CardDescription>
									Current admin session details
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Admin User
										</label>
										<p className="text-sm text-foreground">
											{user?.name} ({user?.email})
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Session ID
										</label>
										<p className="text-sm text-foreground font-mono">
											{session?.id?.slice(0, 8)}...
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Role
										</label>
										<div className="mt-1">
											<Badge variant="default">
												{user?.role}
											</Badge>
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Session Expires
										</label>
										<p className="text-sm text-foreground">
											{new Date(session?.expiresAt || "").toLocaleString()}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
} 