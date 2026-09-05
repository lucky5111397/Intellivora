import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 dark:text-gray-500 text-lg">
          Loading Report...
        </p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  const totalQuestions = questionWiseScore.length;

  const averageScore =
    totalQuestions > 0
      ? (
        questionWiseScore.reduce((sum, q) => sum + (q.score || 0), 0) /
        totalQuestions
      ).toFixed(1)
      : 0;

  const highestScore =
    totalQuestions > 0
      ? Math.max(...questionWiseScore.map((q) => q.score || 0))
      : 0;

  const lowestScore =
    totalQuestions > 0
      ? Math.min(...questionWiseScore.map((q) => q.score || 0))
      : 0;

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  let recommendation = "";

  if (finalScore >= 8) {
    recommendation =
      "You are ready for real interviews. Continue practicing advanced questions and maintain your confidence.";
  } else if (finalScore >= 5) {
    recommendation =
      "You have a solid foundation. Improve communication and answer structure before attending interviews.";
  } else {
    recommendation =
      "Focus on improving technical knowledge, confidence, and structured communication before applying.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // ================= TITLE =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);

    doc.text(
      "Intellivora Interview Performance Report",
      pageWidth / 2,
      currentY,
      {
        align: "center",
      }
    );

    currentY += 5;

    // underline
    doc.setDrawColor(34, 197, 94);

    doc.line(
      margin,
      currentY + 2,
      pageWidth - margin,
      currentY + 2
    );

    currentY += 15;

    // ================= FINAL SCORE BOX =================
    doc.setFillColor(240, 253, 244);

    doc.roundedRect(
      margin,
      currentY,
      contentWidth,
      20,
      4,
      4,
      "F"
    );

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Final Score: ${score}/10`,
      pageWidth / 2,
      currentY + 12,
      {
        align: "center",
      }
    );

    currentY += 30;

    // ================= SKILLS BOX =================
    doc.setFillColor(249, 250, 251);

    doc.roundedRect(
      margin,
      currentY,
      contentWidth,
      30,
      4,
      4,
      "F"
    );

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ================= ADVICE =================
    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice =
        "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);

    doc.roundedRect(
      margin,
      currentY,
      contentWidth,
      35,
      4,
      4
    );

    doc.setFont("helvetica", "bold");
    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(
      advice,
      contentWidth - 20
    );

    doc.text(
      splitAdvice,
      margin + 10,
      currentY + 20
    );

    currentY += 50;

    // ================= QUESTION TABLE =================

    autoTable(doc, {
      startY: currentY,

      margin: {
        left: margin,
        right: margin,
      },

      head: [["#", "Question", "Score", "Feedback"]],

      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback,
      ]),

      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "top",
      },

      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        halign: "center",
      },

      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // index
        1: { cellWidth: 55 },                   // question
        2: { cellWidth: 20, halign: "center" }, // score
        3: { cellWidth: "auto" },               // feedback
      },

      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },

    });

    doc.save("Intellivora_Interview_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1220] to-[#111827]">
      <div className="mb-8 bg-[#111827] rounded-3xl shadow-lg p-6 sm:p-8">

        <div className="flex flex-col lg:flex-row justify-between gap-8">

          {/* Left */}
          <div className="flex items-start gap-5">

            <button
              onClick={() => navigate("/history")}
              className="mt-1 p-3 rounded-xl bg-gray-100 dark:bg-[#1f2937] hover:scale-105 transition"
            >
              <FaArrowLeft className="text-gray-700 dark:text-white" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                🧠 Intellivora AI
              </div>

              <h1 className="mt-4 text-4xl font-extrabold text-white">
                Interview Performance Report
              </h1>

              <p className="mt-2 text-slate-400">
                AI-powered evaluation with detailed analytics and personalized feedback.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">

                <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  Technical Interview
                </span>

                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                  Completed
                </span>

                <span className="px-4 py-2 rounded-full bg-violet-900/30 text-violet-300 text-sm font-medium">
                  Intellivora AI
                </span>

              </div>
            </div>

          </div>

          {/* Right */}
          <div className="grid grid-cols-2 gap-4 lg:w-[340px]">

            <div className="rounded-2xl bg-[#1f2937] p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Overall Score</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-500">
                {score}/10
              </h3>
            </div>

            <div className="rounded-2xl bg-[#1f2937] p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Questions</p>
              <h3 className="mt-2 text-3xl font-bold text-cyan-500">
                {totalQuestions}
              </h3>
            </div>

            <div className="rounded-2xl bg-[#1f2937] p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase">Average</p>
              <h3 className="mt-2 text-3xl font-bold text-yellow-500">
                {averageScore}
              </h3>
            </div>

            <button
              onClick={downloadPDF}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition text-white font-semibold"
            >
              ⬇ Download PDF
            </button>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className='space-y-6'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden bg-[#111827] rounded-3xl border border-[#243244] shadow-xl p-8 text-center">

            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl"></div>

            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-cyan-500/10 blur-3xl"></div>

            <h3 className="text-slate-400 mb-6 text-sm uppercase tracking-widest">
              Overall Score
            </h3>


            <div className="relative w-36 h-36 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: "#10b981",
                  trailColor: "#1f2937",
                  textColor: "#10b981",
                  strokeLinecap: "round",
                })}
              />
            </div>

            <div className="mt-6 space-y-3">

              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="font-semibold text-white">
                  Interview Readiness
                </span>
              </div>

              <h2 className="text-4xl font-extrabold text-emerald-500">
                {percentage.toFixed(0)}%
              </h2>

              <p className="text-slate-400">
                Ready for Technical Interviews
              </p>

            </div>

            <p className='text-gray-400 dark:text-gray-500 mt-3 text-xs sm:text-sm'>
              Out of 10
            </p>

            <div className="mt-5">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${score >= 8
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : score >= 5
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
              >
                {score >= 8
                  ? "🏆 Excellent Performance"
                  : score >= 5
                    ? "👍 Good Performance"
                    : "📘 Needs Improvement"}
              </span>
            </div>
            <div className="mt-4 flex justify-center">

              <span
                className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg ${score >= 8
                  ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"
                  : score >= 5
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                    : "bg-gradient-to-r from-slate-500 to-slate-700"
                  }`}
              >
                {score >= 8
                  ? "🚀 Top Performer"
                  : score >= 5
                    ? "👍 Good Progress"
                    : "📘 Keep Practicing"}
              </span>
            </div>

            <div className="mt-6">

              <h4 className="text-xl font-bold text-white">

                {performanceText}

              </h4>

              <p className="text-gray-500 mt-2 leading-relaxed">

                {shortTagline}

              </p>

            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-3 gap-3">

            <div className="rounded-xl bg-[#1f2937] p-3">

              <p className="text-xs text-gray-500">
                Rank
              </p>

              <h3 className="font-bold text-emerald-500">
                Top 15%
              </h3>

            </div>

            <div className="rounded-xl bg-[#1f2937] p-3">

              <p className="text-xs text-gray-500">
                Accuracy
              </p>

              <h3 className="font-bold text-cyan-500">
                {correctness * 10}%
              </h3>

            </div>

            <div className="rounded-xl bg-[#1f2937] p-3">

              <p className="text-xs text-gray-500">
                Confidence
              </p>

              <h3 className="font-bold text-yellow-500">
                {confidence * 10}%
              </h3>

            </div>

          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#111827] rounded-2xl shadow-lg p-5">
            <h3 className="text-lg font-bold text-white mb-6">
              Skill Evaluation
            </h3>
            <div className="space-y-3">{
              skills.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#1f2937] rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">

                    <span className="font-medium text-white">
                      {s.label}
                    </span>

                    <span className="text-emerald-500 font-bold">
                      {s.value}/10
                    </span>

                  </div>

                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.value * 10}%` }}
                    ></div>

                  </div>

                </div>
              ))}
            </div>

          </motion.div>


        </div>

        <div className='lg:col-span-2 space-y-6'>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#111827] rounded-3xl border border-[#243244] shadow-xl p-6 sm:p-8"
          >

            <h3 className="text-xl font-bold text-white mb-6">
              Performance Trend Analysis
            </h3>

            <div className="h-80">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>

                  <CartesianGrid
                    stroke="#374151"
                    strokeDasharray="4 4"
                    opacity={0.3}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#6ee7b7"
                    fillOpacity={0.25}
                    strokeWidth={4}
                  />

                </AreaChart>
              </ResponsiveContainer>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >

            <div className="bg-[#111827] rounded-2xl border border-[#243244]shadow-lg p-5">
              <p className="text-sm text-gray-500">Questions</p>
              <h2 className="text-3xl font-bold text-emerald-500 mt-2">
                {totalQuestions}
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Total Questions
              </p>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-[#243244] p-5">
              <p className="text-sm text-gray-500">Average</p>
              <h2 className="text-3xl font-bold text-cyan-500 mt-2">
                {averageScore}
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Average Score
              </p>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-[#243244] shadow-lg p-5">
              <p className="text-sm text-gray-500">Highest</p>
              <h2 className="text-3xl font-bold text-green-500 mt-2">
                {highestScore}
              </h2>
              <p className="text-xs text-green-400 mt-2">
                Best Performance
              </p>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-[#243244] shadow-lg p-5">
              <p className="text-sm text-gray-500">Lowest</p>
              <h2 className="text-3xl font-bold text-red-500 mt-2">
                {lowestScore}
              </h2>
              <p className="text-xs text-red-400 mt-2">
                Needs Improvement
              </p>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=" rounded-3xl border border-[#243244] shadow-xl p-6"
          >

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl">
                🤖
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  AI Recommendation
                </h2>

                <p className="text-sm text-gray-500">
                  Personalized interview guidance
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 bg-[#111827] border border-[#243244]"
            >
              <div className="grid md:grid-cols-2 gap-5">

                {/* Strengths */}
                <div className="rounded-2xl bg-[#161f2e] border border-emerald-600/40 p-5">
                  <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    ✅ Strengths
                  </h4>

                  <ul className="space-y-3 text-slate-300">
                    <li>• Clear communication</li>
                    <li>• Structured answers</li>
                    <li>• Good confidence</li>
                  </ul>
                </div>

                {/* Areas */}
                <div className="rounded-2xl bg-[#161f2e] border border-yellow-600/40 p-5">
                  <h4 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    ⚠ Areas to Improve
                  </h4>

                  <ul className="space-y-3 text-slate-300">
                    <li>• Explain edge cases</li>
                    <li>• Add practical examples</li>
                    <li>• Improve answer depth</li>
                  </ul>
                </div>

                {/* Next Goal */}
                <div className="rounded-2xl bg-[#161f2e] border border-blue-600/40 p-5">
                  <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                    🎯 Next Goal
                  </h4>

                  <p className="text-slate-300 leading-7">
                    Practice 5 more technical mock interviews and improve consistency.
                  </p>
                </div>

                {/* Recommendation */}
                <div className="rounded-2xl bg-[#161f2e] border border-purple-600/40 p-5">
                  <h4 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                    📚 AI Recommendation
                  </h4>

                  <p className="text-slate-300 leading-7">
                    {recommendation}
                  </p>
                </div>

              </div>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#111827] rounded-3xl border border-[#243244] shadow-xl p-6 sm:p-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-6">
              {questionWiseScore.map((q, i) => (
                <div
                  key={i}
                  className="group bg-[#1f2937] p-6 rounded-3xl border border-[#2a3447] hover:border-emerald-500/40 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">

                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>

                        <span className="text-xs uppercase tracking-wider text-slate-400">
                          Question {i + 1}
                        </span>
                      </div>

                      <p className="font-semibold text-white text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold
  ${q.score >= 8
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : q.score >= 5
                            ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                    >
                      ⭐
                      <span>{q.score ?? 0}/10</span>
                    </div>

                  </div>

                  <div className="mt-5 rounded-2xl bg-[#161f2e] border border-[#243244] p-5">

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🤖</span>

                      <h4 className="font-semibold text-emerald-400">
                        AI Feedback
                      </h4>
                    </div>

                    <p className="text-slate-300 leading-7">
                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}

export default Step3Report;