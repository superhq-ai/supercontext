import prompts from "prompts";
import { auth } from "@/lib/auth";

async function main() {
	const name = await prompts({
		type: "text",
		name: "value",
		message: "Enter name:",
	});
	const email = await prompts({
		type: "text",
		name: "value",
		message: "Enter email:",
	});
	const password = await prompts({
		type: "password",
		name: "value",
		message: "Enter password:",
	});
	await auth.api.signUpEmail({
		body: {
			name: name.value,
			email: email.value,
			password: password.value,
		},
	});
}

main()
	.then(() => {
		console.log("Admin user created successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Failed to create admin user:", error);
		process.exit(1);
	});
