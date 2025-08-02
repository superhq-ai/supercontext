import { createBrowserRouter } from "react-router";
import { DashboardPage } from "./pages/dashboard";
import { AdminPage } from "./pages/admin";
import { HomePage } from "./pages/home";
import { MemoriesPage } from "./pages/memories";
import { SpacesPage } from "./pages/spaces";
import { ApiKeysPage } from "./pages/api-keys";
import { ProtectedRoute } from "./components/auth/protected-route";
import { PublicRoute } from "./components/auth/public-route";
import { AdminRoute } from "./components/auth/admin-route";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <PublicRoute />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
		],
	},
	{
		path: "/dashboard",
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: <DashboardPage />,
			},
		],
	},
	{
		path: "/memories",
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: <MemoriesPage />,
			},
		],
	},
	{
		path: "/spaces",
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: <SpacesPage />,
			},
		],
	},
	{
		path: "/api-keys",
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: <ApiKeysPage />,
			},
		],
	},
	{
		path: "/admin",
		element: <ProtectedRoute />,
		children: [
			{
				element: <AdminRoute />,
				children: [
					{
						index: true,
						element: <AdminPage />,
					},
				],
			},
		],
	},
]);
