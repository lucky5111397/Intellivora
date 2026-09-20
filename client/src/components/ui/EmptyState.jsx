import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
    icon: Icon = FolderOpen,
    title = "No data found",
    description = "There are no records to display at this time.",
    actionLabel,
    onAction,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-[#0A0D14] border border-[#161F33] ${className}`}
        >
            <div className="w-12 h-12 rounded-xl bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#64748B] mb-4">
                <Icon size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 tracking-tight">
                {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button variant="primary" size="sm" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;

