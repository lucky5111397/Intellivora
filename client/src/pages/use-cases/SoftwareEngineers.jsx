import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Code2,
    Cpu,
    GitBranch,
    Terminal,
    ShieldCheck,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button, Badge, BackButton, Card } from "@/components/ui";
import { SampleQuestionPreview } from "@/components/SampleQuestionPreview";

export default function SoftwareEngineers() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/auth", { state: { from: { pathname: "/use-cases/software-engineers" } } });
    };

    const benefits = [
        {
            icon: Cpu,
            title: "System Design & Distributed Architecture",
            description:
                "Practice high-level and low-level system design rounds. Receive immediate feedback on caching, concurrency, data consistency, and failure modes.",
        },
        {
            icon: Terminal,
            title: "Live Voice-to-Text Mock Rounds",
            description:
                "Experience realistic voice interviews with dynamic follow-ups based on your exact answers, simulating tier-1 tech company interviewers.",
        },
        {
            icon: GitBranch,
            title: "Stack & Seniority Tailoring",
            description:
                "Calibrate question depth from Junior to Principal level across Frontend, Backend, Full Stack, DevOps, and Distributed Systems tracks.",
        },
        {
            icon: ShieldCheck,
            title: "Telemetry-Backed Scoring Rubrics",
            description:
                "Get evaluated on technical correctness, answer structure (STAR method), and communication confidence with downloadable PDF audit reports.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
                {/* 1. Header & Navigation */}
                <div className="space-y-6">
                    <BackButton to="/" fallback="/" label="Back" />

                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                            <Code2 size={13} />
                            <span>Engineered for Software Engineers</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                            Ace Technical Rounds with Calibrated AI Interviewers
                        </h1>
                        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                            Practice real-time technical interviews, architecture trade-offs, and algorithmic reasoning tailored to your target tech stack and seniority level.
                        </p>
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={ArrowRight}
                                onClick={handleStart}
                                className="shadow-lg shadow-[#2563EB]/25"
                            >
                                Start Free Assessment
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => {
                                    document.getElementById("sample-question")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                Try Sample Question
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Why Software Engineers Choose Intellivora */}
                <div className="space-y-8">
                    <div className="space-y-2 border-b border-[#1E2B45] pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Why Software Engineers Choose Intellivora
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Purpose-built engineering evaluation that moves beyond static flashcards.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {benefits.map((b, idx) => {
                            const Icon = b.icon;
                            return (
                                <Card key={idx} variant="default" padding="lg" className="space-y-3 bg-[#0A0D14] border-[#1E2B45]">
                                    <div className="w-9 h-9 rounded-lg bg-[#0D1E3A] border border-[#2563EB]/40 flex items-center justify-center text-[#93C5FD]">
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="text-base font-semibold text-[#F1F5F9]">
                                        {b.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                        {b.description}
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Try a Sample Question */}
                <div id="sample-question" className="space-y-6 pt-4">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <Badge variant="brand" size="sm">
                            Live Interactive Preview
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Try a Sample Technical Question
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Experience the depth of technical questions asked during our AI mock rounds. No login required.
                        </p>
                    </div>

                    <SampleQuestionPreview
                        type="interview"
                        role="Software Engineers"
                        category="Technical Interview"
                        difficulty="Medium"
                        question="How would you design an idempotent payment processing API to handle network retries without causing duplicate customer charges?"
                        focus="Focus: Discuss unique idempotency keys, distributed locks vs database unique constraints, state machines, and retry backoff strategies."
                        placeholder="Outline your approach: idempotency key lifecycle, database transaction boundaries, locking mechanisms, and recovery on timeouts..."
                    />
                </div>

                {/* 4. Final CTA */}
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E131F] to-[#0A0D14] border border-[#1E2B45] text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                        <Sparkles size={14} />
                        <span>Ready for Your Next Senior Role?</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Transform Your Technical Interview Confidence
                    </h3>
                    <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                        Join thousands of software engineers practicing adaptive technical rounds, system design challenges, and behavioral assessments.
                    </p>
                    <div className="pt-2">
                        <Button
                            variant="primary"
                            size="md"
                            rightIcon={ArrowRight}
                            onClick={handleStart}
                            className="shadow-md shadow-[#2563EB]/25"
                        >
                            Get Started Free
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

