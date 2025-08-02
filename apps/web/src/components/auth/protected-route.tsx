import { useAuth } from "@/contexts/auth-context";
import { Navigate, Outlet } from "react-router";
import { Splash } from "@/components/ui/splash";

interface ProtectedRouteProps {
	redirectTo?: string;
}

export function ProtectedRoute({ 
	redirectTo = "/" 
}: ProtectedRouteProps) {
	const { session, isPending } = useAuth();

	if (isPending) {
		return <Splash />;
	}

	if (!session) {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
} 