import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const accessLogQueue = new Queue("access-log", {
	connection: redis,
});

export const addAccessLogJob = async (data: {
	memoryId: string;
	apiKeyId: string;
}) => {
	await accessLogQueue.add("logAccess", data, {
		removeOnComplete: true,
		removeOnFail: 1000,
	});
};

/**
 * Add multiple access log jobs at once.
 */
export const addAccessLogJobs = async (
	dataList: { memoryId: string; apiKeyId: string }[],
) => {
	if (!Array.isArray(dataList) || dataList.length === 0) return;
	await accessLogQueue.addBulk(
		dataList.map((data) => ({
			name: "logAccess",
			data,
			opts: {
				removeOnComplete: true,
				removeOnFail: 1000,
			},
		})),
	);
};
