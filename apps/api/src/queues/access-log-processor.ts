import { type Job, Worker } from "bullmq";
import { db } from "@/db";
import { memoryAccessLog } from "@/db/schema";
import { redis } from "@/lib/redis";

/**
 * Worker to process access log jobs.
 */
export async function initAccessLogWorker() {
	const worker = new Worker(
		"access-log",
		async (job: Job) => {
			if (job.name === "logAccess") {
				const { memoryId, apiKeyId } = job.data;
				await db
					.insert(memoryAccessLog)
					.values({ memoryId, apiKeyId })
					.execute();
			}
		},
		{ connection: redis },
	);

	worker.on("completed", (job) => {
		console.log(`Access log job ${job.id} completed`);
	});

	worker.on("failed", (job, err) => {
		console.error(`Access log job ${job?.id} failed:`, err);
	});
}
