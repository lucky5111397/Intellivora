import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop: Global route transition listener that resets scroll position
 * to (0, 0) on every pathname change while preserving intentional in-page hash navigation.
 */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    // Disable default browser scroll restoration so it doesn't fight route navigation
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useLayoutEffect(() => {
        // Respect intentional in-page anchor navigation if a hash is present
        if (hash) {
            const targetId = hash.replace("#", "");
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                return;
            }
        }

        const resetScroll = () => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            } catch {
                window.scrollTo(0, 0);
            }
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }
            if (document.body) {
                document.body.scrollTop = 0;
            }
        };

        // Reset immediately
        resetScroll();

        // Also schedule a reset on the next frame to handle lazy-loaded Suspense mounting
        const rafId = requestAnimationFrame(resetScroll);
        return () => cancelAnimationFrame(rafId);
    }, [pathname, hash]);

    return null;
}
