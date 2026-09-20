import React from "react";
import { Badge } from "@/components/ui";

/**
 * ScoreSummary
 * Prominent score presentation answering "How did I perform?" and "What does it mean?"
 */
export function ScoreSummary({
  score,
  maxScore = 100,
  scoreLabel = "Overall Performance",
  tier,
  tierDescription,
  progressPercentage,
  className = "",
}) {
  const percentage =
    progressPercentage ??
    (typeof score === "number" && maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);

  const getTierVariant = (pct) => {
    if (pct >= 80) return "success";
    if (pct >= 60) return "brand";
    return "danger";
  };

  const tierVariant = getTierVariant(percentage);

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] shadow-xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`}
    >
      {/* Left: Score & Tier */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono font-semibold">
          {scoreLabel}
        </span>

        <div className="flex items-baseline gap-3">
          <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono text-[#F1F5F9] tabular-nums tracking-tight">
            {score}
          </span>
          <span className="text-sm sm:text-base font-mono text-[#64748B]">
            / {maxScore}
          </span>

          {tier && (
            <Badge variant={tierVariant} size="md" className="ml-2">
              {tier}
            </Badge>
          )}
        </div>

        {tierDescription && (
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl leading-relaxed">
            {tierDescription}
          </p>
        )}
      </div>

      {/* Right: Progress Indicator */}
      <div className="w-full md:w-64 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#94A3B8]">Proficiency</span>
          <span className="text-[#38BDF8] font-bold tabular-nums">
            {percentage}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#141B2D] rounded-full overflow-hidden border border-[#1E2B45]/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percentage >= 80
                ? "bg-gradient-to-r from-[#2563EB] to-[#22C55E]"
                : percentage >= 60
                ? "bg-gradient-to-r from-[#2563EB] to-[#38BDF8]"
                : "bg-gradient-to-r from-[#EF4444] to-[#F59E0B]"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ScoreSummary;

