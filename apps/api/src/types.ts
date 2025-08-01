import type { apiKey } from "@/db/schema";
import type { auth } from "@/lib/auth.js";

export interface AppVariables {
	user: typeof auth.$Infer.Session.user | null;
	session: typeof auth.$Infer.Session.session | null;
	apiKey: typeof apiKey.$inferSelect | null;
}

export type ProtectedAppVariables = Omit<AppVariables, "user" | "session"> & {
	user: NonNullable<AppVariables["user"]>;
	session: NonNullable<AppVariables["session"]>;
};
