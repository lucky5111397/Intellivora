import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building,
  ArrowRight,
  Sparkles,
  Users,
  Code2,
  Video,
} from "lucide-react";
import { startPlacementDrive } from "../../services/placementApi.js";

const POPULAR_COMPANIES = ["Google", "Amazon", "Meta", "Microsoft", "TCS", "Infosys", "Wipro", "Uber"];

const PIPELINE_ROUNDS = [
  { num: 1, name: "Online Aptitude Round", icon: Sparkles, cutoff: "60%", desc: "Quantitative, logical reasoning, and verbal aptitude tests." },
  { num: 2, name: "Technical Coding Round", icon: Code2, cutoff: "60%", desc: "Algorithmic problem solving and edge case execution." },
  { num: 3, name: "AI Group Discussion", icon: Users, cutoff: "60%", desc: "Multi-agent conversational discussion on current tech and business topics." },
  { num: 4, name: "Technical & HR Interview", icon: Video, cutoff: "60%", desc: "Adaptive real-time interview evaluating correctness, communication, and confidence." },
];

export default function MockPlacementSetup() {
  const navigate = useNavigate();
  const [targetCompany, setTargetCompany] = useState("Google");
  const [targetRole, setTargetRole] = useState("Software Development Engineer");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await startPlacementDrive({ targetCompany, targetRole });
      if (res?.success && res.data) {
        navigate(`/assess/placement/${res.data._id}`, {
          state: { session: res.data },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to start placement drive.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" /> Full Simulation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Mock Placement Drive
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Experience the complete, proctored 4-round hiring pipeline replicating on-campus
            and off-campus placement drives at top tech enterprises.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Company & Role Configuration */}
        <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" /> Target Enterprise & Role
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Target Company</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-[#06080B] p-3 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {POPULAR_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer, Frontend Engineer"
                className="w-full bg-[#06080B] p-3 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 4-Round Pipeline Structure */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider text-xs">
            Hiring Assessment Pipeline (Must pass each round to advance)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PIPELINE_ROUNDS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.num} className="bg-[#0D121D] p-5 rounded-xl border border-slate-800 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">Round {r.num}</span>
                      <span className="text-xs font-bold text-amber-400">Cutoff: {r.cutoff}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{r.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleStart}
            disabled={isStarting || !targetRole.trim()}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Initializing Placement Drive...
              </>
            ) : (
              <>
                Begin Round 1: Aptitude Screening <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
