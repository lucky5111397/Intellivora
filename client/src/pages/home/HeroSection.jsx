import React from "react";
import {
    ArrowRight,
    SlidersHorizontal,
    Database,
    Mic,
    Timer,
    FileText,
    Users,
    AlertCircle,
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button, Badge, AmbientBackground } from "@/components/ui";

export function HeroSection({ onStart, onExplore }) {
    const { scrollY } = useScroll();
    const bgParallaxY = useTransform(scrollY, [0, 1000], [0, 120]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.08,
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <section className="relative w-full overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
            {/* Ambient Background with slow drifting orbs, radial grid, noise texture, and scroll parallax */}
            <motion.div
                style={{ y: bgParallaxY }}
                className="absolute inset-0 pointer-events-none -z-10"
            >
                <AmbientBackground variant="hero" showGrid={true} />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
                {/* Motion Header Block */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center"
                >
                    {/* Status Badge */}
                    <motion.div variants={itemVariants}>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] shadow-md shadow-[#2563EB]/10 mb-5 group hover:border-[#2563EB] transition-all cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
                            </span>
                            <span className="text-xs font-semibold tracking-wider uppercase font-mono">
                                AI-Powered Career Proving Ground & Assessment Platform
                            </span>
                        </div>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F1F5F9] max-w-4xl leading-[1.12] mb-5 font-sans selection:bg-[#2563EB] selection:text-white"
                    >
                        Prepare for Every Stage of Your{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F1F5F9] via-[#93C5FD] to-[#38BDF8]">
                            Career Journey.
                        </span>
                    </motion.h1>

                    {/* Supporting Copy */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mb-8 leading-relaxed font-normal"
                    >
                        INTELLIVORA combines adaptive AI mock interviews, timed aptitude diagnostics, ATS resume remediation, and multi-agent group discussions into one unified, precision career preparation workspace.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-12 sm:mb-14"
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            rightIcon={ArrowRight}
                            onClick={() => onStart("/interview")}
                            className="shadow-lg shadow-[#2563EB]/25"
                        >
                            Start Practicing Free
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            leftIcon={SlidersHorizontal}
                            onClick={onExplore}
                        >
                            Explore Assessment Suite
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Hero Visual: Candidate Workspace Dashboard Preview with Motion & Elevation */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full text-left bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/80 relative group"
                >
                    {/* Top Workspace Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 bg-[#0E131F] px-4 py-3.5 rounded-xl border border-[#1E2B45]">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]" />
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-[#F1F5F9]">
                                Production Candidate Workspace
                            </span>
                            <span className="font-mono text-xs text-[#64748B] hidden sm:inline">
                                | ID: #USR-90214
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs bg-[#141B2D] border border-[#2D3E63] text-[#93C5FD] px-2.5 py-1 rounded-md font-semibold">
                                SYS: ONLINE
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-medium">
                                <Database size={13} className="text-[#38BDF8]" />
                                <span className="hidden sm:inline">Simulated Assessment Telemetry</span>
                                <span className="sm:hidden">Telemetry</span>
                            </span>
                        </div>
                    </div>

                    {/* 4 Core Modules Overview Grid with Staggered Entrance & Hover Lift */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                        {/* Card 1: Mock Interview */}
                        <motion.div
                            custom={0}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-[#0E131F] border border-[#1E2B45] p-5 sm:p-6 rounded-xl flex flex-col justify-between hover:border-[#3B82F6]/60 hover:bg-[#141B2D] transition-all shadow-md shadow-black/40"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3.5">
                                    <Badge variant="brand" size="sm">
                                        VOICE & TECH
                                    </Badge>
                                    <div className="p-2 rounded-lg bg-[#141B2D] text-[#38BDF8]">
                                        <Mic size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                                    Mock Interview
                                </h3>
                                <p className="text-xs text-[#94A3B8] mb-4">
                                    Senior Distributed Systems Engineer
                                </p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold text-[#F1F5F9] font-mono tabular-nums">84</span>
                                    <span className="text-xs text-[#94A3B8]">/ 100 Overall</span>
                                </div>
                                <div className="space-y-2.5 text-xs">
                                    <div>
                                        <div className="flex justify-between text-[#94A3B8] text-[11px] mb-1">
                                            <span>Technical Correctness</span>
                                            <span className="text-[#F1F5F9] font-mono font-semibold tabular-nums">88%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#06080B] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "88%" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[#94A3B8] text-[11px] mb-1">
                                            <span>Communication Cadence</span>
                                            <span className="text-[#F1F5F9] font-mono font-semibold tabular-nums">82%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#06080B] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: "82%" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 mt-5 border-t border-[#161F33] flex items-center justify-between text-xs">
                                <span className="text-[#64748B] font-mono">Report #IV-2041</span>
                                <button
                                    onClick={() => onStart("/interview")}
                                    className="text-[#38BDF8] hover:text-[#93C5FD] transition-colors cursor-pointer font-semibold flex items-center gap-1"
                                >
                                    <span>Breakdown</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Card 2: Timed Aptitude */}
                        <motion.div
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-[#0E131F] border border-[#1E2B45] p-5 sm:p-6 rounded-xl flex flex-col justify-between hover:border-[#3B82F6]/60 hover:bg-[#141B2D] transition-all shadow-md shadow-black/40"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3.5">
                                    <Badge variant="brand" size="sm">
                                        PROCTORED
                                    </Badge>
                                    <div className="p-2 rounded-lg bg-[#141B2D] text-[#38BDF8]">
                                        <Timer size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                                    Timed Aptitude
                                </h3>
                                <p className="text-xs text-[#94A3B8] mb-4">
                                    Core CS & Quantitative Diagnostic
                                </p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold text-[#F1F5F9] font-mono tabular-nums">78</span>
                                    <span className="text-xs text-[#94A3B8]">/ 100 Composite</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-center bg-[#06080B] p-2.5 rounded-lg border border-[#161F33]">
                                    <div>
                                        <span className="text-[10px] text-[#94A3B8] block uppercase">Quant</span>
                                        <span className="font-mono text-xs text-[#F1F5F9] font-bold tabular-nums">82%</span>
                                    </div>
                                    <div className="bg-[#141B2D] rounded py-0.5 border border-[#2D3E63]">
                                        <span className="text-[10px] text-[#94A3B8] block uppercase">Logic</span>
                                        <span className="font-mono text-xs text-[#22C55E] font-bold tabular-nums">86%</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-[#94A3B8] block uppercase">Verbal</span>
                                        <span className="font-mono text-xs text-[#F1F5F9] font-bold tabular-nums">74%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 mt-5 border-t border-[#161F33] flex items-center justify-between text-xs">
                                <span className="text-[#64748B] font-mono">91st Percentile</span>
                                <button
                                    onClick={() => onStart("/aptitude")}
                                    className="text-[#38BDF8] hover:text-[#93C5FD] transition-colors cursor-pointer font-semibold flex items-center gap-1"
                                >
                                    <span>Solutions</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Card 3: ATS Resume Score */}
                        <motion.div
                            custom={2}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-[#0E131F] border border-[#1E2B45] p-5 sm:p-6 rounded-xl flex flex-col justify-between hover:border-[#3B82F6]/60 hover:bg-[#141B2D] transition-all shadow-md shadow-black/40"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3.5">
                                    <Badge variant="brand" size="sm">
                                        BENCHMARK
                                    </Badge>
                                    <div className="p-2 rounded-lg bg-[#141B2D] text-[#38BDF8]">
                                        <FileText size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                                    ATS Resume Score
                                </h3>
                                <p className="text-xs text-[#94A3B8] mb-4">
                                    Target: Staff SRE Architect
                                </p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold text-[#22C55E] font-mono tabular-nums">91</span>
                                    <span className="text-xs text-[#94A3B8]">/ 100 Match</span>
                                </div>
                                <div className="bg-[#06080B] p-2.5 rounded-lg border border-[#161F33] space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#94A3B8]">Keyword Coverage</span>
                                        <span className="text-[#F1F5F9] font-mono font-bold tabular-nums">28 / 32</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#F87171] text-xs">
                                        <AlertCircle size={13} />
                                        <span>4 Critical Technical Gaps</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 mt-5 border-t border-[#161F33] flex items-center justify-between text-xs">
                                <span className="text-[#64748B] font-mono">PDF Synced • 2h ago</span>
                                <button
                                    onClick={() => onStart("/resume")}
                                    className="text-[#38BDF8] hover:text-[#93C5FD] transition-colors cursor-pointer font-semibold flex items-center gap-1"
                                >
                                    <span>Remediate</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Card 4: Group Discussion */}
                        <motion.div
                            custom={3}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-[#0E131F] border border-[#1E2B45] p-5 sm:p-6 rounded-xl flex flex-col justify-between hover:border-[#3B82F6]/60 hover:bg-[#141B2D] transition-all shadow-md shadow-black/40"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3.5">
                                    <Badge variant="success" size="sm" dot>
                                        LIVE SIMULATION
                                    </Badge>
                                    <div className="p-2 rounded-lg bg-[#141B2D] text-[#38BDF8]">
                                        <Users size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-[#F1F5F9] mb-1">
                                    Group Discussion
                                </h3>
                                <p className="text-xs text-[#94A3B8] mb-3">
                                    Workplace Automation Governance
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-[#06080B] p-2 rounded-lg border border-[#161F33]">
                                        <span className="text-[#94A3B8] block text-[10px] uppercase">Articulation</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">84%</span>
                                    </div>
                                    <div className="bg-[#06080B] p-2 rounded-lg border border-[#161F33]">
                                        <span className="text-[#94A3B8] block text-[10px] uppercase">Leadership</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">79%</span>
                                    </div>
                                    <div className="bg-[#06080B] p-2 rounded-lg border border-[#161F33]">
                                        <span className="text-[#94A3B8] block text-[10px] uppercase">Listening</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">88%</span>
                                    </div>
                                    <div className="bg-[#06080B] p-2 rounded-lg border border-[#161F33]">
                                        <span className="text-[#94A3B8] block text-[10px] uppercase">Logic</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">86%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 mt-5 border-t border-[#161F33] flex items-center justify-between text-xs">
                                <span className="text-[#64748B] font-mono">Floor Share 28%</span>
                                <button
                                    onClick={() => onStart("/gd")}
                                    className="text-[#38BDF8] hover:text-[#93C5FD] transition-colors cursor-pointer font-semibold flex items-center gap-1"
                                >
                                    <span>Chamber</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default HeroSection;
