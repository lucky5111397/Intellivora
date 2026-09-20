import React from "react";
import { CheckCircle2, Timer, Users, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Badge, Button } from "@/components/ui";

export function MethodologySection({ onStart }) {
    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
    };

    return (
        <section id="how-it-works" className="w-full py-20 sm:py-28 border-t border-[#161F33] bg-[#0A0D14] relative overflow-hidden">
            {/* Ambient Background Gradient Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#2563EB]/5 blur-[160px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <Badge variant="brand" size="md" className="mb-4">
                        Evaluation Methodology
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] mb-5 font-sans">
                        Unified Competency Synthesis
                    </h2>
                    <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                        Assessments don't live in isolation. Intellivora aggregates performance signals across voice, logic, code, and discourse into a centralized diagnostic profile.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Activity Timeline */}
                    <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="lg:col-span-7 bg-[#0E131F] border border-[#1E2B45] p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/50"
                    >
                        <span className="text-xs font-bold text-[#93C5FD] uppercase tracking-wider block mb-6">
                            Unified Activity Timeline
                        </span>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 bg-[#0A0D14] border border-[#161F33] p-4 rounded-xl hover:border-[#2D3E63] hover:bg-[#141B2D]/50 transition-all">
                                <div className="p-2 rounded-lg bg-[#062319] text-[#22C55E] shrink-0 mt-0.5 border border-[#047857]/40">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="font-bold text-[#F1F5F9] text-sm">
                                            Technical Interview • Distributed Systems
                                        </span>
                                        <span className="font-mono text-[#22C55E] font-bold tabular-nums text-sm">
                                            86 / 100
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                                        Evaluated 6 questions on caching & replication. PDF report issued.
                                    </p>
                                    <span className="text-[10px] text-[#38BDF8] font-mono mt-2 block font-semibold">
                                        RECENT ASSESSMENT
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 bg-[#0A0D14] border border-[#161F33] p-4 rounded-xl hover:border-[#2D3E63] hover:bg-[#141B2D]/50 transition-all">
                                <div className="p-2 rounded-lg bg-[#052028] text-[#38BDF8] shrink-0 mt-0.5 border border-[#0E7490]/40">
                                    <Timer size={18} />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="font-bold text-[#F1F5F9] text-sm">
                                            Aptitude Mock • Quantitative Speed Drill
                                        </span>
                                        <span className="font-mono text-[#38BDF8] font-bold tabular-nums text-sm">
                                            88% (94th %ile)
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                                        Completed 30 quantitative and CS problems with 3m 42s remaining.
                                    </p>
                                    <span className="text-[10px] text-[#38BDF8] font-mono mt-2 block font-semibold">
                                        VERIFIED SESSION
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 bg-[#0A0D14] border border-[#161F33] p-4 rounded-xl hover:border-[#2D3E63] hover:bg-[#141B2D]/50 transition-all">
                                <div className="p-2 rounded-lg bg-[#0D1E3A] text-[#93C5FD] shrink-0 mt-0.5 border border-[#2563EB]/40">
                                    <Users size={18} />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="font-bold text-[#F1F5F9] text-sm">
                                            Group Discussion: AI Ethics in Enterprise
                                        </span>
                                        <span className="font-mono text-[#22C55E] font-bold text-sm">
                                            Placement-Ready
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                                        Ranked 1st among panel. High marks in Active Listening and Floor Share.
                                    </p>
                                    <span className="text-[10px] text-[#38BDF8] font-mono mt-2 block font-semibold">
                                        PEER SYNTHESIS
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Competency Vector Synthesis */}
                    <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="lg:col-span-5 bg-[#0E131F] border border-[#1E2B45] p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/50 flex flex-col justify-between"
                    >
                        <div>
                            <span className="text-xs font-bold text-[#93C5FD] uppercase tracking-wider block mb-6">
                                Competency Vector Synthesis
                            </span>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Algorithms & Architecture</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">88%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "88%" }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Quantitative Speed</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">82%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: "82%" }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Resume ATS Keyword Alignment</span>
                                        <span className="font-mono text-[#22C55E] font-bold tabular-nums">91%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "91%" }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#94A3B8]">Collaborative Discourse (GD)</span>
                                        <span className="font-mono text-[#F1F5F9] font-bold tabular-nums">85%</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#06080B] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "85%" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 mt-6 border-t border-[#161F33]">
                            <Button
                                variant="secondary"
                                size="md"
                                className="w-full shadow-sm"
                                rightIcon={ArrowRight}
                                onClick={() => onStart("/history")}
                            >
                                Open Unified Analytics History
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default MethodologySection;
