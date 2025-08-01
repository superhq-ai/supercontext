import { createProtectedRouter } from "@/lib/create-app";
import { handleGetCurrentUser, handleUpdateCurrentUser } from "./handlers";

const router = createProtectedRouter();

router.get("/me", handleGetCurrentUser);
router.patch("/me", handleUpdateCurrentUser);

export default router;
