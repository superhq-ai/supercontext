import { Hono } from "hono";
import { requireAuth } from "@/middlewares/require-auth";
import type { AppVariables, ProtectedAppVariables } from "@/types";

export const createRouter = () => {
	const router = new Hono<{ Variables: AppVariables }>();
	return router;
};

export const createProtectedRouter = () => {
	const router = new Hono<{ Variables: ProtectedAppVariables }>();
	router.use("*", requireAuth);
	return router;
};

export const createApp = () => {
	const app = createRouter();
	return app;
};
