import { Hono } from "hono";
import type { AppVariables, ProtectedAppVariables } from "@/types";

export const createRouter = () => {
	const router = new Hono<{ Variables: AppVariables }>();
	return router;
};

export const createProtectedRouter = () => {
	const router = new Hono<{ Variables: ProtectedAppVariables }>();
	return router;
};

export const createApp = () => {
	const app = createRouter();
	return app;
};
