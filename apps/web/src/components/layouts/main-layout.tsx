import { Navigation } from "@/components/navigation";

type Props = {
	children: React.ReactNode;
};

export function MainLayout({ children }: Props) {
	return (
		<div className="flex min-h-screen flex-col">
			<Navigation />
			<main className="container flex-1 p-4">{children}</main>
		</div>
	);
}
