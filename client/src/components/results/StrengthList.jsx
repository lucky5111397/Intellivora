import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * StrengthList
 * Displays "What you did well" with subtle green semantic indicators.
 */
export function StrengthList({
  title = "What You Did Well",
  strengths = [],
  className = "",
}) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#0D2818] border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
          <CheckCircle2 size={14} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#F1F5F9] tracking-tight">
          {title}
        </h3>
      </div>

      <ul className="space-y-2.5">
        {strengths.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed"
          >
            <span className="text-[#22C55E] mt-0.5 shrink-0 font-bold">✓</span>
            <span>{typeof item === "string" ? item : item.text || item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StrengthList;

