import { createRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
import {
	handleCreateUser,
	handleGetAllUsers,
	handleUpdateUser,
} from "./handlers";

const router = createRouter();

router.use("*", auth({ requireAdmin: true }));

router.get("/", handleGetAllUsers);
router.post("/", handleCreateUser);
router.patch("/:id", handleUpdateUser);

export default router;
