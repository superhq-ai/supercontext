import { LogOutIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut, useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
	const { user } = useAuth();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleSignOut = async () => {
		await signOut();
		setIsSidebarOpen(false);
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<nav className="bg-background border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-4">
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleSidebar}
								aria-label="Toggle menu"
							>
								{isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
							</Button>
						</div>
						<Link
							to="/dashboard"
							className="flex items-center space-x-2 text-xl font-semibold text-foreground"
						>
							<img
								src="/src/logo.svg"
								alt="SuperContext Logo"
								className="w-8 h-8"
							/>
							<span>SuperContext</span>
						</Link>
						<div className="hidden md:flex space-x-4">
							<Link to="/dashboard">
								<Button variant="ghost" size="sm">
									Dashboard
								</Button>
							</Link>
							<Link to="/memories">
								<Button variant="ghost" size="sm">
									Memories
								</Button>
							</Link>
							<Link to="/spaces">
								<Button variant="ghost" size="sm">
									Spaces
								</Button>
							</Link>
							<Link to="/api-keys">
								<Button variant="ghost" size="sm">
									API Keys
								</Button>
							</Link>
							{user?.role === "admin" && (
								<Link to="/user-management">
									<Button variant="ghost" size="sm">
										User Management
									</Button>
								</Link>
							)}
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<div className="hidden md:flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">
								{user?.name}
							</span>
							<Badge variant={user?.role === "admin" ? "default" : "secondary"}>
								{user?.role}
							</Badge>
						</div>
						<ThemeToggle />
						<div className="hidden md:block">
							<Button variant="outline" onClick={handleSignOut} size="sm">
								Sign Out
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Sidebar for mobile */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} md:hidden transition-transform duration-300 ease-in-out`}
			>
				<div className="flex flex-col h-full p-4">
					<div className="flex items-center justify-between mb-6">
						<Link
							to="/dashboard"
							className="flex items-center space-x-2 text-xl font-semibold text-foreground"
							onClick={() => setIsSidebarOpen(false)}
						>
							<img
								src="/src/logo.svg"
								alt="SuperContext Logo"
								className="w-8 h-8"
							/>
							<span>SuperContext</span>
						</Link>
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleSidebar}
							aria-label="Close menu"
						>
							<X size={24} />
						</Button>
					</div>
					<div className="flex flex-col space-y-2">
						<Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								Dashboard
							</Button>
						</Link>
						<Link to="/memories" onClick={() => setIsSidebarOpen(false)}>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								Memories
							</Button>
						</Link>
						<Link to="/spaces" onClick={() => setIsSidebarOpen(false)}>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								Spaces
							</Button>
						</Link>
						<Link to="/api-keys" onClick={() => setIsSidebarOpen(false)}>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								API Keys
							</Button>
						</Link>
						{user?.role === "admin" && (
							<Link
								to="/user-management"
								onClick={() => setIsSidebarOpen(false)}
							>
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
								>
									User Management
								</Button>
							</Link>
						)}
					</div>
					<div className="mt-auto flex flex-col space-y-2">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">
								{user?.name}
							</span>
							<Badge variant={user?.role === "admin" ? "default" : "secondary"}>
								{user?.role}
							</Badge>
						</div>
						<Button
							variant="outline"
							onClick={handleSignOut}
							size="sm"
							className="w-full justify-start"
						>
							<LogOutIcon />
							Sign Out
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}
