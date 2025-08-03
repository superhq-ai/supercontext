import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
	const { headers, ...restOptions } = options;
	const newOptions: RequestInit = {
		...restOptions,
		headers: {
			...headers,
			"Content-Type": "application/json",
		},
		credentials: "include",
	};

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}${path}`,
		newOptions,
	);

	return response;
}
