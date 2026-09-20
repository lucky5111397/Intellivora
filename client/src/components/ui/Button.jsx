import React from "react";

/**
 * Primary Interactive Button Primitive
 * Adheres to the Obsidian Intelligence design standard with subtle micro-interactions,
 * accessible focus rings, loading state spinners, and icon slots.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {"primary" | "secondary" | "ghost" | "danger" | "outline" | "ai"} [props.variant="primary"]
 * @param {"sm" | "md" | "lg" | "icon"} [props.size="md"]
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ElementType} [props.leftIcon]
 * @param {React.ElementType} [props.rightIcon]
 * @param {string} [props.className=""]
 * @param {"button" | "submit" | "reset"} [props.type="button"]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick]
 * @returns {JSX.Element}
 */
export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    type = "button",
    onClick,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:scale-[1.015] active:scale-[0.98] shadow-sm";

    const sizeStyles = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-9 w-9 p-0 flex items-center justify-center",
    };

    const variantStyles = {
        primary:
            "bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-[#F1F5F9] shadow-md shadow-[#2563EB]/20 border border-[#3B82F6]/30 hover:border-[#3B82F6]/60",
        secondary:
            "bg-[#0E131F] hover:bg-[#141B2D] active:bg-[#1A233A] text-[#F1F5F9] border border-[#1E2B45] hover:border-[#2D3E63] shadow-sm",
        ghost:
            "bg-transparent hover:bg-[#141B2D] text-[#94A3B8] hover:text-[#F1F5F9] border border-transparent",
        danger:
            "bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] text-white border border-transparent shadow-sm shadow-[#EF4444]/20",
        outline:
            "bg-transparent hover:bg-[#141B2D] text-[#F1F5F9] border border-[#1E2B45] hover:border-[#2D3E63]",
        ai:
            "bg-[#13122B] hover:bg-[#1E1C44] text-[#A78BFA] border border-[#8B5CF6]/40 hover:border-[#8B5CF6]/70 shadow-sm shadow-[#8B5CF6]/20",
    };

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            ) : LeftIcon ? (
                <LeftIcon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className="shrink-0" />
            ) : null}
            <span>{children}</span>
            {!isLoading && RightIcon ? (
                <RightIcon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className="shrink-0" />
            ) : null}
        </button>
    );
}

export default Button;

