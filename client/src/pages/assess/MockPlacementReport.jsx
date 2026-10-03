import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import { getPlacementReport } from "../../services/placementApi.js";

export default function MockPlacementReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const res = await getPlacementReport(id);
        if (res?.success && res.data) {
          setReport(res.data);
        }
      } catch (err) {
        console.error("Failed to load placement report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Report not found</h2>
        <Link to="/assess/placement" className="text-cyan-400 hover:underline text-sm">
          Return to Placement Setup
        </Link>
      </div>
    );
  }

  const summary = report.sessionSummary || {};
  const feedback = report.feedbackReport || {};
  const breakdown = feedback.roundBreakdown || {};
  const composite = summary.compositeScore || 0;
  const isHired = summary.overallStatus === "hired";

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          to="/assess/placement"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Start Another Placement Drive
        </Link>

        {/* Hero Scorecard */}
        <div className="bg-[#0D121D] rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Final Placement Scorecard
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-xl ${
              isHired
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500 bg-amber-500/10 text-amber-400"
            }`}>
              <span className="text-4xl font-extrabold tracking-tight">{composite}%</span>
              <span className="text-xs font-medium text-slate-300">Composite</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mt-4">
              Hiring Verdict: {feedback.hiringDecision || (isHired ? "Strong Hire" : "Needs Revision")}
            </h2>
            <p className="text-slate-400 text-sm max-w-md mt-1">
              Target Enterprise: <span className="text-white font-semibold">{summary.targetCompany}</span> &bull; {summary.targetRole}
            </p>
          </div>

          {/* 4 Rounds Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Aptitude (20%)</span>
              <span className="text-lg font-extrabold text-white">{breakdown.aptitude || 0}%</span>
            </div>
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Coding (35%)</span>
              <span className="text-lg font-extrabold text-cyan-400">{breakdown.coding || 0}%</span>
            </div>
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">GD Round (20%)</span>
              <span className="text-lg font-extrabold text-indigo-400">{breakdown.gd || 0}%</span>
            </div>
            <div className="bg-[#06080B] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Interview (25%)</span>
              <span className="text-lg font-extrabold text-emerald-400">{breakdown.interview || 0}%</span>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D121D] rounded-2xl border border-emerald-500/30 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Evaluated Strengths
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {(feedback.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0D121D] rounded-2xl border border-amber-500/30 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Growth Recommendations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {(feedback.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
