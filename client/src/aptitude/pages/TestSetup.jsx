import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById, categoriesData } from '../data/topicsData';

export default function TestSetup() {
  const { state, dispatch, startTest } = useAptitude();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!state.selectedTopic) {
      navigate('/aptitude/topics');
    }
  }, [state.selectedTopic, navigate]);

  if (!state.selectedTopic) {
    return null;
  }

  const topicObj = findTopicById(state.selectedTopic) || {
    id: state.selectedTopic,
    name: state.selectedTopic,
    description: 'Assessment drill focusing on proficiency and conceptual speed in this aptitude domain.',
    category: state.selectedCategory || 'quantitative',
  };

  const categoryObj = categoriesData.find((c) => c.slug === (topicObj.category || state.selectedCategory)) || {
    name: 'Aptitude Assessment',
  };

  const formatTime = (seconds) => {
    if (seconds === 0) return 'Untimed';
    return `${Math.floor(seconds / 60)} Mins`;
  };

  const handleStartTest = async () => {
    setStarting(true);
    setErrorMessage('');

    const res = await startTest({
      category: topicObj.category || state.selectedCategory || 'quantitative',
      topic: state.selectedTopic,
      difficulty: state.difficulty || 'Medium',
      questionCount: Number(state.questionCount || 5),
      timeLimitSeconds: Number(state.timeLimit ?? 600),
    });

    setStarting(false);

    if (res.success) {
      navigate('/aptitude/test');
    } else {
      setErrorMessage(res.error || 'Failed to initialize test attempt.');
    }
  };

  return (
    <div className="min-h-screen bg-apt-bg text-apt-text font-family-jakarta selection:bg-apt-primary/30 overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 1. Breadcrumb Rail */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center text-sm font-medium text-apt-text-dim">
            <span className="material-symbols-outlined text-[18px] mr-1">home</span>
            <span className="hover:text-apt-text cursor-pointer transition-colors" onClick={() => navigate('/aptitude')}>
              Home
            </span>
            <span className="mx-2 text-apt-outline-dim">/</span>
            <span className="hover:text-apt-text cursor-pointer transition-colors" onClick={() => navigate('/aptitude/topics')}>
              {categoryObj.name}
            </span>
            <span className="mx-2 text-apt-outline-dim">/</span>
            <span className="text-apt-secondary font-semibold">{topicObj.name} Setup</span>
          </div>

          <button
            onClick={() => navigate('/aptitude/topics')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-apt-surface-low border border-apt-outline-dim rounded-lg hover:bg-apt-surface-mid transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            <span>Change Topic</span>
          </button>
        </div>

        {/* Error Alert (e.g. 422 Insufficient Pool or Provider Failure) */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-300">
            <span className="material-symbols-outlined text-rose-400 mt-0.5">error</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-rose-300">Test Initialization Error</h4>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Topic Header Card */}
        <div className="relative overflow-hidden bg-apt-surface-mid rounded-2xl p-6 sm:p-8 border border-apt-outline-dim">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <span className="px-3 py-1 text-xs font-bold bg-apt-primary/20 text-apt-primary rounded-full border border-apt-primary/30 uppercase tracking-wider">
              {categoryObj.name}
            </span>
            <span className="text-xs text-apt-text-dim">
              Verified Psychometric Assessment
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-apt-text tracking-tight mb-3">
            {topicObj.name}
          </h1>
          <p className="text-apt-text-dim max-w-2xl text-base leading-relaxed">
            {topicObj.description}
          </p>
        </div>

        {/* 3. Setup Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Controls */}
          <div className="lg:col-span-8 space-y-6">

            {/* Setting 1: Difficulty Level */}
            <div className="bg-apt-surface-mid rounded-xl p-6 border border-apt-outline-dim space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-apt-primary text-xl">tune</span>
                <h2 className="text-lg font-bold text-apt-text">Difficulty Calibration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'Easy', desc: 'Foundation concepts, formulas, and straightforward evaluation.' },
                  { id: 'Medium', desc: 'Industry-standard benchmarks and multi-step reasoning.' },
                  { id: 'Hard', desc: 'Advanced problem solving, intricate edge cases, and traps.' },
                  { id: 'Adaptive', desc: 'Dynamically balanced mix across difficulty tiers.' },
                ].map((diff) => {
                  const isSelected = state.difficulty === diff.id;
                  return (
                    <div
                      key={diff.id}
                      onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: diff.id })}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-apt-surface-high border-apt-primary shadow-md ring-1 ring-apt-primary/40'
                          : 'bg-apt-surface-low border-apt-outline-dim hover:bg-apt-surface-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-apt-text">{diff.id}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-apt-primary bg-apt-primary' : 'border-apt-outline-dim'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>
                      <p className="text-xs text-apt-text-dim leading-relaxed">{diff.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Setting 2: Question Load */}
            <div className="bg-apt-surface-mid rounded-xl p-6 border border-apt-outline-dim space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-xl">format_list_numbered</span>
                  <h2 className="text-lg font-bold text-apt-text">Question Load</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-apt-surface-low text-apt-secondary">
                  {state.questionCount} Questions Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 5, label: 'Quick Sprint', sub: '5 Questions' },
                  { count: 10, label: 'Standard Set', sub: '10 Questions' },
                  { count: 15, label: 'Deep Practice', sub: '15 Questions' },
                  { count: 20, label: 'Comprehensive', sub: '20 Questions' },
                ].map((opt) => {
                  const isSelected = state.questionCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      onClick={() => dispatch({ type: 'SET_QUESTION_COUNT', payload: opt.count })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-apt-primary/20 border-apt-primary text-white shadow-md'
                          : 'bg-apt-surface-low border-apt-outline-dim text-apt-text-dim hover:text-apt-text hover:bg-apt-surface-high'
                      }`}
                    >
                      <span className="font-family-jetbrains text-2xl font-bold text-apt-text mb-1">
                        {opt.count}
                      </span>
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setting 3: Time Allocation */}
            <div className="bg-apt-surface-mid rounded-xl p-6 border border-apt-outline-dim space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-xl">timer</span>
                  <h2 className="text-lg font-bold text-apt-text">Timer & Constraints</h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-apt-surface-low text-amber-400">
                  {formatTime(state.timeLimit)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { seconds: 300, label: '5 Mins' },
                  { seconds: 600, label: '10 Mins' },
                  { seconds: 900, label: '15 Mins' },
                  { seconds: 1200, label: '20 Mins' },
                  { seconds: 0, label: 'Untimed' },
                ].map((t) => {
                  const isSelected = state.timeLimit === t.seconds;
                  return (
                    <button
                      key={t.seconds}
                      onClick={() => dispatch({ type: 'SET_TIME_LIMIT', payload: t.seconds })}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-apt-surface-low border-apt-outline-dim text-apt-text-dim hover:text-apt-text hover:bg-apt-surface-high'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Test Summary & Launch */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-apt-surface-mid rounded-xl p-6 border border-apt-outline-dim space-y-5">
              <h3 className="text-lg font-bold text-apt-text border-b border-apt-outline-dim pb-3">
                Drill Specification
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Domain:</span>
                  <span className="font-semibold text-apt-text">{topicObj.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Category:</span>
                  <span className="font-semibold text-apt-text">{categoryObj.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Difficulty:</span>
                  <span className="font-semibold text-apt-primary">{state.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Questions:</span>
                  <span className="font-family-jetbrains font-bold text-apt-text">{state.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Time Limit:</span>
                  <span className="font-semibold text-amber-400">{formatTime(state.timeLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-apt-text-dim">Negative Marking:</span>
                  <span className="font-semibold text-rose-400">-0.25 / wrong</span>
                </div>
              </div>

              <div className="pt-4 border-t border-apt-outline-dim space-y-3">
                <button
                  disabled={starting}
                  onClick={handleStartTest}
                  className="w-full flex items-center justify-center gap-2 bg-apt-primary-ctr text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {starting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Preparing Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">rocket_launch</span>
                      <span>Begin Assessment</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-apt-text-dim text-center leading-relaxed">
                  Questions are dynamically served from validated database and AI pools. Answers will be evaluated server-side.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
