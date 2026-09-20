import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight, MessageSquare, BookOpen, Shield } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <HelpCircle size={13} />
                        <span>Support Center</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Help Center
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Find answers, troubleshooting guidance, and technical assistance for all assessment modules.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to="/faqs"
                        className="p-6 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 hover:bg-[#0E131F] transition-all space-y-3 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8] group-hover:border-[#2563EB]">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9] flex items-center justify-between">
                            <span>Frequently Asked Questions</span>
                            <ArrowRight size={14} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                        </h2>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Answers regarding credit consumption, scoring formulas, speech recognition, and microphone setup.
                        </p>
                    </Link>

                    <Link
                        to="/contact"
                        className="p-6 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 hover:bg-[#0E131F] transition-all space-y-3 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8] group-hover:border-[#2563EB]">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9] flex items-center justify-between">
                            <span>Contact Support</span>
                            <ArrowRight size={14} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                        </h2>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Submit a message directly to our engineering team for account or technical troubleshooting.
                        </p>
                    </Link>

                    <Link
                        to="/security"
                        className="p-6 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 hover:bg-[#0E131F] transition-all space-y-3 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8] group-hover:border-[#2563EB]">
                            <Shield size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9] flex items-center justify-between">
                            <span>Security & Privacy</span>
                            <ArrowRight size={14} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                        </h2>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                            Review our data policies, auth mechanisms, and ephemeral media stream guidelines.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

