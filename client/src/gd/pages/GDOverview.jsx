import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  TrendingUp,
  Clock,
  Award,
  History,
  Info,
  Sparkles,
  X,
  CheckCircle2,
  BarChart3,
  Brain,
  ShieldCheck,
  MessageSquare,
  Activity,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useGD } from "../context/gdContext";

export default function GDOverview() {
  const { overviewStats, recentSessions, fetchOverview } = useGD();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    fetchOverview().catch(() => {
      // Ignored: context manages error state
    });
  }, [fetchOverview]);

  const totalSessions = overviewStats?.totalSessions ?? 0;
  const averageScore = overviewStats?.averageScore ?? 0;
  const bestScore = overviewStats?.bestScore ?? 0;
  const totalMinutes = totalSessions * 10;

  const formatDate = (isoStr) => {
    if (!isoStr) return "Recent";
    try {
      const date = new Date(isoStr);
      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Top Standard Navigation */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12 relative overflow-hidden">
        {/* Subtle Ambient Glowing Backdrops */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-[450px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ========================================================
            HERO DELIBERATION ARENA
            ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 pt-4">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Group Discussion Simulator
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-family-jakarta">
                Master Group Discussions with AI
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                Practice realistic group discussions with AI participants and improve your
                communication, confidence, leadership, and ability to respond under pressure.
              </p>
            </div>

            {/* CTA Cluster */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/gd/setup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-[0_4px_20px_rgba(79,91,213,0.35)] active:scale-[0.99] transition-all border border-white/10"
              >
                <span>Start a GD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setShowHowItWorks(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-medium border border-white/[0.08] backdrop-blur-sm transition-all"
              >
                <PlayCircle className="w-4 h-4 text-indigo-400" />
                <span>How it works</span>
              </button>
            </div>

            {/* Persona Tagline */}
            <div className="flex items-center gap-3 pt-2 text-slate-400 text-xs sm:text-sm">
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#1c2233] border border-white/10 flex items-center justify-center text-[10px] text-indigo-400 font-bold shadow-sm">
                  A1
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-white/10 flex items-center justify-center text-[10px] text-emerald-400 font-bold shadow-sm">
                  A2
                </div>
                <div className="w-7 h-7 rounded-full bg-sky-950/80 border border-white/10 flex items-center justify-center text-[10px] text-sky-400 font-bold shadow-sm">
                  A3
                </div>
              </div>
              <span>Deliberate alongside Analytical, Confident &amp; Critical Thinker personas.</span>
            </div>
          </div>

          {/* Right Column: Abstract Deliberation Matrix Visual Topology */}
          <div className="lg:col-span-6 relative w-full">
            <div className="relative w-full rounded-2xl bg-[#0d121f]/80 border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 overflow-hidden flex flex-col gap-4">
              {/* Telemetry Header */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-slate-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Dynamic Neural Orchestrator
                </span>
                <span className="font-mono text-emerald-400 text-[11px] tracking-wider">
                  LATENCY 18MS · 4 NODES SYNCED
                </span>
              </div>

              {/* Interactive Visualizer Canvas */}
              <div className="relative h-72 w-full flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full text-white/[0.08]"
                  fill="none"
                  viewBox="0 0 460 280"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse cx="230" cy="140" rx="175" ry="95" stroke="currentColor" strokeDasharray="4 4" />
                  <ellipse cx="230" cy="140" rx="105" ry="52" stroke="currentColor" strokeOpacity="0.6" />
                  <line stroke="currentColor" strokeOpacity="0.6" x1="230" x2="230" y1="35" y2="140" />
                  <line stroke="currentColor" strokeOpacity="0.6" x1="75" x2="230" y1="140" y2="140" />
                  <line stroke="currentColor" strokeOpacity="0.6" x1="385" x2="230" y1="140" y2="140" />
                  <line stroke="currentColor" strokeOpacity="0.6" x1="230" x2="230" y1="245" y2="140" />
                  <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.3" x1="75" x2="230" y1="140" y2="35" />
                  <line stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.3" x1="385" x2="230" y1="140" y2="35" />
                </svg>

                {/* Central Topic Core */}
                <div className="absolute z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-[0_0_24px_rgba(79,91,213,0.4)] ring-4 ring-indigo-500/20 border border-white/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-indigo-300 font-semibold mt-1.5 tracking-tight">
                    Topic Core
                  </span>
                </div>

                {/* Candidate Node (You) - Top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="px-3 py-1 rounded-full bg-[#181f33]/90 border border-white/10 shadow-lg flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold">You (Candidate)</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1 h-3">
                    <span className="w-0.5 bg-emerald-400 h-2 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 bg-emerald-400 h-3 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 bg-emerald-400 h-1.5 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="w-0.5 bg-emerald-400 h-2.5 rounded-full animate-bounce" style={{ animationDelay: "75ms" }} />
                  </div>
                </div>

                {/* Agent 1 — Analytical Node - Left */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-md text-slate-200 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-medium">Agent 1 (Analytical)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">CI: 65</span>
                </div>

                {/* Agent 2 — Confident Node - Right */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-md text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium">Agent 2 (Confident)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">Active</span>
                </div>

                {/* Agent 3 — Critical Thinker Node - Bottom */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                  <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-md text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-medium">Agent 3 (Critical Thinker)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">Contrarian Stress Test</span>
                </div>
              </div>

              {/* Telemetry Bottom Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs text-slate-400 bg-[#070a11]/60 border border-white/[0.05] p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block text-[11px]">Speaking Floor Target</span>
                  <span className="text-white text-base font-semibold">25–30%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Articulation Index</span>
                  <span className="text-white text-base font-semibold">
                    8.5+ <span className="text-slate-500 text-xs font-normal">/ 10</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Active Cohort</span>
                  <span className="text-emerald-400 truncate block font-medium">3 AI Peers + You</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            YOUR GD PERFORMANCE SECTION
            ======================================================== */}
        <section className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-family-jakarta">
                Your GD Performance
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Continuous Assessment Window
            </span>
          </div>

          {/* 3 Compact Glass Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Average Score */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-5 shadow-md flex flex-col justify-between gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Average Score
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {totalSessions > 0 ? averageScore : "--"}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ 100</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                {totalSessions > 0 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" />
                    <span>Consistent Growth</span>
                  </div>
                ) : (
                  <span className="text-slate-500">Awaiting first session</span>
                )}
                <span className="text-slate-400">Composite Rating</span>
              </div>
            </div>

            {/* Card 2: Sessions */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-5 shadow-md flex flex-col justify-between gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Simulations
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      {totalSessions}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">Completed</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                <span className="text-slate-300 font-medium">
                  {totalMinutes} Mins Deliberation
                </span>
                <span className="text-slate-400">10m Avg / Session</span>
              </div>
            </div>

            {/* Card 3: Best Score */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-5 shadow-md flex flex-col justify-between gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Best Score
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                      {totalSessions > 0 ? bestScore : "--"}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">/ 100</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                {bestScore >= 85 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Tier-1 Placement Ready</span>
                  </div>
                ) : bestScore >= 70 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Corporate Benchmark</span>
                  </div>
                ) : (
                  <span className="text-slate-500">Foundation Stage</span>
                )}
                <span className="text-slate-400">Peak Performance</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            RECENT SESSIONS SECTION
            ======================================================== */}
        <section className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-family-jakarta">
                Recent Sessions
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Directly synced with your centralized{" "}
              <Link to="/history" className="text-indigo-400 hover:underline font-medium">
                Interview History
              </Link>
            </span>
          </div>

          {recentSessions && recentSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {recentSessions.map((session) => {
                const score = session.evaluation?.overallScore ?? null;
                const difficultyLabel =
                  session.difficulty === "executive"
                    ? "Hard"
                    : session.difficulty === "entry"
                    ? "Easy"
                    : "Medium";

                return (
                  <div
                    key={session._id}
                    className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.14] backdrop-blur-md p-5 rounded-2xl shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600" />
                    <div className="flex flex-col gap-2 pl-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-[11px] text-slate-300 uppercase font-semibold">
                            {session.category || "General"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-[11px] text-slate-400">
                            {difficultyLabel}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {session.durationMinutes || 10} min
                          </span>
                        </div>

                        {score !== null ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-semibold">
                            <span className="text-indigo-400">{score}</span>
                            <span className="text-slate-500">/100</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 font-medium">
                            {session.status === "in_progress" ? "In Progress" : "Pending"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors mt-1 font-family-jakarta line-clamp-1">
                        {session.topic}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {session.evaluation?.executiveSummary ||
                          "Complete multi-agent deliberation simulation with structured turn analysis and cognitive scoring."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pl-2 pt-2 border-t border-white/[0.04]">
                      <span className="text-xs text-slate-500 font-mono">
                        Recorded {formatDate(session.createdAt)}
                      </span>
                      <Link
                        to={`/gd/analysis/${session._id}`}
                        className="inline-flex items-center gap-1.5 text-indigo-400 text-xs hover:text-indigo-300 transition-colors font-semibold"
                      >
                        <span>View Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-lg font-semibold text-white font-family-jakarta">
                  No Group Discussions Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Configure your first simulation with custom topics, adaptive peer rigor, and
                  comprehensive 4-pillar AI evaluation.
                </p>
              </div>
              <Link
                to="/gd/setup"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
              >
                <span>Start Your First GD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Synced History Info Note */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 text-xs mt-2 shadow-sm">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              All completed GD sessions are automatically archived inside your central Interview
              History.
            </span>
          </div>
        </section>
      </main>

      {/* ========================================================
          HOW IT WORKS MODAL
          ======================================================== */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-family-jakarta">
                    How Group Discussion Simulator Works
                  </h3>
                  <p className="text-xs text-slate-400">
                    Master corporate and campus GD rounds in 4 structured stages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white">Select Topic &amp; Rigor</span>
                  <p className="text-slate-400 text-xs">
                    Choose from curated technology, economic, and policy cases, or input your own
                    custom prompt. Configure peer difficulty from supportive to executive stress.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white">Lobby Calibration</span>
                  <p className="text-slate-400 text-xs">
                    Verify microphone latency, preview the discussion blueprint, and review the 3
                    AI participants assembled for your session.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-full bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white">Live Discussion Chamber</span>
                  <p className="text-slate-400 text-xs">
                    Speak using voice recognition or text input. Balance speaking time, build on
                    ideas from Agent 1 (Analytical), manage Agent 2 (Confident), and handle edge-case
                    pushback from Agent 3 (Critical Thinker).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white">4-Pillar Evaluation &amp; Scorecard</span>
                  <p className="text-slate-400 text-xs">
                    Receive detailed quantitative critique across Articulation, Leadership, Active
                    Listening, and Critical Thinking with turn-by-turn feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <Link
                to="/gd/setup"
                onClick={() => setShowHowItWorks(false)}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Configure Discussion
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#06080e] border-t border-white/[0.06] py-5 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2025 Intellivora Systems Inc. · Executive Multi-Agent Cognitive Assessment &amp; Placement Prep
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Latency: 22ms · Neural Engine v4.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
