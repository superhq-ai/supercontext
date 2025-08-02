import prompts from "prompts";
import { auth } from "@/lib/auth";
import { updateUserRole } from "@/lib/update-user-role";
import { createSpace } from "@/routes/spaces/services";

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
	const {
		user: { id: userId },
	} = await auth.api.signUpEmail({
		body: {
			name: name.value,
			email: email.value,
			password: password.value,
		},
	});

	if (!userId) {
		throw new Error("Failed to create admin user");
	}

	// Set the user role to admin
	await updateUserRole(userId, "admin");

	const defaultSpace = await createSpace({
		name: "Default Space",
		createdBy: userId,
	});

	if (!defaultSpace) {
		throw new Error("Failed to create default space");
	}

	console.log(`Admin user created with ID: ${userId}`);
	console.log(`Default space created with ID: ${defaultSpace.id}`);
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
