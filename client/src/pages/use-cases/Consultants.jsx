import React from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    ShieldAlert,
    Layers,
    Target,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button, Badge, BackButton, Card } from "@/components/ui";
import { SampleQuestionPreview } from "@/components/SampleQuestionPreview";

export default function Consultants() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/auth", { state: { from: { pathname: "/use-cases/consultants" } } });
    };

    const benefits = [
        {
            icon: Layers,
            title: "MECE Framework Structuring",
            description:
                "Practice decomposing ambiguous business problems into Mutually Exclusive, Collectively Exhaustive branches with clear issue trees.",
        },
        {
            icon: ShieldAlert,
            title: "Crisis & Risk Simulation Scenarios",
            description:
                "Simulate high-stakes executive crisis debates: systemic outages, regulatory audits, supply-chain collapses, and reputational containment.",
        },
        {
            icon: Target,
            title: "Synthesized Executive Delivery",
            description:
                "Train on pyramid principle communication—lead with the recommendation, defend with structured pillars, and anticipate counter-arguments.",
        },
        {
            icon: TrendingUp,
            title: "Consulting Interview Telemetry",
            description:
                "Receive objective feedback on critical thinking, listening comprehension, floor share balance, and persuasive presence during multi-agent discussions.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
                {/* 1. Header & Navigation */}
                <div className="space-y-6">
                    <BackButton to="/" fallback="/" label="Back" />

                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#271A04] border border-[#F59E0B]/40 text-[#FBBF24] text-xs font-mono font-semibold">
                            <TrendingUp size={13} />
                            <span>Designed for Management Consultants</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                            Command Case Interviews & High-Stakes Boardroom Debates
                        </h1>
                        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                            Simulate strategy case studies, crisis management scenarios, and multi-agent partner discussions to build boardroom-ready executive presence.
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
                                Try Sample Case
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Why Consultants Choose Intellivora */}
                <div className="space-y-8">
                    <div className="space-y-2 border-b border-[#1E2B45] pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Why Consultants Choose Intellivora
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Precision case simulation tools built for management and strategy consulting candidates.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {benefits.map((b, idx) => {
                            const Icon = b.icon;
                            return (
                                <Card key={idx} variant="default" padding="lg" className="space-y-3 bg-[#0A0D14] border-[#1E2B45]">
                                    <div className="w-9 h-9 rounded-lg bg-[#271A04] border border-[#F59E0B]/40 flex items-center justify-center text-[#FBBF24]">
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
                        <Badge variant="warning" size="sm">
                            Live Interactive Preview
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Try a Sample Consulting Case Scenario
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Structure your recommendation for an executive crisis simulation. No login required.
                        </p>
                    </div>

                    <SampleQuestionPreview
                        type="gd"
                        role="Consultants"
                        category="Case Studies"
                        difficulty="Executive"
                        question="Crisis Management: Handling a Global Cloud Infrastructure and Banking Outage"
                        focus="Focus: Systemic concentration risk, incident communication, redundancy failures, and regulatory fines."
                        placeholder="Outline your structured crisis framework: Immediate containment, stakeholder communication, root-cause triage, and governance mitigation..."
                    />
                </div>

                {/* 4. Final CTA */}
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E131F] to-[#0A0D14] border border-[#1E2B45] text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                        <Sparkles size={14} />
                        <span>Ready for Strategy Case Rounds?</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Master the Rigor of Tier-1 Consulting Interviews
                    </h3>
                    <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                        Practice case structuring, quantitative market estimations, and multi-agent executive debates with calibrated evaluation rubrics.
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
