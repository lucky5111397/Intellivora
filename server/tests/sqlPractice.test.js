import { describe, it } from "node:test";
import assert from "node:assert/strict";
import SqlExecutionService from "../services/sqlExecution.service.js";
import { executeSqlSchema, sqlSlugParamSchema } from "../validators/sql.validator.js";

describe("Phase 3C: Isolated SQL Practice Sandbox", () => {
  describe("SQL Safety Guards", () => {
    it("permits standard SELECT queries and CTEs", () => {
      assert.doesNotThrow(() => {
        SqlExecutionService.validateSafeQuery("SELECT * FROM Employee WHERE salary > 50000;");
      });

      assert.doesNotThrow(() => {
        SqlExecutionService.validateSafeQuery(`
          WITH RankedSalaries AS (
            SELECT id, salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank
            FROM Employee
          )
          SELECT salary FROM RankedSalaries WHERE rank = 2;
        `);
      });
    });

    it("strictly blocks mutating and destructive commands", () => {
      const maliciousQueries = [
        "DROP TABLE Employee;",
        "INSERT INTO Employee VALUES (5, 9999);",
        "UPDATE Employee SET salary = 1000000;",
        "DELETE FROM Employee;",
        "ALTER TABLE Employee ADD COLUMN hacked TEXT;",
        "PRAGMA table_info(Employee);",
        "ATTACH DATABASE 'leak.db' AS leak;",
      ];

      for (const query of maliciousQueries) {
        assert.throws(() => {
          SqlExecutionService.validateSafeQuery(query);
        }, /prohibited|Only SELECT/i);
      }
    });

    it("rejects non-string queries", () => {
      assert.throws(() => {
        SqlExecutionService.validateSafeQuery(null);
      });
    });
  });

  describe("SQL Tabular Result Comparison", () => {
    it("identifies matching result sets regardless of column casing", () => {
      const candidate = [{ id: 1, SALARY: 200 }];
      const reference = [{ ID: 1, salary: 200 }];

      const comparison = SqlExecutionService.compareResults(candidate, reference);
      assert.equal(comparison.matched, true);
    });

    it("identifies row count mismatches", () => {
      const candidate = [{ salary: 100 }, { salary: 200 }];
      const reference = [{ salary: 200 }];

      const comparison = SqlExecutionService.compareResults(candidate, reference);
      assert.equal(comparison.matched, false);
      assert.match(comparison.reason, /Row count mismatch/);
    });

    it("identifies value mismatches", () => {
      const candidate = [{ salary: 300 }];
      const reference = [{ salary: 200 }];

      const comparison = SqlExecutionService.compareResults(candidate, reference);
      assert.equal(comparison.matched, false);
      assert.match(comparison.reason, /Data mismatch/);
    });
  });

  describe("SQL Validation Schemas", () => {
    it("validates valid executeSqlSchema payloads", () => {
      const valid = executeSqlSchema.parse({
        query: "SELECT name, salary FROM Employee;",
      });
      assert.equal(valid.query, "SELECT name, salary FROM Employee;");
    });

    it("rejects empty SQL queries", () => {
      assert.throws(() => {
        executeSqlSchema.parse({ query: "" });
      });
    });

    it("validates slug parameters correctly", () => {
      const valid = sqlSlugParamSchema.parse({ slug: "second-highest-salary" });
      assert.equal(valid.slug, "second-highest-salary");
    });
  });
});
