import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-app";

const authRouter = createRouter();

authRouter.on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw));

export default authRouter;
