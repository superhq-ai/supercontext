import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "@/env";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
	console.log("Running migrations...");
	await migrate(db, { migrationsFolder: "./drizzle" });
	console.log("Migrations finished.");
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
