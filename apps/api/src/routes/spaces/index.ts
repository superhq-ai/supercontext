import { createProtectedRouter } from "@/lib/create-app";
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

router.post("/", handleCreateSpace);
router.get("/", handleListSpaces);
router.get("/:spaceId", handleGetSpace);
router.patch("/:spaceId", handleUpdateSpace);
router.delete("/:spaceId", handleDeleteSpace);
router.post("/:spaceId/users", handleAddUserToSpace);
router.delete("/:spaceId/users/:userId", handleRemoveUserFromSpace);

export default router;
