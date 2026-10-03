import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Database,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Table,
} from "lucide-react";
import { getSqlProblems, getSqlProblemBySlug, executeSqlQuery } from "../../services/sqlApi.js";
import { BackButton } from "@/components/ui";

export default function SqlWorkspace() {
  const { slug: routeSlug } = useParams();
  const [problems, setProblems] = useState([]);
  const [currentSlug, setCurrentSlug] = useState(routeSlug || "second-highest-salary");
  const [problem, setProblem] = useState(null);
  const [query, setQuery] = useState("SELECT * FROM Employee;");
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProblems() {
      try {
        const res = await getSqlProblems({ limit: 20 });
        if (res?.success && res.data?.items) {
          setProblems(res.data.items);
          if (!routeSlug && res.data.items.length > 0) {
            setCurrentSlug(res.data.items[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to list SQL problems:", err);
      }
    }
    loadProblems();
  }, [routeSlug]);

  useEffect(() => {
    async function loadCurrentProblem() {
      if (!currentSlug) return;
      setLoading(true);
      setResult(null);
      setError(null);
      try {
        const res = await getSqlProblemBySlug(currentSlug);
        if (res?.success && res.data) {
          setProblem(res.data);
          setQuery("SELECT \n  -- Write your SQL query here\nFROM \n;");
        }
      } catch (err) {
        console.error("Failed to load problem:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentProblem();
  }, [currentSlug]);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);
    try {
      const res = await executeSqlQuery(currentSlug, query);
      if (res?.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to execute query.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-[#0A0E17] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallback="/" label="Back" className="-ml-0 text-slate-400 hover:text-white" />
          <span className="text-slate-600">|</span>
          <Link
            to="/prepare/sql"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <Database className="w-4 h-4 text-cyan-400" /> SQL Sandbox
          </Link>
          <span className="text-slate-600">|</span>
          <select
            value={currentSlug}
            onChange={(e) => setCurrentSlug(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
          >
            {problems.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-[#0A0E17]">
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" /> {isExecuting ? "Executing..." : "Execute Query"}
        </button>
      </header>

      {/* Main Split-Pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Problem Description & Schema */}
        <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto space-y-6 bg-[#0A0E17]/60 text-sm">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : problem ? (
            <>
              <div>
                <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    problem.difficulty === "easy"
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">{problem.category}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                {problem.description}
              </div>

              {/* Relational Schema Card */}
              {problem.sqlMetadata?.schemaDdl && (
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-cyan-400" /> Relational Table Schema
                  </h4>
                  <pre className="bg-[#06080B] p-3 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                    {problem.sqlMetadata.schemaDdl}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400">Select a problem to begin.</p>
          )}
        </div>

        {/* Right Pane: Query Editor & Result Display */}
        <div className="lg:col-span-7 flex flex-col bg-[#06080B] overflow-hidden">
          {/* Editor Header */}
          <div className="h-10 border-b border-slate-800 bg-[#0A0E17] px-4 flex items-center justify-between text-xs text-slate-400">
            <span>SQL Sandbox (Read-Only SQLite Engine)</span>
            <button
              onClick={() => setQuery("SELECT \n  -- Write your SQL query here\nFROM \n;")}
              className="hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>

          {/* SQL Editor Area */}
          <div className="flex-1 relative font-mono text-sm">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM Employee..."
              spellCheck="false"
              className="w-full h-full p-4 bg-[#06080B] text-slate-100 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Tabular Output Panel */}
          <div className="h-72 border-t border-slate-800 bg-[#0A0E17] flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Execution Output
              </span>
              {result && (
                <div className="flex items-center gap-3">
                  <span className={`font-bold flex items-center gap-1 ${
                    result.status === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {result.status === "ACCEPTED" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {result.status}
                  </span>
                  <span className="text-slate-400">{result.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto pt-3 text-xs">
              {isExecuting ? (
                <div className="py-8 flex justify-center items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Running SQL query in memory...
                </div>
              ) : error ? (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {error}
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {result.mismatchReason && (
                    <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      {result.mismatchReason}
                    </div>
                  )}

                  {/* Candidate Output Table */}
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1.5">Your Query Result:</span>
                    {result.candidateOutput?.rows?.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-800 rounded-lg">
                        <table className="w-full text-left font-mono">
                          <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
                            <tr>
                              {result.candidateOutput.columns.map((c, i) => (
                                <th key={i} className="py-1.5 px-3">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-200">
                            {result.candidateOutput.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/30">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-1.5 px-3">
                                    {cell === null ? <span className="text-slate-500">NULL</span> : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs">Empty result set (0 rows).</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 py-6 text-center">Execute your SQL query to inspect results.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
