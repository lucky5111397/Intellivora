import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError, extractErrorMessage } from "../src/services/apiError.js";
import { apiClient, ServerUrl, ApiBaseUrl } from "../src/services/apiClient.js";

describe("Centralized Frontend API Client & Error Normalizer", () => {
  describe("ApiError class", () => {
    it("initializes with provided parameters and sensible defaults", () => {
      const err = new ApiError({
        message: "Resource not found",
        status: 404,
        errors: [{ field: "userId", message: "User does not exist" }],
        code: "NOT_FOUND",
      });

      assert.equal(err.name, "ApiError");
      assert.equal(err.message, "Resource not found");
      assert.equal(err.status, 404);
      assert.equal(err.code, "NOT_FOUND");
      assert.equal(err.isNetworkError, false);
      assert.equal(err.errors.length, 1);
      assert.equal(err.errors[0].field, "userId");
    });

    it("defaults to status 500 and empty errors array", () => {
      const err = new ApiError();
      assert.equal(err.status, 500);
      assert.equal(err.errors.length, 0);
      assert.equal(err.message, "An unexpected error occurred.");
    });
  });

  describe("extractErrorMessage utility", () => {
    it("extracts message from ApiError instance with field error aggregation", () => {
      const errWithFields = new ApiError({
        message: "Validation failed",
        errors: [
          { field: "email", message: "Email is required" },
          { field: "password", message: "Password too short" },
        ],
      });
      assert.equal(
        extractErrorMessage(errWithFields),
        "Email is required, Password too short"
      );

      const errWithoutFields = new ApiError({ message: "Simple failure" });
      assert.equal(extractErrorMessage(errWithoutFields), "Simple failure");
    });

    it("extracts message from Axios response payload", () => {
      const axiosErr = {
        response: {
          data: {
            success: false,
            message: "Insufficient credit balance.",
          },
        },
      };
      assert.equal(extractErrorMessage(axiosErr), "Insufficient credit balance.");
    });

    it("extracts field errors from Axios response data errors array", () => {
      const axiosValidationErr = {
        response: {
          data: {
            errors: [
              { field: "code", message: "Code cannot be empty" },
              { field: "language", message: "Unsupported language" },
            ],
          },
        },
      };
      assert.equal(
        extractErrorMessage(axiosValidationErr),
        "Code cannot be empty, Unsupported language"
      );
    });

    it("translates raw network errors into clear user-facing messages", () => {
      const networkErr = new Error("Network Error");
      assert.equal(
        extractErrorMessage(networkErr),
        "Network connection error. Please check your internet connection."
      );
    });

    it("handles null, undefined, and plain string inputs", () => {
      assert.equal(extractErrorMessage(null), "An unexpected error occurred.");
      assert.equal(extractErrorMessage("Custom error string"), "Custom error string");
    });
  });

  describe("apiClient configuration contract", () => {
    it("has withCredentials permanently enabled", () => {
      assert.equal(apiClient.defaults.withCredentials, true);
    });

    it("resolves base URL with /api suffix", () => {
      assert.ok(ServerUrl.startsWith("http"));
      assert.ok(ApiBaseUrl.endsWith("/api"));
      assert.equal(apiClient.defaults.baseURL, ApiBaseUrl);
    });

    it("sets JSON content type and accept headers by default", () => {
      assert.equal(apiClient.defaults.headers["Content-Type"], "application/json");
      assert.equal(apiClient.defaults.headers["Accept"], "application/json");
    });

    it("configures request timeout", () => {
      assert.ok(apiClient.defaults.timeout >= 10000);
    });
  });
});
