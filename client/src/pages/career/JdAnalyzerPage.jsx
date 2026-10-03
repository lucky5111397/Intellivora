import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { analyzeJobDescription } from "../../services/careerApi.js";
import { BackButton } from "@/components/ui";

export default function JdAnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeJobDescription({
        jobDescription,
        resumeText: resumeText.trim() || undefined,
      });
      if (res?.success && res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to analyze Job Description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <BackButton fallback="/" label="Back" />
        </div>

        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" /> Career Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Job Description (JD) Intelligence Analyzer
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
            Paste target role job descriptions to assess skill compatibility, uncover critical keyword gaps,
            and preview tailored technical interview questions.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Target Job Description (JD)
            </label>
            <textarea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description requirements, responsibilities, and qualifications..."
              className="w-full bg-[#06080B] p-4 rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans resize-none"
            />
          </div>

          <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Your Resume / Profile Highlights (Optional)
            </label>
            <textarea
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste specific resume bullet points or leave empty to evaluate against your default profile..."
              className="w-full bg-[#06080B] p-4 rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 leading-relaxed font-sans resize-none"
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || jobDescription.trim().length < 30}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Analyzing Compatibility...
              </>
            ) : (
              <>
                Analyze Compatibility (10 cr) <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Analysis Results Display */}
        {analysis && (
          <div className="space-y-6 pt-6 border-t border-slate-800/80">
            {/* Score Banner */}
            <div className="bg-[#0D121D] rounded-2xl border border-cyan-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  JD Match Rating
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {analysis.matchPercentage}% Compatibility Score
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  {analysis.experienceMatchSummary}
                </p>
              </div>

              <div className="w-24 h-24 rounded-full border-4 border-cyan-500 bg-cyan-500/10 text-cyan-400 flex flex-col items-center justify-center font-extrabold text-2xl shadow-lg shrink-0">
                {analysis.matchPercentage}%
              </div>
            </div>

            {/* Skills Alignment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="bg-[#0D121D] rounded-2xl border border-emerald-500/30 p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Matched Skills & Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(analysis.matchedSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-[#0D121D] rounded-2xl border border-amber-500/30 p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Missing or Weak Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(analysis.missingSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tailored Questions & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Anticipated Interview Questions
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {(analysis.tailoredInterviewQuestions || []).map((q, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-[#06080B] border border-slate-800">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Resume Optimization Advice
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {(analysis.actionableRecommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
