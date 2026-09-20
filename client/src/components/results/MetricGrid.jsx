import React from "react";

/**
 * MetricGrid
 * Renders structured supporting metrics (e.g. Reasoning, Communication, Articulation, Accuracy).
 */
export function MetricGrid({ metrics = [], columns = 4, className = "" }) {
  if (!metrics || metrics.length === 0) return null;

  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colStyles[columns] || colStyles[4]} gap-4 ${className}`}>
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        const pct = m.max ? Math.round((m.value / m.max) * 100) : m.percentage;

        return (
          <div
            key={m.label || idx}
            className="p-5 rounded-xl bg-[#0E131F] border border-[#1E2B45] hover:border-[#2D3E63] transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
                {m.label}
              </span>
              {Icon && (
                <div className="w-7 h-7 rounded-lg bg-[#141B2D] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8]">
                  <Icon size={14} />
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F1F5F9] tabular-nums">
                {m.value}
              </span>
              {m.max && (
                <span className="text-xs font-mono text-[#64748B]">
                  / {m.max}
                </span>
              )}
              {m.unit && (
                <span className="text-xs font-mono text-[#64748B] ml-1">
                  {m.unit}
                </span>
              )}
            </div>

            {typeof pct === "number" && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-[#141B2D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              </div>
            )}

            {m.subtext && (
              <p className="text-[11px] text-[#64748B] leading-normal">
                {m.subtext}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MetricGrid;

