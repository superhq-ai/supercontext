import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function fetchWithAuth(
	path: string,
	token: string | undefined,
	options: RequestInit = {},
) {
	const { headers, ...restOptions } = options;
	const newOptions = {
		...restOptions,
		headers: {
			...headers,
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	};

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}${path}`,
		newOptions,
	);

	return response;
}
