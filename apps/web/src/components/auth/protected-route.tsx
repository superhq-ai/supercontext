import { Navigate, Outlet } from "react-router";
import { Splash } from "@/components/ui/splash";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
	redirectTo?: string;
	requireAdmin?: boolean;
}

export function ProtectedRoute({
	redirectTo = "/",
	requireAdmin = false,
}: ProtectedRouteProps) {
	const { session, isPending, user } = useAuth();

	if (isPending) {
		return <Splash />;
	}

	if (!session) {
		return <Navigate to={redirectTo} replace />;
	}

	if (requireAdmin && user?.role !== "admin") {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
}
