import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function EmailSignInForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { isPending, error } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = await signIn.email({
			email,
			password,
		});

		if (!result.error) {
			// Redirect to dashboard on successful sign in
			navigate("/dashboard");
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>
						Enter your email and password to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							{error && (
								<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
									{error.message || "Sign in failed"}
								</div>
							)}
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isPending}
								/>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isPending}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Button type="submit" className="w-full" disabled={isPending}>
									{isPending ? "Signing in..." : "Login"}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
