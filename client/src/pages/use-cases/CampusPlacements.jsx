import React from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    Award,
    Clock,
    BookOpen,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button, Badge, BackButton, Card } from "@/components/ui";
import { SampleQuestionPreview } from "@/components/SampleQuestionPreview";

export default function CampusPlacements() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/auth", { state: { from: { pathname: "/use-cases/campus-placements" } } });
    };

    const benefits = [
        {
            icon: BookOpen,
            title: "Comprehensive Placement Syllabus",
            description:
                "Practice curated question banks covering Quantitative Aptitude, Logical Reasoning, and Verbal Ability calibrated to major campus recruiters.",
        },
        {
            icon: Clock,
            title: "Timed Speed & Accuracy Drills",
            description:
                "Build exam-room reflexes under realistic time pressure with auto-calculated accuracy scores, skipped questions tracking, and time metrics.",
        },
        {
            icon: Award,
            title: "Tier-1 Placement Benchmarking",
            description:
                "Evaluate your placement readiness against thousands of student cohorts with instant feedback and topic-level remedial recommendations.",
        },
        {
            icon: GraduationCap,
            title: "End-to-End Placement Preparation",
            description:
                "Seamlessly transition from aptitude screening filters to technical voice mock rounds and group discussions all in one platform.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
                {/* 1. Header & Navigation */}
                <div className="space-y-6">
                    <BackButton to="/" fallback="/" label="Back" />

                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#062319] border border-[#047857]/50 text-[#34D399] text-xs font-mono font-semibold">
                            <GraduationCap size={13} />
                            <span>Built for Campus Placements</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] leading-tight">
                            Clear Campus Aptitude Filters & Placement Drives
                        </h1>
                        <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                            Master quantitative shortcuts, logical reasoning puzzles, and technical mock interviews designed to help college students secure day-one dream offers.
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

                {/* 2. Why Students Choose Intellivora */}
                <div className="space-y-8">
                    <div className="space-y-2 border-b border-[#1E2B45] pb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Why Students Choose Intellivora
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            The structured proving ground designed to convert campus applicants into hired graduates.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {benefits.map((b, idx) => {
                            const Icon = b.icon;
                            return (
                                <Card key={idx} variant="default" padding="lg" className="space-y-3 bg-[#0A0D14] border-[#1E2B45]">
                                    <div className="w-9 h-9 rounded-lg bg-[#062319] border border-[#047857]/50 flex items-center justify-center text-[#34D399]">
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
                        <Badge variant="success" size="sm">
                            Live Interactive Preview
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                            Try a Sample Campus Aptitude Question
                        </h2>
                        <p className="text-sm text-[#94A3B8]">
                            Practice with an authentic quantitative question commonly tested during on-campus recruitment drives.
                        </p>
                    </div>

                    <SampleQuestionPreview
                        type="aptitude"
                        role="Campus Candidates"
                        category="Quantitative Aptitude"
                        difficulty="Easy"
                        question="If A's salary is 20% less than B's salary, by how much percent is B's salary more than A's?"
                        options={["20%", "25%", "33.33%", "16.66%"]}
                        correctAnswer={1}
                        explanation="If B = 100, then A = 80. B is 20 more than A. Percentage = (20 / 80) * 100 = 25%."
                    />
                </div>

                {/* 4. Final CTA */}
                <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E131F] to-[#0A0D14] border border-[#1E2B45] text-center space-y-4 shadow-2xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                        <Sparkles size={14} />
                        <span>Ready to Land Your Campus Placement?</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Start Preparing for Day-One Recruitment
                    </h3>
                    <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                        Practice full-length aptitude tests, resume optimization, and mock technical interviews before company drives begin.
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
