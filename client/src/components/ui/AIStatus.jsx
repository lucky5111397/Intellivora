import React from "react";
import { Sparkles, Brain, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export function AIStatus({
    state = "idle", // 'idle' | 'deliberating' | 'generating' | 'streaming' | 'success' | 'error'
    message,
    className = "",
}) {
    const config = {
        idle: {
            icon: Sparkles,
            text: message || "AI Standby",
            bg: "bg-[#0E131F]",
            border: "border-[#1E2B45]",
            color: "text-[#94A3B8]",
            dot: "bg-[#64748B]",
            animate: false,
        },
        deliberating: {
            icon: Brain,
            text: message || "Synthesizing evaluation...",
            bg: "bg-[#13122B]",
            border: "border-[#8B5CF6]/40",
            color: "text-[#C4B5FD]",
            dot: "bg-[#8B5CF6] animate-pulse",
            animate: true,
        },
        generating: {
            icon: Loader2,
            text: message || "Generating assessment...",
            bg: "bg-[#0D1E3A]",
            border: "border-[#2563EB]/40",
            color: "text-[#93C5FD]",
            dot: "bg-[#3B82F6] animate-pulse",
            animate: true,
        },
        streaming: {
            icon: Sparkles,
            text: message || "Streaming response...",
            bg: "bg-[#052028]",
            border: "border-[#0E7490]/50",
            color: "text-[#38BDF8]",
            dot: "bg-[#38BDF8] animate-ping",
            animate: true,
        },
        success: {
            icon: CheckCircle2,
            text: message || "Analysis complete",
            bg: "bg-[#062319]",
            border: "border-[#047857]/50",
            color: "text-[#34D399]",
            dot: "bg-[#22C55E]",
            animate: false,
        },
        error: {
            icon: AlertTriangle,
            text: message || "Evaluation interrupted",
            bg: "bg-[#280B0B]",
            border: "border-[#B91C1C]/50",
            color: "text-[#F87171]",
            dot: "bg-[#EF4444]",
            animate: false,
        },
    };

    const current = config[state] || config.idle;
    const Icon = current.icon;

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium select-none shadow-sm transition-all duration-300 ${current.bg} ${current.border} ${current.color} ${className}`}
        >
            <span className="relative flex h-2 w-2 shrink-0">
                {current.animate && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${current.dot.split(' ')[0]}`} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot.split(' ')[0]}`} />
            </span>
            <Icon
                size={14}
                className={`shrink-0 ${current.animate && state === "generating" ? "animate-spin" : ""}`}
            />
            <span className="truncate">{current.text}</span>
        </div>
    );
}

export default AIStatus;

