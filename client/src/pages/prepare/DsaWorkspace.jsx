import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  runSampleCode,
  submitCode,
  getHint,
  getSubmissionHistory,
} from "../../services/dsaApi.js";
import { getQuestionBySlug } from "../../services/questionBankApi.js";
import BackButton from "../../components/ui/BackButton.jsx";

const DEFAULT_STARTER_CODE = {
  python: `class Solution:\n    def solve(self):\n        # Write your code here\n        pass\n`,
  javascript: `function solve() {\n  // Write your code here\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`,
};

export default function DsaWorkspace() {
  const { slug } = useParams();
  const location = useLocation();
  const catalogPath = location.state?.from || (
    location.pathname.startsWith("/prepare/coding")
      ? "/prepare/coding"
      : "/prepare/dsa"
  );
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState("description"); // description, history, hints
  const [customInput, setCustomInput] = useState("");
  const [activeBottomTab, setActiveBottomTab] = useState("testcases"); // testcases, custom, output
  const [historyList, setHistoryList] = useState([]);
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // AI Hint states
  const [hintLevel, setHintLevel] = useState(1);
  const [hintText, setHintText] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintError, setHintError] = useState(null);

  useEffect(() => {
    async function fetchProblem() {
      setLoading(true);
      try {
        const res = await getQuestionBySlug(slug);
        if (res?.success && res.data) {
          setProblem(res.data);
          const starters = res.data.dsaMetadata?.starterCode || {};
          setCode(starters[language] || DEFAULT_STARTER_CODE[language]);
        }
      } catch (err) {
        console.error("Failed to load problem:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [slug, language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starters = problem?.dsaMetadata?.starterCode || {};
    setCode(starters[newLang] || DEFAULT_STARTER_CODE[newLang]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setSubmissionResult(null);
    setActiveBottomTab("output");
    try {
      const res = await runSampleCode(slug, {
        language,
        code,
        customInput: activeBottomTab === "custom" ? customInput : undefined,
      });
      if (res?.success) {
        setExecutionOutput(res.data);
      }
    } catch (err) {
      setExecutionOutput({
        error: err.response?.data?.message || err.message || "Execution failed",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveBottomTab("output");
    setExecutionOutput(null);
    try {
      const res = await submitCode(slug, { language, code });
      if (res?.success) {
        setSubmissionResult(res.data);
        // Refresh history
        loadHistory();
      }
    } catch (err) {
      setSubmissionResult({
        status: "RUNTIME_ERROR",
        errorMessage: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await getSubmissionHistory(slug);
      if (res?.success) {
        setHistoryList(res.data || []);
      }
    } catch (err) {
      console.warn("Could not load submission history:", err.message);
    }
  };

  const handleRequestHint = async (level) => {
    setIsHintLoading(true);
    setHintError(null);
    setHintLevel(level);
    try {
      const res = await getHint(slug, level, code);
      if (res?.success) {
        setHintText(res.data.hint);
      }
    } catch (err) {
      setHintError(err.response?.data?.message || "Failed to retrieve hint. Check credit balance.");
    } finally {
      setIsHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Problem not found</h2>
        <Link to={catalogPath} className="mt-4 text-cyan-400 hover:underline">
          Return to problem catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col">
      {/* Top Navbar Header */}
      <header className="h-14 border-b border-slate-800 bg-[#0A0E17] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton
            to={catalogPath}
            fallback={catalogPath}
            label={problem?.contentType === "coding" ? "Coding Practice" : "Problem List"}
            className="text-xs font-semibold text-slate-400 hover:text-white -ml-2"
          />
          <span className="text-slate-600">|</span>
          <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {problem.title}
          </h2>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize ${
            problem.difficulty === "easy"
              ? "text-emerald-400 bg-emerald-500/10"
              : problem.difficulty === "medium"
              ? "text-amber-400 bg-amber-500/10"
              : "text-rose-400 bg-rose-500/10"
          }`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveLeftTab("hints")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500 hover:text-white text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Hint (5 cr)
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" /> {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </header>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: Description / Hints / History */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-[#0A0E17]/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-[#0A0E17] text-xs font-medium">
            <button
              onClick={() => setActiveLeftTab("description")}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeLeftTab === "description"
                  ? "border-cyan-500 text-cyan-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => {
                setActiveLeftTab("history");
                loadHistory();
              }}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeLeftTab === "history"
                  ? "border-cyan-500 text-cyan-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveLeftTab("hints")}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeLeftTab === "hints"
                  ? "border-cyan-500 text-cyan-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Hints
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            {activeLeftTab === "description" && (
              <>
                <div className="space-y-4">
                  <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(problem.companyTags || []).map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c}
                      </span>
                    ))}
                    {(problem.tags || []).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {problem.description}
                </div>

                {problem.dsaMetadata?.constraints?.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                      Constraints
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                      {problem.dsaMetadata.constraints.map((c, i) => (
                        <li key={i} className="font-mono">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeLeftTab === "history" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Your Submission History</h3>
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No submissions yet for this problem.</p>
                ) : (
                  <div className="space-y-2">
                    {historyList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#06080B] border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {item.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className={`font-semibold ${item.status === "ACCEPTED" ? "text-emerald-400" : "text-rose-400"}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="capitalize">{item.language}</span>
                          <span>{item.executionTimeMs} ms</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === "hints" && (
              <div className="space-y-4">
                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
                    <Sparkles className="w-4 h-4" /> Progressive AI Coding Hint
                  </div>
                  <p className="text-xs text-slate-300">
                    Get calibrated architectural clues without spoiling the complete answer. Costs 5 credits.
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleRequestHint(lvl)}
                        disabled={isHintLoading}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          hintLevel === lvl
                            ? "bg-indigo-600 border-indigo-400 text-white"
                            : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        Level {lvl} Hint
                      </button>
                    ))}
                  </div>
                </div>

                {isHintLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Generating progressive hint...
                  </div>
                ) : hintError ? (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {hintError}
                  </div>
                ) : hintText ? (
                  <div className="p-4 rounded-xl bg-[#06080B] border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                    <span className="text-xs font-bold text-indigo-400 block mb-2 uppercase tracking-wider">
                      Hint Level {hintLevel}:
                    </span>
                    {hintText}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col bg-[#06080B] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 border-b border-slate-800 bg-[#0A0E17] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="python" className="bg-[#0A0E17]">Python (3.10)</option>
                <option value="javascript" className="bg-[#0A0E17]">JavaScript (Node.js)</option>
                <option value="cpp" className="bg-[#0A0E17]">C++ (GCC 12)</option>
                <option value="java" className="bg-[#0A0E17]">Java (OpenJDK 17)</option>
              </select>
            </div>

            <button
              onClick={() => {
                const starters = problem?.dsaMetadata?.starterCode || {};
                setCode(starters[language] || DEFAULT_STARTER_CODE[language]);
              }}
              title="Reset code to template"
              className="text-slate-400 hover:text-white p-1 rounded transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Text Editor Area */}
          <div className="flex-1 relative font-mono text-sm">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your algorithmic solution here..."
              spellCheck="false"
              className="w-full h-full p-4 bg-[#06080B] text-slate-100 resize-none focus:outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Bottom Execution Console */}
          <div className="h-64 border-t border-slate-800 bg-[#0A0E17] flex flex-col">
            {/* Console Tabs */}
            <div className="flex items-center border-b border-slate-800 px-4 text-xs font-medium">
              <button
                onClick={() => setActiveBottomTab("testcases")}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  activeBottomTab === "testcases"
                    ? "border-cyan-500 text-cyan-400 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Sample Testcases
              </button>
              <button
                onClick={() => setActiveBottomTab("custom")}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  activeBottomTab === "custom"
                    ? "border-cyan-500 text-cyan-400 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setActiveBottomTab("output")}
                className={`py-2.5 px-3 border-b-2 transition-colors ${
                  activeBottomTab === "output"
                    ? "border-cyan-500 text-cyan-400 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Execution Result
              </button>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              {activeBottomTab === "testcases" && (
                <div className="space-y-3">
                  {(problem.dsaMetadata?.sampleTestCases || []).map((tc, idx) => (
                    <div key={idx} className="bg-[#06080B] p-3 rounded-lg border border-slate-800 space-y-2">
                      <div className="text-slate-400 font-semibold">Case {idx + 1}:</div>
                      <div>
                        <span className="text-slate-500 block">Input:</span>
                        <div className="text-slate-200 bg-slate-900/80 p-1.5 rounded">{tc.input}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Expected Output:</span>
                        <div className="text-slate-200 bg-slate-900/80 p-1.5 rounded">{tc.expectedOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeBottomTab === "custom" && (
                <div className="h-full flex flex-col">
                  <span className="text-slate-400 mb-1 block">Custom Stdin:</span>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input here..."
                    className="flex-1 bg-[#06080B] p-2.5 rounded-lg border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none font-mono"
                  />
                </div>
              )}

              {activeBottomTab === "output" && (
                <div>
                  {isRunning || isSubmitting ? (
                    <div className="flex items-center gap-2 text-slate-400 py-4">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      Executing sandboxed test cases...
                    </div>
                  ) : submissionResult ? (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border flex items-center justify-between ${
                        submissionResult.status === "ACCEPTED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {submissionResult.status === "ACCEPTED" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                          {submissionResult.status}
                        </div>
                        <div className="text-xs">
                          {submissionResult.passedTestCases} / {submissionResult.totalTestCases} Testcases Passed
                        </div>
                      </div>

                      {submissionResult.failureDetail && (
                        <div className="bg-[#06080B] p-3 rounded-lg border border-rose-500/30 space-y-1.5 text-rose-300">
                          <div>Failed at Case {submissionResult.failureDetail.caseIndex}:</div>
                          {!submissionResult.failureDetail.isHidden && (
                            <>
                              <div>Input: {submissionResult.failureDetail.input}</div>
                              <div>Expected: {submissionResult.failureDetail.expected}</div>
                              <div>Actual: {submissionResult.failureDetail.actual}</div>
                            </>
                          )}
                          {submissionResult.failureDetail.error && (
                            <div className="text-rose-400 font-mono mt-1">
                              {submissionResult.failureDetail.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : executionOutput ? (
                    <div className="space-y-3">
                      {executionOutput.cases ? (
                        executionOutput.cases.map((c, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border text-xs space-y-1 ${
                              c.status === "PASSED"
                                ? "bg-emerald-500/5 border-emerald-500/20 text-slate-200"
                                : "bg-rose-500/5 border-rose-500/20 text-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>Case {c.caseIndex}</span>
                              <span className={c.status === "PASSED" ? "text-emerald-400" : "text-rose-400"}>
                                {c.status}
                              </span>
                            </div>
                            <div>Input: {c.input}</div>
                            <div>Expected: {c.expectedOutput}</div>
                            <div>Output: {c.actualOutput}</div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-[#06080B] p-3 rounded-lg border border-slate-800">
                          <div className="text-slate-400 mb-1">Status: {executionOutput.status}</div>
                          <pre className="text-slate-200 whitespace-pre-wrap">{executionOutput.stdout || executionOutput.stderr || "No output"}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 py-4 text-center">Run code or submit to view testcase output.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
