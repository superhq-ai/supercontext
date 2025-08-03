import prompts from "prompts";
import { createInvite } from "@/routes/users/services";

async function main() {
	const email = await prompts({
		type: "text",
		name: "value",
		message: "Enter email:",
	});
	const inviteToken = await createInvite({
		email: email.value,
	});

	if (!inviteToken) {
		throw new Error("Failed to create invite token");
	}

	console.log(`Invite token created: ${inviteToken.token}`);
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
