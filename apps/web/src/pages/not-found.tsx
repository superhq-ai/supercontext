import { Link } from "react-router";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen bg-background relative">
			<div className="flex flex-col items-center justify-center min-h-screen px-4">
				<h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
				<p className="text-lg text-muted-foreground mb-6">
					The page you're looking for does not exist.
				</p>
				<Link to="/" className="text-primary hover:underline">
					Go back home
				</Link>
			</div>
		</div>
	);
}
