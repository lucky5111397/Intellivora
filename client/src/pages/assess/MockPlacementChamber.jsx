import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Sparkles,
  Code2,
  Users,
  Video,
  ArrowRight,
} from "lucide-react";
import { getPlacementState, submitRound } from "../../services/placementApi.js";

const ROUND_INFO = {
  1: { key: "aptitude", title: "Round 1: Online Aptitude Test", icon: Sparkles, time: "20 min", desc: "Diagnostic test measuring quantitative speed, analytical deduction, and reading comprehension." },
  2: { key: "coding", title: "Round 2: Technical Coding Assessment", icon: Code2, time: "30 min", desc: "Algorithmic problem solving test evaluating data structures and edge case resilience." },
  3: { key: "gd", title: "Round 3: Group Discussion Chamber", icon: Users, time: "15 min", desc: "Multi-agent conversational discussion assessing collaborative leadership and articulation." },
  4: { key: "interview", title: "Round 4: Technical & HR Interview", icon: Video, time: "25 min", desc: "Adaptive final interview assessing domain depth, past projects, and enterprise culture alignment." },
};

export default function MockPlacementChamber() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [simulatedScore, setSimulatedScore] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await getPlacementState(id);
        if (res?.success && res.data) {
          setSession(res.data);
          if (res.data.overallStatus === "hired" || (res.data.overallStatus === "completed" && res.data.currentRound === 4)) {
            navigate(`/assess/placement/${id}/report`, { replace: true });
          }
        }
      } catch (err) {
        console.error("Failed to load placement session:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [id, navigate]);

  const handleSubmitRound = async () => {
    if (!session) return;
    setIsSubmitting(true);
    setRoundFeedback(null);
    try {
      const res = await submitRound(id, session.currentRound, {
        score: Number(simulatedScore),
        details: { completedSimulated: true },
      });

      if (res?.success && res.data) {
        setSession(res.data);
        if (Number(simulatedScore) >= 60) {
          if (session.currentRound === 4) {
            navigate(`/assess/placement/${id}/report`);
          } else {
            setRoundFeedback({
              type: "success",
              message: `Congratulations! Round ${session.currentRound} cleared with ${simulatedScore}%. Advancing to Round ${session.currentRound + 1}.`,
            });
          }
        } else {
          setRoundFeedback({
            type: "fail",
            message: `Score of ${simulatedScore}% did not meet the 60% qualification cutoff. Candidate eliminated from this placement drive.`,
          });
        }
      }
    } catch (err) {
      setRoundFeedback({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to submit round result.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Session not found</h2>
        <Link to="/assess/placement" className="text-cyan-400 hover:underline text-sm">
          Return to Placement Setup
        </Link>
      </div>
    );
  }

  const currentInfo = ROUND_INFO[session.currentRound] || ROUND_INFO[1];
  const CurrentIcon = currentInfo.icon;
  const isEliminated = session.overallStatus === "failed_round";

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Drive Header */}
        <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Placement Simulation in Progress
            </div>
            <h1 className="text-2xl font-bold text-white">
              {session.targetCompany} &bull; {session.targetRole}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
              isEliminated
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {isEliminated ? "Eliminated" : `Round ${session.currentRound} Active`}
            </span>
          </div>
        </div>

        {/* 4-Step Pipeline Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((step) => {
            const stepInfo = ROUND_INFO[step];
            const roundRes = session.roundResults?.[stepInfo.key];
            const isCompleted = roundRes?.passed;
            const isFailed = roundRes && !roundRes.passed;
            const isCurrent = session.currentRound === step && !isEliminated;

            return (
              <div
                key={step}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isFailed
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-[#0D121D] border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isFailed ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <span className="text-xs font-bold">Round {step}</span>
                  )}
                </div>
                <span className="text-[11px] font-semibold block truncate">
                  {stepInfo.key.toUpperCase()}
                </span>
                {roundRes?.score !== undefined && (
                  <span className="text-[10px] block opacity-80">{roundRes.score}%</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Round Stage Box */}
        {isEliminated ? (
          <div className="bg-[#0D121D] rounded-2xl border border-rose-500/30 p-8 text-center space-y-4">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Placement Drive Not Cleared</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              You did not meet the minimum 60% qualification cutoff in this round.
              Review your diagnostics and attempt a new drive when prepared.
            </p>
            <div className="pt-2">
              <Link
                to="/assess/placement"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg"
              >
                Start New Placement Drive
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Current Stage</span>
                <h3 className="text-xl font-bold text-white">{currentInfo.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentInfo.desc}</p>
              </div>
            </div>

            {roundFeedback && (
              <div className={`p-4 rounded-xl text-xs ${
                roundFeedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}>
                {roundFeedback.message}
              </div>
            )}

            {/* Assessment Simulation Control */}
            <div className="bg-[#06080B] p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">
                  Candidate Round Assessment Simulation
                </span>
                <span className="text-amber-400 font-bold">Cutoff: 60%</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">
                  Simulate Candidate Performance Score (0 - 100%):
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simulatedScore}
                    onChange={(e) => setSimulatedScore(e.target.value)}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="font-mono font-bold text-lg text-cyan-400 w-12 text-right">
                    {simulatedScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmitRound}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Evaluating Round...
                  </>
                ) : (
                  <>
                    Submit Round Assessment <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
