import { DatabaseSync } from "node:sqlite";
import QuestionBankService from "./questionBank.service.js";

const FORBIDDEN_SQL_PATTERNS = [
  /\bATTACH\b/i,
  /\bDETACH\b/i,
  /\bPRAGMA\b/i,
  /\bDROP\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bTRUNCATE\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bDELETE\b/i,
  /\bLOAD_EXTENSION\b/i,
  /\bVACUUM\b/i,
];

export class SqlExecutionService {
  /**
   * Enforces that candidate SQL queries are strictly read-only.
   */
  static validateSafeQuery(sql) {
    if (!sql || typeof sql !== "string") {
      throw new Error("Invalid SQL query string.");
    }

    const trimmed = sql.trim();
    if (!trimmed.match(/^(SELECT|WITH)\b/i)) {
      throw new Error("Only SELECT queries and CTEs (WITH ... SELECT) are allowed in practice mode.");
    }

    for (const pattern of FORBIDDEN_SQL_PATTERNS) {
      if (pattern.test(trimmed)) {
        throw new Error("Mutating or administrative SQL statements (e.g. DROP, INSERT, PRAGMA) are strictly prohibited.");
      }
    }

    return true;
  }

  /**
   * Normalizes tabular output for clean JSON serialization.
   */
  static formatTabularResult(rows) {
    if (!rows || rows.length === 0) {
      return { columns: [], rows: [] };
    }
    const columns = Object.keys(rows[0]);
    const formattedRows = rows.map((r) => columns.map((col) => r[col]));
    return { columns, rows: formattedRows };
  }

  /**
   * Deep comparison of candidate tabular result against reference tabular result.
   */
  static compareResults(candidateRows, referenceRows) {
    if (candidateRows.length !== referenceRows.length) {
      return {
        matched: false,
        reason: `Row count mismatch: expected ${referenceRows.length} rows, got ${candidateRows.length}.`,
      };
    }

    if (candidateRows.length === 0) {
      return { matched: true };
    }

    const candidateCols = Object.keys(candidateRows[0]).map((c) => c.toLowerCase());
    const referenceCols = Object.keys(referenceRows[0]).map((c) => c.toLowerCase());

    if (candidateCols.length !== referenceCols.length) {
      return {
        matched: false,
        reason: `Column count mismatch: expected ${referenceCols.length} columns (${referenceCols.join(", ")}), got ${candidateCols.length} (${candidateCols.join(", ")}).`,
      };
    }

    for (let i = 0; i < candidateRows.length; i++) {
      const cRow = candidateRows[i];
      const rRow = referenceRows[i];

      const cVals = Object.values(cRow).map((v) => (v === null || v === undefined ? null : String(v)));
      const rVals = Object.values(rRow).map((v) => (v === null || v === undefined ? null : String(v)));

      for (let j = 0; j < cVals.length; j++) {
        if (cVals[j] !== rVals[j]) {
          return {
            matched: false,
            reason: `Data mismatch at row ${i + 1}, column ${candidateCols[j]}: expected '${rVals[j]}', got '${cVals[j]}'.`,
          };
        }
      }
    }

    return { matched: true };
  }

  /**
   * Executes candidate query inside an isolated in-memory SQLite sandbox.
   */
  static async executeSql({ slug, query }) {
    this.validateSafeQuery(query);

    const question = await QuestionBankService.getAuthoritativeQuestion(slug);
    if (!question) {
      throw new Error(`SQL problem not found with slug: ${slug}`);
    }

    const { schemaDdl, seedDataSql, referenceQuery } = question.sqlMetadata || {};
    if (!schemaDdl || !seedDataSql) {
      throw new Error("Problem metadata is missing relational schema or seed dataset.");
    }

    let db;
    try {
      // 1. Initialize isolated in-memory SQLite container
      db = new DatabaseSync(":memory:");

      // 2. Provision sandbox schema & dataset
      db.exec(schemaDdl);
      db.exec(seedDataSql);

      // 3. Execute reference query to get authoritative baseline
      let referenceRows = [];
      if (referenceQuery) {
        referenceRows = db.prepare(referenceQuery).all();
      }

      // 4. Execute candidate query with timing
      const startTime = performance.now();
      let candidateRows = [];
      try {
        candidateRows = db.prepare(query).all();
      } catch (sqlErr) {
        return {
          status: "SYNTAX_ERROR",
          executionTimeMs: Math.round(performance.now() - startTime),
          error: sqlErr.message,
          candidateOutput: { columns: [], rows: [] },
          expectedOutput: this.formatTabularResult(referenceRows),
        };
      }
      const executionTimeMs = Math.round(performance.now() - startTime);

      // 5. Compare candidate output with expected reference output
      const comparison = this.compareResults(candidateRows, referenceRows);

      return {
        status: comparison.matched ? "ACCEPTED" : "WRONG_ANSWER",
        executionTimeMs,
        candidateOutput: this.formatTabularResult(candidateRows),
        expectedOutput: this.formatTabularResult(referenceRows),
        mismatchReason: comparison.reason || null,
      };
    } finally {
      if (db) {
        try {
          db.close();
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }
}

export default SqlExecutionService;
