import React from "react";

/**
 * Status and Metadata Badge Primitive
 * Compact visual indicator for performance tiers, status states, and domain categories.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {"default" | "brand" | "success" | "warning" | "error" | "info" | "ai" | "neutral"} [props.variant="default"]
 * @param {"sm" | "md" | "lg"} [props.size="sm"]
 * @param {boolean} [props.dot=false] - Whether to render a leading semantic status dot.
 * @param {string} [props.className=""]
 * @returns {JSX.Element}
 */
export function Badge({
    children,
    variant = "default",
    size = "sm",
    dot = false,
    className = "",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center font-medium rounded-md border tracking-wide uppercase select-none";

    const sizeStyles = {
        sm: "px-2 py-0.5 text-[10px] sm:text-[11px] gap-1.5",
        md: "px-2.5 py-1 text-xs gap-2",
        lg: "px-3 py-1.5 text-xs gap-2",
    };

    const variantStyles = {
        default: "bg-[#0E131F] text-[#94A3B8] border-[#1E2B45]",
        brand: "bg-[#0D1E3A] text-[#93C5FD] border-[#2563EB]/40",
        success: "bg-[#062319] text-[#34D399] border-[#047857]/50",
        warning: "bg-[#271A04] text-[#FBBF24] border-[#B45309]/50",
        error: "bg-[#280B0B] text-[#F87171] border-[#B91C1C]/50",
        info: "bg-[#052028] text-[#38BDF8] border-[#0E7490]/50",
        ai: "bg-[#13122B] text-[#C4B5FD] border-[#8B5CF6]/40",
        neutral: "bg-[#141B2D] text-[#F1F5F9] border-[#2D3E63]",
    };

    const dotColors = {
        default: "bg-[#94A3B8]",
        brand: "bg-[#3B82F6]",
        success: "bg-[#22C55E]",
        warning: "bg-[#F59E0B]",
        error: "bg-[#EF4444]",
        info: "bg-[#38BDF8]",
        ai: "bg-[#8B5CF6]",
        neutral: "bg-[#F1F5F9]",
    };

    return (
        <span
            className={`${baseStyles} ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.default} ${className}`}
            {...props}
        >
            {dot && (
                <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`}
                />
            )}
            <span>{children}</span>
        </span>
    );
}

export default Badge;

