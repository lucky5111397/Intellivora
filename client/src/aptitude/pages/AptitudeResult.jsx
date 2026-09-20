import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById } from '../data/topicsData';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  RotateCcw,
} from 'lucide-react';
import { Badge, Skeleton, ErrorState } from '@/components/ui';
import {
  ResultHeader,
  ScoreSummary,
  MetricGrid,
  ResultActions,
  ReportDownload,
} from '@/components/results';
import { generateAptitudeReportPdf } from '@/utils/pdfReportGenerator';

export default function AptitudeResult() {
  const { state, fetchResult, resetTest } = useAptitude();
  const navigate = useNavigate();
  const { attemptId: paramAttemptId } = useParams();
  const { userData } = useSelector((state) => state.user);

  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadResult = async () => {
      const targetId = paramAttemptId || state.result?.attemptId || state.attemptId;
      if (!targetId) {
        navigate('/aptitude');
        return;
      }

      if (state.result && (String(state.result.attemptId) === String(targetId) || String(state.result._id) === String(targetId))) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);
      try {
        const fetched = await fetchResult(targetId);
        if (!fetched && mounted && !state.result) {
          setFetchError(state.error || 'Unable to retrieve test results.');
        }
      } catch (err) {
        console.error('[AptitudeResult] Error fetching result:', err);
        if (mounted) {
          setFetchError(err.response?.data?.message || err.message || 'Unable to retrieve test results.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();
    return () => { mounted = false; };
  }, [paramAttemptId]);

  const result = state.result;

  const topicName = useMemo(() => {
    if (!result) return 'Aptitude Assessment';
    return findTopicById(result.topic)?.name || result.topic || 'Assessment';
  }, [result]);

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleRetake = () => {
    const topicToRetake = result?.topic || state.selectedTopic;
    resetTest(topicToRetake);
    navigate('/aptitude/setup');
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    return generateAptitudeReportPdf({
      result: {
        ...result,
        correctCount: result.correct ?? result.correctCount ?? 0,
        incorrectCount: result.incorrect ?? result.incorrectCount ?? 0,
        unansweredCount: result.skipped ?? result.unansweredCount ?? 0,
      },
      topicName,
      candidateName: userData?.name || 'Candidate',
      candidateEmail: userData?.email || 'candidate@intellivora.app',
      date: result.submittedAt ? new Date(result.submittedAt) : undefined,
    });
  };

  const filteredQuestions = useMemo(() => {
    if (!result?.questions) return [];
    if (filter === 'All') return result.questions;
    return result.questions.filter((q) => q.result?.toLowerCase() === filter.toLowerCase());
  }, [result, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-24">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 flex-1">
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton variant="title" className="w-64 h-8" />
              <Skeleton variant="text" className="w-48 h-4" />
            </div>
            <div className="flex gap-3">
              <Skeleton variant="button" className="w-28 h-9" />
              <Skeleton variant="button" className="w-32 h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl space-y-2">
                <Skeleton variant="text" className="w-20 h-3" />
                <Skeleton variant="title" className="w-16 h-7" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (fetchError || !result) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Result Unavailable"
            description={fetchError || "The requested aptitude test result could not be found or has expired."}
            onRetry={() => navigate('/aptitude')}
          />
        </div>
      </div>
    );
  }

  const accuracyVal = Number(result.accuracy || 0);
  const correctVal = result.correct ?? result.correctCount ?? 0;
  const incorrectVal = result.incorrect ?? result.incorrectCount ?? 0;
  const skippedVal = result.skipped ?? result.unansweredCount ?? 0;
  const totalMarks = result.totalMarks || 10;
  const scoreVal = Number(result.score || 0).toFixed(2);

  const tierName = accuracyVal >= 80
    ? 'Exemplary Analytical Speed'
    : accuracyVal >= 50
    ? 'Satisfactory Analytical Baseline'
    : 'Needs Systematic Revision';

  const tierDesc = `Completed ${totalMarks} marks in ${formatTime(result.timeTakenSeconds)} with standard marking (+1 / -0.25).`;

  const metricCards = [
    {
      label: 'Accuracy Rate',
      value: `${accuracyVal.toFixed(1)}%`,
      icon: Target,
      percentage: Math.min(100, Math.max(0, accuracyVal)),
      subtext: `${correctVal + incorrectVal} answered · ${skippedVal} skipped`,
    },
    {
      label: 'Correct Answers',
      value: correctVal,
      icon: CheckCircle2,
      max: result.questions?.length || 10,
      subtext: `+${correctVal} points earned`,
    },
    {
      label: 'Incorrect Answers',
      value: incorrectVal,
      icon: XCircle,
      max: result.questions?.length || 10,
      subtext: `-${(incorrectVal * 0.25).toFixed(2)} negative penalty`,
    },
    {
      label: 'Time Consumed',
      value: formatTime(result.timeTakenSeconds),
      icon: Clock,
      subtext: `Avg ${result.questions?.length ? Math.round(result.timeTakenSeconds / result.questions.length) : 0}s / item`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Standardized Result Header */}
        <ResultHeader
          badge="APTITUDE SCORECARD"
          badgeVariant="brand"
          title="Performance Diagnostics"
          subtitle={`${topicName} assessment finished in ${formatTime(result.timeTakenSeconds)}. Full item breakdown and solution derivation below.`}
          roleOrTopic={topicName}
          difficulty={result.difficulty || "Medium"}
          targetCompany={result.targetCompany}
          backTo="/aptitude"
          backLabel="Back to Aptitude Hub"
          date={result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : undefined}
          extraActions={
            <ReportDownload
              onDownload={handleDownloadPDF}
              label="Download PDF"
              size="sm"
            />
          }
        />

        {/* 2. Prominent Score Summary */}
        <ScoreSummary
          score={scoreVal}
          maxScore={totalMarks}
          scoreLabel="Candidate Net Score"
          tier={tierName}
          tierDescription={tierDesc}
          progressPercentage={Math.round(accuracyVal)}
        />

        {/* 3. 4 Core Metrics Cards */}
        <MetricGrid metrics={metricCards} columns={4} />

        {/* 4. Detailed Question Review Feed */}
        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#161F33]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F1F5F9]">
                Detailed Question Diagnostics
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Examine individual candidate selections, correct answers, and mathematical derivations.
              </p>
            </div>

            <div className="flex gap-1 bg-[#0E131F] border border-[#161F33] p-1 rounded-lg">
              {['All', 'Correct', 'Incorrect', 'Skipped'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    filter === opt
                      ? 'bg-[#141B2D] text-[#F1F5F9] border border-[#2D3E63]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isCorrect = q.result === 'correct';
              const isIncorrect = q.result === 'incorrect';

              return (
                <article
                  key={q.questionNumber}
                  className="bg-[#0E131F] border border-[#161F33] rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-[#062319] text-[#34D399] border border-[#047857]/40'
                          : isIncorrect
                          ? 'bg-[#280B0B] text-[#F87171] border border-[#B91C1C]/40'
                          : 'bg-[#141B2D] text-[#64748B] border border-[#2D3E63]'
                      }`}
                    >
                      {q.questionNumber}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={isCorrect ? 'success' : isIncorrect ? 'error' : 'default'}
                          size="sm"
                        >
                          {q.result}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium text-[#F1F5F9] leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt) => {
                          const optKey = typeof opt === 'object' ? opt.key : '';
                          const optText = typeof opt === 'object' ? opt.text : opt;
                          const isUserChoice = q.selectedAnswer === optKey;
                          const isCorrectChoice = q.correctAnswer === optKey;

                          let optStyle = 'border-[#161F33] bg-[#0A0D14] text-[#94A3B8]';
                          if (isCorrectChoice) {
                            optStyle = 'border-[#047857] bg-[#062319] text-[#34D399] font-semibold';
                          } else if (isUserChoice && !isCorrectChoice) {
                            optStyle = 'border-[#B91C1C] bg-[#280B0B] text-[#F87171] font-semibold';
                          }

                          return (
                            <div
                              key={optKey || optText}
                              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${optStyle}`}
                            >
                              <span className="w-5 h-5 rounded font-mono font-bold text-[11px] bg-[#06080B] flex items-center justify-center shrink-0">
                                {optKey}
                              </span>
                              <span className="truncate">{optText}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mathematical / Conceptual Explanation */}
                      {q.explanation && (
                        <div className="mt-3 pt-3 border-t border-[#161F33] bg-[#0A0D14] p-3.5 rounded-lg text-xs text-[#94A3B8] leading-relaxed">
                          <span className="font-bold text-[#F1F5F9] block mb-1">
                            Derivation & Solution Key:
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* 5. Standardized Result Action Bar */}
        <ResultActions
          primaryLabel="Retake Drill"
          primaryIcon={RotateCcw}
          onPrimary={handleRetake}
          secondaryLabel="Aptitude Hub"
          onSecondary={() => navigate('/aptitude')}
          tertiaryLabel="Back to History"
          onTertiary={() => navigate('/history')}
        />
      </main>
    </div>
  );
}
