import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
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

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					{/* Welcome Section */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Admin Panel
						</h1>
						<p className="text-muted-foreground">
							Manage your application, users, and system settings from here.
						</p>
					</div>

					{/* Admin Actions Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* User Management */}
						<Card>
							<CardHeader>
								<CardTitle>User Management</CardTitle>
								<CardDescription>
									Manage user accounts and permissions
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full justify-start" variant="outline">
									View All Users
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Create New User
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Manage Roles
								</Button>
							</CardContent>
						</Card>

						{/* System Settings */}
						<Card>
							<CardHeader>
								<CardTitle>System Settings</CardTitle>
								<CardDescription>
									Configure application settings
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full justify-start" variant="outline">
									General Settings
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Security Settings
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Email Configuration
								</Button>
							</CardContent>
						</Card>

						{/* Analytics */}
						<Card>
							<CardHeader>
								<CardTitle>Analytics</CardTitle>
								<CardDescription>
									View system analytics and reports
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full justify-start" variant="outline">
									User Analytics
								</Button>
								<Button className="w-full justify-start" variant="outline">
									System Performance
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Usage Reports
								</Button>
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
								<Button className="w-full justify-start" variant="outline">
									View All API Keys
								</Button>
								<Button className="w-full justify-start" variant="outline">
									API Usage Stats
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Rate Limiting
								</Button>
							</CardContent>
						</Card>

						{/* Spaces Management */}
						<Card>
							<CardHeader>
								<CardTitle>Spaces Management</CardTitle>
								<CardDescription>
									Manage user spaces and content
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full justify-start" variant="outline">
									View All Spaces
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Space Analytics
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Content Moderation
								</Button>
							</CardContent>
						</Card>

						{/* System Health */}
						<Card>
							<CardHeader>
								<CardTitle>System Health</CardTitle>
								<CardDescription>
									Monitor system status and logs
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full justify-start" variant="outline">
									Health Check
								</Button>
								<Button className="w-full justify-start" variant="outline">
									View Logs
								</Button>
								<Button className="w-full justify-start" variant="outline">
									Database Status
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Quick Stats */}
					<div className="mt-8">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							Quick Stats
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-blue-600">1,234</div>
									<div className="text-sm text-muted-foreground">Total Users</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-green-600">567</div>
									<div className="text-sm text-muted-foreground">Active Spaces</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-purple-600">89</div>
									<div className="text-sm text-muted-foreground">API Keys</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="text-2xl font-bold text-orange-600">99.9%</div>
									<div className="text-sm text-muted-foreground">Uptime</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
} 