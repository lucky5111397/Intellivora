import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById } from '../data/topicsData';
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

export default function TestScreen() {
  const {
    state,
    dispatch,
    selectAnswer,
    clearAnswer,
    toggleReview,
    submitTest,
    recoverActiveTest,
  } = useAptitude();
  const navigate = useNavigate();

  const questions = state.questions || [];
  const index = state.currentQuestionIndex;
  const question = questions[index];

  const [timeLeft, setTimeLeft] = useState(state.timeLimit);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [visited, setVisited] = useState([0]);
  const [recovering, setRecovering] = useState(false);

  // Recover in-progress attempt if entered directly or reloaded
  useEffect(() => {
    let active = true;
    const checkAttempt = async () => {
      if (questions.length === 0) {
        setRecovering(true);
        const restored = await recoverActiveTest();
        if (active) {
          setRecovering(false);
          if (!restored) {
            navigate('/aptitude/topics');
          }
        }
      }
    };
    checkAttempt();
    return () => {
      active = false;
    };
  }, [questions.length, recoverActiveTest, navigate]);

  const handleSubmit = useCallback(async () => {
    if (state.isSubmitting) return;
    setSubmitError(null);
    const res = await submitTest();
    if (res?.success && res.result?.attemptId) {
      navigate(`/aptitude/result/${res.result.attemptId}`);
    } else {
      const errMsg = res?.message || 'Submission failed. Please check your network and retry.';
      setSubmitError(errMsg);
      setShowSubmit(true);
    }
  }, [state.isSubmitting, submitTest, navigate]);

  // Synchronize local countdown against server-authoritative start timestamp
  useEffect(() => {
    if (!state.timeLimit || state.timeLimit <= 0) return undefined;

    const computeRemaining = () => {
      if (!state.testStartTime) return state.timeLimit;
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(state.testStartTime).getTime()) / 1000));
      return Math.max(0, state.timeLimit - elapsed);
    };

    setTimeLeft(computeRemaining());

    const timer = window.setInterval(() => {
      const remaining = computeRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.timeLimit, state.testStartTime, handleSubmit]);

  useEffect(() => {
    setVisited((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }, [index]);

  // Keyboard navigation: arrow keys for question traversal, number/letter keys for answer selection
  useEffect(() => {
    const handleKey = (event) => {
      if (showSubmit) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.key === 'ArrowLeft' && index > 0) {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: index - 1 });
      }
      if (event.key === 'ArrowRight' && index < questions.length - 1) {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: index + 1 });
      }

      const keyMap = {
        '1': 'A', '2': 'B', '3': 'C', '4': 'D',
        'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D',
        'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D',
      };
      const optionKey = keyMap[event.key];
      if (optionKey && question?.options) {
        const currentQId = question.questionId || question.id;
        const hasKey = question.options.some((opt, i) =>
          (typeof opt === 'object' ? opt.key : String.fromCharCode(65 + i)) === optionKey
        );
        if (hasKey && currentQId) {
          selectAnswer(currentQId, optionKey);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch, index, questions.length, showSubmit, question, selectAnswer]);

  if (recovering && !questions.length) {
    return (
      <div className="min-h-screen bg-[#06080B] flex flex-col items-center justify-center text-[#F1F5F9]">
        <div className="w-10 h-10 border-3 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#94A3B8]">Restoring active assessment attempt...</p>
      </div>
    );
  }

  if (!question) return null;

  const qId = question.questionId || question.id;
  const topicName = findTopicById(state.selectedTopic)?.name || state.selectedTopic || 'Aptitude Assessment';
  const answered = Object.keys(state.answers).length;
  const marked = Object.values(state.markedForReview).filter(Boolean).length;
  const formatTime = (seconds) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const timerClass =
    timeLeft < 60
      ? 'text-[#F87171] animate-pulse border-[#B91C1C]'
      : timeLeft < 300
      ? 'text-[#FBBF24] border-[#B45309]'
      : 'text-[#F1F5F9] border-[#1E2B45]';
  const selectedKey = state.answers[qId];

  // Question palette state priority: current active > answered & flagged > answered > flagged > visited > unvisited
  const paletteClass = (item, itemIndex) => {
    const itemId = item.questionId || item.id;
    const isCurrent = itemIndex === index;
    const isAnswered = state.answers[itemId] !== undefined;
    const isMarked = state.markedForReview[itemId];

    if (isCurrent) {
      return 'bg-[#2563EB] text-white border-[#3B82F6] ring-2 ring-[#38BDF8]/50 shadow-md font-bold';
    }
    if (isAnswered && isMarked) {
      return 'bg-[#271A04] text-[#FBBF24] border-[#B45309] font-semibold';
    }
    if (isAnswered) {
      return 'bg-[#062319] text-[#34D399] border-[#047857] font-semibold';
    }
    if (isMarked) {
      return 'bg-[#271A04] text-[#FBBF24] border-[#B45309] font-semibold';
    }
    if (visited.includes(itemIndex)) {
      return 'bg-[#141B2D] text-[#94A3B8] border-[#2D3E63]';
    }
    return 'bg-[#0A0D14] text-[#64748B] border-[#161F33]';
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] flex flex-col selection:bg-[#2563EB] selection:text-white">
      {/* Top Test Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#06080B]/90 backdrop-blur-md border-b border-[#161F33] flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="hidden sm:block truncate font-semibold text-sm text-[#F1F5F9]">{topicName}</span>
          <span className="bg-[#141B2D] border border-[#2D3E63] px-2.5 py-0.5 rounded-full text-xs font-mono text-[#93C5FD] tabular-nums">
            Q {index + 1} of {questions.length}
          </span>
        </div>

        {/* Authoritative Countdown Timer */}
        <div className={`font-mono text-base font-bold bg-[#0A0D14] px-4 py-1.5 rounded-lg border tabular-nums ${timerClass}`}>
          <div className="flex items-center gap-1.5">
            <Clock size={15} />
            <span>{state.timeLimit ? formatTime(timeLeft) : 'Untimed'}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          {/* Flag Question Button */}
          <button
            onClick={() => toggleReview(qId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              state.markedForReview[qId]
                ? 'bg-[#271A04] text-[#FBBF24] border-[#B45309]'
                : 'bg-[#0E131F] border-[#1E2B45] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D]'
            }`}
          >
            <Flag size={14} className={state.markedForReview[qId] ? 'fill-current' : ''} />
            <span className="hidden lg:inline">{state.markedForReview[qId] ? 'Flagged' : 'Flag'}</span>
          </button>

          {/* Palette toggle on mobile */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="lg:hidden px-3 py-1.5 rounded-lg bg-[#0E131F] border border-[#1E2B45] text-xs font-medium text-[#94A3B8]"
          >
            Palette
          </button>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmit(true)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Content: Question + Right Palette */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Current Question */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <section className="bg-[#0E131F] border border-[#1E2B45] rounded-xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#161F33]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-mono font-bold">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD]">
                    {question.difficulty || 'Diagnostic'} Problem
                  </span>
                </div>
                {state.markedForReview[qId] && (
                  <Badge variant="warning" size="sm" dot>
                    Review Later
                  </Badge>
                )}
              </div>

              {/* Question Statement */}
              <h2 className="text-base sm:text-xl font-medium text-[#F1F5F9] leading-relaxed whitespace-pre-wrap break-words mb-8">
                {question.questionText || question.text || question.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {question.options?.map((opt, optIndex) => {
                  const key = typeof opt === 'object' ? opt.key : String.fromCharCode(65 + optIndex);
                  const text = typeof opt === 'object' ? opt.text : opt;
                  const isSelected = selectedKey === key;

                  return (
                    <button
                      key={key}
                      onClick={() => selectAnswer(qId, key)}
                      className={`text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D1E3A] border-[#2563EB] text-[#93C5FD] ring-1 ring-[#2563EB]/40 shadow-sm'
                          : 'bg-[#0A0D14] border-[#161F33] hover:border-[#2D3E63] text-[#F1F5F9]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-lg text-xs font-mono font-bold ${
                          isSelected
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-[#141B2D] text-[#94A3B8] border border-[#2D3E63]'
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed mt-0.5">{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#161F33]">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={index === 0}
                  leftIcon={ChevronLeft}
                  onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: index - 1 })}
                >
                  Previous
                </Button>
                {selectedKey && (
                  <button
                    onClick={() => clearAnswer(qId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    Clear Choice
                  </button>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                rightIcon={index < questions.length - 1 ? ChevronRight : undefined}
                onClick={() =>
                  index < questions.length - 1
                    ? dispatch({ type: 'SET_CURRENT_QUESTION', payload: index + 1 })
                    : setShowSubmit(true)
                }
              >
                {index < questions.length - 1 ? 'Save & Next' : 'Review & Submit'}
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Question Palette */}
        <aside
          className={`${
            paletteOpen ? 'fixed inset-0 z-50 bg-[#06080B] p-4 overflow-y-auto' : 'hidden'
          } lg:flex lg:w-[320px] shrink-0`}
        >
          <div className="w-full bg-[#0E131F] rounded-xl p-5 border border-[#1E2B45] h-fit lg:sticky lg:top-20 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#161F33]">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#F1F5F9]">
                Question Palette
              </h3>
              <button
                onClick={() => setPaletteOpen(false)}
                className="lg:hidden p-1 rounded-lg text-[#64748B] hover:text-[#F1F5F9]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid of Palette Questions */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((item, itemIndex) => (
                <button
                  key={item.questionId || item.id || itemIndex}
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_QUESTION', payload: itemIndex });
                    setPaletteOpen(false);
                  }}
                  className={`h-9 rounded-lg border font-mono text-xs transition-all cursor-pointer ${paletteClass(
                    item,
                    itemIndex
                  )}`}
                >
                  {itemIndex + 1}
                </button>
              ))}
            </div>

            {/* Palette Legend */}
            <div className="space-y-2 text-xs text-[#94A3B8] bg-[#0A0D14] rounded-lg p-3.5 border border-[#161F33]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span>Answered:</span>
                </span>
                <b className="text-[#34D399] font-mono tabular-nums">{answered} / {questions.length}</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Flagged:</span>
                </span>
                <b className="text-[#FBBF24] font-mono tabular-nums">{marked}</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                  <span>Unvisited:</span>
                </span>
                <b className="text-[#F1F5F9] font-mono tabular-nums">{Math.max(0, questions.length - visited.length)}</b>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-[#06080B]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-[#1E2B45] w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#F1F5F9]">Submit Assessment?</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              You have answered <b className="text-[#34D399] font-mono">{answered}</b> out of{' '}
              <b className="text-[#F1F5F9] font-mono">{questions.length}</b> questions.
              {questions.length - answered > 0 && (
                <span className="text-[#FBBF24] block mt-1">
                  ({questions.length - answered} questions remain unattempted).
                </span>
              )}
            </p>

            {submitError && (
              <div className="p-3 rounded-lg bg-[#280B0B] border border-[#B91C1C]/40 text-[#F87171] text-xs leading-relaxed">
                {submitError}
              </div>
            )}

            <div className="flex gap-3 pt-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSubmit(false)}
              >
                Return to Test
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={state.isSubmitting}
                onClick={handleSubmit}
              >
                {submitError ? 'Retry Submit' : 'Confirm Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
