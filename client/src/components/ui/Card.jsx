import React from "react";

/**
 * Obsidian Surface Card Primitive
 * Provides structured surface elevation with border styling and padding options.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {"default" | "elevated" | "subtle" | "interactive" | "glass"} [props.variant="default"]
 * @param {"none" | "sm" | "md" | "lg"} [props.padding="md"]
 * @param {string} [props.className=""]
 * @param {React.MouseEventHandler<HTMLDivElement>} [props.onClick]
 * @returns {JSX.Element}
 */
export function Card({
    children,
    variant = "default",
    padding = "md",
    className = "",
    onClick,
    ...props
}) {
    const baseStyles = "rounded-xl transition-all duration-200 relative";

    const variantStyles = {
        default: "bg-[#0E131F] border border-[#1E2B45] text-[#F1F5F9] shadow-md shadow-black/30",
        elevated: "bg-[#141B2D] border border-[#2D3E63] text-[#F1F5F9] shadow-xl shadow-black/50 hover:border-[#3B82F6]/50",
        subtle: "bg-[#0A0D14] border border-[#161F33] text-[#F1F5F9]",
        interactive:
            "bg-[#0E131F] border border-[#1E2B45] hover:border-[#3B82F6]/60 hover:bg-[#141B2D] hover:shadow-xl hover:shadow-black/50 text-[#F1F5F9] cursor-pointer hover:-translate-y-0.5 active:scale-[0.99]",
        glass:
            "glass text-[#F1F5F9] shadow-2xl",
    };

    const paddingStyles = {
        none: "p-0",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
    };

    return (
        <div
            onClick={onClick}
            className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${paddingStyles[padding] || paddingStyles.md} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }) {
    return <div className={`flex flex-col gap-1 mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
    return <h3 className={`text-base font-semibold text-[#F1F5F9] tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }) {
    return <p className={`text-xs sm:text-sm text-[#94A3B8] leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
    return <div className={`mt-4 pt-4 border-t border-[#161F33] flex items-center justify-between ${className}`}>{children}</div>;
}

export default Card;

