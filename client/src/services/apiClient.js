import axios from "axios";
import { ApiError, extractErrorMessage } from "./apiError.js";

const rawServerUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SERVER_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SERVER_URL) ||
  "http://localhost:8000";

export const ServerUrl = rawServerUrl.replace(/\/+$/, "");
export const ApiBaseUrl = `${ServerUrl}/api`;

/**
 * Shared, hardened Axios client for all platform network operations.
 * - withCredentials: true ensures HttpOnly JWT session cookies accompany all requests
 * - Response interceptor automatically unwraps response data and normalizes errors
 * - Selective retry policy only retries idempotent GET requests on transient network drops
 */
export const apiClient = axios.create({
  baseURL: ApiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach timestamp and metadata
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error normalization & selective idempotent retry
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const method = String(config.method || "get").toLowerCase();
    const status = error.response?.status;
    const isNetworkError = !error.response && Boolean(error.message);

    // Selective Retry: Only retry idempotent GET requests on network drops or 502/503/504
    const isRetryableStatus = status === 502 || status === 503 || status === 504;
    const canRetry = method === "get" && (isNetworkError || isRetryableStatus);
    config.__retryCount = config.__retryCount || 0;
    const MAX_RETRIES = 2;

    if (canRetry && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delayMs = config.__retryCount * 300;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return apiClient(config);
    }

    // 401 Session Expiration Hook (exclude passive boot probe /user/current-user)
    if (status === 401 && !config.url?.includes("/user/current-user")) {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    // Construct normalized ApiError
    const normalized = new ApiError({
      message: extractErrorMessage(error),
      status: status || (isNetworkError ? 0 : 500),
      errors: error.response?.data?.errors || [],
      code: error.code || null,
      isNetworkError,
      raw: error,
    });

    return Promise.reject(normalized);
  }
);

export default apiClient;
