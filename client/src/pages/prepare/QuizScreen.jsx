import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { submitQuiz } from "../../services/quizApi.js";

export default function QuizScreen() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const session = location.state?.quizSession;
  const questions = session?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: "A" | "B" | ... }
  const [secondsRemaining, setSecondsRemaining] = useState(
    (session?.durationMinutes || 15) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Timer Countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleAutoSubmit = async () => {
    await doSubmit();
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionKey: selectedAnswers[q.questionId] || null,
      }));

      const totalTime = (session?.durationMinutes || 15) * 60 - secondsRemaining;

      const res = await submitQuiz(attemptId, {
        answers: answersPayload,
        timeTakenSeconds: Math.max(1, totalTime),
      });

      if (res?.success) {
        navigate(`/prepare/quiz/result/${attemptId}`, {
          state: { result: res.data },
        });
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
      navigate(`/prepare/quiz/result/${attemptId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">No active quiz session found</h2>
        <p className="text-slate-400 text-sm mb-4">Please start a new quiz from the catalog.</p>
        <button
          onClick={() => navigate("/prepare/quiz")}
          className="px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg text-sm"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0A0E17] px-4 sm:px-8 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400">{session.category}</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs uppercase font-semibold text-slate-400 capitalize">{session.difficulty}</span>
          </h2>
          <span className="text-xs text-slate-400">
            Question {currentIndex + 1} of {questions.length} ({answeredCount} answered)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            secondsRemaining < 120
              ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
              : "bg-slate-900 border-slate-700 text-slate-200"
          }`}>
            <Clock className="w-4 h-4 text-cyan-400" />
            {formattedTime}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-md transition-all"
          >
            Finish & Submit
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 w-full">
        <div
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="bg-[#0D121D] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-cyan-400">
                Question {currentIndex + 1}
              </span>
              <span>Single Choice</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.title}
            </h3>

            {currentQ.description && (
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {currentQ.description}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {(currentQ.options || []).map((opt) => {
              const isSelected = selectedAnswers[currentQ.questionId] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOption(currentQ.questionId, opt.key)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all text-sm ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-[#0D121D] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-cyan-500 text-black font-extrabold"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {opt.key}
                  </div>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const answered = Boolean(selectedAnswers[q.questionId]);
              const current = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${
                    current
                      ? "bg-cyan-500 text-black font-bold"
                      : answered
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Finish Quiz <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Ready to submit?</h3>
            <p className="text-sm text-slate-300">
              You have answered {answeredCount} out of {questions.length} questions.
              Once submitted, your responses will be authoritatively graded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Continue Quiz
              </button>
              <button
                onClick={doSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-extrabold text-xs shadow-lg hover:bg-cyan-400"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
