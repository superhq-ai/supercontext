import { createBrowserRouter } from "react-router";
import { SignInPage } from "./pages/sign-in";

export const router = createBrowserRouter([
	{
		path: "/sign-in",
		element: <SignInPage />,
	},
]);
