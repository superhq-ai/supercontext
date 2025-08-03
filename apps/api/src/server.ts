import { app } from "@/app";
import { initAccessLogWorker } from "./queues/access-log-processor";

try {
	await initAccessLogWorker();
	console.log("Access log worker initialized");
} catch (err) {
	console.error("Failed to initialize access log worker:", err);
	process.exit(1);
}

export default {
	port: 3001,
	fetch: app.fetch,
};
