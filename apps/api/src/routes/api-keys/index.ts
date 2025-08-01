import { createProtectedRouter } from "@/lib/create-app";
import {
	handleCreateApiKey,
	handleDeleteApiKey,
	handleListApiKeys,
	handleRevokeApiKey,
} from "./handlers";

const router = createProtectedRouter();

router.post("/", handleCreateApiKey);
router.get("/", handleListApiKeys);
router.patch("/:apiKeyId/revoke", handleRevokeApiKey);
router.delete("/:apiKeyId", handleDeleteApiKey);

export default router;
