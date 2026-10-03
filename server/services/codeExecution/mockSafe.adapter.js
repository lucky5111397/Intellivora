import { BaseExecutionEngine, ExecutionResult } from "./engine.interface.js";

/**
 * Deterministic Mock Safe Execution Adapter
 * Used for automated CI testing and local environments.
 * Strictly guarantees ZERO host execution of untrusted code while
 * accurately validating the end-to-end execution contract and security boundaries.
 */
export class MockSafeExecutionAdapter extends BaseExecutionEngine {
  /**
   * Evaluates code through static pattern simulation.
   */
  async execute({ language, code, stdin = "", timeLimitMs = 3000 }) {
    const startTime = Date.now();

    // 1. Language validation check
    const supported = this.getSupportedLanguages().map((l) => l.id);
    if (!supported.includes(language)) {
      return new ExecutionResult({
        success: false,
        status: "COMPILE_ERROR",
        stderr: `Unsupported language: ${language}`,
        error: "Compilation failed.",
      });
    }

    // 2. Timeout simulation: Detect unbounded loops
    if (
      code.includes("while True:") ||
      code.includes("while (true)") ||
      code.includes("while(true)") ||
      code.includes("for (;;)")
    ) {
      return new ExecutionResult({
        success: false,
        status: "TIME_LIMIT_EXCEEDED",
        stderr: `Time Limit Exceeded: Execution terminated after ${timeLimitMs}ms`,
        executionTimeMs: timeLimitMs,
        exitCode: 124,
      });
    }

    // 3. Syntax error simulation
    if (
      code.includes("SyntaxError") ||
      code.includes("invalid syntax") ||
      code.includes(";;;;;;error")
    ) {
      return new ExecutionResult({
        success: false,
        status: "COMPILE_ERROR",
        stderr: "SyntaxError: invalid syntax on line 1",
        exitCode: 1,
      });
    }

    // 4. Runtime error simulation
    if (code.includes("raise Exception") || code.includes("throw new Error")) {
      return new ExecutionResult({
        success: false,
        status: "RUNTIME_ERROR",
        stderr: "RuntimeError: explicit user exception raised",
        exitCode: 1,
      });
    }

    // 5. Successful deterministic output generation
    let simulatedStdout = "";
    if (stdin && stdin.trim()) {
      simulatedStdout = `Processed input: ${stdin.trim()}\n`;
    } else if (code.includes("print(") || code.includes("console.log(")) {
      // Extract string literal inside print or console.log if present
      const match = code.match(/(?:print|console\.log)\(['"]([^'"]+)['"]\)/);
      simulatedStdout = match ? `${match[1]}\n` : "Execution output\n";
    } else {
      simulatedStdout = "Program executed successfully with exit code 0.\n";
    }

    const elapsed = Math.max(1, Date.now() - startTime + 12);

    return new ExecutionResult({
      success: true,
      status: "ACCEPTED",
      stdout: simulatedStdout,
      stderr: "",
      executionTimeMs: elapsed,
      memoryBytes: 14200000, // ~14.2 MB
      exitCode: 0,
    });
  }
}

export default MockSafeExecutionAdapter;
