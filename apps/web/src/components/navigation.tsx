import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut, useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
	const { user } = useAuth();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<nav className="bg-background border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<Link
							to="/dashboard"
							className="flex items-center space-x-2 text-xl font-semibold text-foreground"
						>
							<img src="/src/logo.svg" alt="SuperContext Logo" className="w-8 h-8" />
							<span>SuperContext</span>
						</Link>
						<div className="hidden md:flex space-x-4">
							<Link to="/dashboard">
								<Button variant="ghost" size="sm">
									Dashboard
								</Button>
							</Link>
							{user?.role === "admin" && (
								<Link to="/admin">
									<Button variant="ghost" size="sm">
										Admin
									</Button>
								</Link>
							)}
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<div className="hidden md:flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">{user?.name}</span>
							<Badge variant={user?.role === "admin" ? "default" : "secondary"}>
								{user?.role}
							</Badge>
						</div>
						<ThemeToggle />
						<Button variant="outline" onClick={handleSignOut} size="sm">
							Sign Out
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}
