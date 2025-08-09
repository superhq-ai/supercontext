import { createProtectedRouter } from "@/lib/create-app";
import { auth } from "@/middlewares/auth";
import { handleFetchAndStoreContent, handleQueryContent } from "./handlers";

const router = createProtectedRouter();

router.use("*", auth());
router.post("/query", handleQueryContent);
router.post("/fetch-and-store", handleFetchAndStoreContent);

export default router;
