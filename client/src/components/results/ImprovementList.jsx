import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * ImprovementList
 * Displays "Where to improve" with clean numbered badges and actionable explanations.
 */
export function ImprovementList({
  title = "Where to Improve",
  improvements = [],
  className = "",
}) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#2D1B0D] border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
          <AlertCircle size={14} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#F1F5F9] tracking-tight">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {improvements.map((item, index) => {
          const numStr = String(index + 1).padStart(2, "0");
          const isString = typeof item === "string";
          const heading = isString ? null : item.title || item.heading;
          const body = isString ? item : item.description || item.text;

          return (
            <div
              key={index}
              className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0E131F] border border-[#161F33]"
            >
              <span className="px-2 py-0.5 rounded bg-[#141B2D] border border-[#1E2B45] text-xs font-mono font-bold text-[#F59E0B] shrink-0">
                {numStr}
              </span>

              <div className="space-y-0.5 min-w-0">
                {heading && (
                  <h4 className="text-xs font-semibold text-[#F1F5F9]">
                    {heading}
                  </h4>
                )}
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImprovementList;

