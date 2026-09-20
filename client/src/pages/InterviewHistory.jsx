import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import {
    Search,
    Trash2,
    ArrowRight,
    Brain,
    Timer,
    Users,
    FileText,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Download,
    Building2,
} from "lucide-react";
import { Button, Badge, Modal, Input, EmptyState, ErrorState, Skeleton, BackButton } from "@/components/ui";
import { toast } from "sonner";
import { generateATSReportPdf } from "@/utils/pdfReportGenerator";

function InterviewHistory() {
    const { userData } = useSelector((state) => state.user);
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortBy, setSortBy] = useState("latest");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // { id, type }
    const [selectedResumeItem, setSelectedResumeItem] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const navigate = useNavigate();

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            // Try unified history API first
            const result = await axios.get(
                `${ServerUrl}/api/history`,
                { withCredentials: true }
            );
            if (Array.isArray(result.data)) {
                setHistoryItems(result.data);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.warn("[History] Unified history endpoint unavailable, falling back to interviews:", error.message);
        }

        // Fallback to legacy interview endpoint
        try {
            const legacyRes = await axios.get(
                `${ServerUrl}/api/interview/get-interviews`,
                { withCredentials: true }
            );
            const mapped = (legacyRes.data || []).map((item) => ({
                id: item._id,
                _id: item._id,
                type: "interview",
                module: "interview",
                title: item.role,
                subtitle: `${item.experience || ""} • ${item.mode || ""}`.trim(),
                role: item.role,
                experience: item.experience,
                mode: item.mode,
                targetCompany: item.targetCompany || null,
                score: item.finalScore || 0,
                finalScore: item.finalScore || 0,
                status: item.status || "Completed",
                createdAt: item.createdAt,
                route: `/report/${item._id}`,
            }));
            setHistoryItems(mapped);
        } catch (err) {
            console.error("[History] Error fetching interview history fallback:", err);
            setError("Unable to retrieve assessment history. Please check your network connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const deleteItem = async () => {
        if (!selectedItem) return;

        try {
            if (selectedItem.type === "aptitude") {
                await axios.delete(
                    `${ServerUrl}/api/history/aptitude/${selectedItem.id}`,
                    { withCredentials: true }
                );
            } else if (selectedItem.type === "gd") {
                await axios.delete(
                    `${ServerUrl}/api/history/gd/${selectedItem.id}`,
                    { withCredentials: true }
                );
            } else if (selectedItem.type === "resume" || selectedItem.type === "ats") {
                await axios.delete(
                    `${ServerUrl}/api/history/resume/${selectedItem.id}`,
                    { withCredentials: true }
                );
            } else {
                try {
                    await axios.delete(
                        `${ServerUrl}/api/history/interview/${selectedItem.id}`,
                        { withCredentials: true }
                    );
                } catch {
                    await axios.delete(
                        `${ServerUrl}/api/interview/delete-interview/${selectedItem.id}`,
                        { withCredentials: true }
                    );
                }
            }

            setHistoryItems((prev) => prev.filter((item) => (item._id || item.id) !== selectedItem.id));
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error("[History] Error deleting item:", error);
            toast.error("Unable to delete history entry. Please try again.");
        }
    };

    const handleViewReport = (item) => {
        const itemType = (item.type || item.module || "interview").toLowerCase();
        const itemId = item._id || item.id;

        if (itemType === "resume" || itemType === "ats") {
            setSelectedResumeItem(item);
            setShowResumeModal(true);
            return;
        }

        let destination = item.route;
        if (itemType === "aptitude") {
            destination = `/aptitude/result/${itemId}`;
        } else if (itemType === "gd") {
            destination = `/gd/analysis/${itemId}`;
        } else if (itemType === "interview") {
            destination = `/report/${itemId}`;
        }

        navigate(destination, { state: { from: "/history" } });
    };

    const handleDownloadResumePdf = async () => {
        if (!selectedResumeItem) return;
        setIsDownloadingPdf(true);
        try {
            await generateATSReportPdf({
                analysis: selectedResumeItem,
                targetRole: selectedResumeItem.targetRole || selectedResumeItem.role || "Software Engineer",
                experienceLevel: selectedResumeItem.experienceLevel || "Mid Level",
                candidateName: userData?.name || "Candidate",
                candidateEmail: userData?.email || "candidate@intellivora.app",
                date: selectedResumeItem.createdAt ? new Date(selectedResumeItem.createdAt) : undefined,
            });
            toast.success("ATS Resume Scorecard downloaded successfully.");
        } catch (err) {
            console.error("[History] Error downloading resume PDF:", err);
            toast.error("Failed to generate PDF report.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const totalSessions = historyItems.length;

    const averageScore =
        totalSessions > 0
            ? (
                historyItems.reduce((sum, item) => sum + (item.finalScore || item.score || 0), 0) /
                totalSessions
            ).toFixed(1)
            : 0;

    const highestScore =
        totalSessions > 0
            ? Math.max(...historyItems.map((item) => item.finalScore || item.score || 0))
            : 0;

    const completedSessions = historyItems.filter(
        (item) => item.status?.toLowerCase() === "completed" || item.status?.toLowerCase() === "submitted"
    ).length;

    const getModuleIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "interview":
                return Brain;
            case "aptitude":
                return Timer;
            case "gd":
                return Users;
            case "resume":
            case "ats":
                return FileText;
            default:
                return Sparkles;
        }
    };

    const filteredItems = [...historyItems]
        .filter((item) => {
            // Module filter
            if (activeFilter !== "all") {
                const itemType = (item.type || item.module || "").toLowerCase();
                if (activeFilter === "interview" && itemType !== "interview") return false;
                if (activeFilter === "aptitude" && itemType !== "aptitude") return false;
                if (activeFilter === "gd" && itemType !== "gd") return false;
                if (activeFilter === "resume" && itemType !== "resume" && itemType !== "ats") return false;
            }

            // Search filter
            const query = search.toLowerCase();
            const textToMatch = [
                item.role,
                item.title,
                item.subtitle,
                item.category,
                item.topic,
            ].filter(Boolean).join(" ").toLowerCase();
            return textToMatch.includes(query);
        })
        .sort((a, b) => {
            const scoreA = a.finalScore ?? a.score ?? 0;
            const scoreB = b.finalScore ?? b.score ?? 0;
            switch (sortBy) {
                case "highest":
                    return scoreB - scoreA;
                case "lowest":
                    return scoreA - scoreB;
                case "role": {
                    const titleA = a.role || a.title || "";
                    const titleB = b.role || b.title || "";
                    return titleA.localeCompare(titleB);
                }
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    return (
        <div className="w-full bg-[#06080B] py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-4">
                    <BackButton to="/" fallback="/" />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="brand" size="sm">
                            ANALYTICS & ARCHIVE
                        </Badge>
                        <span className="text-xs font-mono text-[#64748B]">Unified History Hub</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
                        Assessment History & Analytics
                    </h1>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                        Review past mock interviews, timed aptitude exams, ATS keyword audits, and group discussion scorecards.
                    </p>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl">
                        <span className="text-xs text-[#94A3B8] block mb-1">Total Activities</span>
                        {loading ? (
                            <Skeleton variant="title" className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] font-mono tabular-nums">
                                {totalSessions}
                            </span>
                        )}
                    </div>
                    <div className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl">
                        <span className="text-xs text-[#94A3B8] block mb-1">Average Score</span>
                        {loading ? (
                            <Skeleton variant="title" className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-[#38BDF8] font-mono tabular-nums">
                                {averageScore}
                            </span>
                        )}
                    </div>
                    <div className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl">
                        <span className="text-xs text-[#94A3B8] block mb-1">Highest Score</span>
                        {loading ? (
                            <Skeleton variant="title" className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-[#22C55E] font-mono tabular-nums">
                                {highestScore}
                            </span>
                        )}
                    </div>
                    <div className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl">
                        <span className="text-xs text-[#94A3B8] block mb-1">Completed</span>
                        {loading ? (
                            <Skeleton variant="title" className="h-8 w-16" />
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-[#A78BFA] font-mono tabular-nums">
                                {completedSessions}
                            </span>
                        )}
                    </div>
                </div>

                {/* Filters, Search & Sort Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
                    {/* Module Filter Pills */}
                    <div className="flex flex-wrap gap-1 p-1 bg-[#0A0D14] border border-[#161F33] rounded-lg">
                        {[
                            { id: "all", label: "All Sessions" },
                            { id: "interview", label: "Interviews" },
                            { id: "aptitude", label: "Aptitude" },
                            { id: "gd", label: "GD Chamber" },
                            { id: "resume", label: "ATS Resume" },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                    activeFilter === filter.id
                                        ? "bg-[#141B2D] text-[#F1F5F9] border border-[#2D3E63]"
                                        : "text-[#94A3B8] hover:text-[#F1F5F9]"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="w-full md:w-64">
                            <Input
                                leftIcon={Search}
                                placeholder="Search by role or topic..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-[#0A0D14] border border-[#1E2B45] text-xs text-[#F1F5F9] outline-none cursor-pointer focus:border-[#3B82F6]"
                        >
                            <option value="latest">Latest First</option>
                            <option value="highest">Highest Score</option>
                            <option value="lowest">Lowest Score</option>
                            <option value="role">Title A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Items Feed */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="bg-[#0E131F] border border-[#1E2B45] p-5 rounded-xl space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="avatar" className="w-10 h-10 rounded-lg" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton variant="text" className="w-24 h-3" />
                                        <Skeleton variant="title" className="w-48 h-4" />
                                    </div>
                                    <Skeleton variant="button" className="w-20 h-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error && historyItems.length === 0 ? (
                    <ErrorState
                        title="Unable to Load Assessment History"
                        description={error}
                        onRetry={fetchHistory}
                    />
                ) : filteredItems.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title={search ? "No matching records found" : "No assessment history yet"}
                        description={
                            search
                                ? "Try adjusting your search query or filter."
                                : "You haven't completed any mock interviews or aptitude diagnostics yet. Start your first session to build your portfolio."
                        }
                        actionLabel="Start Mock Interview"
                        onAction={() => navigate("/interview")}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            const itemId = item._id || item.id;
                            const itemType = (item.type || item.module || "interview").toLowerCase();
                            const Icon = getModuleIcon(itemType);
                            const score = item.finalScore ?? item.score ?? 0;
                            const title = item.title || item.role || item.topic || "Assessment";
                            const subtitle = item.subtitle || `${item.category || ""} • ${item.difficulty || ""}`.trim();

                            return (
                                <div
                                    key={itemId}
                                    className="bg-[#0E131F] border border-[#1E2B45] hover:border-[#2D3E63] p-4 sm:p-5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-lg bg-[#141B2D] border border-[#2D3E63] flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    variant={
                                                        itemType === "gd"
                                                            ? "success"
                                                            : itemType === "aptitude"
                                                            ? "brand"
                                                            : "neutral"
                                                    }
                                                    size="sm"
                                                >
                                                    {itemType}
                                                </Badge>
                                                {item.targetCompany && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#141B2D] text-[#38BDF8] border border-[#1E2B45]">
                                                        <Building2 size={11} />
                                                        <span>{item.targetCompany}</span>
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-mono text-[#64748B]">
                                                    {item.createdAt
                                                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "Recently"}
                                                </span>
                                            </div>
                                            <h3 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">
                                                {title}
                                            </h3>
                                            {subtitle && (
                                                <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#161F33]">
                                        <div className="text-right">
                                            <span className="text-[11px] text-[#64748B] block uppercase">Score</span>
                                            <span
                                                className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
                                                    score >= 80
                                                        ? "text-[#22C55E]"
                                                        : score >= 60
                                                        ? "text-[#F59E0B]"
                                                        : "text-[#EF4444]"
                                                }`}
                                            >
                                                {score}
                                                <span className="text-xs text-[#64748B] font-normal font-sans">
                                                    /100
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                rightIcon={ArrowRight}
                                                onClick={() => handleViewReport(item)}
                                            >
                                                View Report
                                            </Button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem({ id: itemId, type: itemType });
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 rounded-lg text-[#64748B] hover:text-[#F87171] hover:bg-[#280B0B] transition-colors cursor-pointer"
                                                aria-label="Delete assessment record"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ATS Resume Analysis Details Modal */}
                <Modal
                    isOpen={showResumeModal}
                    onClose={() => {
                        setShowResumeModal(false);
                        setSelectedResumeItem(null);
                    }}
                    size="lg"
                    title={selectedResumeItem?.title || "ATS Resume Scorecard"}
                    description={
                        selectedResumeItem?.createdAt
                            ? `Evaluated on ${new Date(selectedResumeItem.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })} for ${selectedResumeItem.targetRole || "Target Role"} (${selectedResumeItem.experienceLevel || "Mid Level"})`
                            : "Detailed applicant tracking system analysis and keyword breakdown."
                    }
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowResumeModal(false);
                                    setSelectedResumeItem(null);
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={Download}
                                loading={isDownloadingPdf}
                                onClick={handleDownloadResumePdf}
                            >
                                Download ATS Report (PDF)
                            </Button>
                        </>
                    }
                >
                    {selectedResumeItem && (
                        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                            {/* 3 Score Pillars */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-xl bg-[#141B2D] border border-[#1E2B45] text-center">
                                    <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">ATS Match</span>
                                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#38BDF8]">
                                        {selectedResumeItem.atsScore ?? selectedResumeItem.score ?? 0}%
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#141B2D] border border-[#1E2B45] text-center">
                                    <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Resume Score</span>
                                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#22C55E]">
                                        {selectedResumeItem.resumeScore ?? selectedResumeItem.score ?? 0}%
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#141B2D] border border-[#1E2B45] text-center">
                                    <span className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Interview Prep</span>
                                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#A78BFA]">
                                        {selectedResumeItem.interviewReadinessScore ?? 0}%
                                    </span>
                                </div>
                            </div>

                            {/* Strengths */}
                            {selectedResumeItem.strengths && selectedResumeItem.strengths.length > 0 && (
                                <div className="p-4 rounded-xl bg-[#062319]/40 border border-[#047857]/30 space-y-2">
                                    <div className="flex items-center gap-2 text-[#34D399] text-xs font-semibold uppercase tracking-wider">
                                        <CheckCircle2 size={14} />
                                        <span>Observed Strengths</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-[#CBD5E1] pl-5 list-disc">
                                        {selectedResumeItem.strengths.map((s, idx) => (
                                            <li key={idx} className="leading-relaxed">{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Weaknesses / Areas for Elevation */}
                            {selectedResumeItem.weaknesses && selectedResumeItem.weaknesses.length > 0 && (
                                <div className="p-4 rounded-xl bg-[#280B0B]/40 border border-[#B91C1C]/30 space-y-2">
                                    <div className="flex items-center gap-2 text-[#F87171] text-xs font-semibold uppercase tracking-wider">
                                        <AlertTriangle size={14} />
                                        <span>Areas for Elevation</span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-[#CBD5E1] pl-5 list-disc">
                                        {selectedResumeItem.weaknesses.map((w, idx) => (
                                            <li key={idx} className="leading-relaxed">{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing Skills */}
                            {selectedResumeItem.missingSkills && selectedResumeItem.missingSkills.length > 0 && (
                                <div className="p-4 rounded-xl bg-[#141B2D] border border-[#1E2B45] space-y-2">
                                    <span className="text-[11px] font-semibold text-[#38BDF8] uppercase tracking-wider block">
                                        Missing Target Keywords & Skills
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedResumeItem.missingSkills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-md bg-[#0A0D14] border border-[#2D3E63] text-xs font-mono text-[#F1F5F9]"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actionable Improvement Suggestions */}
                            {selectedResumeItem.improvementSuggestions && selectedResumeItem.improvementSuggestions.length > 0 && (
                                <div className="p-4 rounded-xl bg-[#141B2D] border border-[#1E2B45] space-y-2">
                                    <span className="text-[11px] font-semibold text-[#F59E0B] uppercase tracking-wider block">
                                        Actionable Recommendations
                                    </span>
                                    <ul className="space-y-1.5 text-xs text-[#CBD5E1] pl-5 list-disc">
                                        {selectedResumeItem.improvementSuggestions.map((sug, idx) => (
                                            <li key={idx} className="leading-relaxed">{sug}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Delete Assessment Record?"
                    description="This action cannot be undone. The evaluation metrics and report data will be permanently purged from your account."
                    footer={
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={deleteItem}
                            >
                                Confirm Delete
                            </Button>
                        </>
                    }
                >
                    <p className="text-xs text-[#94A3B8]">
                        Item ID: <span className="font-mono text-[#F1F5F9]">{selectedItem?.id}</span>
                    </p>
                </Modal>
            </div>
        </div>
    );
}

export default InterviewHistory;