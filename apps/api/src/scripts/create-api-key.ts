import prompts from "prompts";
import { auth } from "@/lib/auth";
import { createApiKey } from "@/routes/api-keys/services";

async function main() {
	const email = await prompts({
		type: "text",
		name: "email",
		message: "Enter your email",
	});
	const password = await prompts({
		type: "password",
		name: "password",
		message: "Enter your password",
	});

	const {
		user: { id: userId },
	} = await auth.api.signInEmail({
		body: {
			email: email.email,
			password: password.password,
		},
	});

	console.log(`User signed in with ID: ${userId}`);

	const name = await prompts({
		type: "text",
		name: "value",
		message: "Enter the name for the API key",
	});
	const spaceId = await prompts({
		type: "text",
		name: "value",
		message: "Enter the space ID for the API key",
	});

	const { key: apiKey, id: apiKeyId } = await createApiKey({
		name: name.value,
		spaceId: spaceId.value,
		userId,
	});

	console.log("API key created successfully");
	console.log(`API Key ID: ${apiKeyId}, API Key: ${apiKey}`);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error("Failed to create API key:", error);
		process.exit(1);
	});
