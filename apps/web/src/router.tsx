import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/auth/protected-route";
import { PublicRoute } from "./components/auth/public-route";
import { ApiKeysPage } from "./pages/api-keys";
import { DashboardPage } from "./pages/dashboard";
import { HomePage } from "./pages/home";
import { MemoriesPage } from "./pages/memories";
import { MemoryPage } from "./pages/memory";
import NotFoundPage from "./pages/not-found";
import { SpacesPage } from "./pages/spaces";
import { UserManagementPage } from "./pages/user-management";

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
			{
				path: ":id",
				element: <MemoryPage />,
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
		path: "/user-management",
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: <UserManagementPage />,
			},
		],
	},
	{
		path: "*",
		element: <NotFoundPage />,
	},
]);
