import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutionResult } from "../services/codeExecution/engine.interface.js";
import MockSafeExecutionAdapter from "../services/codeExecution/mockSafe.adapter.js";

describe("DSA Code Execution & Safety Boundaries", () => {
  const adapter = new MockSafeExecutionAdapter();

  describe("ExecutionResult contract", () => {
    it("constructs normalized result with default zero-values", () => {
      const res = new ExecutionResult({
        success: true,
        status: "ACCEPTED",
        stdout: "Result: 42\n",
        executionTimeMs: 18,
        memoryBytes: 14000000,
      });

      assert.equal(res.success, true);
      assert.equal(res.status, "ACCEPTED");
      assert.equal(res.stdout, "Result: 42\n");
      assert.equal(res.stderr, "");
      assert.equal(res.executionTimeMs, 18);
      assert.equal(res.memoryBytes, 14000000);
      assert.equal(res.exitCode, 0);
    });
  });

  describe("Supported Languages & Whitelisting", () => {
    it("reports official whitelisted languages with version specs", () => {
      const languages = adapter.getSupportedLanguages();
      assert.ok(Array.isArray(languages));
      assert.equal(languages.length, 4);

      const ids = languages.map((l) => l.id);
      assert.ok(ids.includes("python"));
      assert.ok(ids.includes("javascript"));
      assert.ok(ids.includes("cpp"));
      assert.ok(ids.includes("java"));
    });
  });

  describe("MockSafeExecutionAdapter sandboxed execution simulation", () => {
    it("returns ACCEPTED with captured stdout for valid Python code", async () => {
      const result = await adapter.execute({
        language: "python",
        code: 'print("Two Sum Solution: [0, 1]")',
      });

      assert.equal(result.success, true);
      assert.equal(result.status, "ACCEPTED");
      assert.equal(result.stdout, "Two Sum Solution: [0, 1]\n");
      assert.equal(result.exitCode, 0);
      assert.ok(result.executionTimeMs > 0);
      assert.ok(result.memoryBytes > 0);
    });

    it("returns ACCEPTED with captured stdout for valid JavaScript code", async () => {
      const result = await adapter.execute({
        language: "javascript",
        code: 'console.log("Binary Search Found")',
      });

      assert.equal(result.success, true);
      assert.equal(result.status, "ACCEPTED");
      assert.equal(result.stdout, "Binary Search Found\n");
      assert.equal(result.exitCode, 0);
    });

    it("processes standard input (stdin) cleanly", async () => {
      const result = await adapter.execute({
        language: "python",
        code: "input()",
        stdin: "4 2 1 3",
      });

      assert.equal(result.success, true);
      assert.equal(result.status, "ACCEPTED");
      assert.equal(result.stdout, "Processed input: 4 2 1 3\n");
    });

    it("detects infinite loop constructs and terminates with TIME_LIMIT_EXCEEDED", async () => {
      const result = await adapter.execute({
        language: "python",
        code: "while True:\n    pass",
        timeLimitMs: 2000,
      });

      assert.equal(result.success, false);
      assert.equal(result.status, "TIME_LIMIT_EXCEEDED");
      assert.equal(result.exitCode, 124);
      assert.equal(result.executionTimeMs, 2000);
      assert.ok(result.stderr.includes("Time Limit Exceeded"));
    });

    it("classifies syntax errors as COMPILE_ERROR with non-zero exit code", async () => {
      const result = await adapter.execute({
        language: "python",
        code: "def invalid syntax;;;;;;error",
      });

      assert.equal(result.success, false);
      assert.equal(result.status, "COMPILE_ERROR");
      assert.equal(result.exitCode, 1);
      assert.ok(result.stderr.includes("SyntaxError"));
    });

    it("classifies user exceptions as RUNTIME_ERROR", async () => {
      const result = await adapter.execute({
        language: "python",
        code: 'raise Exception("Index out of range")',
      });

      assert.equal(result.success, false);
      assert.equal(result.status, "RUNTIME_ERROR");
      assert.equal(result.exitCode, 1);
      assert.ok(result.stderr.includes("RuntimeError"));
    });
  });

});
