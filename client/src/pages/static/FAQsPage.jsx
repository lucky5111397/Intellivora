import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function FAQsPage() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            category: "Credits & Billing",
            question: "How do credits work across the platform?",
            answer: "Intellivora uses a universal credit balance. Every new account receives 100 free introductory credits upon registration. Additional credits can be acquired via our Pricing page. Credits are deducted per session: AI Mock Interviews consume credits based on duration/questions, Aptitude tests consume a fixed allocation, and ATS Resume scans deduct per document analyzed.",
        },
        {
            category: "Credits & Billing",
            question: "What happens if an interview is interrupted by a network issue?",
            answer: "If a session terminates prematurely due to server connectivity problems or speech API timeout without generating a completed scorecard, your deducted credits can be reviewed and credited back by reaching out via our Contact page.",
        },
        {
            category: "Mock Interviews",
            question: "Do I need a camera and microphone to practice?",
            answer: "A microphone is required for voice interactions because our AI interviewer transcribes and analyzes speech in real time. The camera stream is optional and used only for candidate presence telemetry during proctored sessions. You can toggle your camera off at any time using the in-session controls.",
        },
        {
            category: "Mock Interviews",
            question: "How is my interview performance scored?",
            answer: "Responses are evaluated against multidimensional rubrics including Technical Accuracy, Communication Clarity, Structural Problem Solving (STAR method), and Pacing. A detailed report with actionable feedback is generated immediately upon completion.",
        },
        {
            category: "Aptitude Assessments",
            question: "Can I review questions or change answers during an aptitude test?",
            answer: "Yes. The aptitude assessment interface includes an interactive Question Palette. You can jump directly to any question, mark questions for review, and utilize keyboard shortcuts (1-4 or A-D to select options, Arrow keys to navigate) to maximize efficiency under the countdown timer.",
        },
        {
            category: "Group Discussions",
            question: "How does the AI Group Discussion simulator work?",
            answer: "The GD chamber simulates a collaborative deliberation with 3-4 autonomous AI participants. Each participant has distinct communication styles and viewpoints. The orchestrator monitors floor share, candidate turn counts, rebuttal quality, and leadership initiatives.",
        },
        {
            category: "ATS Resume Checker",
            question: "What resume formats are supported?",
            answer: "The ATS Resume analyzer currently supports standard PDF documents. It parses text content, matches technical skill keywords against target job descriptions, identifies formatting pitfalls, and computes an overall match percentage.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <HelpCircle size={13} />
                        <span>Knowledge Base</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Everything you need to know about simulations, credit consumption, and scoring.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={faq.question}
                                className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] overflow-hidden transition-colors"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#0E131F] transition-colors cursor-pointer"
                                >
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8]">
                                            {faq.category}
                                        </span>
                                        <h3 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                                            isOpen ? "rotate-180 text-[#38BDF8]" : ""
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-5 pt-1 border-t border-[#1E2B45]/60 text-sm text-[#94A3B8] leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

