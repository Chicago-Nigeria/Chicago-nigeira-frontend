import axios from "axios";
import { isObject } from "./typeHelper";
import { AppError } from "@/app/types";
import { toast } from "sonner";
import { initSession } from "@/app/store/useSession";

// Use your environment variables directly
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api";
const frontendURL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// Debug log to verify environment variables (remove in production)
// if (typeof window !== "undefined") {
//   console.log("API Base URL:", baseURL);
//   console.log("Frontend URL:", frontendURL);
// }

const axiosinstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Helper to get cookies for debugging
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Helper to get token from localStorage (for cross-origin auth)
const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const callApi = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  payload?: Record<string, unknown> | FormData
): Promise<{ data?: T; error?: AppError }> => {
  const source = axios.CancelToken.source();

  try {
    // Determine payload type
    const isFormData = payload instanceof FormData;
    const isJSONObject = isObject(payload) && !isFormData;

    // Debug logging
    console.log("🔧 API Call Debug:", {
      endpoint,
      method,
      isFormData,
      isJSONObject,
      hasPayload: !!payload,
      payloadType: payload?.constructor.name,
      accessToken: !!getCookie("accessToken"),
      refreshToken: !!getCookie("refreshToken"),
    });

    // Build headers - CRITICAL: No Content-Type for FormData!
    const headers: Record<string, string> = {
      "x-referer": frontendURL,
    };

    // Add Authorization header if token exists in localStorage (for cross-origin auth)
    const storedToken = getStoredToken();
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }

    // Only set Content-Type for JSON, NOT for FormData
    if (isJSONObject) {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    }
    // For FormData, let axios/browser set Content-Type automatically with boundary

    const config = {
      url: endpoint,
      method,
      data: payload,
      headers,
      withCredentials: true,
      cancelToken: source.token,
      // Optional: Add timeout specifically for file uploads
      ...(isFormData && { timeout: 30000 }), // 30 seconds for file uploads
    };
    const response = await axiosinstance.request<T>(config);

    console.log("✅ API Call Successful:", {
      endpoint,
      status: response.status,
      data: response.data,
    });

    return { data: response.data };
  } catch (error) {
    // Enhanced error logging
    console.error("❌ API Call Failed:", {
      endpoint,
      method,
      error,
    });

    let err: AppError | undefined;

    if (axios.isCancel(error)) {
      err = {
        success: "Error",
        message: "Request cancelled",
      };
      return { error: err };
    }

    if (axios.isAxiosError(error) && error.response) {
      const rawError = error.response.data as AppError;

      // Detailed error logging
      console.error("🔍 Axios Error Details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: error.config?.headers?.["Content-Type"],
      });

      // Simplify error message for user
      let userMessage = rawError.message || "An error occurred";

      // Handle Prisma validation errors
      if (typeof userMessage === "string") {
        // Extract simple message from Prisma error
        if (userMessage.includes("Invalid `prisma.")) {
          userMessage = "Failed to update profile. Please check your input and try again.";
        }
        // Handle other database errors
        else if (userMessage.includes("PrismaClient")) {
          userMessage = "Database error. Please try again later.";
        }
        // Truncate overly long error messages
        else if (userMessage.length > 200) {
          userMessage = "An error occurred. Please try again or contact support.";
        }
      }

      err = {
        success: "Error",
        message: userMessage,
      };

      if (error.response.status === 401) {
        // toast.error("Session expired - please log in again");
        initSession.getState().actions.clearSession();
      }

      if (
        error.response.status === 423 &&
        error.response.data.message === "Your email is yet to be verified"
      ) {
        if (typeof window !== "undefined") {
          window.location.replace("/verify-email");
        }
      }

      if (error.response.status === 429) {
        toast.error("Too many requests - please slow down");
      }

      if (error.response.status === 500) {
        toast.error("Server error - please try again later");
        if (err) err.message = "Server error. Please try again later.";
      }

      if (!error.response) {
        err = {
          success: "Error",
          message: "Network error - please check your connection",
        };
      }

      if (error.code === "ECONNABORTED") {
        err = {
          success: "Error",
          message: "Request timeout - please try again",
        };
      }
    } else {
      if (error instanceof Error) {
        err = { message: error.message, success: "Error" };
      } else {
        err = { message: "Unknown error occurred", success: "Error" };
      }
    }

    return { error: err };
  }
};
