import React from "react";
import { Compass } from "lucide-react";

/**
 * RecommendationList
 * Displays "Recommended next steps" with structured action items.
 */
export function RecommendationList({
  title = "Recommended Next Steps",
  recommendations = [],
  className = "",
}) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#0D1E3A] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
          <Compass size={14} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#F1F5F9] tracking-tight">
          {title}
        </h3>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, index) => {
          const numStr = String(index + 1).padStart(2, "0");
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#0E131F] border border-[#161F33] hover:border-[#2563EB]/30 transition-colors"
            >
              <span className="px-2 py-0.5 rounded bg-[#141B2D] border border-[#1E2B45] text-xs font-mono font-bold text-[#38BDF8] shrink-0">
                {numStr}
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed self-center">
                {typeof rec === "string" ? rec : rec.text || rec.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendationList;

