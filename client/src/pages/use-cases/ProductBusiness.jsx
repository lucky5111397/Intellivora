import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    Users,
    TrendingUp,
    Compass,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button, Badge, BackButton, Card } from "@/components/ui";
import { SampleQuestionPreview } from "@/components/SampleQuestionPreview";

export default function ProductBusiness() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/auth", { state: { from: { pathname: "/use-cases/product-business" } } });
    };

    const benefits = [
        {
            icon: Users,
            title: "Multi-Agent Boardroom Simulations",
            description:
                "Participate in authentic multi-agent discussions with AI personas who introduce counterarguments, challenge premises, and push for strategic clarity.",
        },
        {
            icon: Compass,
            title: "Product Sense & Framework Structuring",
            description:
                "Practice hypothesis-driven problem solving, customer journey trade-offs, and metric prioritization under realistic interview conditions.",
        },
        {
            icon: TrendingUp,
            title: "Executive Presence & Turn-Taking Telemetry",
            description:
                "Receive objective metrics on your articulation, floor share, listening comprehension, and leadership balance during team debates.",
        },
        {
            icon: Briefcase,
            title: "Strategic Business Case Scenarios",
            description:
                "Tackle curated business strategy topics ranging from gig-economy economics to quick-commerce disruption and platform governance.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
                {/* 1. Header & Navigation */}
                <div className="space-y-6">
                    <BackButton to="/" fallback="/" label="Back" />

                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13122B] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-mono font-semibold">
                            <Briefcase size={13} />
                            <span>Tailored for Product & Business Leaders</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                            Command Boardrooms & Product Strategy Interviews
                        </h1>
                        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                            Sharpen your product sense, strategic trade-offs, and collaborative leadership through multi-agent group discussions and executive mock rounds.
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
                                Try Sample Topic
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Why Product Leaders Choose Intellivora */}
                <div className="space-y-8">
                    <div className="space-y-2 border-b border-[#1E2B45] pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Why Product & Business Leaders Choose Intellivora
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Develop high-impact executive presence and structured communication.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {benefits.map((b, idx) => {
                            const Icon = b.icon;
                            return (
                                <Card key={idx} variant="default" padding="lg" className="space-y-3 bg-[#0A0D14] border-[#1E2B45]">
                                    <div className="w-9 h-9 rounded-lg bg-[#2E1065] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
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
                        <Badge variant="ai" size="sm">
                            Live Interactive Preview
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Try a Sample Business Discussion Topic
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            See how our multi-agent chambers frame strategic business dilemmas. Formulate your position below.
                        </p>
                    </div>

                    <SampleQuestionPreview
                        type="gd"
                        role="Product & Business Leaders"
                        category="Group Discussion"
                        difficulty="Medium"
                        question="Quick-Commerce Disruption: Survival Strategies for Traditional Mom-and-Pop Retail"
                        focus="Focus: Dark-store economics, ultra-fast logistics margins, and grassroots retail displacement strategies."
                        placeholder="State your opening stance: How can traditional retailers leverage community relationships, fresh assortment, or hybrid delivery partnerships?..."
                    />
                </div>

                {/* 4. Final CTA */}
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E131F] to-[#0A0D14] border border-[#1E2B45] text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                        <Sparkles size={14} />
                        <span>Elevate Your Strategic Presence</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Lead Confident, Persuasive Executive Conversations
                    </h3>
                    <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                        Practice live product management interviews and multi-agent group discussions to achieve placement-grade executive poise.
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
