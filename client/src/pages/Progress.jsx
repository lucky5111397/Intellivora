import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Video,
    Sparkles,
    Users,
    Target,
    Award,
    Flame,
    Minus,
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { EmptyState, ErrorState, Skeleton, BackButton } from "@/components/ui";
import { fetchProgressData } from "@/utils/progressApi";

export default function Progress() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProgress = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchProgressData();
            setData(res);
        } catch (err) {
            console.error("[Progress Page] Failed to fetch progress analytics:", err);
            setError(err.response?.data?.message || err.message || "Failed to load progress data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    const formatDateLabel = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const summaryStats = data?.summaryStats || {
        totalSessions: { interview: 0, aptitude: 0, gd: 0, total: 0 },
        averageScore: { interview: 0, aptitude: 0, gd: 0 },
        bestScore: { interview: 0, aptitude: 0, gd: 0 },
        improvementPercentage: { interview: null, aptitude: null, gd: null, overall: null },
    };

    const renderImprovementBadge = (val, label = "") => {
        if (val === null || val === undefined) {
            return (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141B2D] border border-[#1E2B45] text-xs font-medium text-[#64748B]">
                    <Minus size={12} />
                    <span>{label || "4+ sessions needed"}</span>
                </div>
            );
        }

        const isPositive = val >= 0;
        return (
            <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isPositive
                        ? "bg-[#052E16]/60 border-[#10B981]/40 text-[#34D399]"
                        : "bg-[#280B0B]/60 border-[#EF4444]/40 text-[#F87171]"
                }`}
            >
                {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span className="font-mono font-semibold">
                    {isPositive ? `+${val}%` : `${val}%`}
                </span>
                {label && <span className="text-[11px] opacity-80">{label}</span>}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <Skeleton variant="button" className="w-20 h-9" />
                        <div className="space-y-2 flex-1">
                            <Skeleton variant="title" className="w-48 h-7" />
                            <Skeleton variant="text" className="w-80 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-3 animate-pulse"
                            >
                                <Skeleton variant="text" className="w-24 h-4" />
                                <Skeleton variant="title" className="w-16 h-8" />
                                <Skeleton variant="text" className="w-32 h-3" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-4 animate-pulse"
                            >
                                <div className="flex justify-between items-center">
                                    <Skeleton variant="title" className="w-40 h-6" />
                                    <Skeleton variant="button" className="w-24 h-6" />
                                </div>
                                <Skeleton variant="card" className="h-60 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                    <BackButton to="/" label="Back" fallback="/" />
                    <ErrorState
                        title="Unable to load progress analytics"
                        description={error}
                        onRetry={loadProgress}
                    />
                </div>
            </div>
        );
    }

    const interviewTrend = data?.interviewTrend || [];
    const aptitudeTrend = data?.aptitudeTrend || [];
    const gdTrend = data?.gdTrend || [];

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* 1. Header & Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    <BackButton to="/" label="Back" fallback="/" />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E2B45] pb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8]">
                                    <Activity size={20} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                                    Your Progress
                                </h1>
                            </div>
                            <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                                Track your learning trajectory, assessment trends, and skill acquisition across all preparation modules.
                            </p>
                        </div>

                        {/* Overall Trajectory Pill */}
                        <div className="flex items-center gap-3 bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-3 sm:px-4">
                            <div className="space-y-0.5">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
                                    Trajectory
                                </span>
                                <div>
                                    {renderImprovementBadge(
                                        summaryStats.improvementPercentage.overall,
                                        "Overall Trajectory"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Top Summary KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {/* Card 1: Total Completed Sessions */}
                    <div className="p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-2 relative overflow-hidden group hover:border-[#2563EB]/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Total Sessions
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8]">
                                <Flame size={15} />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F5F9]">
                            {summaryStats.totalSessions.total}
                        </div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-2">
                            <span>{summaryStats.totalSessions.interview} Interview</span>
                            <span>•</span>
                            <span>{summaryStats.totalSessions.aptitude} Aptitude</span>
                            <span>•</span>
                            <span>{summaryStats.totalSessions.gd} GD</span>
                        </div>
                    </div>

                    {/* Card 2: Interview Telemetry */}
                    <div className="p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-2 relative overflow-hidden group hover:border-[#2563EB]/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Interview Avg
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#0D1E3A] border border-[#2563EB]/40 flex items-center justify-center text-[#93C5FD]">
                                <Video size={15} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F5F9]">
                                {summaryStats.averageScore.interview}
                            </span>
                            <span className="text-xs text-[#64748B] font-mono">/ 10</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#64748B]">Best: {summaryStats.bestScore.interview} / 10</span>
                            {renderImprovementBadge(summaryStats.improvementPercentage.interview)}
                        </div>
                    </div>

                    {/* Card 3: Aptitude Telemetry */}
                    <div className="p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-2 relative overflow-hidden group hover:border-[#06B6D4]/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Aptitude Accuracy
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#082F49] border border-[#06B6D4]/40 flex items-center justify-center text-[#38BDF8]">
                                <Sparkles size={15} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F5F9]">
                                {summaryStats.averageScore.aptitude}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#64748B]">Best: {summaryStats.bestScore.aptitude}%</span>
                            {renderImprovementBadge(summaryStats.improvementPercentage.aptitude)}
                        </div>
                    </div>

                    {/* Card 4: GD Telemetry */}
                    <div className="p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45] space-y-2 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                GD Performance
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[#2E1065] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
                                <Users size={15} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F5F9]">
                                {summaryStats.averageScore.gd}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#64748B]">Best: {summaryStats.bestScore.gd}%</span>
                            {renderImprovementBadge(summaryStats.improvementPercentage.gd)}
                        </div>
                    </div>
                </motion.div>

                {/* 3. Detailed Trend Charts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-8"
                >
                    {/* CHART 1: Technical Interview Trajectory */}
                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B45]/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0D1E3A] border border-[#2563EB]/40 flex items-center justify-center text-[#93C5FD]">
                                    <Video size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">
                                        Technical Interview Trajectory
                                    </h2>
                                    <p className="text-xs text-[#94A3B8]">
                                        Score progression across AI mock rounds (0–10 scale)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#64748B]">
                                    {interviewTrend.length} {interviewTrend.length === 1 ? "Round" : "Rounds"}
                                </span>
                                {summaryStats.bestScore.interview > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD]">
                                        <Award size={12} />
                                        Best: {summaryStats.bestScore.interview}
                                    </span>
                                )}
                            </div>
                        </div>

                        {interviewTrend.length === 0 ? (
                            <EmptyState
                                icon={Video}
                                title="No interview sessions recorded yet"
                                description="Complete your first AI technical interview to start visualizing your performance trajectory."
                                actionLabel="Start Mock Interview"
                                onAction={() => navigate("/interview")}
                                className="bg-[#0E131F]/50 border-dashed"
                            />
                        ) : (
                            <div className="h-64 sm:h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={interviewTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#161F33" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDateLabel}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 10]}
                                            ticks={[0, 2, 4, 6, 8, 10]}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0E131F",
                                                borderColor: "#1E2B45",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                color: "#F1F5F9",
                                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                            }}
                                            labelFormatter={formatFullDate}
                                            formatter={(value) => [`${value} / 10`, "Final Score"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#2563EB"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: "#2563EB", strokeWidth: 1 }}
                                            activeDot={{ r: 5, fill: "#38BDF8", stroke: "#2563EB" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* CHART 2: Aptitude Accuracy Progression */}
                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B45]/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#082F49] border border-[#06B6D4]/40 flex items-center justify-center text-[#38BDF8]">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">
                                        Aptitude Accuracy Progression
                                    </h2>
                                    <p className="text-xs text-[#94A3B8]">
                                        Accuracy percentage across Quantitative, Logical & Verbal diagnostic tests
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#64748B]">
                                    {aptitudeTrend.length} {aptitudeTrend.length === 1 ? "Test" : "Tests"}
                                </span>
                                {summaryStats.bestScore.aptitude > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-[#082F49] border border-[#06B6D4]/40 text-[#38BDF8]">
                                        <Target size={12} />
                                        Best: {summaryStats.bestScore.aptitude}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {aptitudeTrend.length === 0 ? (
                            <EmptyState
                                icon={Sparkles}
                                title="No aptitude tests completed yet"
                                description="Take a timed quantitative, logical, or verbal test to analyze your accuracy curves."
                                actionLabel="Practice Aptitude"
                                onAction={() => navigate("/aptitude")}
                                className="bg-[#0E131F]/50 border-dashed"
                            />
                        ) : (
                            <div className="h-64 sm:h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={aptitudeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#161F33" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDateLabel}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0E131F",
                                                borderColor: "#1E2B45",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                color: "#F1F5F9",
                                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                            }}
                                            labelFormatter={formatFullDate}
                                            formatter={(value, name, item) => [
                                                `${value}% (${item?.payload?.topic || "Aptitude"})`,
                                                "Accuracy",
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke="#06B6D4"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: "#06B6D4", strokeWidth: 1 }}
                                            activeDot={{ r: 5, fill: "#38BDF8", stroke: "#06B6D4" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* CHART 3: Group Discussion Performance */}
                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-2xl p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B45]/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#2E1065] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD]">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">
                                        Group Discussion Performance
                                    </h2>
                                    <p className="text-xs text-[#94A3B8]">
                                        Articulation, leadership, and critical thinking index (0–100%)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#64748B]">
                                    {gdTrend.length} {gdTrend.length === 1 ? "Session" : "Sessions"}
                                </span>
                                {summaryStats.bestScore.gd > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-[#2E1065] border border-[#8B5CF6]/40 text-[#C4B5FD]">
                                        <Award size={12} />
                                        Best: {summaryStats.bestScore.gd}%
                                    </span>
                                )}
                            </div>
                        </div>

                        {gdTrend.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No GD sessions evaluated yet"
                                description="Engage in multi-agent group discussions to evaluate executive presence and debate metrics."
                                actionLabel="Join Group Discussion"
                                onAction={() => navigate("/gd")}
                                className="bg-[#0E131F]/50 border-dashed"
                            />
                        ) : (
                            <div className="h-64 sm:h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={gdTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#161F33" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatDateLabel}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                            stroke="#64748B"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0E131F",
                                                borderColor: "#1E2B45",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                color: "#F1F5F9",
                                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                                            }}
                                            labelFormatter={formatFullDate}
                                            formatter={(value) => [`${value}%`, "Overall Score"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="overallScore"
                                            stroke="#8B5CF6"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 1 }}
                                            activeDot={{ r: 5, fill: "#C4B5FD", stroke: "#8B5CF6" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

