import axios from "axios";
import { FormValues } from "../types/user";

export async function createUser(url: string, { arg }: { arg: FormValues }) {
	try {
		const res = await axios.post(url, arg, {
			headers: { "Content-Type": "application/json" },
			timeout: 20000, // 20 seconds
		});
		return res.data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			if (err.code === "ECONNABORTED") {
				throw new Error(
					"Request timed out. Please check your internet connection.",
				);
			} else if (err.response) {
				const message =
					(err.response.data as any)?.message ||
					"Failed to save user";
				throw new Error(message);
			} else if (err.request) {
				throw new Error("Network error: No response from server.");
			} else {
				throw new Error("Unexpected Axios error occurred.");
			}
		} else if (err instanceof Error) {
			throw err; // rethrow normal JS errors
		} else {
			throw new Error("Unknown error occurred.");
		}
	}
}
export async function signinUser(url: string, { arg }: { arg: FormValues }) {
	try {
		const res = await axios.post(url, arg, {
			headers: { "Content-Type": "application/json" },
			timeout: 10000, // optional
		});
		return res.data; // server response
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			// Server responded with error
			if (err.response?.data?.message) {
				throw new Error(err.response.data.message);
			}
			// No response from server
			if (err.request) {
				throw new Error(
					"No response from server. Please check your network.",
				);
			}
			// Other axios errors
			throw new Error(err.message);
		} else if (err instanceof Error) {
			throw err; // normal JS errors
		} else {
			throw new Error("Unknown error occurred.");
		}
	}
}
