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

export function DashboardPage() {
	const { session, user } = useAuth();

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Dashboard
						</h1>
						<p className="text-muted-foreground">
							Welcome back! Here's an overview of your account and quick access to your tools.
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* User Info Card */}
						<Card>
							<CardHeader>
								<CardTitle>User Information</CardTitle>
								<CardDescription>
									Your account details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Name
									</label>
									<p className="text-sm text-foreground">
										{user?.name}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Email
									</label>
									<p className="text-sm text-foreground">
										{user?.email}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Role
									</label>
									<div className="mt-1">
										<Badge variant={user?.role === "admin" ? "default" : "secondary"}>
											{user?.role}
										</Badge>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Email Verified
									</label>
									<p className="text-sm text-foreground">
										{user?.emailVerified ? "Yes" : "No"}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions Card */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>
									Access your main tools and features
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link to="/memories">
									<Button className="w-full justify-start" variant="outline">
										View Memories
									</Button>
								</Link>
								<Link to="/spaces">
									<Button className="w-full justify-start" variant="outline">
										Manage Spaces
									</Button>
								</Link>
								<Link to="/api-keys">
									<Button className="w-full justify-start" variant="outline">
										API Keys
									</Button>
								</Link>
								{user?.role === "admin" && (
									<Link to="/admin">
										<Button className="w-full justify-start" variant="outline">
											Admin Panel
										</Button>
									</Link>
								)}
							</CardContent>
						</Card>

						{/* Session Info Card */}
						<Card>
							<CardHeader>
								<CardTitle>Session Information</CardTitle>
								<CardDescription>
									Current session details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
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
										Created At
									</label>
									<p className="text-sm text-foreground">
										{new Date(session?.createdAt || "").toLocaleDateString()}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Expires At
									</label>
									<p className="text-sm text-foreground">
										{new Date(session?.expiresAt || "").toLocaleDateString()}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
} 