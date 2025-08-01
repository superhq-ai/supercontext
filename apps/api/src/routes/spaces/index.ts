import { createProtectedRouter } from "@/lib/create-app";
import { requireAdmin } from "@/middlewares/require-admin";
import { requireApiKey } from "@/middlewares/require-api-key";
import {
	handleAddUserToSpace,
	handleCreateSpace,
	handleDeleteSpace,
	handleGetSpace,
	handleListSpaces,
	handleRemoveUserFromSpace,
	handleUpdateSpace,
} from "./handlers";

const router = createProtectedRouter();

router.use("*", requireApiKey);
router.post("/", handleCreateSpace);
router.get("/", handleListSpaces);
router.get("/:spaceId", handleGetSpace);
router.patch("/:spaceId", requireAdmin, handleUpdateSpace);
router.delete("/:spaceId", requireAdmin, handleDeleteSpace);
router.post("/:spaceId/users", requireAdmin, handleAddUserToSpace);
router.delete(
	"/:spaceId/users/:userId",
	requireAdmin,
	handleRemoveUserFromSpace,
);

export default router;
