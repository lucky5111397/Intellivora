import React from "react";
import { useLocation } from "react-router-dom";
import { BackButton, Badge } from "@/components/ui";
import { Calendar, Clock, Award, Building2 } from "lucide-react";

/**
 * ResultHeader
 * Clean, consistent header for all assessment result pages.
 */
export function ResultHeader({
  badge = "ASSESSMENT RESULT",
  badgeVariant = "brand",
  title,
  subtitle,
  date,
  duration,
  difficulty,
  roleOrTopic,
  targetCompany,
  backTo = "/",
  backLabel = "Back to Hub",
  extraActions,
  className = "",
}) {
  const location = useLocation();
  const from = location.state?.from;
  const effectiveBackTo = from || backTo;
  const effectiveBackLabel = from === "/history" ? "Back to History" : backLabel;

  return (
    <div className={`space-y-4 pb-6 border-b border-[#1E2B45] ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <BackButton to={effectiveBackTo} label={effectiveBackLabel} fallback={backTo || "/"} />
        {extraActions && (
          <div className="flex items-center gap-2">
            {extraActions}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant={badgeVariant} size="sm">
            {badge}
          </Badge>

          {roleOrTopic && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B45] text-[11px] font-medium text-[#93C5FD]">
              <Award size={12} className="text-[#38BDF8]" />
              <span>{roleOrTopic}</span>
            </span>
          )}

          {difficulty && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B45] text-[11px] font-mono text-[#94A3B8]">
              {difficulty}
            </span>
          )}

          {targetCompany && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B45] text-[11px] font-medium text-[#38BDF8]">
              <Building2 size={12} />
              <span>{targetCompany}</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F1F5F9]">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}

        {(date || duration) && (
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#64748B] font-mono">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#64748B]" />
                <span>{date}</span>
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#64748B]" />
                <span>{duration}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultHeader;

