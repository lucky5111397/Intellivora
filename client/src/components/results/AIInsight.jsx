import React from "react";
import { Sparkles } from "lucide-react";

/**
 * AIInsight
 * Distinctive qualitative analysis layer with restrained violet/cyan accents.
 */
export function AIInsight({
  label = "INTELLIVORA INSIGHT",
  title = "Evaluator Assessment & Synthesis",
  content,
  bullets = [],
  className = "",
}) {
  if (!content && (!bullets || bullets.length === 0)) return null;

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0E131F] via-[#0A0D14] to-[#0A101D] border border-[#2563EB]/30 shadow-xl shadow-black/50 space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#38BDF8]">
        <Sparkles size={14} className="text-[#38BDF8]" />
        <span>{label}</span>
      </div>

      {title && (
        <h3 className="text-base sm:text-lg font-bold text-[#F1F5F9] tracking-tight">
          {title}
        </h3>
      )}

      {content && (
        <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          {content}
        </p>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="space-y-2 pt-1 border-t border-[#1E2B45]/60">
          {bullets.map((b, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-[#94A3B8] leading-relaxed"
            >
              <span className="text-[#38BDF8] mt-1 text-[8px]">•</span>
              <span>{typeof b === "string" ? b : b.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AIInsight;

