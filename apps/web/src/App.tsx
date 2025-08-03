import "./index.css";
import { RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { router } from "./router";

export function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster />
		</>
	);
}

export default App;
