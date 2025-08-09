import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { createApp } from "@/lib/create-app";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import apiKeyRouter from "./routes/api-keys";
import authRouter from "./routes/auth";
import llmsTxtRouter from "./routes/llms-txt";
import memoryRouter from "./routes/memories";
import spacesRouter from "./routes/spaces";
import usersRouter from "./routes/users";

export const app = createApp();

// Middlewares
app.use(secureHeaders());
app.use(logger());
app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	c.set("user", session?.user ?? null);
	c.set("session", session?.session ?? null);
	await next();
});
app.use(
	"*",
	cors({
		origin: env.SUPERCONTEXT_CLIENT_URL,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "DELETE", "PATCH", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

// Error handling
app.notFound(notFound);
app.onError(onError);

// Routes
app.get("/", (c) => c.text("Welcome to Supercontext!"));
app.get("/health", (c) =>
	c.json({ status: "ok", timestamp: new Date().toISOString() }),
);
app.route("/api/auth", authRouter);

app.route("/api/users", usersRouter);
app.route("/api/spaces", spacesRouter);
app.route("/api/api-keys", apiKeyRouter);
app.route("/api/memories", memoryRouter);
app.route("/api/llms-txt", llmsTxtRouter);
