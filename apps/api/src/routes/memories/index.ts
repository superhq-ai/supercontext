import { createProtectedRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
import {
	handleCreateMemory,
	handleDeleteMemory,
	handleGetMemory,
	handleGetMemoryLogs,
	handleListMemories,
	handleSearchMemories,
} from "./handlers";

const router = createProtectedRouter();

router.use("*", auth());
router.post("/", handleCreateMemory);
router.get("/", handleListMemories);
router.post("/search", handleSearchMemories);
router.get("/:memoryId", handleGetMemory);
router.get("/:memoryId/logs", handleGetMemoryLogs);
router.delete("/:memoryId", handleDeleteMemory);

export default router;
