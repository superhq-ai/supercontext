import { useAuth } from "@/contexts/auth-context";
import { Navigate, Outlet } from "react-router";
import { Splash } from "@/components/ui/splash";

interface AdminRouteProps {
	redirectTo?: string;
}

export function AdminRoute({ 
	redirectTo = "/dashboard" 
}: AdminRouteProps) {
	const { user, isPending } = useAuth();

	if (isPending) {
		return <Splash />;
	}

	const isAdmin = user?.role === "admin";

	if (!isAdmin) {
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
} 