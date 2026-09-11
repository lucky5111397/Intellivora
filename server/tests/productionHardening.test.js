import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── PDF Validator ───────────────────────────────────────────────────────────
import { hasPdfMagicBytes } from "../utils/pdfValidator.js";

describe("hasPdfMagicBytes", () => {
  it("accepts a valid PDF header buffer", () => {
    const buf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e]); // %PDF-1.
    assert.equal(hasPdfMagicBytes(buf), true);
  });

  it("rejects a non-PDF buffer", () => {
    const buf = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK.. (zip)
    assert.equal(hasPdfMagicBytes(buf), false);
  });

  it("rejects a short buffer", () => {
    assert.equal(hasPdfMagicBytes(Buffer.from([0x25])), false);
  });

  it("rejects null/undefined", () => {
    assert.equal(hasPdfMagicBytes(null), false);
    assert.equal(hasPdfMagicBytes(undefined), false);
  });
});

// ─── JSON Parser ─────────────────────────────────────────────────────────────
import { cleanAndParseJson } from "../utils/jsonParser.js";

describe("cleanAndParseJson", () => {
  it("parses clean JSON", () => {
    const result = cleanAndParseJson('{"score": 85}');
    assert.deepEqual(result, { score: 85 });
  });

  it("parses JSON wrapped in markdown code fence", () => {
    const input = '```json\n{"score": 85}\n```';
    const result = cleanAndParseJson(input);
    assert.deepEqual(result, { score: 85 });
  });

  it("extracts JSON object from surrounding prose", () => {
    const input = 'Here is the result:\n{"score": 85, "feedback": "good"}\nDone.';
    const result = cleanAndParseJson(input);
    assert.deepEqual(result, { score: 85, feedback: "good" });
  });

  it("handles trailing commas in objects", () => {
    const input = '{"a": 1, "b": 2,}';
    const result = cleanAndParseJson(input);
    assert.deepEqual(result, { a: 1, b: 2 });
  });

  it("extracts JSON array from surrounding text", () => {
    const input = 'Results:\n[{"q": 1}, {"q": 2}]\nEnd.';
    const result = cleanAndParseJson(input);
    assert.deepEqual(result, [{ q: 1 }, { q: 2 }]);
  });

  it("returns fallback when no JSON found", () => {
    const result = cleanAndParseJson("no json here", { error: true });
    assert.deepEqual(result, { error: true });
  });

  it("throws when no JSON found and no fallback", () => {
    assert.throws(() => cleanAndParseJson("no json here"), {
      message: /No valid JSON structure/,
    });
  });

  it("throws for null/empty input with no fallback", () => {
    assert.throws(() => cleanAndParseJson(null), {
      message: /Cannot parse empty/,
    });
    assert.throws(() => cleanAndParseJson(""), {
      message: /Cannot parse empty/,
    });
  });
});

// ─── Rate Limiter ────────────────────────────────────────────────────────────
import createRateLimiter from "../middlewares/rateLimiter.js";

describe("createRateLimiter", () => {
  function createMockReqRes(ip = "127.0.0.1") {
    const req = {
      ip,
      headers: { "x-test-rate-limit": "true" },
      socket: { remoteAddress: ip },
    };
    let statusCode = 200;
    let body = null;
    const headers = {};
    const res = {
      setHeader(name, value) {
        headers[name] = value;
      },
      status(code) {
        statusCode = code;
        return res;
      },
      json(data) {
        body = data;
      },
      _getStatus() {
        return statusCode;
      },
      _getBody() {
        return body;
      },
      _getHeaders() {
        return headers;
      },
    };
    return { req, res };
  }

  it("allows requests under the limit", (_, done) => {
    const limiter = createRateLimiter({ windowMs: 60000, max: 3 });
    const { req, res } = createMockReqRes();
    limiter(req, res, () => {
      assert.equal(res._getBody(), null);
      done();
    });
  });

  it("blocks requests over the limit with 429", () => {
    const limiter = createRateLimiter({ windowMs: 60000, max: 2 });
    const ip = "10.0.0.99";

    // Exhaust limit
    for (let i = 0; i < 2; i++) {
      const { req, res } = createMockReqRes(ip);
      limiter(req, res, () => {});
    }

    // Third request should be blocked
    const { req, res } = createMockReqRes(ip);
    limiter(req, res, () => {
      assert.fail("should not call next()");
    });
    assert.equal(res._getStatus(), 429);
    assert.equal(res._getBody().success, false);
    assert.ok(res._getHeaders()["Retry-After"]);
  });
});

// ─── Security Headers ────────────────────────────────────────────────────────
import securityHeaders from "../middlewares/securityHeaders.js";

describe("securityHeaders middleware", () => {
  it("sets expected security headers", (_, done) => {
    const headers = {};
    const removedHeaders = [];
    const req = {};
    const res = {
      setHeader(name, value) {
        headers[name] = value;
      },
      removeHeader(name) {
        removedHeaders.push(name);
      },
    };
    securityHeaders(req, res, () => {
      assert.equal(headers["X-Content-Type-Options"], "nosniff");
      assert.equal(headers["X-Frame-Options"], "DENY");
      assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
      assert.ok(removedHeaders.includes("X-Powered-By"));
      done();
    });
  });
});

// ─── Error Handler Masking ───────────────────────────────────────────────────
import errorHandler from "../middlewares/errorHandler.js";

describe("errorHandler masks errors in production", () => {
  it("masks 500 error messages in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    let statusCode = 200;
    let body = null;
    const err = new Error("Sensitive database details here");
    err.status = 500;
    const req = { method: "GET", originalUrl: "/test" };
    const res = {
      headersSent: false,
      status(code) {
        statusCode = code;
        return res;
      },
      json(data) {
        body = data;
      },
    };

    errorHandler(err, req, res, () => {});

    assert.equal(statusCode, 500);
    // Verify the actual sensitive message is NOT exposed
    assert.ok(!body?.message?.includes("Sensitive database"));
    assert.ok(body?.message?.includes("unexpected internal server error"));

    process.env.NODE_ENV = originalEnv;
  });

  it("exposes error message in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    let statusCode = 200;
    let body = null;
    const err = new Error("Debug info");
    const req = { method: "GET", originalUrl: "/test" };
    const res = {
      headersSent: false,
      status(code) {
        statusCode = code;
        return res;
      },
      json(data) {
        body = data;
      },
    };

    errorHandler(err, req, res, () => {});

    assert.equal(statusCode, 500);
    assert.ok(body?.message?.includes("Debug info"));

    process.env.NODE_ENV = originalEnv;
  });
});
