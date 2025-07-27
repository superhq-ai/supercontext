import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

import * as schema from "./schema";

export const db = drizzle(pool, { schema });
export * as schema from "./schema";
