import { createProtectedRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
import {
	handleCreateMemory,
	handleDeleteMemory,
	handleGetMemory,
	handleListMemories,
	handleSearchMemories,
	handleUpdateMemory,
} from "./handlers";

const router = createProtectedRouter();

router.use("*", auth());
router.post("/", handleCreateMemory);
router.get("/", handleListMemories);
router.post("/search", handleSearchMemories);
router.get("/:memoryId", handleGetMemory);
router.patch("/:memoryId", handleUpdateMemory);
router.delete("/:memoryId", handleDeleteMemory);

export default router;
