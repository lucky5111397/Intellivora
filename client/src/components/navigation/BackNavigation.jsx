import React from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navSections } from "../../config/navConfig";

const sectionParentPaths = {
    prepare: "/prepare/dsa",
    assess: "/assess/placement",
    career: "/career/roadmap",
};

const immersiveRoutePatterns = [
    /^\/prepare\/dsa\/[^/]+/,
    /^\/prepare\/coding\/[^/]+/,
    /^\/prepare\/quiz\/(screen|result)(?:\/|$)/,
    /^\/prepare\/system-design\/[^/]+/,
    /^\/assess\/placement\/[^/]+/,
    /^\/assess\/replay\/[^/]+/,
];

function getSectionKey(pathname) {
    const match = pathname.match(/^\/(prepare|assess|career)(?:\/|$)/);
    return match?.[1] ?? null;
}

function hasUsefulHistoryEntry() {
    const historyIndex = window.history.state?.idx;
    return typeof historyIndex === "number" && historyIndex > 0;
}

export function BackNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const sectionKey = getSectionKey(location.pathname);
    const section = navSections.find(({ key }) => key === sectionKey);

    if (!section || immersiveRoutePatterns.some((pattern) => pattern.test(location.pathname))) {
        return null;
    }

    const handleBack = () => {
        if (hasUsefulHistoryEntry()) {
            navigate(-1);
            return;
        }

        navigate(sectionParentPaths[section.key]);
    };

    return (
        <nav
            aria-label={`${section.name} navigation`}
            className="w-full border-b border-[#161F33]/80 bg-[#06080B]/70"
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <button
                    type="button"
                    onClick={handleBack}
                    className="group inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-[#0E131F] hover:text-[#F1F5F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080B]"
                    aria-label={`Back to ${section.name}`}
                >
                    <ArrowLeft
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="transition-transform duration-150 group-hover:-translate-x-0.5"
                    />
                    <span>Back to {section.name}</span>
                </button>
            </div>
        </nav>
    );
}

export default BackNavigation;
