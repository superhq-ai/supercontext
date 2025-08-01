import type { apiKey } from "@/db/schema";
import type { auth } from "@/lib/auth.js";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;

export interface AppVariables {
	user: User | null;
	session: Session | null;
	apiKey: typeof apiKey.$inferSelect | null;
}

export type ProtectedAppVariables = Omit<AppVariables, "user" | "session"> & {
	user: NonNullable<AppVariables["user"]>;
	session: NonNullable<AppVariables["session"]>;
};
