import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-app";
import { handleCheckInviteToken, handleValidateToken } from "./handlers";

const authRouter = createRouter();

authRouter.post("/check-invite-token", handleCheckInviteToken);
authRouter.post("/validate", handleValidateToken);
authRouter.on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw));

export default authRouter;
