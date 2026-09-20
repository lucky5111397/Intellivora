import React from "react";
import { Button } from "@/components/ui";
import { ArrowRight, RotateCcw } from "lucide-react";
import ReportDownload from "./ReportDownload";

/**
 * ResultActions
 * Standardized action bar for assessment outcomes.
 */
export function ResultActions({
  primaryLabel = "Continue Training",
  onPrimary,
  primaryIcon = ArrowRight,
  secondaryLabel = "Retake Assessment",
  onSecondary,
  secondaryIcon = RotateCcw,
  onDownload,
  downloadLabel = "Download Report (PDF)",
  tertiaryLabel = "View Assessment History",
  onTertiary,
  className = "",
}) {
  return (
    <div
      className={`pt-6 border-t border-[#1E2B45] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {onPrimary && (
          <Button
            variant="primary"
            size="md"
            rightIcon={primaryIcon}
            onClick={onPrimary}
            className="text-xs shadow-lg shadow-[#2563EB]/25"
          >
            {primaryLabel}
          </Button>
        )}

        {onSecondary && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={secondaryIcon}
            onClick={onSecondary}
            className="text-xs"
          >
            {secondaryLabel}
          </Button>
        )}

        {onDownload && (
          <ReportDownload
            onDownload={onDownload}
            label={downloadLabel}
            size="md"
          />
        )}
      </div>

      {onTertiary && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onTertiary}
          className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] self-start sm:self-auto"
        >
          {tertiaryLabel}
        </Button>
      )}
    </div>
  );
}

export default ResultActions;

