import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Clock,
  MessageSquare,
  Users,
  Radio,
} from "lucide-react";
import { useGD } from "../context/gdContext";
import { Skeleton } from "@/components/ui";
import {
  ResultHeader,
  ScoreSummary,
  MetricGrid,
  StrengthList,
  ImprovementList,
  AIInsight,
  ResultActions,
  ReportDownload,
} from "@/components/results";
import { generateGDReportPdf } from "@/utils/pdfReportGenerator";

export default function GDAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

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

  const handleDownloadPdf = async () => {
    if (!session) return;
    return generateGDReportPdf({
      session,
      candidateName: userData?.name || "Candidate",
      candidateEmail: userData?.email || "candidate@intellivora.app",
      date: session.createdAt ? new Date(session.createdAt) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 flex-1">
              <Skeleton variant="text" className="w-28 h-4" />
              <Skeleton variant="title" className="w-80 h-8" />
              <Skeleton variant="text" className="w-56 h-4" />
            </div>
            <div className="flex gap-3">
              <Skeleton variant="button" className="w-28 h-9" />
              <Skeleton variant="button" className="w-32 h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl space-y-2">
                <Skeleton variant="text" className="w-24 h-3" />
                <Skeleton variant="title" className="w-16 h-7" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0E131F] border border-[#1E2B45] p-6 rounded-xl space-y-4">
              <Skeleton variant="title" className="w-48 h-6" />
              <Skeleton variant="text" className="w-full h-24" />
            </div>
            <div className="bg-[#0E131F] border border-[#1E2B45] p-6 rounded-xl space-y-4">
              <Skeleton variant="title" className="w-36 h-6" />
              <Skeleton variant="text" className="w-full h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !session) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0A0D14] border border-[#1E2B45] p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center gap-4 shadow-xl">
            <div className="p-3.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scorecard Unavailable</h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {fetchError || "The requested discussion session could not be found."}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => navigate("/history")}
                className="flex-1 py-2 rounded-xl bg-[#141B2D] border border-[#1E2B45] text-xs font-semibold text-[#CBD5E1] hover:bg-[#1E2B45] transition-all cursor-pointer"
              >
                View History
              </button>
              <button
                onClick={() => navigate("/gd")}
                className="flex-1 py-2 rounded-xl bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all cursor-pointer"
              >
                GD Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.status !== "completed" || !evaluation) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0A0D14] border border-[#1E2B45] p-8 rounded-2xl max-w-md w-full text-center flex flex-col items-center gap-4 shadow-xl">
            <div className="p-3.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Session Incomplete</h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                This discussion is marked as{" "}
                <span className="text-[#F59E0B] font-semibold uppercase">
                  {session.status}
                </span>{" "}
                and has not been formally evaluated yet.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              {session.status === "in_progress" ? (
                <button
                  onClick={() => navigate(`/gd/room/${id}`)}
                  className="w-full py-2 rounded-xl bg-[#16A34A] text-xs font-semibold text-white hover:bg-[#15803D] transition-all cursor-pointer"
                >
                  Return to Live Room →
                </button>
              ) : session.status === "lobby" ? (
                <button
                  onClick={() => navigate(`/gd/lobby/${id}`)}
                  className="w-full py-2 rounded-xl bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all cursor-pointer"
                >
                  Return to Lobby →
                </button>
              ) : (
                <button
                  onClick={() => navigate("/gd")}
                  className="w-full py-2 rounded-xl bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-all cursor-pointer"
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

  const tierTitle = overallScore >= 85
    ? "Tier-1 Corporate Placement Ready"
    : overallScore >= 70
    ? "Competitive Benchmark · Ready"
    : overallScore >= 50
    ? "Developing Foundation · Practice Recommended"
    : "Foundational Stage · Practice Recommended";

  const competencyMetrics = [
    {
      label: "Articulation & Clarity",
      value: articulation,
      max: 100,
      percentage: articulation,
      subtext: articulation >= 80 ? "Crisp speech & concise structure" : "Clear delivery & argument structure",
    },
    {
      label: "Leadership & Initiative",
      value: leadership,
      max: 100,
      percentage: leadership,
      subtext: leadership >= 80 ? "Proactive floor claiming & steering" : "Balanced initiative & synthesis",
    },
    {
      label: "Active Listening",
      value: listening,
      max: 100,
      percentage: listening,
      subtext: listening >= 80 ? "High empathy & smooth yields" : "Constructive rebuttal & build-ons",
    },
    {
      label: "Critical Thinking",
      value: criticalThinking,
      max: 100,
      percentage: criticalThinking,
      subtext: criticalThinking >= 80 ? "Data driven & empirical depth" : "Logical reasoning & clear framing",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-24 selection:bg-[#2563EB] selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Standardized Result Header */}
        <ResultHeader
          badge="GD PERFORMANCE AUDIT"
          badgeVariant="brand"
          title={session.topic}
          subtitle="Evaluated against corporate assessment center rubrics across 4 foundational competencies: Articulation, Leadership, Active Listening, and Critical Thinking."
          roleOrTopic={session.category || "General Discussion"}
          difficulty={`${session.difficulty || "mid"} difficulty`}
          duration={`${session.durationMinutes || 10}m`}
          backTo="/gd"
          backLabel="Back to GD Hub"
          date={session.createdAt ? new Date(session.createdAt).toLocaleDateString() : undefined}
          extraActions={
            <ReportDownload
              onDownload={handleDownloadPdf}
              label="Download PDF"
              size="sm"
            />
          }
        />

        {/* 2. Prominent Score Summary */}
        <ScoreSummary
          score={overallScore}
          maxScore={100}
          scoreLabel="Overall Discussion Benchmark"
          tier={tierTitle}
          tierDescription={`Scored across ${totalTurns} deliberation turns with 3 AI peer agents and central orchestrator.`}
          progressPercentage={overallScore}
        />

        {/* 3. 4-Pillar Evaluation Matrix */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#38BDF8]">
              Competency Breakdown
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              4-Pillar Evaluation Matrix
            </h3>
          </div>
          <MetricGrid metrics={competencyMetrics} columns={4} />
        </section>

        {/* 4. Speaking & Floor Telemetry */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#38BDF8]">
              Session Telemetry
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Speaking & Floor Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0A0D14] border border-[#1E2B45] p-5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="text-[10px] uppercase font-semibold">Speaking Time</span>
                <Clock size={14} className="text-[#38BDF8]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                {candidateSpeakingFormatted}
              </p>
              <span className="text-xs text-[#38BDF8] font-medium block">
                {floorSharePercentage}% of total discussion
              </span>
            </div>

            <div className="bg-[#0A0D14] border border-[#1E2B45] p-5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="text-[10px] uppercase font-semibold">Your Contributions</span>
                <MessageSquare size={14} className="text-[#22C55E]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                {candidateTurns} Turns
              </p>
              <span className="text-xs text-[#94A3B8] block">
                Balanced intervention frequency
              </span>
            </div>

            <div className="bg-[#0A0D14] border border-[#1E2B45] p-5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="text-[10px] uppercase font-semibold">Total Session Turns</span>
                <Users size={14} className="text-[#A78BFA]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                {totalTurns} Turns
              </p>
              <span className="text-xs text-[#94A3B8] block">
                3 AI Peers + You + Orchestrator
              </span>
            </div>

            <div className="bg-[#0A0D14] border border-[#1E2B45] p-5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="text-[10px] uppercase font-semibold">Floor Shifts</span>
                <Radio size={14} className="text-[#F59E0B]" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                {interruptionsCount} Shifts
              </p>
              <span className="text-xs text-[#22C55E] font-medium block">
                Assertive floor transitions
              </span>
            </div>
          </div>
        </section>

        {/* 5. Qualitative Feedback & Strengths/Improvements */}
        <div className="space-y-6">
          <AIInsight
            label="INTELLIVORA AI SYNTHESIS"
            title="Executive Evaluator Feedback"
            content={detailedFeedback}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrengthList
              title="What You Did Well"
              strengths={strengths.length > 0 ? strengths : [
                "Constructive opening statement framing the debate",
                "Maintained respectful discourse throughout all turns",
                "Articulate and well-paced delivery",
              ]}
            />
            <ImprovementList
              title="Areas for Elevation"
              improvements={improvements.length > 0 ? improvements : [
                "Summarize peer perspectives before introducing counterpoints",
                "Balance talking duration to leave space for collaborative consensus",
                "Introduce concrete empirical case studies or precedents",
              ]}
            />
          </div>
        </div>

        {/* 6. Turn-by-Turn Interventions (If Available) */}
        {turnFeedback && turnFeedback.length > 0 && (
          <section className="space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-[#38BDF8]">
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
                    className="bg-[#0A0D14] border border-[#1E2B45] p-5 rounded-xl space-y-3 shadow-sm"
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
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {fb.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Complete Discussion Transcript */}
        <section className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#141B2D] border border-[#1E2B45] text-[#38BDF8]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#38BDF8]">
                  Full Dialogue Record
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Session Transcript ({transcript.length} Turns)
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTranscript((prev) => !prev)}
              className="px-4 py-2 rounded-xl bg-[#0E131F] hover:bg-[#141B2D] border border-[#1E2B45] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
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
            <div className="space-y-4 pt-4 border-t border-[#161F33]">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTranscriptFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "all"
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#0E131F] text-[#94A3B8] hover:text-white border border-[#1E2B45]"
                  }`}
                >
                  All Turns ({transcript.length})
                </button>
                <button
                  onClick={() => setTranscriptFilter("candidate")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "candidate"
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#0E131F] text-[#94A3B8] hover:text-white border border-[#1E2B45]"
                  }`}
                >
                  Your Turns ({candidateTurns})
                </button>
                <button
                  onClick={() => setTranscriptFilter("ai")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    transcriptFilter === "ai"
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#0E131F] text-[#94A3B8] hover:text-white border border-[#1E2B45]"
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
                          ? "bg-[#062319]/20 border-[#047857]/30"
                          : "bg-[#0E131F] border-[#161F33]"
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeStyle}`}
                          >
                            {speakerName}
                          </span>
                          <span className="text-[#64748B] font-mono">
                            Turn #{turn.turnNumber || idx + 1}
                          </span>
                        </div>
                        {turn.durationSeconds > 0 && (
                          <span className="text-[#94A3B8] font-mono text-[11px]">
                            {turn.durationSeconds}s
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed pl-1">
                        {turn.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 8. Standardized Result Action Bar */}
        <ResultActions
          primaryLabel="Start New GD Simulation"
          primaryIcon={RotateCcw}
          onPrimary={() => navigate("/gd/setup")}
          secondaryLabel="GD Overview"
          onSecondary={() => navigate("/gd")}
          tertiaryLabel="Back to Activity History"
          onTertiary={() => navigate("/history")}
        />
      </main>
    </div>
  );
}
