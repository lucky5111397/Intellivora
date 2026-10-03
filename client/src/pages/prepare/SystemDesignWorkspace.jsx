import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Save,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import {
  getSystemDesignProblemBySlug,
  getSystemDesignAttempt,
  saveSystemDesignDraft,
  evaluateSystemDesign,
} from "../../services/systemDesignApi.js";

export default function SystemDesignWorkspace() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requirements"); // requirements, estimations, architecture, data, tradeoffs, evaluation
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form notes state
  const [notes, setNotes] = useState({
    functionalRequirements: "",
    nonFunctionalRequirements: "",
    estimations: "",
    highLevelArchitecture: "",
    dataStorage: "",
    apiDesign: "",
    tradeOffsAndBottlenecks: "",
  });

  useEffect(() => {
    async function loadWorkspace() {
      setLoading(true);
      try {
        const [probRes, attRes] = await Promise.allSettled([
          getSystemDesignProblemBySlug(slug),
          getSystemDesignAttempt(slug),
        ]);

        if (probRes.status === "fulfilled" && probRes.value?.success) {
          setProblem(probRes.value.data);
        }

        if (attRes.status === "fulfilled" && attRes.value?.success && attRes.value.data) {
          const att = attRes.value.data;
          setNotes((prev) => ({ ...prev, ...(att.architecturalNotes || {}) }));
          if (att.rubricScores?.totalScore) {
            setEvalResult(att);
          }
        }
      } catch (err) {
        console.error("Workspace load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, [slug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);
    try {
      const res = await saveSystemDesignDraft(slug, {
        architecturalNotes: notes,
      });
      if (res?.success) {
        setSaveMessage("Draft saved successfully.");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setErrorMessage(null);
    try {
      const res = await evaluateSystemDesign(slug, {
        architecturalNotes: notes,
      });
      if (res?.success && res.data) {
        setEvalResult(res.data);
        setActiveTab("evaluation");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Evaluation failed. Please verify credit balance.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Problem not found</h2>
        <Link to="/prepare/system-design" className="text-cyan-400 hover:underline text-sm">
          Return to System Design Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0A0E17] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/prepare/system-design"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" /> Catalog
          </Link>
          <span className="text-slate-600">|</span>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
            {problem.title}
          </h2>
          <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium">{saveMessage}</span>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isSaving || isEvaluating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" /> {isEvaluating ? "Evaluating..." : "Evaluate Architecture (15 cr)"}
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Specification Sidebar */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-[#0A0E17]/60 p-6 overflow-y-auto space-y-6 text-sm">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>
          </div>

          {/* Scale Targets */}
          {problem.systemDesignMetadata?.scaleRequirements && (
            <div className="space-y-2 p-4 rounded-xl bg-[#06080B] border border-slate-800 text-xs">
              <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[10px]">
                Target Scale & Throughput:
              </span>
              {Object.entries(problem.systemDesignMetadata.scaleRequirements).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-slate-800/60 last:border-none">
                  <span className="text-slate-400 uppercase text-[10px]">{k}:</span>
                  <span className="text-slate-200 font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Functional Requirements */}
          {problem.systemDesignMetadata?.functionalRequirements?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Functional Requirements
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {problem.systemDesignMetadata.functionalRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Non-Functional Requirements */}
          {problem.systemDesignMetadata?.nonFunctionalRequirements?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Non-Functional Requirements
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {problem.systemDesignMetadata.nonFunctionalRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Editor Pane */}
        <div className="lg:col-span-8 flex flex-col bg-[#06080B] overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-[#0A0E17] text-xs font-medium overflow-x-auto">
            {[
              { id: "requirements", label: "Requirements" },
              { id: "estimations", label: "Estimations" },
              { id: "architecture", label: "High-Level Architecture" },
              { id: "data", label: "Data Storage & Schema" },
              { id: "tradeoffs", label: "Trade-offs & Resilience" },
              ...(evalResult ? [{ id: "evaluation", label: "AI Evaluation Scorecard" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-400 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === "requirements" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Functional Requirements & Use Cases:
                  </label>
                  <textarea
                    rows={6}
                    value={notes.functionalRequirements}
                    onChange={(e) => setNotes({ ...notes, functionalRequirements: e.target.value })}
                    placeholder="List candidate use cases: e.g. 1. Users can submit requests... 2. Rate limiter checks IP..."
                    className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Non-Functional Requirements (Latency, HA, CAP):
                  </label>
                  <textarea
                    rows={4}
                    value={notes.nonFunctionalRequirements}
                    onChange={(e) => setNotes({ ...notes, nonFunctionalRequirements: e.target.value })}
                    placeholder="e.g. Sub-millisecond overhead, 99.99% availability, graceful degradation..."
                    className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                  />
                </div>
              </div>
            )}

            {activeTab === "estimations" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Scale, QPS & Memory Footprint Estimations:
                </label>
                <textarea
                  rows={12}
                  value={notes.estimations}
                  onChange={(e) => setNotes({ ...notes, estimations: e.target.value })}
                  placeholder="Back-of-the-envelope calculations:&#10;- Daily Active Users (DAU) = 50 Million&#10;- Requests per second (QPS) = (50M * 50) / 86400 ≈ 29,000 peak QPS&#10;- Memory storage = 50M keys * 20 bytes ≈ 1 GB Redis RAM"
                  className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                />
              </div>
            )}

            {activeTab === "architecture" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    High-Level Component Architecture (Flow & Component Description):
                  </label>
                  <textarea
                    rows={8}
                    value={notes.highLevelArchitecture}
                    onChange={(e) => setNotes({ ...notes, highLevelArchitecture: e.target.value })}
                    placeholder="Describe components: Client -> API Gateway (Envoy) -> Rate Limiter Filter -> Redis Cluster (Sliding Window / Token Bucket) -> Backend Microservices"
                    className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    API Endpoint Contracts:
                  </label>
                  <textarea
                    rows={4}
                    value={notes.apiDesign}
                    onChange={(e) => setNotes({ ...notes, apiDesign: e.target.value })}
                    placeholder="POST /api/v1/resource&#10;Headers: X-RateLimit-Limit: 100, X-RateLimit-Remaining: 98, X-RateLimit-Reset: 1620000000"
                    className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Data Modeling, Storage Engines & Partitioning Strategy:
                </label>
                <textarea
                  rows={12}
                  value={notes.dataStorage}
                  onChange={(e) => setNotes({ ...notes, dataStorage: e.target.value })}
                  placeholder="e.g.&#10;- Fast Path: Redis in-memory key-value store using Hash or Sorted Set for Sliding Window. Key: user_id:window_minute&#10;- Sharding Key: Hash(user_id) distributed across Redis Cluster nodes&#10;- Persistent Tier: PostgreSQL for long-term customer quota configurations."
                  className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
              </div>
            )}

            {activeTab === "tradeoffs" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Trade-offs, Single Points of Failure & Resilience:
                </label>
                <textarea
                  rows={12}
                  value={notes.tradeOffsAndBottlenecks}
                  onChange={(e) => setNotes({ ...notes, tradeOffsAndBottlenecks: e.target.value })}
                  placeholder="Address:&#10;1. CAP Theorem choice: Choose Availability over strict Consistency (AP) — in case of Redis partition, fail open rather than dropping valid client traffic.&#10;2. Race conditions: Atomic Redis Lua scripts prevent read-modify-write concurrency errors.&#10;3. SPOF elimination: Multi-region Redis Sentinel with automatic failover."
                  className="w-full bg-[#0D121D] p-4 rounded-xl border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                />
              </div>
            )}

            {activeTab === "evaluation" && evalResult && (
              <div className="space-y-6">
                {/* Score Header */}
                <div className="p-6 rounded-2xl bg-[#0D121D] border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Architectural Evaluation
                    </span>
                    <h3 className="text-xl font-bold text-white">System Design Scorecard</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-lg">
                      {evalResult.feedback?.summary || "Comprehensive architectural assessment."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-extrabold text-cyan-400">
                      {evalResult.rubricScores?.totalScore || 0}
                    </span>
                    <span className="text-slate-500 text-sm">/ 100</span>
                  </div>
                </div>

                {/* 4 Rubric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Completeness", score: evalResult.rubricScores?.architecturalCompleteness || 0 },
                    { label: "Scaling", score: evalResult.rubricScores?.scalingCorrectness || 0 },
                    { label: "Data Design", score: evalResult.rubricScores?.dataDesign || 0 },
                    { label: "Trade-offs", score: evalResult.rubricScores?.tradeOffAnalysis || 0 },
                  ].map((rub) => (
                    <div key={rub.label} className="p-4 rounded-xl bg-[#0D121D] border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">{rub.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{rub.score}</span>
                        <span className="text-xs text-slate-500">/ 25</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-[#0D121D] border border-emerald-500/30 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Architectural Strengths
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                      {(evalResult.feedback?.strengths || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl bg-[#0D121D] border border-amber-500/30 space-y-3">
                    <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Scaling Recommendations
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                      {(evalResult.feedback?.scalingRecommendations || evalResult.feedback?.improvementAreas || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
