import React from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart2,
    Database,
    LineChart,
    PieChart,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button, Badge, BackButton, Card } from "@/components/ui";
import { SampleQuestionPreview } from "@/components/SampleQuestionPreview";

export default function DataAnalysts() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/auth", { state: { from: { pathname: "/use-cases/data-analysts" } } });
    };

    const benefits = [
        {
            icon: BarChart2,
            title: "Data Interpretation & Table Analysis",
            description:
                "Sharpen rapid data extraction from complex tables, multi-axis bar charts, pie charts, and growth matrices under strict time constraints.",
        },
        {
            icon: Database,
            title: "Analytical & Quantitative Diagnostics",
            description:
                "Practice statistical reasoning, percentage shifts, ratios, and probability assessments calibrated to top financial and analytics employers.",
        },
        {
            icon: LineChart,
            title: "Real-Time Pacing & Accuracy Curves",
            description:
                "Track how speed affects your accuracy with granular question-by-question telemetry, eliminating second-guessing on live screening tests.",
        },
        {
            icon: PieChart,
            title: "ATS Resume Optimization for Data Roles",
            description:
                "Scan your resume against real Data Analyst and Business Intelligence JDs to highlight missing statistical tooling, SQL, and Python proficiencies.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
                {/* 1. Header & Navigation */}
                <div className="space-y-6">
                    <BackButton to="/" fallback="/" label="Back" />

                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#052028] border border-[#06B6D4]/40 text-[#38BDF8] text-xs font-mono font-semibold">
                            <BarChart2 size={13} />
                            <span>Calibrated for Data Analysts</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                            Master Data Interpretation & Analytical Screening Tests
                        </h1>
                        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                            Train on timed data interpretation charts, statistical reasoning, and quantitative analytics questions designed to simulate elite data role recruitment tests.
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

                {/* 2. Why Data Analysts Choose Intellivora */}
                <div className="space-y-8">
                    <div className="space-y-2 border-b border-[#1E2B45] pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Why Data Analysts Choose Intellivora
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Rigorous analytical drills that build instinctive data speed and precision.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {benefits.map((b, idx) => {
                            const Icon = b.icon;
                            return (
                                <Card key={idx} variant="default" padding="lg" className="space-y-3 bg-[#0A0D14] border-[#1E2B45]">
                                    <div className="w-9 h-9 rounded-lg bg-[#082F49] border border-[#06B6D4]/40 flex items-center justify-center text-[#38BDF8]">
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
                        <Badge variant="info" size="sm">
                            Live Interactive Preview
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Try a Sample Data Interpretation Question
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Test your data deduction speed right now with an authentic question from our aptitude bank.
                        </p>
                    </div>

                    <SampleQuestionPreview
                        type="aptitude"
                        role="Data Analysts"
                        category="Data Interpretation"
                        difficulty="Medium"
                        question="Production of Units (2021 vs 2022): Dept A: 400 to 500; Dept B: 600 to 660; Dept C: 250 to 350. Which department registered the highest percentage growth?"
                        options={["Dept A", "Dept B", "Dept C", "Both A and C"]}
                        correctAnswer={2}
                        explanation="Dept A: (100/400)*100 = 25%. Dept B: (60/600)*100 = 10%. Dept C: (100/250)*100 = 40%. Dept C registered the highest growth at 40%."
                    />
                </div>

                {/* 4. Final CTA */}
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E131F] to-[#0A0D14] border border-[#1E2B45] text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                        <Sparkles size={14} />
                        <span>Ready to Prove Your Analytical Edge?</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Benchmark Your Data Problem-Solving Skills
                    </h3>
                    <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                        Access hundreds of data interpretation problems, quantitative diagnostics, and technical mock rounds tailored for analytics professionals.
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
