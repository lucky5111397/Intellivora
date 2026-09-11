import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  Brain,
  Activity,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useGD } from "../context/gdContext";
import { useMediaStream } from "../audio/useMediaStream";
import { toast } from "sonner";

export default function GDLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loadSession, enterRoom, loading, error, clearError } = useGD();
  const {
    startMedia,
    stopMedia,
    audioLevel,
    hasAudio,
    permissionDenied,
  } = useMediaStream();

  const [isEntering, setIsEntering] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const timerRef = useRef(null);

  // Load session by ID on mount
  useEffect(() => {
    if (id) {
      loadSession(id)
        .then((res) => {
          const sess = res.session;
          if (sess?.status === "in_progress") {
            navigate(`/gd/room/${id}`, { replace: true });
          } else if (sess?.status === "completed") {
            navigate(`/gd/analysis/${id}`, { replace: true });
          }
        })
        .catch(() => {
          // Error captured by context
        });
    }
  }, [id, loadSession, navigate]);

  // Start microphone diagnostics on mount
  useEffect(() => {
    startMedia({ video: false, audio: true }).catch(() => {
      // Handled in useMediaStream
    });

    return () => {
      stopMedia();
    };
  }, [startMedia, stopMedia]);

  // Brief auto-readiness countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleEnterDiscussion = async () => {
    if (isEntering) return;
    setIsEntering(true);
    clearError();

    try {
      await enterRoom(id);
      toast.success("Connecting to discussion chamber...");
      navigate(`/gd/room/${id}`);
    } catch (err) {
      setIsEntering(false);
      const msg = err.response?.data?.message || err.message || "Failed to enter discussion chamber.";
      toast.error(msg);
    }
  };

  const difficultyLabel =
    session?.difficulty === "executive"
      ? "Hard Difficulty"
      : session?.difficulty === "entry"
      ? "Easy Difficulty"
      : "Medium Difficulty";

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Top Standard Navigation */}
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative">
        {/* Top Breadcrumb & Stage Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/gd/setup"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/10"
              title="Back to Setup"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link to="/gd" className="hover:text-slate-200 transition-colors">
                Simulation Workspace
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-indigo-400 font-semibold uppercase tracking-wider">
                GD Preparation Stage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Autonomous Orchestrator Online</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/[0.04] text-slate-400 text-xs font-semibold uppercase tracking-wider border border-white/[0.08]">
              Step 02 / 03
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-xs underline hover:text-white ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================
            1. TOPIC & SCENARIO HEADER
            ======================================================== */}
        <section className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deliberation Ready</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white max-w-3xl leading-snug font-family-jakarta">
            {session?.topic || (loading ? "Loading session..." : "Group Discussion Chamber")}
          </h1>

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{session?.category || "Technology & AI"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-xs font-medium">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>{difficultyLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{session?.durationMinutes || 10} Minutes Duration</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>4 Seats Allocated</span>
            </div>
          </div>

          {/* Short Scenario Excerpt */}
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            “Deliberate dynamically against 3 specialized AI personas. Maintain collaborative leadership,
            articulate empirical backing, and synthesize counter-arguments effectively.”
          </p>
        </section>

        {/* ========================================================
            2. VIRTUAL CHAMBER TOPOLOGY (Cross / Diamond Layout)
            ======================================================== */}
        <section className="relative w-full max-w-3xl mx-auto my-1">
          <div className="relative bg-white/[0.025] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-family-jakarta">
                  Virtual Chamber Topology
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>4 Nodes Synchronized</span>
              </div>
            </div>

            {/* Topology Diamond Container */}
            <div className="relative flex flex-col items-center">
              {/* Decorative Background Rings */}
              <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-indigo-500/10 pointer-events-none" />
              <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-purple-500/15 pointer-events-none" />

              {/* TOP NODE: Agent 1 · Analytical */}
              <div className="w-full sm:w-[320px] mb-4 sm:mb-8 z-10">
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0d111a]/95 border border-white/[0.09] hover:border-indigo-500/40 backdrop-blur-md transition-all shadow-md">
                  <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-b from-indigo-500/20 to-indigo-950/60 border border-indigo-400/30 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-indigo-300" />
                    <span className="absolute -bottom-1 -right-0.5 px-1 py-0.2 rounded bg-indigo-900 border border-indigo-400/50 text-[8px] font-bold text-indigo-200 uppercase">
                      AI
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-white truncate font-family-jakarta">
                        Agent 1
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        Top Node
                      </span>
                    </div>
                    <div className="text-xs text-indigo-300 font-medium mb-0.5">Analytical</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Acoustic Node Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Left (Agent 2) & Right (Agent 3) */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-12 mb-4 sm:mb-8 z-10">
                {/* LEFT NODE: Agent 2 · Confident */}
                <div className="w-full sm:w-[300px]">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0d111a]/95 border border-white/[0.09] hover:border-purple-500/40 backdrop-blur-md transition-all shadow-md">
                    <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-b from-purple-500/20 to-purple-950/60 border border-purple-400/30 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-300" />
                      <span className="absolute -bottom-1 -right-0.5 px-1 py-0.2 rounded bg-purple-900 border border-purple-400/50 text-[8px] font-bold text-purple-200 uppercase">
                        AI
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-white truncate font-family-jakarta">
                          Agent 2
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                          Left Node
                        </span>
                      </div>
                      <div className="text-xs text-purple-300 font-medium mb-0.5">Confident</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Floor Synced</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT NODE: Agent 3 · Critical Thinker */}
                <div className="w-full sm:w-[300px]">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0d111a]/95 border border-white/[0.09] hover:border-sky-500/40 backdrop-blur-md transition-all shadow-md">
                    <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-b from-sky-500/20 to-slate-900/80 border border-sky-400/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-sky-300" />
                      <span className="absolute -bottom-1 -right-0.5 px-1 py-0.2 rounded bg-sky-950 border border-sky-400/50 text-[8px] font-bold text-sky-200 uppercase">
                        AI
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-white truncate font-family-jakarta">
                          Agent 3
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                          Right Node
                        </span>
                      </div>
                      <div className="text-xs text-sky-300 font-medium mb-0.5">Critical Thinker</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Model Synced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM NODE: You · Candidate */}
              <div className="w-full sm:w-[320px] z-10">
                <div className="relative flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-950/70 to-[#0d111a] border border-indigo-500/40 backdrop-blur-md shadow-lg shadow-indigo-950/30">
                  <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-full bg-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Active Participant
                  </div>

                  <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border-2 border-indigo-400/60 flex items-center justify-center font-bold text-indigo-200 text-xs">
                    YOU
                    <span className="absolute -bottom-1 -right-0.5 px-1 py-0.2 rounded bg-indigo-700 border border-indigo-300/40 text-[7px] font-bold text-white uppercase">
                      YOU
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate font-family-jakarta">
                        You
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[9px] font-semibold uppercase">
                        Candidate
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mb-0.5">
                      Evaluated Participant
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{hasAudio ? "Mic Calibrated" : "Floor Ready"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. BEFORE YOU BEGIN: 4 GUIDELINES
            ======================================================== */}
        <section className="w-full max-w-3xl mx-auto">
          <div className="bg-white/[0.025] backdrop-blur-md border border-white/[0.08] rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-family-jakarta">
                Before You Begin
              </h2>
              <span className="text-[11px] text-slate-500 ml-auto hidden sm:inline">
                Deliberation Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-indigo-400 font-bold text-sm shrink-0">01</span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Stay relevant</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Keep arguments directly focused on the core resolution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-purple-400 font-bold text-sm shrink-0">02</span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Support points</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Back viewpoints with verifiable rationale and data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-sky-400 font-bold text-sm shrink-0">03</span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Respond to peers</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Synthesize other nodes’ claims before offering rebuttals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-emerald-400 font-bold text-sm shrink-0">04</span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Share the floor</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Maintain fluid cadences without monopolizing speaking time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. LAUNCHPAD & HARDWARE DIAGNOSTICS
            ======================================================== */}
        <section className="w-full max-w-3xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            {/* Audio Hardware Status */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  hasAudio
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : permissionDenied
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-white/[0.04] border-white/[0.08] text-slate-400"
                }`}
              >
                {hasAudio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Microphone Diagnostics</span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      hasAudio
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : permissionDenied
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {hasAudio ? "LIVE" : permissionDenied ? "DENIED" : "CALIBRATING"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {hasAudio
                    ? `Active acoustic floor · Signal level: ${audioLevel}%`
                    : permissionDenied
                    ? "Microphone access blocked. Fallback text input enabled."
                    : "Calibrating audio floor..."}
                </span>
              </div>

              {/* Dynamic Mini Audio Waveform based on real-time audioLevel */}
              {hasAudio && (
                <div className="hidden md:flex items-center gap-1 h-5 px-2.5 py-1 rounded bg-black/40 border border-white/[0.06] ml-2">
                  <span
                    className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
                  />
                  <span
                    className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, (audioLevel / 100) * 20)}px` }}
                  />
                  <span
                    className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 14)}px` }}
                  />
                  <span
                    className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, (audioLevel / 100) * 20)}px` }}
                  />
                  <span
                    className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (audioLevel / 100) * 12)}px` }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                to="/gd/setup"
                className="px-4 py-2.5 rounded-xl border border-white/[0.09] text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Setup</span>
              </Link>

              <button
                type="button"
                onClick={handleEnterDiscussion}
                disabled={isEntering || loading}
                className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 active:translate-y-px transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEntering ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Discussion</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono text-indigo-200 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-emerald-300" />
                      <span>{countdown > 0 ? `0:0${countdown}` : "READY"}</span>
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.05] py-3.5 px-6 bg-[#080B12] mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>© 2025 Intellivora Systems Inc. · Executive Multi-Agent Cognitive Assessment</div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Latency: 22ms · Neural Engine v4.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
