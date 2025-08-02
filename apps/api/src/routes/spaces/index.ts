import { createProtectedRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
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

router.get("/", auth(), handleListSpaces);
router.get("/:spaceId", auth(), handleGetSpace);
router.post("/", auth(), handleCreateSpace);
router.patch("/:spaceId", auth({ requireAdmin: true }), handleUpdateSpace);
router.delete("/:spaceId", auth({ requireAdmin: true }), handleDeleteSpace);
router.post(
	"/:spaceId/users",
	auth({ requireAdmin: true }),
	handleAddUserToSpace,
);
router.delete(
	"/:spaceId/users/:userId",
	auth({ requireAdmin: true }),
	handleRemoveUserFromSpace,
);

export default router;
