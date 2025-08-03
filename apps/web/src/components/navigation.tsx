import { LogOutIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
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

	const activeLinkStyle = ({ isActive }: { isActive: boolean }) =>
		isActive
			? "font-bold bg-accent text-accent-foreground rounded-md"
			: "text-foreground hover:bg-accent hover:text-accent-foreground rounded-md";

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
						<NavLink
							to="/dashboard"
							end
							className="flex items-center space-x-2 text-xl font-semibold text-foreground"
						>
							<img
								src="/src/logo.svg"
								alt="SuperContext Logo"
								className="w-8 h-8"
							/>
							<span>SuperContext</span>
						</NavLink>
						<div className="hidden md:flex space-x-4">
							<NavLink to="/memories" className={activeLinkStyle}>
								<Button variant="ghost" size="sm">
									Memories
								</Button>
							</NavLink>
							<NavLink to="/spaces" className={activeLinkStyle}>
								<Button variant="ghost" size="sm">
									Spaces
								</Button>
							</NavLink>
							<NavLink to="/api-keys" className={activeLinkStyle}>
								<Button variant="ghost" size="sm">
									API Keys
								</Button>
							</NavLink>
							{user?.role === "admin" && (
								<NavLink to="/user-management" className={activeLinkStyle}>
									<Button variant="ghost" size="sm">
										User Management
									</Button>
								</NavLink>
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
						<NavLink
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
						</NavLink>
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
						<NavLink
							to="/memories"
							className={activeLinkStyle}
							onClick={() => setIsSidebarOpen(false)}
						>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								Memories
							</Button>
						</NavLink>
						<NavLink
							to="/spaces"
							className={activeLinkStyle}
							onClick={() => setIsSidebarOpen(false)}
						>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								Spaces
							</Button>
						</NavLink>
						<NavLink
							to="/api-keys"
							className={activeLinkStyle}
							onClick={() => setIsSidebarOpen(false)}
						>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							>
								API Keys
							</Button>
						</NavLink>
						{user?.role === "admin" && (
							<NavLink
								to="/user-management"
								className={activeLinkStyle}
								onClick={() => setIsSidebarOpen(false)}
							>
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start"
								>
									User Management
								</Button>
							</NavLink>
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
