import React from "react";
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <CreditCard size={13} />
                        <span>Billing & Credits</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Refund & Credit Policy
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                </div>

                <div className="space-y-8 text-sm text-[#94A3B8] leading-relaxed">
                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            1. Credit Economy & Nature of Service
                        </h2>
                        <p>
                            Intellivora operates on a credit pack model where credits are consumed for computational AI processing, speech synthesis, and scoring. Free introductory credits (100 credits) are allocated upon registration for evaluation before any purchase.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            2. Refund Eligibility
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#94A3B8]">
                            <li><strong>Unused Credit Packs:</strong> If you purchased a credit pack and have not consumed any credits from the purchased balance, you may request a full refund within 7 days of transaction.</li>
                            <li><strong>Technical Faults & Interruptions:</strong> If an assessment session fails due to server-side outage or AI provider downtime without generating a report, the deducted credits are automatically restored to your account or re-credited manually.</li>
                            <li><strong>Consumed Credits:</strong> Once credits have been utilized for a completed interview, aptitude test, or ATS resume audit, refunds cannot be issued.</li>
                        </ul>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            3. How to Request Support
                        </h2>
                        <p>
                            To report a technical interruption or request a credit audit, please contact us via our{" "}
                            <Link to="/contact" className="text-[#38BDF8] hover:underline">
                                Contact page
                            </Link>{" "}
                            with your registered email and Razorpay Order ID.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

