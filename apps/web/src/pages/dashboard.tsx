import { Link } from "react-router";
import { MainLayout } from "@/components/layouts/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function DashboardPage() {
	const { session, user } = useAuth();

	return (
		<MainLayout>
			<div className="px-4 py-6 sm:px-0">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back! Here's an overview of your account and quick access to
						your tools.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* User Info Card */}
					<Card>
						<CardHeader>
							<CardTitle>User Information</CardTitle>
							<CardDescription>Your account details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Name
								</span>
								<p className="text-sm text-foreground">{user?.name}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Email
								</span>
								<p className="text-sm text-foreground">{user?.email}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Role
								</span>
								<div className="mt-1">
									<Badge
										variant={user?.role === "admin" ? "default" : "secondary"}
									>
										{user?.role}
									</Badge>
								</div>
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
						<CardContent className="flex flex-col gap-2">
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
								<Link to="/user-management">
									<Button className="w-full justify-start" variant="outline">
										Manage Users
									</Button>
								</Link>
							)}
						</CardContent>
					</Card>

					{/* Session Info Card */}
					<Card>
						<CardHeader>
							<CardTitle>Session Information</CardTitle>
							<CardDescription>Current session details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Session ID
								</span>
								<p className="text-sm text-foreground font-mono">
									{session?.id?.slice(0, 8)}...
								</p>
							</div>
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Created At
								</span>
								<p className="text-sm text-foreground">
									{new Date(session?.createdAt || "").toLocaleDateString()}
								</p>
							</div>
							<div>
								<span className="text-sm font-medium text-muted-foreground">
									Expires At
								</span>
								<p className="text-sm text-foreground">
									{new Date(session?.expiresAt || "").toLocaleDateString()}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</MainLayout>
	);
}
