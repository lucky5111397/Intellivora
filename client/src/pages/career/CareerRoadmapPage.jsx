import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Circle,
  Code2,
} from "lucide-react";
import { getRoadmap, generateRoadmap, updateMilestone } from "../../services/careerApi.js";

export default function CareerRoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState("Full Stack Engineer");
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRoadmap() {
      setLoading(true);
      try {
        const res = await getRoadmap();
        if (res?.success && res.data) {
          setRoadmap(res.data);
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateRoadmap({
        targetRole,
        currentSkillLevel: skillLevel,
        targetTimelineWeeks: Number(timelineWeeks),
      });
      if (res?.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId, currentCompleted) => {
    try {
      const res = await updateMilestone(milestoneId, !currentCompleted);
      if (res?.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      console.error("Failed to update milestone:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Career Trajectory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalized Career Preparation Roadmap
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
            Structured week-by-week curriculum calibrated to your target engineering role,
            integrating hands-on algorithmic and architectural milestones.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* If no roadmap, show generator setup */}
        {!roadmap ? (
          <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-8 space-y-6 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Configure Your Target Roadmap
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-400">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#06080B] p-3 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">Current Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-[#06080B] p-3 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">Timeline (Weeks)</label>
                  <select
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(e.target.value)}
                    className="w-full bg-[#06080B] p-3 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={4}>4 Weeks (Intensive)</option>
                    <option value={8}>8 Weeks (Standard)</option>
                    <option value={12}>12 Weeks (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !targetRole.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm shadow-xl transition-all disabled:opacity-50 mt-4"
              >
                {isGenerating ? "Generating Roadmap..." : "Generate Personalized Roadmap"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress Header Card */}
            <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Active Roadmap
                </span>
                <h2 className="text-2xl font-bold text-white">
                  {roadmap.targetRole} ({roadmap.targetTimelineWeeks} Weeks)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Weekly commitment: ~{roadmap.weeklyCommitmentHours || 10} hours &bull; {roadmap.currentSkillLevel} tier
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Completed</span>
                  <span className="text-2xl font-extrabold text-cyan-400">{roadmap.overallProgress || 0}%</span>
                </div>
                <button
                  onClick={() => setRoadmap(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Configure New
                </button>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                Milestones & Weekly Curriculum
              </h3>

              <div className="space-y-4">
                {(roadmap.milestones || []).map((m) => (
                  <div
                    key={m._id}
                    className={`bg-[#0D121D] rounded-2xl border p-6 transition-all ${
                      m.completed
                        ? "border-emerald-500/30 bg-emerald-950/5"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleMilestone(m._id, m.completed)}
                          className="mt-1 text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-base font-bold ${m.completed ? "line-through text-slate-400" : "text-white"}`}>
                            {m.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>

                          {/* Topics */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(m.topics || []).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Suggested Problems */}
                          {m.suggestedProblems?.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
                              <span className="text-slate-500 font-semibold flex items-center gap-1">
                                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Suggested Practice:
                              </span>
                              {m.suggestedProblems.map((prob) => (
                                <Link
                                  key={prob}
                                  to={`/prepare/dsa/${prob}`}
                                  className="text-cyan-400 hover:underline font-mono"
                                >
                                  {prob} &rarr;
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
