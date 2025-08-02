export function Splash() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="text-center">
				<div className="w-20 h-20 mx-auto mb-6 animate-pulse">
					<img src="/src/logo.svg" alt="SuperContext Logo" className="w-full h-full" />
				</div>
				<h1 className="text-4xl font-bold text-foreground mb-2 animate-pulse">
					SuperContext
				</h1>
				<p className="text-muted-foreground animate-pulse">
					Your intelligent context management platform
				</p>
			</div>
		</div>
	);
} 