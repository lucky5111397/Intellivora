import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  Layers,
} from "lucide-react";
import { getQuestions, getQuestionCategories } from "../../services/questionBankApi.js";
import { getUserProgress } from "../../services/dsaApi.js";

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const MODE_CONFIG = {
  dsa: {
    title: "Data Structures & Algorithms",
    badge: "Algorithmic Mastery",
    description:
      "Sharpen your algorithmic thinking with curated interview problems from top tech companies. Run test cases in Python, JavaScript, C++, or Java.",
    empty: "No DSA problems match your current filters.",
  },
  coding: {
    title: "Coding Practice",
    badge: "Hands-on Programming",
    description:
      "Build practical programming fluency with focused exercises for strings, arrays, data processing, and everyday coding tasks.",
    empty: "No Coding Practice problems match your current filters.",
  },
};

export default function DsaCatalog({ mode = "dsa" }) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.dsa;
  const catalogPath = mode === "coding" ? "/prepare/coding" : "/prepare/dsa";
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userProgress, setUserProgress] = useState({ solvedCount: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [qRes, cRes, pRes] = await Promise.allSettled([
          getQuestions({
            contentType: mode,
            difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: search.trim() || undefined,
            limit: 50,
          }),
          getQuestionCategories(mode),
          getUserProgress(),
        ]);

        if (qRes.status !== "fulfilled" || !qRes.value?.success) {
          throw new Error(
            qRes.status === "fulfilled"
              ? qRes.value?.message || "Failed to load problems."
              : qRes.reason?.message || "Failed to load problems."
          );
        }
        const questionData = qRes.value.data;
        setProblems(Array.isArray(questionData) ? questionData : questionData?.items || []);
        if (cRes.status === "fulfilled" && cRes.value?.success) {
          setCategories(cRes.value.data || []);
        }
        if (pRes.status === "fulfilled" && pRes.value?.success) {
          setUserProgress(pRes.value.data || { solvedCount: 0, easy: 0, medium: 0, hard: 0 });
        }
      } catch (err) {
        console.error(`Error loading ${mode} problems:`, err);
        setProblems([]);
        setError(err.message || "Failed to load problems.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [mode, selectedDifficulty, selectedCategory, search, retryCount]);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Code2 className="w-3.5 h-3.5" /> {config.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {config.title}
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
              {config.description}
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-3 gap-3 bg-[#0D121D] p-4 rounded-xl border border-slate-800 shadow-lg min-w-[280px]">
            <div className="text-center border-r border-slate-800 pr-2">
              <span className="text-xs text-slate-400 block font-medium">Solved</span>
              <span className="text-xl font-bold text-cyan-400">{userProgress.solvedCount || 0}</span>
            </div>
            <div className="text-center border-r border-slate-800 px-2">
              <span className="text-xs text-emerald-400 block font-medium">Easy</span>
              <span className="text-xl font-bold text-white">{userProgress.easy || 0}</span>
            </div>
            <div className="text-center pl-2">
              <span className="text-xs text-amber-400 block font-medium">Med / Hard</span>
              <span className="text-xl font-bold text-white">{(userProgress.medium || 0) + (userProgress.hard || 0)}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0D121D] p-4 rounded-xl border border-slate-800">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search problem title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#06080B] rounded-lg border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#06080B] text-slate-300 text-sm py-2 px-3 rounded-lg border border-slate-700/80 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.count})
                </option>
              ))}
            </select>

            {/* Difficulty Tabs */}
            <div className="flex items-center bg-[#06080B] rounded-lg p-1 border border-slate-700/80 text-xs">
              {["all", "easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded capitalize font-medium transition-colors ${
                    selectedDifficulty === diff
                      ? "bg-cyan-500 text-black font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problem Table / Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading problems...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-[#0D121D] rounded-xl border border-rose-500/20">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200">Unable to load problems</h3>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center bg-[#0D121D] rounded-xl border border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200">{config.empty}</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="bg-[#0D121D] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0A0E17] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Category / Subtopic</th>
                    <th className="py-3.5 px-6">Difficulty</th>
                    <th className="py-3.5 px-6">Companies</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {problems.map((prob) => {
                    const isSolved = userProgress.solvedProblems?.includes(prob.slug);
                    return (
                      <tr
                        key={prob.slug}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500" />
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-white group-hover:text-cyan-400 transition-colors">
                          <Link
                            to={`${catalogPath}/${prob.slug}`}
                            state={{ from: catalogPath }}
                            className="hover:underline flex items-center gap-2"
                          >
                            {prob.title}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          <span className="text-slate-300 font-medium">{prob.category}</span>
                          {prob.subtopic && (
                            <span className="text-xs text-slate-500 block">{prob.subtopic}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                              DIFFICULTY_COLORS[prob.difficulty] || "text-slate-300"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(prob.companyTags || []).slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                              >
                                {comp}
                              </span>
                            ))}
                            {(prob.companyTags || []).length > 3 && (
                              <span className="text-xs text-slate-500 self-center">
                                +{prob.companyTags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`${catalogPath}/${prob.slug}`}
                            state={{ from: catalogPath }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black font-semibold text-xs transition-all"
                          >
                            Solve <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
