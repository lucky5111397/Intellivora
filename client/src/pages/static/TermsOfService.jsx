import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <FileText size={13} />
                        <span>Platform Terms</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Terms of Service
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                </div>

                <div className="space-y-8 text-sm text-[#94A3B8] leading-relaxed">
                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By creating an account or accessing Intellivora, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion, you must cease using the platform.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            2. Service Usage & Educational Purpose
                        </h2>
                        <p>
                            Intellivora provides simulated career preparation tools, quantitative aptitude diagnostics, and AI-driven mock interviews. These tools are engineered for training and skill rehearsal. Evaluations and scores do not constitute formal employment guarantees or accreditation.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            3. Credit Economy & Payments
                        </h2>
                        <p>
                            Assessments consume universal credits allocated upon registration or purchased through our{" "}
                            <Link to="/pricing" className="text-[#38BDF8] hover:underline">
                                Pricing plans
                            </Link>. Credits are deducted upon session initiation. In the event of system interruptions, credits can be reviewed by contacting support.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            4. Account Security & Prohibited Conduct
                        </h2>
                        <p>
                            Users are responsible for safeguarding account credentials. Reverse-engineering proprietary interview rubrics, distributing automated scraping scripts, or misusing audio/speech endpoints is strictly prohibited.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            5. Limitation of Liability
                        </h2>
                        <p>
                            Intellivora is provided on an "as is" and "as available" basis without warranties of any kind. Under no circumstances shall Intellivora be liable for indirect, incidental, or consequential damages resulting from platform usage.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

