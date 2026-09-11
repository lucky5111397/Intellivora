import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Brain,
  Users,
  Clock,
  Mic,
  Lightbulb,
  Coins,
  AlertCircle,
  ShieldAlert,
  Sliders,
  LogIn,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useGD } from "../context/gdContext";
import {
  VALID_CATEGORIES,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  getTopicsByCategory,
  validateGDSetupForm,
} from "../data/gdTopicsData";
import { toast } from "sonner";

const GD_CREDIT_COST = 150;

export default function GDSetup() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const { initSession, loading, error, clearError } = useGD();

  // Authentication state
  const isAuthenticated = Boolean(userData);

  // Configuration Form State
  const [selectedCategory, setSelectedCategory] = useState("Technology & AI");
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("mid");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [formErrors, setFormErrors] = useState({});

  // Credit calculation (authenticated users only)
  const userCredits = userData?.credits ?? 0;
  const hasSufficientCredits = isAuthenticated && userCredits >= GD_CREDIT_COST;

  // Active topic resolution
  const topicsForCategory = useMemo(() => {
    return getTopicsByCategory(selectedCategory);
  }, [selectedCategory]);

  const activeCuratedTopic = topicsForCategory[currentTopicIndex % topicsForCategory.length] || {
    id: "custom",
    title: "",
    focus: "Custom topic prompt provided by candidate.",
    benchmark: "Custom Deliberation",
  };

  const resolvedTopicTitle =
    selectedCategory === "Custom" ? customTopic : activeCuratedTopic.title;

  // Cycle topic within category
  const handleShuffleTopic = () => {
    if (selectedCategory === "Custom") return;
    setCurrentTopicIndex((prev) => (prev + 1) % topicsForCategory.length);
    setFormErrors((prev) => ({ ...prev, topic: undefined }));
  };

  // Category change
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentTopicIndex(0);
    setFormErrors({});
    clearError();
  };

  // Submission handler
  const handleEnterChamber = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to start a Group Discussion.");
      navigate("/auth");
      return;
    }

    if (!hasSufficientCredits) {
      toast.error("Insufficient credits. Please top up your balance to start this simulation.");
      return;
    }

    const validation = validateGDSetupForm({
      topic: resolvedTopicTitle,
      category: selectedCategory,
      difficulty,
      durationMinutes,
      maxTurns: 30,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError || "Please check the discussion parameters.");
      return;
    }

    setFormErrors({});
    clearError();

    try {
      const response = await initSession({
        topic: resolvedTopicTitle.trim(),
        category: selectedCategory,
        difficulty,
        durationMinutes,
        maxTurns: 30,
      });

      const targetSessionId = response.sessionId || response.session?._id;
      if (targetSessionId) {
        toast.success("Discussion chamber configured. Entering lobby...");
        navigate(`/gd/lobby/${targetSessionId}`);
      } else {
        throw new Error("Invalid session response received from server.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to initialize GD session.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Top Standard Navigation */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Breadcrumb & Stage Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/gd"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors shadow-sm border border-white/10"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <Link to="/gd" className="hover:text-slate-200 transition-colors">
                Simulation Workspace
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-indigo-400 font-semibold uppercase tracking-wider text-xs">
                GD Configuration Stage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">Autonomous Orchestrator Online</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/[0.04] text-slate-400 text-xs tracking-wider uppercase font-semibold border border-white/[0.08]">
              Step 01 / 03
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
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

        {/* Two-Column Setup Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================
              LEFT COLUMN: CONFIGURATION (Cols 1-7)
              ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Header */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Session Parameters
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 font-family-jakarta">
                Build Your Discussion
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Customize discussion topic, peer cohort rigor, and session duration.
              </p>
            </div>

            {/* SECTION 01: CHOOSE TOPIC */}
            <div className="bg-[#0f1422] rounded-2xl p-6 shadow-sm border border-white/[0.06] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <span className="text-base font-semibold text-white font-family-jakarta">
                    01 · Choose Topic
                  </span>
                </div>

                {selectedCategory !== "Custom" && (
                  <button
                    type="button"
                    onClick={handleShuffleTopic}
                    className="px-3 py-1 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Shuffle Topic</span>
                  </button>
                )}
              </div>

              {/* Category Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {VALID_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Selected Topic Display or Custom Textarea */}
              {selectedCategory === "Custom" ? (
                <div className="flex flex-col gap-2 mt-1">
                  <label htmlFor="custom-topic-input" className="text-xs text-slate-400 font-medium">
                    Enter Custom Discussion Topic (5 to 300 characters):
                  </label>
                  <textarea
                    id="custom-topic-input"
                    rows={4}
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      if (formErrors.topic) {
                        setFormErrors((prev) => ({ ...prev, topic: undefined }));
                      }
                    }}
                    placeholder="e.g., Should central banks replace physical cash with sovereign digital currencies? Discuss financial privacy, offline resilience, and cross-border settlement."
                    maxLength={300}
                    className="w-full rounded-xl bg-[#080c16] border border-white/10 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>{formErrors.topic && <span className="text-rose-400">{formErrors.topic}</span>}</span>
                    <span>{customTopic.length} / 300</span>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-[#0a0f1c] rounded-xl p-4 border border-white/[0.08] shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] uppercase font-bold tracking-wide">
                          {selectedCategory}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {activeCuratedTopic.benchmark}
                        </span>
                      </div>
                      <div className="text-base font-semibold text-white leading-snug font-family-jakarta">
                        {activeCuratedTopic.title}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Focus:</strong> {activeCuratedTopic.focus}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleShuffleTopic}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium transition-colors border border-white/10 shadow-sm"
                      title="Next Curated Topic"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 02: DIFFICULTY ARCHITECTURE */}
            <div className="bg-[#0f1422] rounded-2xl p-6 shadow-sm border border-white/[0.06] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span className="text-base font-semibold text-white font-family-jakarta">
                    02 · Difficulty
                  </span>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Adaptive Rigor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDifficulty(opt.id)}
                      className={`relative flex flex-col text-left p-4 rounded-xl transition-all shadow-sm group border ${
                        isSelected
                          ? "bg-[#141b2e] border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40"
                          : "bg-[#0a0f1c] hover:bg-[#111728] border-white/[0.06]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-wide">
                          Selected
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {opt.shortLabel}
                        </span>
                        {!isSelected && (
                          <span className="text-[11px] text-slate-500 font-mono font-semibold">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] mb-1.5 uppercase font-semibold tracking-wider ${opt.accentColor}`}>
                        {opt.subBadge}
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {opt.description}
                      </p>
                      {isSelected && (
                        <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full ${
                              opt.id === "entry"
                                ? "bg-emerald-400 w-1/3"
                                : opt.id === "mid"
                                ? "bg-indigo-500 w-2/3"
                                : "bg-rose-400 w-full"
                            }`}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 03 & 04: PARTICIPANTS & DURATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section 03: Participants */}
              <div className="bg-[#0f1422] rounded-2xl p-6 shadow-sm border border-white/[0.06] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-white font-family-jakarta">
                      03 · Participants
                    </span>
                  </div>
                  <span className="text-xs text-indigo-400 font-bold">4 Seats</span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-center">
                  <span className="block text-xl font-bold text-white">3 AI Peers</span>
                  <span className="block text-xs text-indigo-300 mt-0.5 font-medium">
                    + You (Candidate)
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fixed benchmark panel: 3 distinct multi-agent personas mirroring campus and corporate GD rounds.
                </p>
              </div>

              {/* Section 04: Duration */}
              <div className="bg-[#0f1422] rounded-2xl p-6 shadow-sm border border-white/[0.06] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-white font-family-jakarta">
                      04 · Duration
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">Standard: 10m</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((dur) => {
                    const isSelected = durationMinutes === dur.minutes;
                    return (
                      <button
                        key={dur.minutes}
                        type="button"
                        onClick={() => setDurationMinutes(dur.minutes)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400"
                            : "bg-[#0a0f1c] hover:bg-[#111728] text-slate-300 border border-white/[0.06]"
                        }`}
                      >
                        <span className="block text-base font-bold">{dur.minutes}</span>
                        <span
                          className={`block text-[10px] mt-0.5 font-medium ${
                            isSelected ? "text-indigo-100 font-semibold" : "text-slate-400"
                          }`}
                        >
                          min ({dur.subLabel})
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Balanced discussion tempo with opening remarks, core debate, and candidate summary.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: ELEVATED DISCUSSION BLUEPRINT (Cols 8-12)
              ======================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-5">
            <div className="bg-[#0f1422] rounded-2xl p-6 shadow-xl relative overflow-hidden border border-white/[0.08]">
              {/* Ambient Glow Accent */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Blueprint Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs uppercase tracking-widest text-slate-300 font-bold font-family-jakarta">
                    Discussion Blueprint
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to Compile
                </span>
              </div>

              {/* Topic Showcase Card */}
              <div className="bg-[#0a0f1c] rounded-xl p-4 shadow-sm mb-4 border border-white/[0.06]">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  Assigned Deliberation
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug font-family-jakarta line-clamp-3">
                  {resolvedTopicTitle || "Select or enter a discussion topic..."}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-indigo-300 text-[10px] font-semibold">
                    {selectedCategory}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-emerald-300 text-[10px]">
                    {difficulty === "executive" ? "Hard" : difficulty === "entry" ? "Easy" : "Medium"} Rigor
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 text-[10px]">
                    4 Seats (3 AI + You)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-sky-300 text-[10px]">
                    {durationMinutes} Minutes
                  </span>
                </div>
              </div>

              {/* Cohort Roster Preview */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between px-1 mb-0.5">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                    Cohort Roster
                  </span>
                  <span className="text-[11px] text-slate-500">4 Active Voices</span>
                </div>

                {/* You (Candidate) */}
                <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold text-xs">
                      YOU
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-300">You (Candidate)</span>
                      <span className="text-[11px] text-slate-400">Floor Lead · Active Evaluated Voice</span>
                    </div>
                  </div>
                  <Mic className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Agent 1 — Analytical */}
                <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0f1c] border border-white/[0.06] shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1b2238] text-indigo-400 border border-white/10 flex items-center justify-center font-bold text-xs">
                      A1
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Agent 1</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-medium">
                          Analytical
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Quantitative &amp; Econometric Focus</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full" />
                    <span className="w-0.5 h-3 bg-indigo-400 rounded-full" />
                    <span className="w-0.5 h-2 bg-indigo-400 rounded-full" />
                  </div>
                </div>

                {/* Agent 2 — Confident */}
                <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0f1c] border border-white/[0.06] shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-950/60 text-emerald-400 border border-white/10 flex items-center justify-center font-bold text-xs">
                      A2
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Agent 2</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-medium">
                          Confident
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Policy, Consensus &amp; Strategic Pivot</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full" />
                    <span className="w-0.5 h-1 bg-emerald-400 rounded-full" />
                    <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full" />
                  </div>
                </div>

                {/* Agent 3 — Critical Thinker */}
                <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0f1c] border border-white/[0.06] shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-950/60 text-sky-400 border border-white/10 flex items-center justify-center font-bold text-xs">
                      A3
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">Agent 3</span>
                        <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 text-[10px] font-medium">
                          Critical Thinker
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Contrarian &amp; Edge-Case Stress Testing</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-1 bg-sky-400 rounded-full" />
                    <span className="w-0.5 h-2 bg-sky-400 rounded-full" />
                    <span className="w-0.5 h-1 bg-sky-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Credit Cost Guard / Authentication Guard */}
              {!isAuthenticated ? (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                      <LogIn className="w-4 h-4 text-indigo-400" />
                      <span>Authentication Required</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{GD_CREDIT_COST} Credits / Session</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    You must be signed in to configure discussion parameters and enter the simulation chamber.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="mt-1 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>Sign In to Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold">Session Simulation Cost</span>
                    </div>
                    <span className="font-bold text-white text-sm">{GD_CREDIT_COST} Credits</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                    <span className="text-slate-400">Your Available Balance</span>
                    <span
                      className={`font-semibold ${
                        hasSufficientCredits ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {userCredits} Credits
                    </span>
                  </div>

                  {!hasSufficientCredits && (
                    <div className="mt-1 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Insufficient Credits</span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 leading-tight">
                        You need at least {GD_CREDIT_COST} credits to enter the discussion chamber.
                      </p>
                      <Link
                        to="/pricing"
                        className="mt-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                      >
                        <span>Top Up Credits</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Primary CTA Button */}
              <div className="flex flex-col gap-2">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 border border-white/10 active:scale-[0.99] cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Start Discussion</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnterChamber}
                    disabled={loading || !hasSufficientCredits}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
                      loading || !hasSufficientCredits
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 border border-white/10 cursor-pointer"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Initializing Chamber...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Discussion Chamber</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px] pt-1">
                  <span>Session encrypted · Real-time multi-agent speech synthesis</span>
                </div>
              </div>
            </div>

            {/* Evaluator Pro-Tip Card */}
            <div className="bg-[#0f1422] rounded-xl p-4 shadow-sm flex items-start gap-3 border border-white/[0.06]">
              <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white font-family-jakarta">
                  Campus GD Evaluator Pro-Tip
                </span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Establish a clear analytical framing within the first 60 seconds. In Medium difficulty,
                  Agent 1 and Agent 2 will yield the floor if you initiate with empirical proof or structured trade-offs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
