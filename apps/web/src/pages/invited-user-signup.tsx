import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { signUp } from "../contexts/auth-context";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address").min(1, "Email is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export function InvitedUserSignupPage() {
	const navigate = useNavigate();
	const params = useParams();
	const inviteToken = params.inviteToken;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		async function checkToken() {
			if (!inviteToken) {
				setError("Invalid invite link. Token is missing.");
				return;
			}
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/auth/check-invite-token`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ inviteToken }),
					},
				);
				const data = await response.json();
				if (!response.ok) {
					setError(data.message);
				} else {
					form.setValue("email", data.email);
				}
			} catch (error) {
				console.error("Failed to verify invite token:", error);
				setError("Failed to verify invite token.");
			}
		}
		checkToken();
	}, [inviteToken, form]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!inviteToken) {
			toast.error("Invalid invite link. Token is missing.");
			return;
		}
		setIsLoading(true);
		const result = await signUp.email({
			...values,
			inviteToken,
		});
		setIsLoading(false);

		if (result.error) {
			toast.error(result.error.message);
		} else {
			toast.success("Account created successfully!");
			navigate("/dashboard");
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="w-full max-w-md">
				<div className="w-16 h-16 mx-auto mb-4">
					<img
						src="/src/logo.svg"
						alt="supercontext Logo"
						className="w-full h-full"
					/>
				</div>
				<Card>
					<CardHeader className="text-center">
						<CardTitle>Create Your Account</CardTitle>
						<CardDescription>
							You've been invited to join. Create an account to get started.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error ? (
							<div className="text-center text-destructive">{error}</div>
						) : (
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input placeholder="Your name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="your@email.com"
														{...field}
														readOnly
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="********"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? "Signing Up..." : "Sign Up"}
									</Button>
								</form>
							</Form>
						)}
						<p className="text-center text-sm text-muted-foreground mt-6">
							Already have an account?{" "}
							<Link to="/" className={buttonVariants({ variant: "link" })}>
								Sign in
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
