import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById } from '../data/topicsData';

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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [visited, setVisited] = useState([0]);
  const [recovering, setRecovering] = useState(false);

  // 1. Recover active test on page reload / direct entry
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
  }, []); // Run on mount only

  // Submit test handler
  const handleSubmit = useCallback(async () => {
    if (state.isSubmitting) return;
    const res = await submitTest();
    if (res.success && res.result?.attemptId) {
      navigate(`/aptitude/result/${res.result.attemptId}`);
    } else {
      // If error or already submitted
      navigate('/aptitude');
    }
  }, [state.isSubmitting, submitTest, navigate]);

  // 2. Authoritative Timer with countdown
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

  // 3. Mark current question as visited
  useEffect(() => {
    setVisited((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }, [index]);

  // 4. Keyboard navigation (Left / Right arrow keys)
  // 4. Keyboard navigation (Left / Right arrow keys & 1-4 / A-D option selection)
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
      <div className="min-h-screen bg-apt-bg flex flex-col items-center justify-center text-apt-text">
        <div className="w-10 h-10 border-4 border-apt-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-apt-text-dim">Restoring active assessment attempt...</p>
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
      ? 'text-rose-400 animate-pulse'
      : timeLeft < 300
      ? 'text-amber-400'
      : 'text-apt-text';
  const selectedKey = state.answers[qId];

  // Palette styling helper
  const paletteClass = (item, itemIndex) => {
    const itemId = item.questionId || item.id;
    const isCurrent = itemIndex === index;
    const isAnswered = state.answers[itemId] !== undefined;
    const isMarked = state.markedForReview[itemId];

    if (isCurrent) {
      return 'bg-apt-primary-ctr text-white border-apt-primary-ctr ring-2 ring-apt-primary/50 shadow-md font-bold';
    }
    if (isAnswered && isMarked) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold';
    }
    if (isAnswered) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-semibold';
    }
    if (isMarked) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold';
    }
    return visited.includes(itemIndex)
      ? 'bg-apt-surface-low text-apt-text border-apt-outline-dim'
      : 'bg-apt-surface-mid text-apt-text-dim border-transparent';
  };

  return (
    <div className="min-h-screen bg-apt-bg text-apt-text font-family-jakarta flex flex-col">
      {/* Fixed Top Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-apt-surface-top border-b border-apt-outline-dim flex items-center justify-between px-4 lg:px-8 z-40">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="hidden sm:block truncate font-semibold">{topicName}</span>
          <span className="bg-apt-surface-mid px-3 py-1 rounded-full text-xs font-semibold">
            Q {index + 1} of {questions.length}
          </span>
        </div>

        <div className={`font-family-jetbrains text-lg font-bold bg-apt-surface-low px-4 py-1.5 rounded-lg border border-apt-outline-dim ${timerClass}`}>
          {state.timeLimit ? formatTime(timeLeft) : 'Untimed'}
        </div>

        <div className="flex items-center justify-end gap-2 flex-1">
          <button
            onClick={() => toggleReview(qId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              state.markedForReview[qId]
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-apt-surface-low border-transparent hover:bg-apt-surface-mid text-apt-text-dim hover:text-apt-text'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {state.markedForReview[qId] ? 'flag' : 'outlined_flag'}
            </span>
            <span className="hidden lg:inline text-xs font-semibold">
              {state.markedForReview[qId] ? 'Flagged' : 'Flag'}
            </span>
          </button>

          <button
            onClick={() => setShowSubmit(true)}
            className="bg-apt-primary-ctr text-white px-4 py-1.5 rounded-lg font-semibold text-sm shadow hover:bg-opacity-90 transition-all cursor-pointer"
          >
            Submit Test
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="lg:hidden p-1.5 bg-apt-surface-high rounded-lg text-apt-text cursor-pointer"
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </header>

      {/* Main Test Screen Content */}
      <main className="flex-1 mt-16 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6">

        {/* Left Column: Question & Options */}
        <div className="flex-1 flex flex-col min-w-0">
          <section className="bg-apt-surface-mid rounded-xl p-5 sm:p-8 border border-apt-outline-dim flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Question {index + 1}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full uppercase font-bold bg-apt-surface-high border border-apt-outline-dim text-apt-primary">
                  1.0 Mark / -0.25
                </span>
              </div>

              <p className="text-base sm:text-lg mb-8 leading-relaxed whitespace-pre-wrap font-medium">
                {question.question}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {question.options?.map((opt, optIndex) => {
                  const key = typeof opt === 'object' ? opt.key : String.fromCharCode(65 + optIndex);
                  const text = typeof opt === 'object' ? opt.text : opt;
                  const isSelected = selectedKey === key;

                  return (
                    <button
                      key={key}
                      onClick={() => selectAnswer(qId, key)}
                      className={`text-left p-4 rounded-xl border flex items-start gap-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-apt-primary/20 border-apt-primary text-apt-text shadow-sm ring-1 ring-apt-primary/40'
                          : 'bg-apt-surface-low border-transparent hover:bg-apt-surface-high text-apt-text'
                      }`}
                    >
                      <span className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-apt-primary-ctr text-white'
                          : 'bg-apt-surface-high text-apt-text-dim'
                      }`}>
                        {key}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed mt-0.5">{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-apt-outline-dim">
              <div className="flex gap-3">
                <button
                  disabled={index === 0}
                  onClick={() => dispatch({ type: 'SET_CURRENT_QUESTION', payload: index - 1 })}
                  className="bg-apt-surface-high px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {selectedKey && (
                  <button
                    onClick={() => clearAnswer(qId)}
                    className="bg-apt-surface-low text-apt-text-dim hover:text-apt-text px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Clear Choice
                  </button>
                )}
              </div>

              <button
                onClick={() =>
                  index < questions.length - 1
                    ? dispatch({ type: 'SET_CURRENT_QUESTION', payload: index + 1 })
                    : setShowSubmit(true)
                }
                className="bg-apt-primary-ctr text-white px-5 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90 transition-all cursor-pointer"
              >
                {index < questions.length - 1 ? 'Save & Next' : 'Review & Submit'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Question Palette */}
        <aside className={`${paletteOpen ? 'fixed inset-0 z-50 bg-apt-bg p-4 overflow-y-auto' : 'hidden'} lg:flex lg:w-[320px] shrink-0`}>
          <div className="w-full bg-apt-surface-mid rounded-xl p-5 border border-apt-outline-dim h-fit lg:sticky lg:top-20 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-base">Question Palette</h2>
              <button
                onClick={() => setPaletteOpen(false)}
                className="lg:hidden p-1.5 bg-apt-surface-high rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((item, itemIndex) => (
                <button
                  key={item.questionId || item.id || itemIndex}
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_QUESTION', payload: itemIndex });
                    setPaletteOpen(false);
                  }}
                  className={`h-10 rounded-lg border font-family-jetbrains text-xs transition-all cursor-pointer ${paletteClass(
                    item,
                    itemIndex
                  )}`}
                >
                  {itemIndex + 1}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-xs text-apt-text-dim bg-apt-surface-low rounded-xl p-4 border border-apt-outline-dim">
              <div className="flex justify-between">
                <span>Answered:</span>
                <b className="text-emerald-400 font-family-jetbrains">{answered} / {questions.length}</b>
              </div>
              <div className="flex justify-between">
                <span>Flagged for Review:</span>
                <b className="text-amber-400 font-family-jetbrains">{marked}</b>
              </div>
              <div className="flex justify-between">
                <span>Unvisited:</span>
                <b className="font-family-jetbrains">{Math.max(0, questions.length - visited.length)}</b>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* Submit Confirmation Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-apt-surface-mid border border-apt-outline w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-apt-text">Submit Assessment?</h2>
            <p className="text-sm text-apt-text-dim leading-relaxed">
              You have answered <b className="text-emerald-400">{answered}</b> out of <b className="text-apt-text">{questions.length}</b> questions.
              {questions.length - answered > 0 && (
                <span className="text-amber-400 block mt-1">
                  ({questions.length - answered} questions are currently skipped/unanswered).
                </span>
              )}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmit(false)}
                className="flex-1 bg-apt-surface-high hover:bg-apt-surface-top py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-colors"
              >
                Return to Test
              </button>
              <button
                disabled={state.isSubmitting}
                onClick={handleSubmit}
                className="flex-1 bg-apt-primary-ctr hover:bg-opacity-90 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 cursor-pointer transition-all"
              >
                {state.isSubmitting ? 'Evaluating...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
