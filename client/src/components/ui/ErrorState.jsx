import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
    title = "Something went wrong",
    description = "An unexpected error occurred while loading this content.",
    onRetry,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-[#280B0B]/30 border border-[#B91C1C]/40 ${className}`}
        >
            <div className="w-12 h-12 rounded-xl bg-[#280B0B] border border-[#B91C1C]/60 flex items-center justify-center text-[#F87171] mb-4">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#F1F5F9] mb-1.5 tracking-tight">
                {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#F87171]/90 max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={RotateCcw}
                    onClick={onRetry}
                    className="border-[#B91C1C]/60 hover:bg-[#280B0B] text-[#F1F5F9]"
                >
                    Try Again
                </Button>
            )}
        </div>
    );
}

export default ErrorState;

