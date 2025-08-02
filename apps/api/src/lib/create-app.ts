import { Hono } from "hono";
import type { AppVariables, ProtectedAppVariables } from "@/types";

export const createRouter = <T extends AppVariables>() => {
	const router = new Hono<{ Variables: T }>();
	return router;
};

export const createProtectedRouter = () =>
	createRouter<ProtectedAppVariables>();

export const createApp = () => {
	const app = createRouter<AppVariables>();
	return app;
};
