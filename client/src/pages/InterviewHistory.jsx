import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

function InterviewHistory() {
    const [historyItems, setHistoryItems] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // { id, type }

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Try unified history API first
                const result = await axios.get(
                    `${ServerUrl}/api/history`,
                    { withCredentials: true }
                );
                if (Array.isArray(result.data)) {
                    setHistoryItems(result.data);
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
                    score: item.finalScore || 0,
                    finalScore: item.finalScore || 0,
                    status: item.status || "Completed",
                    createdAt: item.createdAt,
                    route: `/report/${item._id}`,
                }));
                setHistoryItems(mapped);
            } catch (err) {
                console.error("[History] Error fetching interview history fallback:", err);
            }
        };

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
            } else {
                // Try unified history delete or fallback to delete-interview
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
            alert("Unable to delete history entry.");
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

    const filteredItems = [...historyItems]
        .filter((item) => {
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
        <div className="relative min-h-screen overflow-hidden bg-[#050816] py-10 text-white">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-500/15 blur-[120px]" />
                <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-500/15 blur-[120px]" />
                <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>
            <div className="relative z-10 w-[92%] max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 w-full flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(59,130,246,.2)] cursor-pointer"
                    >
                        <FaArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Activity & Interview History
                        </h1>
                        <p className="mt-1 text-slate-400">
                            Track your past interviews and aptitude assessment performance reports
                        </p>
                    </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="glass p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-slate-400">Total Activities</p>
                        <h2 className="mt-3 text-3xl font-bold text-emerald-400 font-mono">
                            {totalSessions}
                        </h2>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-slate-400">Average Score</p>
                        <h2 className="mt-3 text-3xl font-bold text-cyan-400 font-mono">
                            {averageScore}
                        </h2>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-slate-400">Highest Score</p>
                        <h2 className="mt-3 text-3xl font-bold text-green-400 font-mono">
                            {highestScore}
                        </h2>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-slate-400">Completed</p>
                        <h2 className="mt-3 text-3xl font-bold text-violet-400 font-mono">
                            {completedSessions}
                        </h2>
                    </div>
                </div>

                {/* Search & Sort */}
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                    <input
                        type="text"
                        placeholder="🔍 Search by role, topic, or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-[#111827] px-5 py-3 text-white outline-none appearance-none transition-all duration-300 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="latest" className="bg-[#111827] text-white">Latest</option>
                        <option value="highest" className="bg-[#111827] text-white">Highest Score</option>
                        <option value="lowest" className="bg-[#111827] text-white">Lowest Score</option>
                        <option value="role" className="bg-[#111827] text-white">Title A-Z</option>
                    </select>
                </div>

                {/* Items List */}
                {historyItems.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl">
                            📋
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">No Activity Records Yet</h3>
                            <p className="text-sm text-slate-400 mt-1 max-w-md">
                                You haven't taken any mock interviews or aptitude drills yet. Start your first practice session to build your career readiness!
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                            <button
                                onClick={() => navigate("/interview")}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-sm hover:scale-105 transition cursor-pointer"
                            >
                                Start Mock Interview
                            </button>
                            <button
                                onClick={() => navigate("/aptitude/topics")}
                                className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 font-semibold text-sm hover:bg-white/15 transition cursor-pointer"
                            >
                                Practice Aptitude
                            </button>
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-center text-slate-400">
                        <p className="text-lg font-medium text-white mb-1">No matching activities found</p>
                        <p className="text-sm text-slate-400">No records match "{search}". Try searching for another topic or role.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredItems.map((item, index) => {
                            const isAptitude = item.type === "aptitude";
                            const targetRoute = item.route || (isAptitude ? `/aptitude/result/${item._id || item.id}` : `/report/${item._id || item.id}`);
                            const itemId = item._id || item.id;

                            return (
                                <div
                                    key={itemId || index}
                                    onClick={() => navigate(targetRoute)}
                                    className="group glass rounded-3xl border border-white/10 p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(59,130,246,.18)]"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    isAptitude
                                                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                }`}>
                                                    {isAptitude ? "Aptitude Assessment" : "Mock Interview"}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white">
                                                {item.title || item.role}
                                            </h3>

                                            <div className="text-sm mt-2 flex flex-wrap gap-2 items-center">
                                                {isAptitude ? (
                                                    <>
                                                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                                                            {item.subtitle || item.category}
                                                        </span>
                                                        {item.difficulty && (
                                                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                                                                {item.difficulty}
                                                            </span>
                                                        )}
                                                        {item.accuracy !== undefined && (
                                                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                                                {item.accuracy}% Accuracy
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {item.experience && (
                                                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                                                                {item.experience}
                                                            </span>
                                                        )}
                                                        {item.mode && (
                                                            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                                                                {item.mode}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <p className="mt-3 text-sm text-slate-400">
                                                📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center justify-end gap-4">

                                                {/* SCORE */}
                                                <div className="min-w-[90px] text-center font-family-jetbrains">
                                                    <p className="text-3xl font-bold text-emerald-400">
                                                        {isAptitude
                                                            ? `${item.score}/${item.totalMarks || 10}`
                                                            : `${item.finalScore || 0}/10`
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 font-sans">
                                                        Score
                                                    </p>

                                                    <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/10 mx-auto">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                                                            style={{
                                                                width: isAptitude
                                                                    ? `${item.totalMarks ? Math.min(100, Math.max(0, (item.score / item.totalMarks) * 100)) : 0}%`
                                                                    : `${(item.finalScore || 0) * 10}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* STATUS BADGE */}
                                                <span
                                                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold capitalize ${
                                                        ["completed", "submitted"].includes(item.status?.toLowerCase())
                                                            ? "border-green-500/20 bg-green-500/15 text-green-400"
                                                            : "border-yellow-500/20 bg-yellow-500/15 text-yellow-400"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>

                                                {/* DELETE BUTTON */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem({ id: itemId, type: item.type });
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-400 transition-all duration-300 hover:bg-red-500/20 cursor-pointer"
                                                    title="Delete Entry"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <FaTrash size={14} />
                                                        <span className="text-xs font-medium">Delete</span>
                                                    </div>
                                                </button>

                                                {/* ACTION BUTTON */}
                                                <button
                                                    className="rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,.25)] transition-all duration-300 group-hover:scale-105 cursor-pointer"
                                                >
                                                    {isAptitude ? "View Result →" : "View Report →"}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-[#111827] p-6 shadow-2xl border border-gray-700 space-y-4">
                            <h2 className="text-xl font-bold text-white">
                                Delete Activity Record?
                            </h2>

                            <p className="text-sm text-gray-300 leading-relaxed">
                                This action cannot be undone. Are you sure you want to permanently delete this {selectedItem?.type === 'aptitude' ? 'aptitude assessment attempt' : 'interview session'}?
                            </p>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedItem(null);
                                    }}
                                    className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={deleteItem}
                                    className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-semibold text-sm cursor-pointer"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default InterviewHistory;