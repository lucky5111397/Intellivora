import React from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Button, BackButton } from "@/components/ui";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-10">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-4 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Sparkles size={13} />
                        <span>About Intellivora</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                        Precision Career Infrastructure for Modern Engineers
                    </h1>
                    <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl">
                        Intellivora is an autonomous career preparation platform engineered to replicate real-world technical interviews, timed quantitative assessments, multi-agent group discussions, and ATS resume audits.
                    </p>
                </div>

                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-[#F1F5F9]">Our Mission</h2>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                            Traditional interview preparation is fragmented: candidates jump between coding problem sets, mock forums, resume builders, and unstructured practice. Intellivora integrates all four dimensions of modern technical hiring into a unified proving ground.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                                <Brain size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-[#F1F5F9]">AI Mock Interviews</h3>
                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                Real-time voice interaction with an adaptive interviewer providing immediate feedback on communication clarity, technical depth, and structure.
                            </p>
                        </div>

                        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                                <Target size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-[#F1F5F9]">Timed Aptitude Testing</h3>
                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                High-stakes quantitative and logic diagnostics with section-level time constraints, question palettes, and percentile breakdowns.
                            </p>
                        </div>

                        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-[#F1F5F9]">Multi-Agent GD Simulation</h3>
                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                Experience collaborative and competitive group discussions with autonomous AI participants debating complex industry topics.
                            </p>
                        </div>

                        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-base font-semibold text-[#F1F5F9]">ATS Resume Remediation</h3>
                            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                Deep keyword matching, gap identification, and structural scoring aligned with modern enterprise applicant tracking algorithms.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#1E2B45] flex items-center justify-between">
                        <p className="text-xs text-[#64748B]">Ready to experience the platform?</p>
                        <Link to="/interview">
                            <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                                Start Practicing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

