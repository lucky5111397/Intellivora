import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAptitude } from '../context/aptitudeContext';
import { findTopicById } from '../data/topicsData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AptitudeResult() {
  const { state, fetchResult, resetTest } = useAptitude();
  const navigate = useNavigate();
  const { attemptId: paramAttemptId } = useParams();

  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadResult = async () => {
      const targetId = paramAttemptId || state.result?.attemptId || state.attemptId;
      if (!targetId) {
        navigate('/aptitude');
        return;
      }

      // If this exact attempt is already active in state, no need to refetch
      if (state.result && (String(state.result.attemptId) === String(targetId) || String(state.result._id) === String(targetId))) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await fetchResult(targetId);
      } catch (err) {
        console.error('[AptitudeResult] Error fetching result:', err);
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

  // Generate and download verified PDF report using jsPDF + autoTable
  const handleDownloadPDF = () => {
    if (!result) return;
    setDownloadingPdf(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let currentY = 20;

      // Header Banner
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, pageWidth, 38, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241); // indigo
      doc.text('Intellivora', margin, 18);

      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('AI-Powered Aptitude & Performance Assessment Report', margin, 26);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      const dateStr = result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : new Date().toLocaleDateString();
      doc.text(`Date: ${dateStr}`, pageWidth - margin - 35, 26);

      currentY = 48;

      // Test Overview Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text(`${topicName} (${result.category?.toUpperCase() || 'APTITUDE'})`, margin, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Difficulty: ${result.difficulty || 'Standard'} | Attempt ID: ${result.attemptId}`, margin, currentY);

      currentY += 10;

      // Summary Metrics Table
      autoTable(doc, {
        startY: currentY,
        head: [['Score', 'Total Marks', 'Accuracy', 'Correct', 'Incorrect', 'Skipped', 'Time Taken']],
        body: [[
          `${result.score} / ${result.totalMarks}`,
          `${result.totalMarks}`,
          `${result.accuracy}%`,
          `${result.correct}`,
          `${result.incorrect}`,
          `${result.skipped}`,
          formatTime(result.timeTakenSeconds),
        ]],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontStyle: 'bold', textColor: [17, 24, 39], halign: 'center' },
        styles: { fontSize: 10, cellPadding: 4 },
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // Question Review Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('Question-Wise Performance Review', margin, currentY);

      currentY += 4;

      const questionRows = (result.questions || []).map((q) => [
        `Q${q.questionNumber}`,
        q.question,
        q.selectedAnswer ? `(${q.selectedAnswer})` : 'Skipped',
        `(${q.correctAnswer})`,
        q.result?.toUpperCase() || 'SKIPPED',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['#', 'Question Statement', 'Your Choice', 'Correct Key', 'Result']],
        body: questionRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 105 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = data.cell.raw;
            if (val === 'CORRECT') data.cell.styles.textColor = [16, 185, 129];
            else if (val === 'INCORRECT') data.cell.styles.textColor = [239, 68, 68];
            else data.cell.styles.textColor = [156, 163, 175];
          }
        },
      });

      // Save PDF file
      const cleanName = topicName.replace(/\s+/g, '_');
      doc.save(`Intellivora_Aptitude_${cleanName}_Result.pdf`);
    } catch (err) {
      console.error('[PDF Generation Error]:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apt-bg flex flex-col items-center justify-center text-apt-text">
        <div className="w-10 h-10 border-4 border-apt-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-apt-text-dim">Retrieving verified assessment evaluation...</p>
      </div>
    );
  }

  if (!result) return null;
  if (!result) {
    return (
      <div className="min-h-screen bg-apt-bg flex flex-col items-center justify-center p-6 text-apt-text">
        <div className="bg-apt-surface-mid max-w-md w-full p-8 rounded-2xl border border-apt-outline-dim text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-apt-error/10 border border-apt-error/20 flex items-center justify-center text-apt-error">
            <span className="material-symbols-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="text-xl font-bold text-apt-text">Assessment Result Not Found</h2>
          <p className="text-sm text-apt-text-dim">
            The requested assessment attempt could not be retrieved. It may have expired or been removed.
          </p>
          <button
            onClick={() => navigate('/aptitude')}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-apt-primary-ctr text-white text-sm font-semibold hover:bg-opacity-90 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Aptitude Hub
          </button>
        </div>
      </div>
    );
  }

  const filteredQuestions = (result.questions || []).filter((q) => {
    if (filter === 'All') return true;
    return q.result?.toUpperCase() === filter.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-apt-bg text-apt-text font-family-jakarta p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <main className="max-w-7xl mx-auto space-y-8">

        {/* 1. Breadcrumb Rail & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-apt-text-dim">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/aptitude')} className="hover:text-apt-text cursor-pointer">
              Aptitude
            </button>
            <span>/</span>
            <span>{topicName}</span>
            <span>/</span>
            <span className="text-apt-text font-semibold">Test Evaluation</span>
          </div>

          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-semibold self-start md:self-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Server-Authoritative Evaluation</span>
          </span>
        </div>

        {/* 2. Header & Action Buttons */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-apt-surface-low border border-apt-outline-dim rounded text-xs uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-apt-primary" />
              Verified Performance Breakdown
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Performance Analysis
            </h1>
            <p className="text-apt-text-dim text-base">
              {topicName} assessment completed in {formatTime(result.timeTakenSeconds)}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/aptitude')}
              className="flex items-center gap-2 px-4 py-2.5 bg-apt-surface-low hover:bg-apt-surface-mid border border-apt-outline rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Hub</span>
            </button>

            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-4 py-2.5 bg-apt-surface-high hover:bg-apt-surface-top border border-apt-outline rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-lg">replay</span>
              <span>Retake Drill</span>
            </button>

            <button
              disabled={downloadingPdf}
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-apt-primary-ctr text-white rounded-xl text-sm font-bold shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span>{downloadingPdf ? 'Preparing PDF...' : 'Download Result PDF'}</span>
            </button>
          </div>
        </section>

        {/* 3. Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Candidate Score */}
          <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-5 flex flex-col justify-between">
            <div className="text-sm text-apt-text-dim font-medium mb-3">Candidate Score</div>
            <div className="text-4xl sm:text-5xl font-bold font-family-jetbrains text-apt-text">
              {Number(result.score || 0).toFixed(2)}
              <span className="text-lg text-apt-text-dim font-sans font-normal ml-1">
                / {result.totalMarks}
              </span>
            </div>
            <div className="mt-3 text-xs text-apt-text-dim">
              Calculated using standard +1 / -0.25 scoring
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-5 flex flex-col justify-between">
            <div className="text-sm text-apt-text-dim font-medium mb-3">Accuracy Rate</div>
            <div className="text-4xl sm:text-5xl font-bold font-family-jetbrains text-emerald-400">
              {Number(result.accuracy || 0).toFixed(1)}%
            </div>
            <div className="mt-3 text-xs text-apt-text-dim">
              Based on {result.correct + result.incorrect} answered questions
            </div>
          </div>

          {/* Question Matrix */}
          <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-5 flex flex-col justify-between">
            <div className="text-sm text-apt-text-dim font-medium mb-3">Response Matrix</div>
            <div className="flex gap-6 font-family-jetbrains">
              <div>
                <b className="text-emerald-400 text-2xl">{result.correct}</b>
                <span className="block text-xs text-apt-text-dim font-sans">Correct</span>
              </div>
              <div>
                <b className="text-rose-400 text-2xl">{result.incorrect}</b>
                <span className="block text-xs text-apt-text-dim font-sans">Incorrect</span>
              </div>
              <div>
                <b className="text-apt-text-dim text-2xl">{result.skipped}</b>
                <span className="block text-xs text-apt-text-dim font-sans">Skipped</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-apt-text-dim">
              Total {result.questions?.length || 0} questions evaluated
            </div>
          </div>

          {/* Time Taken */}
          <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-5 flex flex-col justify-between">
            <div className="text-sm text-apt-text-dim font-medium mb-3">Time Consumed</div>
            <div className="text-4xl sm:text-5xl font-bold font-family-jetbrains text-amber-400">
              {formatTime(result.timeTakenSeconds)}
            </div>
            <div className="mt-3 text-xs text-apt-text-dim">
              Avg {result.questions?.length ? Math.round(result.timeTakenSeconds / result.questions.length) : 0}s per question
            </div>
          </div>
        </section>

        {/* 4. Question Review & Diagnostics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Questions Review (Left: 8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-apt-outline-dim pb-4">
              <h2 className="text-xl font-bold">Detailed Question Review</h2>
              <div className="flex gap-1.5">
                {['All', 'Correct', 'Incorrect', 'Skipped'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      filter === opt
                        ? 'bg-apt-primary-ctr text-white'
                        : 'bg-apt-surface-low text-apt-text-dim hover:text-apt-text'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {filteredQuestions.map((q) => {
                const isCorrect = q.result === 'correct';
                const isIncorrect = q.result === 'incorrect';

                return (
                  <article
                    key={q.questionNumber}
                    className="bg-apt-surface-mid border border-apt-outline-dim rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isIncorrect
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-apt-surface-low text-apt-text-dim'
                      }`}>
                        Q{q.questionNumber}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isIncorrect
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-apt-surface-low text-apt-text-dim'
                          }`}>
                            {q.result}
                          </span>
                        </div>

                        <p className="text-base text-apt-text leading-relaxed font-medium">
                          {q.question}
                        </p>

                        {/* Options display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options?.map((opt) => {
                            const optKey = typeof opt === 'object' ? opt.key : '';
                            const optText = typeof opt === 'object' ? opt.text : opt;
                            const isUserChoice = q.selectedAnswer === optKey;
                            const isCorrectChoice = q.correctAnswer === optKey;

                            let optBorder = 'border-apt-outline-dim bg-apt-surface-low text-apt-text-dim';
                            if (isCorrectChoice) {
                              optBorder = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold';
                            } else if (isUserChoice && !isCorrectChoice) {
                              optBorder = 'border-rose-500/60 bg-rose-500/10 text-rose-300 font-semibold';
                            }

                            return (
                              <div
                                key={optKey || optText}
                                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${optBorder}`}
                              >
                                <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-apt-surface-mid shrink-0">
                                  {optKey}
                                </span>
                                <span className="truncate">{optText}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="pt-3 border-t border-apt-outline-dim/40 text-xs text-apt-text-dim leading-relaxed bg-apt-surface-low p-3 rounded-lg">
                            <span className="font-bold text-apt-text block mb-1">Explanation:</span>
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

          {/* Diagnostics & Strengths (Right: 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-6 space-y-4">
              <h3 className="text-base font-bold text-apt-text flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">verified</span>
                <span>Diagnostic Strengths</span>
              </h3>
              <ul className="space-y-2">
                {(result.strengths || ['Good attempt precision']).map((item, i) => (
                  <li key={i} className="text-xs text-apt-text-dim flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-6 space-y-4">
              <h3 className="text-base font-bold text-apt-text flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">warning</span>
                <span>Areas for Growth</span>
              </h3>
              <ul className="space-y-2">
                {(result.weaknesses || ['Practice with timed drills']).map((item, i) => (
                  <li key={i} className="text-xs text-apt-text-dim flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-apt-surface-mid rounded-xl border border-apt-outline-dim p-6 space-y-3 text-xs text-apt-text-dim">
              <div className="font-bold text-apt-text text-sm">Attempt Metadata</div>
              <div className="flex justify-between">
                <span>Attempt ID:</span>
                <span className="font-family-jetbrains truncate max-w-[160px]">{result.attemptId}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span>{result.submittedAt ? new Date(result.submittedAt).toLocaleTimeString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="uppercase font-bold text-emerald-400">{result.status}</span>
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
