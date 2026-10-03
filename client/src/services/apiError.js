/**
 * Normalized API Error Representation
 * Standardizes HTTP error responses, network failures, and validation breakdowns.
 */
export class ApiError extends Error {
  constructor({
    message = "An unexpected error occurred.",
    status = 500,
    errors = [],
    code = null,
    isNetworkError = false,
    raw = null,
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.raw = raw;
  }
}

/**
 * Extracts a clean, user-friendly error message from any error object.
 *
 * @param {unknown} error
 * @returns {string}
 */
export const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;

  // Handle ApiError instance
  if (error instanceof ApiError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.map((e) => e.message).join(", ");
    }
    return error.message;
  }

  // Handle raw Axios error structure
  if (error.response?.data) {
    const data = error.response.data;
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e) => e.message || e.msg || e).join(", ");
    }
    if (data.message) return data.message;
    if (data.error) return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  }

  if (error.message) {
    if (error.message.includes("Network Error")) {
      return "Network connection error. Please check your internet connection.";
    }
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};

export default ApiError;
