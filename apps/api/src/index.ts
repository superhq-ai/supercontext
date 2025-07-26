import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello from Hono!");
});

export default {
	port: 3001,
	fetch: app.fetch,
};
