import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

/**
 * Reusable BackButton component for top-level module & informational pages.
 * 
 * Props:
 * - to (string): Optional explicit route to navigate to.
 * - label (string): Optional custom text label (defaults to "Back"). Hides on mobile for compact touch target.
 * - fallback (string): Fallback route if navigating back with no history (defaults to "/").
 * - className (string): Optional additional styles.
 */
export function BackButton({
    to,
    label = "Back",
    fallback = "/",
    className = "",
    ariaLabel = "Go back",
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    const handleBack = () => {
        // Priority 1: Explicit referrer state (`location.state.from`).
        // When deep-linking from /history or an audit table, users expect the back action
        // to return them to their filtered history view rather than following the static parent route.
        if (from) {
            navigate(from);
            return;
        }

        const hasHistory =
            typeof window !== "undefined" &&
            window.history.state &&
            typeof window.history.state.idx === "number" &&
            window.history.state.idx > 0;

        // Priority 2: Explicit destination route if specified by the parent view.
        if (to) {
            navigate(to);
        // Priority 3: Browser session history if within an existing SPA navigation trail.
        } else if (hasHistory) {
            navigate(-1);
        // Priority 4: Safe static fallback (e.g. root '/') when entered directly via external link or bookmark.
        } else {
            navigate(fallback);
        }
    };

    const displayLabel = from === "/history" && (label.toLowerCase().includes("hub") || label.toLowerCase().includes("overview") || label.toLowerCase().includes("interview"))
        ? "Back to History"
        : label;

    return (
        <motion.button
            type="button"
            onClick={handleBack}
            aria-label={ariaLabel}
            whileHover="hover"
            className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer select-none rounded-lg p-2 sm:px-2.5 sm:py-1.5 -ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${className}`}
        >
            <motion.span
                variants={{
                    hover: { x: -2 },
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center"
            >
                <ArrowLeft size={16} />
            </motion.span>
            <span className="hidden sm:inline font-medium">{displayLabel}</span>
        </motion.button>
    );
}

export default BackButton;
