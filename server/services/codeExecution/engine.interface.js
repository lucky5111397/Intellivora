/**
 * Standardized Code Execution Result Contract
 * Normalizes output across all sandbox engines (Piston, Judge0, Mock).
 */
export class ExecutionResult {
  /**
   * @param {Object} params
   * @param {boolean} params.success
   * @param {"ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "COMPILE_ERROR" | "RUNTIME_ERROR"} params.status
   * @param {string} [params.stdout]
   * @param {string} [params.stderr]
   * @param {number} [params.executionTimeMs]
   * @param {number} [params.memoryBytes]
   * @param {number} [params.exitCode]
   * @param {string} [params.error]
   */
  constructor({
    success = true,
    status = "ACCEPTED",
    stdout = "",
    stderr = "",
    executionTimeMs = 0,
    memoryBytes = 0,
    exitCode = 0,
    error = null,
  } = {}) {
    this.success = success;
    this.status = status;
    this.stdout = stdout;
    this.stderr = stderr;
    this.executionTimeMs = executionTimeMs;
    this.memoryBytes = memoryBytes;
    this.exitCode = exitCode;
    this.error = error;
  }
}

/**
 * Abstract Base Execution Engine
 * Enforces uniform contract for sandboxed code execution implementations.
 */
export class BaseExecutionEngine {
  /**
   * Executes source code inside an isolated sandbox.
   *
   * @param {Object} params
   * @param {string} params.language
   * @param {string} params.code
   * @param {string} [params.stdin]
   * @param {number} [params.timeLimitMs]
   * @returns {Promise<ExecutionResult>}
   */
  async execute({ language, code, stdin = "", timeLimitMs = 3000 }) {
    throw new Error("execute() method must be implemented by subclass.");
  }

  /**
   * Returns list of supported language identifiers and metadata.
   *
   * @returns {Array<{ id: string, name: string, version: string }>}
   */
  getSupportedLanguages() {
    return [
      { id: "python", name: "Python", version: "3.10+" },
      { id: "javascript", name: "JavaScript (Node.js)", version: "20.x" },
      { id: "cpp", name: "C++ (GCC)", version: "17" },
      { id: "java", name: "Java (OpenJDK)", version: "17" },
    ];
  }
}

export default BaseExecutionEngine;
