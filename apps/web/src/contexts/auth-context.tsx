import type { Session, User } from "better-auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createContext, useContext } from "react";

interface AuthUser extends User {
	role?: "admin" | "user";
	active?: boolean;
}

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
	plugins: [
		inferAdditionalFields({
			user: {
				inviteToken: { type: "string", required: false },
			},
		}),
	],
});

export const {
	signIn,
	signUp,
	signOut,
	useSession: useBetterAuthSession,
} = authClient;

interface AuthContextType {
	session: Session | null;
	user: AuthUser | null;
	isPending: boolean;
	error: Error | null;
	refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { data, isPending, error, refetch } = useBetterAuthSession();

	return (
		<AuthContext.Provider
			value={{
				session: data?.session || null,
				user: (data?.user as AuthUser) || null,
				isPending,
				error,
				refetch,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
