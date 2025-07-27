import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const createDb = (connectionString: string) => {
	const pool = new Pool({
		connectionString,
	});

	return drizzle(pool, { schema });
};
