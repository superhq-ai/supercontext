import { Navigate, Outlet } from "react-router";
import { Splash } from "@/components/ui/splash";
import { useAuth } from "@/contexts/auth-context";

interface PublicRouteProps {
	redirectTo?: string;
}

export function PublicRoute({ redirectTo = "/dashboard" }: PublicRouteProps) {
	const { session, isPending } = useAuth();

	if (isPending) {
		return <Splash />;
	}

	if (session) {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
}
