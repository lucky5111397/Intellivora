import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { getQuizResult } from "../../services/quizApi.js";

export default function QuizResult() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    async function fetchResult() {
      if (result) return;
      setLoading(true);
      try {
        const res = await getQuizResult(attemptId);
        if (res?.success && res.data) {
          setResult(res.data);
        }
      } catch (err) {
        console.error("Failed to load quiz result:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Quiz result not found</h2>
        <Link to="/prepare/quiz" className="text-cyan-400 hover:underline text-sm">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  const score = result.score || 0;
  const isPassing = score >= 70;
  const timeTaken = result.timeTakenSeconds || 0;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header link */}
        <Link
          to="/prepare/quiz"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Quiz Catalog
        </Link>

        {/* Scorecard Hero */}
        <div className="bg-[#0D121D] rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Assessment Completed
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-xl ${
              isPassing
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500 bg-amber-500/10 text-amber-400"
            }`}>
              <span className="text-4xl font-extrabold tracking-tight">{score}%</span>
              <span className="text-xs font-medium text-slate-300">Score</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-4">
              {isPassing ? "Excellent Technical Competence!" : "Good Effort — Review Key Concepts"}
            </h2>
            <p className="text-slate-400 text-sm max-w-md mt-1">
              Category: <span className="text-white font-semibold">{result.category}</span> ({result.difficulty})
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 border-t border-slate-800/80">
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Correct</span>
              <span className="text-lg font-bold text-emerald-400">
                {result.correctCount} / {result.totalQuestions}
              </span>
            </div>
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
              <span className="text-lg font-bold text-cyan-400">{result.accuracy}%</span>
            </div>
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Time Taken</span>
              <span className="text-lg font-bold text-slate-200">{formattedTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate("/prepare/quiz")}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg transition-all"
            >
              Take Another Quiz
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" /> Question-by-Question Analysis
          </h3>

          <div className="space-y-4">
            {(result.answers || []).map((ans, idx) => {
              const isCorrect = ans.isCorrect;
              return (
                <div
                  key={idx}
                  className={`bg-[#0D121D] rounded-2xl border p-6 space-y-4 transition-all ${
                    isCorrect ? "border-emerald-500/30" : "border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  {/* Answers summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#06080B] border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Your Selected Option:</span>
                      <span className={`font-bold text-sm ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                        {ans.selectedOptionKey ? `Option ${ans.selectedOptionKey}` : "Skipped"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#06080B] border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Authoritative Answer:</span>
                      <span className="font-bold text-sm text-emerald-400">
                        Option {ans.correctOptionKey}
                      </span>
                    </div>
                  </div>

                  {/* Explanation card */}
                  {ans.explanation && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-cyan-400 block mb-1 uppercase tracking-wider text-[10px]">
                        Architectural Concept:
                      </span>
                      {ans.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
