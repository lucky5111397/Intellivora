import React, { useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { motion } from "motion/react";
import { Button, Badge } from "@/components/ui";

export function CapabilitiesSection({ onStart }) {
    const [selectedAptOption, setSelectedAptOption] = useState("B");
    const [activePaletteQuestion, setActivePaletteQuestion] = useState(18);

    const showcaseVariants = {
        hidden: { opacity: 0, y: 35 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
    };

    return (
        <section id="modules" className="w-full py-20 sm:py-28 border-t border-[#161F33] bg-[#06080B] relative overflow-hidden">
            {/* Subtle Ambient Section Glow */}
            <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#2563EB]/5 blur-[160px] pointer-events-none rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[160px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <Badge variant="brand" size="md" className="mb-4">
                        Assessment Engine Architecture
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] mb-5 font-sans">
                        Four Disciplined Diagnostics. One Proving Ground.
                    </h2>
                    <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                        Every stage replicates enterprise evaluation standards with calibrated rubrics, automated telemetry, and targeted remedial feedback.
                    </p>
                </motion.div>

                {/* SHOWCASE 1: AI Mock Interview Engine */}
                <motion.div
                    variants={showcaseVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mb-16 p-6 sm:p-10 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] shadow-2xl shadow-black/60 relative overflow-hidden group hover:border-[#2D3E63] transition-colors"
                >
                    {/* Atmospheric Glow */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#2563EB]/10 blur-[100px] pointer-events-none rounded-full" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Badge variant="brand" size="sm">
                                    MODULE 01
                                </Badge>
                                <span className="text-xs font-mono text-[#94A3B8]">Real-time STT / TTS</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4 font-sans tracking-tight">
                                Adaptive Technical & Behavioral Mock Interviews
                            </h3>
                            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
                                Experience high-fidelity mock interviews tailored to your exact target role, seniority level, and uploaded resume context. The AI interviewer analyzes technical correctness, delivery cadence, and structural articulation.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#94A3B8]">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Real-time voice-to-text response capture with turn timers</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Dynamic follow-ups based on candidate's architectural answers</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Multi-dimensional rubric scoring with exportable PDF report</span>
                                </li>
                            </ul>
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={ArrowRight}
                                onClick={() => onStart("/interview")}
                                className="shadow-md shadow-[#2563EB]/20"
                            >
                                Launch Mock Interview
                            </Button>
                        </div>

                        {/* Interactive Interview Preview Panel */}
                        <div className="lg:col-span-7 bg-[#0E131F] border border-[#1E2B45] rounded-xl p-6 shadow-2xl shadow-black/80">
                            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#161F33]">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
                                    </span>
                                    <span className="text-xs font-mono text-[#F1F5F9] font-semibold">LIVE SESSION • 08:42</span>
                                </div>
                                <span className="text-xs font-mono text-[#38BDF8] bg-[#052028] px-2.5 py-1 rounded-md border border-[#0E7490]/50 font-semibold">
                                    Senior Distributed Systems Engineer
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#2D3E63] shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#93C5FD]">AI Interviewer</span>
                                        <span className="text-xs font-mono text-[#64748B]">08:31</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#F1F5F9] leading-relaxed">
                                        "How would you handle cache invalidation across distributed nodes when consistency is paramount?"
                                    </p>
                                </div>
                                <div className="bg-[#0A0D14] p-4 rounded-xl border border-[#161F33] ml-4 sm:ml-6 shadow-inner">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#34D399]">Candidate Speech</span>
                                        <span className="text-xs font-mono text-[#64748B]">Transcribing...</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                        "I'd evaluate a write-through pattern paired with an event-driven pub/sub invalidation bus like Kafka..."
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-[#161F33] flex items-center justify-between text-xs text-[#94A3B8]">
                                <span>Cadence: <strong className="text-[#F1F5F9] font-mono">138 WPM</strong></span>
                                <span className="text-[#22C55E] font-semibold">Confidence Score: 92%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* SHOWCASE 2: Timed Aptitude Engine */}
                <motion.div
                    variants={showcaseVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mb-16 p-6 sm:p-10 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] shadow-2xl shadow-black/60 relative overflow-hidden group hover:border-[#2D3E63] transition-colors"
                >
                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#38BDF8]/8 blur-[100px] pointer-events-none rounded-full" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Badge variant="brand" size="sm">
                                    MODULE 02
                                </Badge>
                                <span className="text-xs font-mono text-[#94A3B8]">Timed & Proctored</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4 font-sans tracking-tight">
                                Precision Quantitative & Logic Diagnostics
                            </h3>
                            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
                                Timed drill sessions with an exam-grade Question Palette, categorized by Quantitative Aptitude, Logical Reasoning, Data Interpretation, and Verbal Ability.
                            </p>
                            <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#94A3B8]">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Interactive Question Palette with real-time state tracking</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Multi-tier difficulty calibration (Easy, Medium, Hard)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                                    <span>Detailed mathematical solution keys with formula derivations</span>
                                </li>
                            </ul>
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={ArrowRight}
                                onClick={() => onStart("/aptitude")}
                                className="shadow-md shadow-[#2563EB]/20"
                            >
                                Start Aptitude Drill
                            </Button>
                        </div>

                        {/* Interactive Aptitude Demo Panel */}
                        <div className="lg:col-span-7 order-1 lg:order-2 bg-[#0E131F] border border-[#1E2B45] rounded-xl p-6 shadow-2xl shadow-black/80">
                            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#161F33]">
                                <div className="flex items-center gap-2">
                                    <Clock size={15} className="text-[#F59E0B]" />
                                    <span className="text-xs font-mono text-[#F1F5F9] tabular-nums font-bold">TIME REMAINING: 18:42</span>
                                </div>
                                <span className="text-xs font-mono text-[#38BDF8] font-semibold">QUESTION 18 OF 30</span>
                            </div>
                            <p className="text-sm text-[#F1F5F9] font-medium mb-5 leading-relaxed">
                                If a train traveling at 72 km/h crosses a 200m platform in 22 seconds, what is the length of the train?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                {[
                                    { id: "A", text: "220 meters" },
                                    { id: "B", text: "240 meters" },
                                    { id: "C", text: "260 meters" },
                                    { id: "D", text: "280 meters" },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedAptOption(opt.id)}
                                        className={`flex items-center gap-3.5 p-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                                            selectedAptOption === opt.id
                                                ? "bg-[#0D1E3A] border-[#2563EB] text-[#93C5FD] ring-1 ring-[#2563EB]/40 shadow-sm"
                                                : "bg-[#0A0D14] border-[#161F33] text-[#94A3B8] hover:border-[#2D3E63]"
                                        }`}
                                    >
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                                            selectedAptOption === opt.id
                                                ? "bg-[#2563EB] text-white"
                                                : "bg-[#141B2D] text-[#94A3B8] border border-[#2D3E63]"
                                        }`}>
                                            {opt.id}
                                        </span>
                                        <span className="text-xs sm:text-sm">{opt.text}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Palette Preview */}
                            <div className="pt-4 border-t border-[#161F33]">
                                <div className="text-xs text-[#94A3B8] mb-2.5 font-mono font-semibold">QUESTION PALETTE DEMO</div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 15 }, (_, i) => i + 15).map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setActivePaletteQuestion(num)}
                                            className={`w-8 h-8 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                                num === activePaletteQuestion
                                                    ? "bg-[#2563EB] text-white font-bold ring-2 ring-[#38BDF8]/50 shadow-md"
                                                    : num < 18
                                                    ? "bg-[#062319] text-[#34D399] border border-[#047857] font-semibold"
                                                    : "bg-[#0A0D14] text-[#64748B] border border-[#161F33]"
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* SHOWCASE 3: ATS Resume Remediation */}
                <motion.div
                    variants={showcaseVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mb-16 p-6 sm:p-10 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] shadow-2xl shadow-black/60 relative overflow-hidden group hover:border-[#2D3E63] transition-colors"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Badge variant="brand" size="sm">
                                    MODULE 03
                                </Badge>
                                <span className="text-xs font-mono text-[#94A3B8]">Automated Parsing</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4 font-sans tracking-tight">
                                ATS Resume Diagnostic & Keyword Remediation
                            </h3>
                            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
                                Benchmark your resume against target job specifications. Identify critical missing keywords, formatting traps, and quantifiable impact gaps before submitting your application.
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={ArrowRight}
                                onClick={() => onStart("/resume")}
                                className="shadow-md shadow-[#2563EB]/20"
                            >
                                Analyze Your Resume
                            </Button>
                        </div>
                        <div className="lg:col-span-7 bg-[#0E131F] border border-[#1E2B45] rounded-xl p-6 shadow-2xl shadow-black/80">
                            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#161F33]">
                                <span className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">ATS MATCH SCORE</span>
                                <span className="text-xs font-mono font-bold text-[#22C55E] bg-[#062319] border border-[#047857] px-2.5 py-1 rounded-md">88 / 100 EXCELLENT</span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#0A0D14] p-4 rounded-xl border border-[#161F33]">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Core Keywords Matched</span>
                                        <span className="text-[#F1F5F9] font-mono font-bold tabular-nums">24 / 28 (86%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "86%" }} />
                                    </div>
                                </div>
                                <div className="bg-[#0A0D14] p-4 rounded-xl border border-[#161F33]">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Impact & Metric Quantification</span>
                                        <span className="text-[#F1F5F9] font-mono font-bold tabular-nums">18 / 20 (90%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: "90%" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* SHOWCASE 4: Multi-Agent Group Discussion Chamber */}
                <motion.div
                    variants={showcaseVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="p-6 sm:p-10 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] shadow-2xl shadow-black/60 relative overflow-hidden group hover:border-[#2D3E63] transition-colors"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <Badge variant="success" size="sm" dot>
                                    MODULE 04
                                </Badge>
                                <span className="text-xs font-mono text-[#94A3B8]">Multi-Agent Orchestrator</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4 font-sans tracking-tight">
                                Autonomous Multi-Agent Group Discussion Chamber
                            </h3>
                            <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
                                Step into a live simulated boardroom discussion with 3 autonomous AI peers. Rehearse entry interventions, collaborative debate, counter-argumentation, and floor-share balance.
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={ArrowRight}
                                onClick={() => onStart("/gd")}
                                className="shadow-md shadow-[#2563EB]/20"
                            >
                                Enter GD Chamber
                            </Button>
                        </div>
                        <div className="lg:col-span-7 order-1 lg:order-2 bg-[#0E131F] border border-[#1E2B45] rounded-xl p-6 shadow-2xl shadow-black/80">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-[#0A0D14] border border-[#2563EB] p-3.5 rounded-xl shadow-sm">
                                    <div className="text-xs text-[#38BDF8] font-mono font-bold mb-1">CANDIDATE (YOU)</div>
                                    <div className="text-xs text-[#F1F5F9] font-medium">Floor Share: 28%</div>
                                </div>
                                <div className="bg-[#0A0D14] border border-[#161F33] p-3.5 rounded-xl">
                                    <div className="text-xs text-[#94A3B8] font-mono font-bold mb-1">AI PEER 1 (RHEA)</div>
                                    <div className="text-xs text-[#94A3B8]">Analytical / Data-Driven</div>
                                </div>
                                <div className="bg-[#0A0D14] border border-[#161F33] p-3.5 rounded-xl">
                                    <div className="text-xs text-[#94A3B8] font-mono font-bold mb-1">AI PEER 2 (ARJUN)</div>
                                    <div className="text-xs text-[#94A3B8]">Pragmatic / Operational</div>
                                </div>
                                <div className="bg-[#0A0D14] border border-[#161F33] p-3.5 rounded-xl">
                                    <div className="text-xs text-[#94A3B8] font-mono font-bold mb-1">AI PEER 3 (PRIYA)</div>
                                    <div className="text-xs text-[#94A3B8]">Strategic / Visionary</div>
                                </div>
                            </div>
                            <div className="bg-[#141B2D] p-4 rounded-xl border border-[#2D3E63] text-xs sm:text-sm text-[#F1F5F9]">
                                <span className="font-bold text-[#93C5FD]">Current Speaker (Priya):</span>
                                <span className="ml-2 text-[#94A3B8]">
                                    "While automation accelerates delivery, human oversight remains critical for ethical governance..."
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default CapabilitiesSection;
