import React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * AmbientBackground
 * Premium atmospheric background motion system with blurred radial gradient orbs,
 * optional radial-masked grid texture, and SVG noise overlay.
 *
 * @param {Object} props
 * @param {"hero" | "subtle" | "footer"} [props.variant="subtle"]
 * @param {boolean} [props.showGrid=false]
 * @param {string} [props.className=""]
 * @param {any} [props.style]
 */
export function AmbientBackground({
    variant = "subtle",
    showGrid = false,
    className = "",
    style = {},
}) {
    const prefersReducedMotion = useReducedMotion();
    const isHero = variant === "hero";
    const isFooter = variant === "footer";
    const isSubtle = variant === "subtle";

    const displayGrid = showGrid || isHero;

    // SVG Noise data URI (feTurbulence) to prevent color banding and add velvet finish
    const noiseBg =
        "data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.04'/></svg>";

    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}
            style={style}
            aria-hidden="true"
        >
            {/* 1. Subtle Animated / Blurred Gradient Orbs */}
            {isHero && (
                <>
                    {/* Primary Hero Orb - Brand Blue */}
                    <motion.div
                        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[720px] sm:w-[900px] h-[480px] rounded-full bg-gradient-to-b from-[#2563EB]/18 via-[#3B82F6]/10 to-transparent blur-[140px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: ["-50%", "-46%", "-54%", "-50%"],
                                      y: [0, -25, 18, 0],
                                      scale: [1, 1.06, 0.96, 1],
                                  }
                        }
                        transition={{
                            duration: 26,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />

                    {/* Secondary Hero Orb - Violet / Purple */}
                    <motion.div
                        className="absolute top-[18%] -left-[10%] sm:left-[12%] w-[480px] sm:w-[600px] h-[380px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/12 via-[#6366F1]/8 to-transparent blur-[130px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: [0, 40, -30, 0],
                                      y: [0, 35, -20, 0],
                                      scale: [1, 0.94, 1.08, 1],
                                  }
                        }
                        transition={{
                            duration: 32,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />

                    {/* Tertiary Hero Orb - Cyan / Electric Blue */}
                    <motion.div
                        className="absolute top-[28%] -right-[10%] sm:right-[15%] w-[420px] sm:w-[520px] h-[340px] rounded-full bg-gradient-to-bl from-[#38BDF8]/10 via-[#2563EB]/8 to-transparent blur-[120px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: [0, -35, 25, 0],
                                      y: [0, -28, 22, 0],
                                      scale: [1, 1.07, 0.95, 1],
                                  }
                        }
                        transition={{
                            duration: 28,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                </>
            )}

            {isSubtle && (
                <>
                    {/* Primary Subtle Orb - Brand Blue */}
                    <motion.div
                        className="absolute top-[5%] left-[25%] -translate-x-1/2 w-[520px] h-[360px] rounded-full bg-gradient-to-b from-[#2563EB]/10 via-[#1D4ED8]/6 to-transparent blur-[130px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: ["-50%", "-45%", "-55%", "-50%"],
                                      y: [0, -20, 15, 0],
                                      scale: [1, 1.05, 0.95, 1],
                                  }
                        }
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />

                    {/* Secondary Subtle Orb - Violet */}
                    <motion.div
                        className="absolute top-[35%] right-[15%] w-[440px] h-[320px] rounded-full bg-gradient-to-tl from-[#8B5CF6]/8 via-[#6366F1]/5 to-transparent blur-[120px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: [0, -30, 25, 0],
                                      y: [0, 25, -20, 0],
                                      scale: [1, 0.96, 1.06, 1],
                                  }
                        }
                        transition={{
                            duration: 34,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                </>
            )}

            {isFooter && (
                <>
                    {/* Centered Grounding Orb for Footer */}
                    <motion.div
                        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[650px] h-[280px] rounded-full bg-gradient-to-t from-[#2563EB]/12 via-[#8B5CF6]/6 to-transparent blur-[140px]"
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : {
                                      x: ["-50%", "-48%", "-52%", "-50%"],
                                      scale: [1, 1.06, 0.97, 1],
                                  }
                        }
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                    />
                    <div className="absolute top-0 right-[20%] w-[320px] h-[180px] rounded-full bg-[#38BDF8]/6 blur-[110px]" />
                </>
            )}

            {/* 2. Radial-Masked Grid / Dot Overlay (Optional or Hero) */}
            {displayGrid && (
                <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)",
                        backgroundSize: "28px 28px",
                        maskImage:
                            "radial-gradient(ellipse 75% 65% at 50% 40%, #000 45%, transparent 100%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse 75% 65% at 50% 40%, #000 45%, transparent 100%)",
                    }}
                />
            )}

            {/* 3. High-Quality SVG Noise Texture (Prevents banding, adds matte velvet depth) */}
            <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("${noiseBg}")`,
                    backgroundRepeat: "repeat",
                }}
            />
        </div>
    );
}

export default AmbientBackground;

