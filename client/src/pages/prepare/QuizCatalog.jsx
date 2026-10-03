import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HelpCircle,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { getQuizCategories, startQuiz, getQuizHistory } from "../../services/quizApi.js";
import { BackButton } from "@/components/ui";

export default function QuizCatalog() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Computer Science Core");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(15);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);
      try {
        const [catRes, histRes] = await Promise.allSettled([
          getQuizCategories(),
          getQuizHistory(),
        ]);
        if (catRes.status === "fulfilled" && catRes.value?.success) {
          const list = catRes.value.data || [];
          setCategories(list);
          if (list.length > 0 && !selectedCategory) {
            setSelectedCategory(list[0].category);
          }
        }
        if (histRes.status === "fulfilled" && histRes.value?.success) {
          setHistory(histRes.value.data || []);
        }
      } catch (err) {
        console.error("Error loading quiz data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, []);

  const handleStartQuiz = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await startQuiz({
        category: selectedCategory,
        difficulty,
        durationMinutes: Number(duration),
      });
      if (res?.success && res.data) {
        navigate(`/prepare/quiz/screen/${res.data.attemptId}`, {
          state: { quizSession: res.data },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to start quiz session.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <BackButton fallback="/" label="Back" />
        </div>

        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Technical Diagnostics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Knowledge Quizzes
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
            Benchmark your foundational Computer Science and systems engineering knowledge
            with timed multiple-choice assessments.
          </p>
        </div>

        {/* Start Configuration Card */}
        <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> Start a Diagnostic Quiz
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Select Domain
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#06080B] text-slate-200 text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category} ({c.count} questions)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Computer Science Core">Computer Science Core</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                  </>
                )}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                2. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      difficulty === diff
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                        : "bg-[#06080B] border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Time Limit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      duration === mins
                        ? "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                        : "bg-[#06080B] border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {mins} Mins
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleStartQuiz}
              disabled={isStarting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  Begin Assessment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Past Attempts Table */}
        <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Recent Quiz Results
          </h3>

          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              You haven't completed any quizzes yet. Start one above to test your skills!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{h.category}</td>
                      <td className="py-3.5 px-4 capitalize text-slate-300">{h.difficulty}</td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{h.score}%</td>
                      <td className="py-3.5 px-4 text-slate-300">{h.accuracy}%</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/prepare/quiz/result/${h._id}`}
                          className="text-cyan-400 hover:underline text-xs font-semibold"
                        >
                          View Breakdown &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
