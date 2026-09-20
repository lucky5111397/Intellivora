import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    BarChart3,
    ShieldCheck,
    MessageSquare,
    CheckCircle,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    ResultHeader,
    ScoreSummary,
    MetricGrid,
    AIInsight,
    ResultActions,
    ReportDownload,
} from "@/components/results";
import { generateInterviewReportPdf } from "@/utils/pdfReportGenerator";

function Step3Report({ report }) {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#06080B]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#94A3B8]">Compiling Assessment Report...</p>
                </div>
            </div>
        );
    }

    const {
        finalScore = 0,
        confidence = 0,
        communication = 0,
        correctness = 0,
        questionWiseScore = [],
        role = "Technical Role",
        experience = "Mid Level",
        targetCompany,
        createdAt,
    } = report;

    const totalQuestions = questionWiseScore.length;

    const questionScoreData = questionWiseScore.map((scoreItem, index) => ({
        name: `Q${index + 1}`,
        score: scoreItem.score || 0,
    }));

    let performanceTier = "Developing Competency";
    let shortTagline = "Good foundational knowledge. Refine answer structure, quantifiable impact, and trade-offs.";
    let recommendation = "You possess solid foundational skills. Focus on answering with quantifiable STAR examples and clear architecture trade-offs.";

    if (finalScore >= 8) {
        performanceTier = "Placement-Ready Performance";
        shortTagline = "Demonstrated rigorous domain architecture, confident delivery, and clear reasoning.";
        recommendation = "You are ready for technical rounds. Continue practicing advanced distributed design questions and maintain your structured communication.";
    } else if (finalScore < 5) {
        performanceTier = "Needs Directed Revision";
        shortTagline = "Focus on core concepts, structured problem-solving, and verbal pacing.";
        recommendation = "Focus on core concepts, structured problem-solving, and verbal practice before attending live recruitment drives.";
    }

    const percentage = Math.round((finalScore / 10) * 100);

    const handleDownloadPdf = async () => {
        return generateInterviewReportPdf({
            report,
            candidateName: userData?.name || "Candidate",
            candidateEmail: userData?.email || "candidate@intellivora.app",
            date: createdAt ? new Date(createdAt) : undefined,
        });
    };

    const metricItems = [
        {
            label: "Confidence",
            value: confidence,
            max: 10,
            icon: ShieldCheck,
            subtext: "Poise, certainty, and steady delivery",
        },
        {
            label: "Communication",
            value: communication,
            max: 10,
            icon: MessageSquare,
            subtext: "Clarity, pacing, and concise articulation",
        },
        {
            label: "Correctness",
            value: correctness,
            max: 10,
            icon: CheckCircle,
            subtext: "Technical precision and domain accuracy",
        },
        {
            label: "Questions Evaluated",
            value: totalQuestions,
            subtext: "Total prompt & answer interactions",
        },
    ];

    return (
        <div className="w-full min-h-screen bg-[#06080B] text-[#F1F5F9] py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* 1. Standardized Result Header */}
                <ResultHeader
                    badge="INTERVIEW ASSESSMENT"
                    badgeVariant="brand"
                    title="Mock Interview Diagnostic Report"
                    subtitle="Comprehensive AI rubric evaluation with question-level breakdown, technical telemetry, and trajectory insights."
                    roleOrTopic={role}
                    difficulty={experience}
                    targetCompany={targetCompany}
                    backTo="/interview"
                    backLabel="Back to Interview Hub"
                    date={createdAt ? new Date(createdAt).toLocaleDateString() : undefined}
                    extraActions={
                        <ReportDownload
                            onDownload={handleDownloadPdf}
                            label="Download PDF"
                            size="sm"
                        />
                    }
                />

                {/* 2. Prominent Score Summary */}
                <ScoreSummary
                    score={Number(finalScore).toFixed(1)}
                    maxScore={10}
                    scoreLabel="Overall Interview Score"
                    tier={performanceTier}
                    tierDescription={shortTagline}
                    progressPercentage={percentage}
                />

                {/* 3. Metric Grid (4 Pillars / Telemetry) */}
                <MetricGrid metrics={metricItems} columns={4} />

                {/* 4. Trajectory Chart & Evaluator Guidance */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: AI Evaluator Guidance */}
                    <div className="lg:col-span-5 space-y-6">
                        <AIInsight
                            label="INTELLIVORA AI EVALUATION"
                            title="Evaluator Synthesis & Next Steps"
                            content={recommendation}
                            bullets={[
                                `Confidence Score: ${confidence}/10 - ${confidence >= 7 ? "Strong executive presence" : "Target calmer pacing and structured delivery"}`,
                                `Communication: ${communication}/10 - ${communication >= 7 ? "Concise and well-structured" : "Incorporate STAR method framework"}`,
                                `Technical Accuracy: ${correctness}/10 - ${correctness >= 7 ? "High domain accuracy" : "Review edge cases and trade-offs"}`,
                            ]}
                        />
                    </div>

                    {/* Right: Score Trajectory Area Chart */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={16} className="text-[#38BDF8]" />
                                    <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                                        Question-by-Question Trajectory
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-[#64748B]">Max: 10 pts</span>
                            </div>

                            <div className="h-60 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={questionScoreData}>
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#161F33" />
                                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 10]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0E131F",
                                                borderColor: "#1E2B45",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                color: "#F1F5F9",
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#2563EB"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#scoreGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Granular Question Breakdown List */}
                <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#161F33]">
                        <div>
                            <h3 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                                Itemized Question-by-Question Rubric
                            </h3>
                            <p className="text-xs text-[#94A3B8] mt-0.5">
                                Granular review of candidate responses, individual scores, and actionable evaluator feedback.
                            </p>
                        </div>
                        <span className="text-xs font-mono text-[#38BDF8] bg-[#141B2D] border border-[#1E2B45] px-2.5 py-1 rounded-lg">
                            {totalQuestions} Questions
                        </span>
                    </div>

                    <div className="space-y-4">
                        {questionWiseScore.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-5 rounded-xl bg-[#0E131F] border border-[#161F33] hover:border-[#1E2B45] transition-colors space-y-3"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-[#141B2D] border border-[#2D3E63] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-sm font-medium text-[#F1F5F9] leading-relaxed">
                                            {item.question}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg shrink-0 tabular-nums border ${
                                            (item.score || 0) >= 8
                                                ? "bg-[#062319] text-[#34D399] border-[#047857]/40"
                                                : (item.score || 0) >= 5
                                                ? "bg-[#271A04] text-[#FBBF24] border-[#B45309]/40"
                                                : "bg-[#280B0B] text-[#F87171] border-[#B91C1C]/40"
                                        }`}
                                    >
                                        {item.score || 0}/10
                                    </span>
                                </div>

                                {item.feedback && (
                                    <div className="mt-2 pt-3 border-t border-[#161F33] pl-9">
                                        <span className="text-[10px] font-mono text-[#38BDF8] block uppercase tracking-wider mb-1">
                                            Evaluator Feedback:
                                        </span>
                                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                                            {item.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Standardized Result Action Bar */}
                <ResultActions
                    primaryLabel="Start New Interview Drill"
                    onPrimary={() => navigate("/interview")}
                    secondaryLabel="Retake Assessment"
                    onSecondary={() => navigate("/interview")}
                    tertiaryLabel="Back to History"
                    onTertiary={() => navigate("/history")}
                />
            </div>
        </div>
    );
}

export default Step3Report;