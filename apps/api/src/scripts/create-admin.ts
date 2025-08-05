import prompts from "prompts";
import { env } from "@/env";
import { createInvite } from "@/routes/users/services";

async function main() {
	let emailValue = process.argv[2];

	if (!emailValue) {
		const emailPrompt = await prompts({
			type: "text",
			name: "value",
			message: "Enter email:",
		});
		emailValue = emailPrompt.value;
	}

	if (!emailValue) {
		throw new Error("Email is required");
	}

	const inviteToken = await createInvite({
		email: emailValue,
		role: "admin",
	});

	if (!inviteToken) {
		throw new Error("Failed to create invite token");
	}

	const inviteUrl = new URL(
		`/invite/${inviteToken.token}`,
		env.SUPERCONTEXT_CLIENT_URL,
	).toString();

	console.log(`Invite URL created: ${inviteUrl}`);
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
