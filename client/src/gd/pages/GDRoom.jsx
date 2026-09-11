import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Send,
  Timer,
  LogOut,
  Brain,
  Activity,
  Shield,
  User,
  Volume2,
  Plus,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useGD } from "../context/gdContext";
import { useSpeechQueue } from "../audio/useSpeechQueue";
import { useSpeechRecognition } from "../audio/useSpeechRecognition";
import { useMediaStream } from "../audio/useMediaStream";
import { toast } from "sonner";

export default function GDRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    session,
    loadSession,
    enterRoom,
    sendCandidateSpeech,
    requestAgentTurn,
    finishSession,
    abandonSession,
    transcript,
    activeSpeakerId,
    isDiscussionComplete,
    error,
    clearError,
  } = useGD();

  // Audio Hook Abstractions
  const {
    enqueue,
    cancel: cancelSpeech,
    isSpeaking: isTTSPlaying,
    currentSpeakerId: ttsSpeakerId,
  } = useSpeechQueue();

  const {
    isListening,
    transcript: sttTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const {
    startMedia,
    stopMedia,
    audioLevel,
  } = useMediaStream();

  // Local Component State
  const [inputPrompt, setInputPrompt] = useState("");
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [candidateSpeakingSeconds, setCandidateSpeakingSeconds] = useState(0);
  const [interruptedPrevious, setInterruptedPrevious] = useState(false);

  // Refs for tracking and cleanup
  const spokenTurnsRef = useRef(new Set());
  const transcriptEndRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const initialOpeningRequestedRef = useRef(false);
  const speakingTimerRef = useRef(null);

  // 1. Session Loading & State Synchronization
  useEffect(() => {
    if (!id) return;

    loadSession(id)
      .then((res) => {
        const sess = res?.session;
        if (sess?.status === "aborted") {
          toast.info("This discussion session has been terminated.");
          navigate("/gd", { replace: true });
          return;
        }
        if (sess?.status === "setup" || sess?.status === "lobby") {
          enterRoom(id).catch(() => {});
        } else if (sess?.status === "completed") {
          navigate(`/gd/analysis/${id}`, { replace: true });
        }
      })
      .catch(() => {});
  }, [id, loadSession, enterRoom, navigate]);

  // Guard against aborted session in active state
  useEffect(() => {
    if (session?.status === "aborted") {
      toast.info("This discussion session has been terminated.");
      navigate("/gd", { replace: true });
    }
  }, [session?.status, navigate]);

  // 2. Start microphone diagnostics stream on mount
  useEffect(() => {
    startMedia({ video: false, audio: true }).catch(() => {});
    return () => {
      stopMedia();
      cancelSpeech();
      stopListening();
    };
  }, [startMedia, stopMedia, cancelSpeech, stopListening]);

  // 3. Auto-Trigger Opening Statement when room initializes with empty transcript
  useEffect(() => {
    if (
      session &&
      session.status === "in_progress" &&
      transcript.length === 0 &&
      !initialOpeningRequestedRef.current
    ) {
      initialOpeningRequestedRef.current = true;
      requestAgentTurn().catch((err) => {
        console.error("[GDRoom] Initial opening statement request failed:", err);
      });
    }
  }, [session, transcript.length, requestAgentTurn]);

  // 4. TTS Enqueue for incoming AI turns
  useEffect(() => {
    if (transcript && transcript.length > 0) {
      transcript.forEach((turn, idx) => {
        const turnKey = `${turn.turnNumber || idx}-${turn.speakerId}`;
        if (!spokenTurnsRef.current.has(turnKey)) {
          spokenTurnsRef.current.add(turnKey);

          // Only enqueue AI/system turns (candidate spoke themselves)
          if (turn.speakerId !== "candidate" && turn.content) {
            enqueue({
              speakerId: turn.speakerId,
              text: turn.content,
            });
          }
        }
      });
    }
  }, [transcript, enqueue]);

  // 5. Auto-scroll transcript on new turns
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // 6. Live Timer & Candidate Speaking Tracking
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Track candidate speaking seconds while mic is actively listening
  useEffect(() => {
    if (isListening) {
      speakingTimerRef.current = setInterval(() => {
        setCandidateSpeakingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    }

    return () => {
      if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    };
  }, [isListening]);

  // 7. Synchronize STT recognition transcript with input prompt
  useEffect(() => {
    if (sttTranscript) {
      setInputPrompt(sttTranscript);
    }
  }, [sttTranscript]);

  // Calculation Helpers
  const totalDurationSeconds = (session?.durationMinutes || 10) * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const formattedRemainingTime = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;

  const currentSpeaker = isTTSPlaying ? ttsSpeakerId : activeSpeakerId;

  const candidateTurnsCount =
    transcript.filter((t) => t.speakerId === "candidate").length;
  const maxTurns = session?.maxTurns || 30;

  // Floor share percentage
  const floorSharePercentage = useMemo(() => {
    if (elapsedSeconds <= 0) return 0;
    const share = Math.round((candidateSpeakingSeconds / elapsedSeconds) * 100);
    return Math.min(100, Math.max(0, share));
  }, [candidateSpeakingSeconds, elapsedSeconds]);

  const handleCompleteDiscussion = useCallback(async () => {
    setIsCompleting(true);
    toast.info("Discussion concluded. Compiling evaluation scorecard...");

    try {
      const finalTelemetry = {
        candidateSpeakingTimeSeconds: candidateSpeakingSeconds,
        totalSessionDurationSeconds: elapsedSeconds,
        candidateTurnCount: candidateTurnsCount,
      };
      await finishSession(finalTelemetry);
      navigate(`/gd/analysis/${id}`, { replace: true });
    } catch (err) {
      setIsCompleting(false);
      const msg = err.response?.data?.message || err.message || "Failed to complete evaluation.";
      toast.error(msg);
    }
  }, [candidateSpeakingSeconds, elapsedSeconds, candidateTurnsCount, finishSession, navigate, id]);

  // 8. Auto-completion check when duration or limits are reached
  useEffect(() => {
    if (isDiscussionComplete && !isCompleting && session?.status !== "completed") {
      handleCompleteDiscussion();
    }
  }, [isDiscussionComplete, isCompleting, session?.status, handleCompleteDiscussion]);

  // Handlers
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      // If an AI agent was speaking, candidate speaking interrupts immediately
      if (isTTSPlaying) {
        cancelSpeech();
        setInterruptedPrevious(true);
        toast.info("Floor taken from AI peer.");
      }
      resetTranscript();
      startListening();
    }
  };

  const handleSendTurn = async (e) => {
    if (e) e.preventDefault();
    const content = inputPrompt.trim();
    if (!content) {
      toast.error("Please provide your argument or point before submitting.");
      return;
    }

    if (isSubmittingTurn) return;
    setIsSubmittingTurn(true);
    clearError();

    // If microphone was recording, stop it
    if (isListening) {
      stopListening();
    }

    try {
      const response = await sendCandidateSpeech({
        content,
        durationSeconds: Math.max(3, candidateSpeakingSeconds),
        interruptedPrevious,
      });

      setInputPrompt("");
      resetTranscript();
      setInterruptedPrevious(false);

      if (response?.isDiscussionComplete) {
        toast.success("Discussion limits reached. Concluding session...");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to submit speech turn.";
      toast.error(msg);
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  const handleRequestPeer = async () => {
    if (isTTSPlaying || isSubmittingTurn) return;
    setIsSubmittingTurn(true);
    try {
      await requestAgentTurn();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to prompt peer agent.";
      toast.error(msg);
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  const handleAbandonDiscussion = async () => {
    try {
      const res = await abandonSession();
      if (res?.refunded) {
        toast.success("Session terminated. Credits were refunded to your balance.");
      } else {
        toast.info("Session terminated.");
      }
      navigate("/gd", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to abandon session.";
      toast.error(msg);
    }
  };

  const handleInjectCitation = (text) => {
    setInputPrompt((prev) => (prev ? `${prev} ${text}` : text));
  };

  // Prevent room from being usable if session is aborted
  if (session?.status === "aborted") {
    return (
      <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">
          This session was terminated. Redirecting to discussion workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* ========================================================
          1. TOP HUD BAR
          ======================================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#0d111a]/95 border-b border-white/[0.08] backdrop-blur-xl px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#080b12] px-3 py-1 rounded-full border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white uppercase tracking-wider font-semibold">
              Live Group Discussion
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Arena: GD-{(session?._id || id || "").slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Center: Topic Banner */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] backdrop-blur-md px-4 py-1 rounded-full max-w-lg truncate">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {session?.topic || "Deliberating..."}
          </span>
          <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0">
            {session?.difficulty || "mid"}
          </span>
        </div>

        {/* Right: Live Timer, End Discussion */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>LIVE</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#080b12] border border-white/[0.08] px-3 py-1 rounded-xl">
            <Timer className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 leading-none">REMAINING</span>
              <span className="font-mono text-xs font-bold text-white tracking-tight">
                {formattedRemainingTime}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="px-3 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Discussion</span>
          </button>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          2. VIRTUAL TELEPRESENCE STAGE GRID (4 Participant Tiles)
          ======================================================== */}
      <section className="w-full px-4 sm:px-6 pt-4 pb-2 bg-gradient-to-b from-[#0d111a] to-[#080b12]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tile 1: Agent 1 · Analytical */}
          <div
            className={`relative p-3.5 rounded-xl transition-all shadow-sm ${
              currentSpeaker === "agent_1"
                ? "bg-[#12192e] border-2 border-indigo-500 shadow-[0_0_20px_rgba(79,91,213,0.25)] -translate-y-0.5"
                : "bg-[#0d111a] border border-white/[0.08]"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${
                    currentSpeaker === "agent_1"
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-white/[0.04] border-white/10 text-indigo-400"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span className="absolute -bottom-1 -right-1 px-1 rounded bg-indigo-900 text-[8px] font-bold text-indigo-200">
                    AI
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white font-family-jakarta">Agent 1</h4>
                    <span className="bg-white/[0.05] text-slate-400 text-[9px] px-1 rounded">
                      CI: 65
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-300 font-medium">Analytical</p>
                </div>
              </div>

              {currentSpeaker === "agent_1" ? (
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Speaking
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  Listening
                </span>
              )}
            </div>

            {currentSpeaker === "agent_1" ? (
              <div className="bg-[#080b12] border border-indigo-500/30 p-1.5 rounded-lg flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-indigo-400 animate-pulse" /> Speaking floor
                </span>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-indigo-400 rounded-full h-2 animate-pulse" />
                  <span className="w-0.5 bg-indigo-300 rounded-full h-3 animate-pulse" />
                  <span className="w-0.5 bg-indigo-400 rounded-full h-1.5 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="bg-[#080b12]/60 border border-white/[0.04] p-1.5 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
                <span>Synthesizing Premise</span>
                <span>Standby</span>
              </div>
            )}
          </div>

          {/* Tile 2: Agent 2 · Confident */}
          <div
            className={`relative p-3.5 rounded-xl transition-all shadow-sm ${
              currentSpeaker === "agent_2"
                ? "bg-[#18132e] border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] -translate-y-0.5"
                : "bg-[#0d111a] border border-white/[0.08]"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${
                    currentSpeaker === "agent_2"
                      ? "bg-purple-500/20 border-purple-400 text-purple-300"
                      : "bg-white/[0.04] border-white/10 text-purple-400"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="absolute -bottom-1 -right-1 px-1 rounded bg-purple-900 text-[8px] font-bold text-purple-200">
                    AI
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white font-family-jakarta">Agent 2</h4>
                    <span className="bg-white/[0.05] text-slate-400 text-[9px] px-1 rounded">
                      CI: 65
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300 font-medium">Confident</p>
                </div>
              </div>

              {currentSpeaker === "agent_2" ? (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  Speaking
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  Listening
                </span>
              )}
            </div>

            {currentSpeaker === "agent_2" ? (
              <div className="bg-[#080b12] border border-purple-500/30 p-1.5 rounded-lg flex items-center justify-between">
                <span className="text-[10px] text-purple-300 font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-purple-400 animate-pulse" /> Counter-rebuttal
                </span>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-purple-400 rounded-full h-2 animate-pulse" />
                  <span className="w-0.5 bg-purple-300 rounded-full h-3 animate-pulse" />
                  <span className="w-0.5 bg-purple-400 rounded-full h-1.5 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="bg-[#080b12]/60 border border-white/[0.04] p-1.5 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
                <span>Evaluating Tradeoffs</span>
                <span>Standby</span>
              </div>
            )}
          </div>

          {/* Tile 3: Agent 3 · Critical Thinker */}
          <div
            className={`relative p-3.5 rounded-xl transition-all shadow-sm ${
              currentSpeaker === "agent_3"
                ? "bg-[#0f1b2e] border-2 border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.25)] -translate-y-0.5"
                : "bg-[#0d111a] border border-white/[0.08]"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${
                    currentSpeaker === "agent_3"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-white/[0.04] border-white/10 text-sky-400"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="absolute -bottom-1 -right-0.5 px-1 rounded bg-sky-950 text-[8px] font-bold text-sky-200">
                    AI
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white font-family-jakarta">Agent 3</h4>
                    <span className="bg-white/[0.05] text-slate-400 text-[9px] px-1 rounded">
                      CI: 95
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-300 font-medium">Critical Thinker</p>
                </div>
              </div>

              {currentSpeaker === "agent_3" ? (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  Speaking
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  Listening
                </span>
              )}
            </div>

            {currentSpeaker === "agent_3" ? (
              <div className="bg-[#080b12] border border-sky-500/30 p-1.5 rounded-lg flex items-center justify-between">
                <span className="text-[10px] text-sky-300 font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-sky-400 animate-pulse" /> Contrarian stress-test
                </span>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-sky-400 rounded-full h-2 animate-pulse" />
                  <span className="w-0.5 bg-sky-300 rounded-full h-3 animate-pulse" />
                  <span className="w-0.5 bg-sky-400 rounded-full h-1.5 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="bg-[#080b12]/60 border border-white/[0.04] p-1.5 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
                <span>Analyzing Edge-cases</span>
                <span>Standby</span>
              </div>
            )}
          </div>

          {/* Tile 4: You · Candidate */}
          <div
            className={`relative p-3.5 rounded-xl transition-all shadow-sm ${
              isListening
                ? "bg-[#0b1c1e] border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] -translate-y-0.5"
                : "bg-[#0d111a] border border-white/[0.08]"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isListening
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-white/[0.04] border-white/10 text-emerald-400"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="absolute -bottom-1 -right-0.5 px-1 rounded bg-emerald-950 text-[8px] font-bold text-emerald-300 uppercase">
                    YOU
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white font-family-jakarta">You</h4>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 rounded font-bold uppercase">
                      Candidate
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">Active Voice</p>
                </div>
              </div>

              {isListening ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Speaking
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                  Floor Primed
                </span>
              )}
            </div>

            <div className="bg-[#080b12] border border-white/[0.04] p-1.5 rounded-lg flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                {isListening ? (
                  <>
                    <Mic className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Recording ({audioLevel}%)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 text-slate-500" />
                    <span>Mic calibrated</span>
                  </>
                )}
              </span>
              <span className="text-slate-400">
                Share: <strong className="text-white">{floorSharePercentage}%</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. MAIN BODY: TIMELINE & TELEMETRY SIDEBAR
          ======================================================== */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Deliberation Stream (Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#0d111a] border border-white/[0.06] px-4 py-2 rounded-xl text-xs text-slate-400">
            <span className="font-semibold text-white uppercase tracking-wider font-family-jakarta flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Structured Deliberation Timeline
            </span>
            <span>
              {transcript.length} Contribution{transcript.length !== 1 ? "s" : ""} Logged
            </span>
          </div>

          {/* Transcript Feed */}
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {transcript.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0d111a]/80 border border-white/[0.06] text-center flex flex-col items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">
                  Initializing discussion chamber. Central Orchestrator is framing the topic...
                </p>
              </div>
            ) : (
              transcript.map((turn, idx) => {
                const isCandidate = turn.speakerId === "candidate";
                const isOrchestrator = turn.speakerId === "orchestrator";
                const isAgent2 = turn.speakerId === "agent_2";
                const isAgent3 = turn.speakerId === "agent_3";

                let borderGradient = "border-indigo-500/40";
                let badgeBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                let roleTitle = "Analytical";

                if (isCandidate) {
                  borderGradient = "border-emerald-500/40 bg-[#0c181f]/70";
                  badgeBg = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                  roleTitle = "Candidate";
                } else if (isOrchestrator) {
                  borderGradient = "border-amber-500/40 bg-[#16120d]/60";
                  badgeBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                  roleTitle = "System";
                } else if (isAgent2) {
                  borderGradient = "border-purple-500/40 bg-[#150f24]/60";
                  badgeBg = "bg-purple-500/15 text-purple-400 border-purple-500/30";
                  roleTitle = "Confident";
                } else if (isAgent3) {
                  borderGradient = "border-sky-500/40 bg-[#0d1726]/60";
                  badgeBg = "bg-sky-500/15 text-sky-400 border-sky-500/30";
                  roleTitle = "Critical Thinker";
                }

                return (
                  <article
                    key={idx}
                    className={`relative rounded-xl p-4 border shadow-sm transition-all ${borderGradient} bg-[#0d111a]/90`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/[0.04] text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-family-jakarta">
                          {isCandidate ? "You (Candidate)" : isOrchestrator ? "Orchestrator" : turn.speakerLabel || turn.speakerId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeBg}`}>
                          {roleTitle}
                        </span>
                        {turn.interruptedPrevious && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 text-[9px] font-semibold">
                            Interruption
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Turn #{turn.turnNumber || idx + 1}
                      </span>
                    </div>

                    <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      “{turn.content}”
                    </blockquote>
                  </article>
                );
              })
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Live Performance Telemetry Panel (Col 4) */}
        <aside className="lg:col-span-4 flex flex-col gap-3">
          <div className="bg-[#0d111a] border border-white/[0.06] rounded-xl p-4 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-family-jakarta">
                Live Performance
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                Synchronized
              </span>
            </div>

            {/* Metric 1: Discourse Turns */}
            <div className="bg-[#080b12] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Candidate Turns</span>
                <span className="font-bold text-white">
                  {candidateTurnsCount} <span className="text-slate-500 font-normal">/ {maxTurns}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (candidateTurnsCount / 6) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">
                Target: 4–6 high-impact turns for optimal evaluation score.
              </span>
            </div>

            {/* Metric 2: Speaking Time & Floor Share */}
            <div className="bg-[#080b12] border border-white/[0.04] p-3 rounded-lg flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Speaking Time
                </span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {Math.floor(candidateSpeakingSeconds / 60)}m {candidateSpeakingSeconds % 60}s
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {floorSharePercentage}% floor share · {floorSharePercentage >= 20 && floorSharePercentage <= 35 ? "Equilibrium met" : "Active cadence"}
                </p>
              </div>

              {/* Progress Circle Visual */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-emerald-400 transition-all duration-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${floorSharePercentage}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute text-[11px] font-bold text-white">{floorSharePercentage}%</div>
              </div>
            </div>

            {/* AI Coach Tactical Whisper */}
            <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Coach Tactical Whisper</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentSpeaker === "agent_1"
                  ? "Agent 1 is framing structural models. Prepare to challenge potential execution bottlenecks."
                  : currentSpeaker === "agent_2"
                  ? "Agent 2 is taking a decisive stance. Cite empirical benchmarks to anchor consensus."
                  : currentSpeaker === "agent_3"
                  ? "Agent 3 is stress-testing edge cases. Acknowledge risk then propose mitigation."
                  : "Floor is balanced. Intervene with quantitative proof or summarize discussion pillars."}
              </p>
            </div>

            {/* Continue / Next Agent Trigger Button */}
            {!isTTSPlaying && !isListening && (
              <button
                type="button"
                onClick={handleRequestPeer}
                disabled={isSubmittingTurn}
                className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Request Next Peer Response</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </aside>
      </section>

      {/* ========================================================
          4. FLOATING CONSOLE DOCK (Bottom Action Bar)
          ======================================================== */}
      <section className="sticky bottom-0 z-40 w-full px-4 sm:px-6 pb-4 pt-1 bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto bg-[#0d111a]/95 border border-white/[0.1] rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5">
          {/* Top Row: Audio Status & Quick Evidence Chips */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1.5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
                  isListening
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isListening ? "bg-emerald-400 animate-ping" : "bg-slate-500"
                  }`}
                />
                <span>{isListening ? "Recording Candidate Speech..." : "Ready to Intervene"}</span>
              </div>

              {isListening && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-3" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-1.5" />
                </div>
              )}
            </div>

            {/* Quick Evidence Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleInjectCitation("Building on Agent 1's framework,")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>Build on Agent 1</span>
              </button>
              <button
                type="button"
                onClick={() => handleInjectCitation("To address Agent 2's counterpoint,")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-purple-400" />
                <span>Address Agent 2</span>
              </button>
              <button
                type="button"
                onClick={() => handleInjectCitation("Synthesizing our positions,")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>Synthesize</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Input Box & Send Controls */}
          <form onSubmit={handleSendTurn} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full bg-[#080b12] border border-white/[0.08] rounded-xl flex items-center px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  isListening
                    ? "Speaking... voice transcription active"
                    : "Share your perspective or type counter-argument (or use microphone)..."
                }
                maxLength={4000}
                className="w-full bg-transparent text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
              />
              <span className="hidden sm:inline text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-white/[0.04]">
                Enter ↵
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                title={isListening ? "Mute Microphone" : "Speak via Microphone"}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                  isListening
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]"
                }`}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Intervene & Send Button */}
              <button
                type="submit"
                disabled={isSubmittingTurn || !inputPrompt.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-[0.99] ${
                  isSubmittingTurn || !inputPrompt.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/25 border border-white/10"
                }`}
              >
                {isSubmittingTurn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Intervene &amp; Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================
          5. END DISCUSSION CONFIRMATION MODAL
          ======================================================== */}
      {showEndModal && (
        <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0e1424] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-family-jakarta">
                  Conclude Group Discussion?
                </h3>
                <p className="text-xs text-slate-400">
                  Select how you would like to end this simulation.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
              Ending now will compile your turns into an executive 4-pillar cognitive report.
              If you have taken 0 turns, abandoning the session will safely refund your 150 credits.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCompleteDiscussion}
                disabled={isCompleting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Conclude &amp; View Evaluation</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAbandonDiscussion}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                Abandon Session (Refund If Unused)
              </button>

              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Resume Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
