import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

/**
 * ReportDownload
 * Professional, premium download action button with state transitions (idle, preparing, ready, error).
 */
export function ReportDownload({
  onDownload,
  label = "Download PDF",
  size = "sm",
  variant = "primary",
  className = "",
}) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'preparing' | 'ready' | 'error'

  const handleTriggerDownload = async () => {
    if (status === "preparing") return;
    setStatus("preparing");

    try {
      // Yield to event loop to allow UI to render spinner without freezing
      await new Promise((resolve) => setTimeout(resolve, 50));
      await onDownload();
      setStatus("ready");
      toast.success("Performance report downloaded successfully!");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to generate report PDF:", err);
      setStatus("error");
      toast.error("Couldn't generate report. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (status === "preparing") {
    return (
      <Button
        variant="primary"
        size={size}
        disabled
        className={`shadow-lg shadow-[#2563EB]/25 ${className}`}
      >
        <Loader2 size={14} className="animate-spin text-white" />
        <span>Generating...</span>
      </Button>
    );
  }

  if (status === "ready") {
    return (
      <Button
        variant="secondary"
        size={size}
        className={`text-[#22C55E] border-[#22C55E]/40 bg-[#0D2818] shadow-sm ${className}`}
      >
        <CheckCircle2 size={14} />
        <span>Downloaded</span>
      </Button>
    );
  }

  if (status === "error") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleTriggerDownload}
        className={`text-[#EF4444] border-[#EF4444]/40 hover:bg-[#280B0B] ${className}`}
      >
        <AlertCircle size={14} />
        <span>Try Again</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      leftIcon={Download}
      onClick={handleTriggerDownload}
      className={`shadow-md shadow-[#2563EB]/20 hover:shadow-lg hover:shadow-[#2563EB]/35 transition-all duration-150 ${className}`}
    >
      {label}
    </Button>
  );
}

export default ReportDownload;
