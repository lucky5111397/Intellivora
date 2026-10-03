import axios from "axios";
import { BaseExecutionEngine, ExecutionResult } from "./engine.interface.js";
import MockSafeExecutionAdapter from "./mockSafe.adapter.js";

const DEFAULT_PISTON_URL =
  process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

/**
 * Piston Sandboxed Code Execution Adapter
 * Communicates with an isolated containerized Piston sandbox execution cluster over HTTP.
 * Guarantees zero arbitrary code execution on the Intellivora server.
 */
export class PistonExecutionAdapter extends BaseExecutionEngine {
  constructor(apiUrl = DEFAULT_PISTON_URL) {
    super();
    this.apiUrl = apiUrl.replace(/\/+$/, "");
    this.fallbackAdapter = new MockSafeExecutionAdapter();
  }

  /**
   * Dispatches code execution payload to isolated sandbox.
   */
  async execute({ language, code, stdin = "", timeLimitMs = 3000 }) {
    const languageMap = {
      python: { language: "python", version: "3.10.0" },
      javascript: { language: "javascript", version: "20.11.1" },
      cpp: { language: "c++", version: "10.2.0" },
      java: { language: "java", version: "15.0.2" },
    };

    const target = languageMap[language];
    if (!target) {
      return new ExecutionResult({
        success: false,
        status: "COMPILE_ERROR",
        stderr: `Unsupported language: ${language}`,
        error: "Compilation failed.",
      });
    }

    try {
      const payload = {
        language: target.language,
        version: target.version,
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin || "",
        run_timeout: timeLimitMs,
        compile_timeout: 5000,
      };

      const response = await axios.post(`${this.apiUrl}/execute`, payload, {
        timeout: timeLimitMs + 3000,
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;
      const run = data.run || {};

      let status = "ACCEPTED";
      if (run.signal === "SIGKILL" || run.code === 124) {
        status = "TIME_LIMIT_EXCEEDED";
      } else if (run.code !== 0 && run.stderr) {
        status = run.stderr.toLowerCase().includes("syntax")
          ? "COMPILE_ERROR"
          : "RUNTIME_ERROR";
      }

      return new ExecutionResult({
        success: run.code === 0,
        status,
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        executionTimeMs: run.time || 25,
        memoryBytes: run.memory || 12800000,
        exitCode: typeof run.code === "number" ? run.code : 0,
      });
    } catch (networkOrTimeoutErr) {
      console.warn(
        `[DSA Sandbox] External sandbox unavailable (${networkOrTimeoutErr.message}). Engaging safe mock fallback.`
      );
      // Fallback cleanly to mock safe adapter
      return this.fallbackAdapter.execute({
        language,
        code,
        stdin,
        timeLimitMs,
      });
    }
  }
}

export default PistonExecutionAdapter;
