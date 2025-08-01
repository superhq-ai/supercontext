import { createProtectedRouter } from "@/lib/create-app";
import { requireApiKey } from "@/middlewares/require-api-key";
import {
	handleCreateMemory,
	handleDeleteMemory,
	handleGetMemory,
	handleListMemories,
	handleSearchMemories,
	handleUpdateMemory,
} from "./handlers";

const router = createProtectedRouter();

router.use("*", requireApiKey);
router.post("/", handleCreateMemory);
router.get("/", handleListMemories);
router.post("/search", handleSearchMemories);
router.get("/:memoryId", handleGetMemory);
router.patch("/:memoryId", handleUpdateMemory);
router.delete("/:memoryId", handleDeleteMemory);

export default router;
