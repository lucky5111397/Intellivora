import React from "react";
import ResumeUploader from "../components/ResumeUploader";
import { Sparkles, Coins } from "lucide-react";
import { BackButton } from "@/components/ui";

function Resume() {
  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/" fallback="/" />
        </div>

        <div className="rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 sm:p-8 shadow-xl shadow-black/40">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                  <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                  ATS Diagnostic Engine
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span className="tabular-nums font-mono">200</span> Credits
                </span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Resume ATS Analysis
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">
                  Upload your PDF resume to evaluate keyword relevance, formatting compatibility, and structural readiness against industry recruiting benchmarks.
                </p>
              </div>
            </div>

            <ResumeUploader />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resume;
