import { Navigation } from "@/components/navigation";

type Props = {
	children: React.ReactNode;
};

export function MainLayout({ children }: Props) {
	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
