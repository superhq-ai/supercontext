import { createRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
import {
	handleAcceptInvite,
	handleCreateInvite,
	handleCreateUser,
	handleGetAllUsers,
	handleGetPendingInvites,
	handleGetUser,
	handleSearchUsers,
	handleUpdateUser,
} from "./handlers";

const router = createRouter();

// Public route for accepting invite
router.post("/accept-invite", handleAcceptInvite);

router.use("*", auth({ requireAdmin: true }));

router.get("/search", handleSearchUsers);
router.get("/", handleGetAllUsers);
router.post("/", handleCreateUser);
router.get("/invites", handleGetPendingInvites);
router.get("/:id", handleGetUser);
router.patch("/:id", handleUpdateUser);
router.post("/invite", handleCreateInvite);

export default router;
