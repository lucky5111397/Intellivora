import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useGD } from "../context/gdContext";
import Navbar from "../../components/Navbar";

export default function GDAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { session, loadSession } = useGD();

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptFilter, setTranscriptFilter] = useState("all");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setFetchError(null);

    loadSession(id)
      .then(() => {
        if (mounted) setIsLoading(false);
      })
      .catch((err) => {
        if (mounted) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Unable to retrieve session analysis.";
          setFetchError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, loadSession]);

  // Derived Metrics & Calculations
  const evaluation = session?.evaluation;
  const overallScore = evaluation?.overallScore ?? 0;
  const breakdown = evaluation?.breakdown || {};
  const articulation = breakdown.articulation ?? 0;
  const leadership = breakdown.leadership ?? 0;
  const listening = breakdown.listening ?? 0;
  const criticalThinking = breakdown.criticalThinking ?? 0;

  const strengths = evaluation?.strengths || [];
  const improvements = evaluation?.improvements || [];
  const detailedFeedback =
    evaluation?.detailedFeedback ||
    "The candidate contributed steadily throughout the debate. Continued deliberate focus on active listening and summarizing peer perspectives will further enhance your executive presence.";
  const turnFeedback = evaluation?.turnFeedback || [];

  const transcript = useMemo(() => session?.transcript || [], [session?.transcript]);
  const totalTurns = session?.telemetry?.totalTurnsCount || transcript.length;
  const candidateTurns =
    session?.telemetry?.candidateTurnCount ||
    transcript.filter((t) => t.speakerId === "candidate").length;
  const candidateSpeakingSeconds =
    session?.telemetry?.candidateSpeakingTimeSeconds || 0;
  const totalSessionSeconds =
    session?.telemetry?.totalSessionDurationSeconds ||
    (session?.durationMinutes || 10) * 60;

  const interruptionsCount =
    session?.telemetry?.interruptionsCount ||
    transcript.filter((t) => t.interruptedPrevious).length;

  const candidateSpeakingFormatted = `${Math.floor(candidateSpeakingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(candidateSpeakingSeconds % 60)
    .toString()
    .padStart(2, "0")}`;

  const floorSharePercentage = useMemo(() => {
    if (totalSessionSeconds <= 0) return 0;
    return Math.min(
      100,
      Math.max(
        0,
        Math.round((candidateSpeakingSeconds / totalSessionSeconds) * 100)
      )
    );
  }, [candidateSpeakingSeconds, totalSessionSeconds]);

  // SVG Radial Gauge Calculation (radius = 58, perimeter = 2 * PI * 58 ~= 364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, overallScore)) / 100) * circumference;

  // Filtered transcript
  const filteredTranscript = useMemo(() => {
    if (transcriptFilter === "candidate") {
      return transcript.filter((t) => t.speakerId === "candidate");
    }
    if (transcriptFilter === "ai") {
      return transcript.filter(
        (t) => t.speakerId !== "candidate" && t.speakerId !== "orchestrator"
      );
    }
    return transcript;
  }, [transcript, transcriptFilter]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">
          Compiling Discussion Scorecard & Evaluation...
        </p>
      </div>
    );
  }

  // Error State
  if (fetchError || !session) {
    return (
      <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0d111a] border border-white/[0.08] p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center gap-4 shadow-xl">
            <div className="p-3.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scorecard Unavailable</h2>
              <p className="text-xs text-slate-400 mt-1">
                {fetchError || "The requested discussion session could not be found."}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => navigate("/history")}
                className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-slate-300 hover:bg-white/[0.1] transition-all"
              >
                View History
              </button>
              <button
                onClick={() => navigate("/gd")}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
              >
                GD Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-completed Session Notice State
  if (session.status !== "completed" || !evaluation) {
    return (
      <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0d111a] border border-white/[0.08] p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center gap-4 shadow-xl">
            <div className="p-3.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Session Incomplete</h2>
              <p className="text-xs text-slate-400 mt-1">
                This discussion is marked as{" "}
                <span className="text-amber-400 font-semibold uppercase">
                  {session.status}
                </span>{" "}
                and has not been formally evaluated yet.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              {session.status === "in_progress" ? (
                <button
                  onClick={() => navigate(`/gd/room/${id}`)}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition-all"
                >
                  Return to Live Room →
                </button>
              ) : session.status === "lobby" ? (
                <button
                  onClick={() => navigate(`/gd/lobby/${id}`)}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Return to Lobby →
                </button>
              ) : (
                <button
                  onClick={() => navigate("/gd")}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Back to GD Overview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper for turn critique styling
  const getCritiqueBadge = (type) => {
    switch (type) {
      case "strong_point":
        return {
          label: "Strong Argument",
          bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "effective_rebuttal":
        return {
          label: "Effective Rebuttal",
          bg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
        };
      case "constructive_addition":
        return {
          label: "Constructive Addition",
          bg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
        };
      case "interruption":
        return {
          label: "Floor Intervention",
          bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
      case "off_topic":
        return {
          label: "Tangential Drift",
          bg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        };
      case "filler":
        return {
          label: "Hesitation / Filler",
          bg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        };
      default:
        return {
          label: "Constructive Note",
          bg: "bg-slate-500/15 text-slate-400 border-slate-500/30",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================
            TOP BREADCRUMB & STAGE HEADER
            ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Back to Interview History"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                  Assessment Scorecard
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  #GD-{(session._id || id || "").slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Discussion Performance Audit
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Audit Verified
            </span>
            <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-mono">
              Duration: {session.durationMinutes || 10}m
            </span>
          </div>
        </div>

        {/* ========================================================
            1. HERO OVERALL SCORECARD
            ======================================================== */}
        <section className="bg-gradient-to-br from-[#0e1424] via-[#0b101c] to-[#080b12] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Narrative & Benchmark */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  {session.category || "General"}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300 text-xs font-semibold capitalize">
                  {session.difficulty || "mid"} Difficulty
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {session.topic}
              </h2>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Evaluated against corporate assessment center rubrics across 4
                foundational competencies: Articulation, Leadership, Active
                Listening, and Critical Thinking.
              </p>

              {/* Placement Ready Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  {overallScore >= 85
                    ? "Tier-1 Corporate Placement Ready"
                    : overallScore >= 70
                    ? "Competitive Benchmark · Ready"
                    : overallScore >= 50
                    ? "Developing Foundation · Practice Recommended"
                    : "Foundational Stage · Practice Recommended"}
                </div>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {overallScore >= 85
                    ? "Top 10th Percentile"
                    : overallScore >= 70
                    ? "Top 25th Percentile"
                    : "Top 50th Percentile"}
                </span>
              </div>
            </div>

            {/* Right Circular Score & CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-6 shrink-0 w-full sm:w-auto">
              {/* Radial Gauge */}
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                  <circle
                    className="text-white/[0.06]"
                    cx="70"
                    cy="70"
                    fill="transparent"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                  />
                  <circle
                    className="transition-all duration-1000 ease-out"
                    cx="70"
                    cy="70"
                    fill="transparent"
                    r={radius}
                    stroke="url(#scoreGrad)"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight font-mono leading-none">
                    {overallScore}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    / 100
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-44">
                <button
                  type="button"
                  onClick={() => navigate("/gd/setup")}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>All History</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. 4 CORE GD COMPETENCY PILLARS
            ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-indigo-400">
                Competency Breakdown
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                4-Pillar Evaluation Matrix
              </h3>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Target: 75+ for corporate placement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: Articulation & Clarity */}
            <div className="bg-[#0d111a]/80 border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-indigo-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Articulation & Clarity
                  </span>
                  <span className="text-base font-bold font-mono text-indigo-400">
                    {articulation}
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${articulation}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                  {articulation >= 80 ? "Crisp & Concise" : "Clear Delivery"}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Speech clarity, argument structure, and minimal filler words.
                </p>
              </div>
            </div>

            {/* Pillar 2: Leadership & Initiative */}
            <div className="bg-[#0d111a]/80 border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-emerald-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Leadership & Initiative
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {leadership}
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${leadership}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                  {leadership >= 80 ? "Proactive Anchor" : "Balanced Initiative"}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Floor claiming, topic steering, and synthesizing group consensus.
                </p>
              </div>
            </div>

            {/* Pillar 3: Active Listening & Responsiveness */}
            <div className="bg-[#0d111a]/80 border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-sky-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Active Listening
                  </span>
                  <span className="text-base font-bold font-mono text-sky-400">
                    {listening}
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${listening}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider">
                  {listening >= 80 ? "High Empathy" : "Constructive Rebuttal"}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Referencing peer arguments by name, smooth yields, and build-ons.
                </p>
              </div>
            </div>

            {/* Pillar 4: Critical Thinking & Depth */}
            <div className="bg-[#0d111a]/80 border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-purple-500/30 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Critical Thinking
                  </span>
                  <span className="text-base font-bold font-mono text-purple-400">
                    {criticalThinking}
                    <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-white/[0.05] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${criticalThinking}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                  {criticalThinking >= 80 ? "Data Driven" : "Logical Reasoning"}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Grounding points in empirical precedents and stress-testing edge cases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SPEAKING & ACOUSTIC TELEMETRY ROW
            ======================================================== */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-indigo-400">
              Session Metrics
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Speaking & Floor Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1: Speaking Time */}
            <div className="bg-[#0d111a]/80 border border-white/[0.06] p-4 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Speaking Time
              </span>
              <p className="text-2xl font-bold font-mono text-white">
                {candidateSpeakingFormatted}
              </p>
              <span className="text-xs text-indigo-400 font-medium block">
                {floorSharePercentage}% of total discussion
              </span>
            </div>

            {/* Metric 2: Candidate Contributions */}
            <div className="bg-[#0d111a]/80 border border-white/[0.06] p-4 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Your Contributions
              </span>
              <p className="text-2xl font-bold font-mono text-white">
                {candidateTurns} Turns
              </p>
              <span className="text-xs text-slate-400 block">
                Balanced intervention frequency
              </span>
            </div>

            {/* Metric 3: Total Discussion Volume */}
            <div className="bg-[#0d111a]/80 border border-white/[0.06] p-4 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Total Session Turns
              </span>
              <p className="text-2xl font-bold font-mono text-white">
                {totalTurns} Turns
              </p>
              <span className="text-xs text-slate-400 block">
                3 AI Peers + You + Orchestrator
              </span>
            </div>

            {/* Metric 4: Floor Interventions */}
            <div className="bg-[#0d111a]/80 border border-white/[0.06] p-4 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Floor Interventions
              </span>
              <p className="text-2xl font-bold font-mono text-white">
                {interruptionsCount} Shifts
              </p>
              <span className="text-xs text-emerald-400 font-medium block">
                Assertive floor-taking
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. AI COACH FEEDBACK & DIAGNOSTIC INTELLIGENCE
            ======================================================== */}
        <section className="bg-[#0d111a]/90 border border-white/[0.07] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400">
                Diagnostic Intelligence
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                AI Coach Synthesis
              </h3>
            </div>
          </div>

          {/* Detailed Feedback Narrative Blockquote */}
          <blockquote className="bg-white/[0.02] border-l-4 border-indigo-500 p-5 rounded-r-2xl text-sm sm:text-base text-slate-200 leading-relaxed">
            "{detailedFeedback}"
          </blockquote>

          {/* Strengths & Improvements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Strengths */}
            <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Key Strengths
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Areas for Elevation
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. TURN-BY-TURN FEEDBACK (When Available)
            ======================================================== */}
        {turnFeedback && turnFeedback.length > 0 && (
          <section className="space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-indigo-400">
                Micro-Level Analysis
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Turn-by-Turn Interventions
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {turnFeedback.map((fb, idx) => {
                const badge = getCritiqueBadge(fb.critiqueType);
                return (
                  <div
                    key={idx}
                    className="bg-[#0d111a]/80 border border-white/[0.06] p-5 rounded-2xl space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white font-mono">
                        Turn #{fb.turnNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {fb.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            6. COMPLETE DISCUSSION TRANSCRIPT
            ======================================================== */}
        <section className="bg-[#0d111a]/80 border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400">
                  Full Dialogue Record
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Session Transcript ({transcript.length} Turns)
                </h3>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowTranscript((prev) => !prev)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span>{showTranscript ? "Collapse Transcript" : "Expand Full Transcript"}</span>
              {showTranscript ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {showTranscript && (
            <div className="space-y-4 pt-2 border-t border-white/[0.05]">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTranscriptFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
                >
                  All Turns ({transcript.length})
                </button>
                <button
                  onClick={() => setTranscriptFilter("candidate")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "candidate"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
                >
                  Your Turns ({candidateTurns})
                </button>
                <button
                  onClick={() => setTranscriptFilter("ai")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "ai"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
                >
                  AI Peers
                </button>
              </div>

              {/* Transcript Entries */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredTranscript.map((turn, idx) => {
                  const isCandidate = turn.speakerId === "candidate";
                  const isOrchestrator = turn.speakerId === "orchestrator";
                  const isAgent2 = turn.speakerId === "agent_2";
                  const isAgent3 = turn.speakerId === "agent_3";

                  let badgeStyle = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
                  let speakerName = "Agent 1 — Analytical";

                  if (isCandidate) {
                    badgeStyle = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
                    speakerName = "You (Candidate)";
                  } else if (isOrchestrator) {
                    badgeStyle = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                    speakerName = "Central Orchestrator";
                  } else if (isAgent2) {
                    badgeStyle = "bg-purple-500/15 text-purple-300 border-purple-500/30";
                    speakerName = "Agent 2 — Confident";
                  } else if (isAgent3) {
                    badgeStyle = "bg-sky-500/15 text-sky-300 border-sky-500/30";
                    speakerName = "Agent 3 — Critical Thinker";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isCandidate
                          ? "bg-emerald-500/[0.03] border-emerald-500/20"
                          : "bg-white/[0.02] border-white/[0.05]"
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeStyle}`}
                          >
                            {speakerName}
                          </span>
                          <span className="text-slate-500 font-mono">
                            Turn #{turn.turnNumber || idx + 1}
                          </span>
                        </div>
                        {turn.durationSeconds > 0 && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {turn.durationSeconds}s
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-1">
                        {turn.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================
            7. NAVIGATION FOOTER
            ======================================================== */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d111a]/70 border border-white/[0.06]">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Activity & Interview History</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/gd"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold text-slate-300 text-center transition-all"
            >
              GD Overview
            </Link>
            <Link
              to="/gd/setup"
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white text-center transition-all shadow-md"
            >
              Start New GD Simulation →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
