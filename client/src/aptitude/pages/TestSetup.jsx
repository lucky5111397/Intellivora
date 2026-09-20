import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById, categoriesData } from '../data/topicsData';
import {
  Home,
  SlidersHorizontal,
  ListOrdered,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  X,
  Building2,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

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
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Breadcrumb Rail */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
            <Link to="/" className="hover:text-[#F1F5F9] transition-colors flex items-center gap-1">
              <Home size={14} />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link to="/aptitude" className="hover:text-[#F1F5F9] transition-colors">
              Aptitude Hub
            </Link>
            <span>/</span>
            <Link to="/aptitude/topics" className="hover:text-[#F1F5F9] transition-colors">
              {categoryObj.name}
            </Link>
            <span>/</span>
            <span className="text-[#38BDF8] font-semibold">{topicObj.name} Setup</span>
          </nav>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/aptitude/topics')}
          >
            Change Topic
          </Button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-[#280B0B] border border-[#B91C1C]/40 rounded-xl p-4 flex items-start gap-3 text-[#F87171]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">Test Initialization Error</h4>
              <p className="text-xs text-[#F87171]/90 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-[#F87171] hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* 2. Topic Header Card */}
        <div className="bg-[#0E131F] rounded-2xl p-6 sm:p-8 border border-[#1E2B45]">
          <div className="flex items-center justify-between gap-4 mb-3">
            <Badge variant="brand" size="sm">
              {categoryObj.name}
            </Badge>
            <span className="text-xs font-mono text-[#64748B]">
              Verified Psychometric Diagnostic
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight mb-2">
            {topicObj.name}
          </h1>
          <p className="text-[#94A3B8] max-w-2xl text-xs sm:text-sm leading-relaxed">
            {topicObj.description}
          </p>
        </div>

        {/* 3. Setup Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Setting 1: Difficulty Level */}
            <div className="bg-[#0E131F] rounded-xl p-6 border border-[#1E2B45] space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#38BDF8]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#F1F5F9]">
                  Difficulty Calibration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Easy', desc: 'Core formulas, single-step arithmetic, and fundamentals.' },
                  { id: 'Medium', desc: 'Standard placement benchmarks and multi-step reasoning.' },
                  { id: 'Hard', desc: 'Complex problem solving, intricate edge cases, and time traps.' },
                  { id: 'Adaptive', desc: 'Dynamically balanced mix across all difficulty tiers.' },
                ].map((diff) => {
                  const isSelected = state.difficulty === diff.id;
                  return (
                    <div
                      key={diff.id}
                      onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: diff.id })}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-[#0D1E3A] border-[#2563EB] text-[#93C5FD] ring-1 ring-[#2563EB]/40'
                          : 'bg-[#0A0D14] border-[#161F33] hover:border-[#2D3E63] text-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#F1F5F9]">{diff.id}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#2D3E63]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed">{diff.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Setting 2: Question Load */}
            <div className="bg-[#0E131F] rounded-xl p-6 border border-[#1E2B45] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListOrdered size={16} className="text-[#38BDF8]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#F1F5F9]">
                    Question Load
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-[#38BDF8] tabular-nums">
                  {state.questionCount} Questions Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 5, label: 'Sprint Drill', sub: '5 Questions' },
                  { count: 10, label: 'Standard Set', sub: '10 Questions' },
                  { count: 15, label: 'Deep Practice', sub: '15 Questions' },
                  { count: 20, label: 'Full Mock', sub: '20 Questions' },
                ].map((opt) => {
                  const isSelected = state.questionCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      onClick={() => dispatch({ type: 'SET_QUESTION_COUNT', payload: opt.count })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D1E3A] border-[#2563EB] text-[#93C5FD]'
                          : 'bg-[#0A0D14] border-[#161F33] text-[#94A3B8] hover:border-[#2D3E63]'
                      }`}
                    >
                      <span className="font-mono text-2xl font-bold text-[#F1F5F9] mb-1 tabular-nums">
                        {opt.count}
                      </span>
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setting 3: Time Allocation */}
            <div className="bg-[#0E131F] rounded-xl p-6 border border-[#1E2B45] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#F59E0B]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#F1F5F9]">
                    Timer & Constraints
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-[#FBBF24] tabular-nums">
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
                          ? 'bg-[#271A04] border-[#F59E0B] text-[#FBBF24]'
                          : 'bg-[#0A0D14] border-[#161F33] text-[#94A3B8] hover:border-[#2D3E63]'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Test Summary & Launch Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0E131F] rounded-xl p-6 border border-[#1E2B45] space-y-6 lg:sticky lg:top-24 shadow-xl">
              <div>
                <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                  Assessment Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#161F33]">
                    <span className="text-[#94A3B8]">Domain Category</span>
                    <span className="font-semibold text-[#F1F5F9]">{categoryObj.name}</span>
                  </div>
                  {state.targetCompany && (
                    <div className="flex justify-between py-2 border-b border-[#161F33]">
                      <span className="text-[#94A3B8] flex items-center gap-1.5">
                        <Building2 size={13} className="text-[#38BDF8]" />
                        <span>Target Company</span>
                      </span>
                      <span className="font-semibold text-[#38BDF8]">{state.targetCompany}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[#161F33]">
                    <span className="text-[#94A3B8]">Calibrated Tier</span>
                    <span className="font-semibold text-[#38BDF8]">{state.difficulty || 'Medium'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#161F33]">
                    <span className="text-[#94A3B8]">Question Load</span>
                    <span className="font-mono font-semibold text-[#F1F5F9] tabular-nums">
                      {state.questionCount} Questions
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#161F33]">
                    <span className="text-[#94A3B8]">Time Constraint</span>
                    <span className="font-mono font-semibold text-[#FBBF24] tabular-nums">
                      {formatTime(state.timeLimit)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={starting}
                rightIcon={ArrowRight}
                onClick={handleStartTest}
              >
                Launch Assessment
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
