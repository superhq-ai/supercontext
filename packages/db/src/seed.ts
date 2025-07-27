import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";
import * as schema from "./schema";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
	console.log("Seeding database...");

	await db.insert(schema.user).values([
		{
			id: "user_2c7Yh4kY8v6Jj4gZ5s3e2a1b",
			name: "Test User",
			email: "test@example.com",
			emailVerified: true,
		},
	]);

	console.log("Seeding finished.");
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
