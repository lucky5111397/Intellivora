import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(
                    ServerUrl + "/api/interview/get-interviews",
                    { withCredentials: true }
                );

                console.log(result.data);
                setInterviews(result.data);
            } catch (error) {
                console.log(error);
            }
        };

        getMyInterviews();
    }, []);

    const deleteInterview = async () => {
        try {
            await axios.delete(
                `${ServerUrl}/api/interview/delete-interview/${selectedInterview}`,
                { withCredentials: true }
            );

            setInterviews((prev) =>
                prev.filter((item) => item._id !== selectedInterview)
            );

            setShowDeleteModal(false);
            setSelectedInterview(null);

        } catch (error) {
            console.log(error);
            alert("Unable to delete interview.");
        }
    };

    const totalInterviews = interviews.length;

    const averageScore =
        totalInterviews > 0
            ? (
                interviews.reduce((sum, item) => sum + (item.finalScore || 0), 0) /
                totalInterviews
            ).toFixed(1)
            : 0;

    const highestScore =
        totalInterviews > 0
            ? Math.max(...interviews.map((item) => item.finalScore || 0))
            : 0;

    const completedInterviews = interviews.filter(
        (item) => item.status?.toLowerCase() === "completed"
    ).length;

    const filteredInterviews = [...interviews]
        .filter((item) =>
            item.role.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "highest":
                    return (b.finalScore || 0) - (a.finalScore || 0);

                case "lowest":
                    return (a.finalScore || 0) - (b.finalScore || 0);

                case "role":
                    return a.role.localeCompare(b.role);

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
                        className="
w-14
h-14
flex
items-center
justify-center
rounded-2xl
border
border-white/10
bg-white/5
backdrop-blur-xl
text-white
transition-all
duration-300
hover:-translate-y-1
hover:border-blue-500/30
hover:bg-white/10
hover:shadow-[0_10px_30px_rgba(59,130,246,.2)]
"
                    >
                        <FaArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Interview History
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Track your past interviews and performance reports
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                    <div className="glass p-5 rounded-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <p className="text-sm text-gray-500">Total Interviews</p>
                        <h2 className="mt-3 text-3xl font-bold text-emerald-400">
                            {totalInterviews}
                        </h2>
                    </div>

                    <div className="
glass
rounded-3xl
border
border-white/10
p-6
transition-all
duration-300
hover:-translate-y-2
hover:border-blue-500/30
hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)]
">
                        <p className="text-sm text-slate-400">Average Score</p>
                        <h2 className="mt-3 text-3xl font-bold text-cyan-400">
                            {averageScore}
                        </h2>
                    </div>

                    <div className="
glass
rounded-3xl
border
border-white/10
p-6
transition-all
duration-300
hover:-translate-y-2
hover:border-blue-500/30
hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)]
">
                        <p className="text-sm text-gray-500">Highest Score</p>
                        <h2 className="mt-3 text-3xl font-bold text-green-400">
                            {highestScore}
                        </h2>
                    </div>

                    <div className="
glass
rounded-3xl
border
border-white/10
p-6
transition-all
duration-300
hover:-translate-y-2
hover:border-blue-500/30
hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)]
">
                        <p className="text-sm text-slate-400">Completed</p>
                        <h2 className="mt-3 text-4xl font-bold text-violet-400">
                            {completedInterviews}
                        </h2>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">

                    <input
                        type="text"
                        placeholder="🔍 Search interview..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
flex-1
rounded-2xl
border
border-white/10
bg-white/5
backdrop-blur-xl
px-5
py-3
text-white
placeholder:text-slate-500
outline-none
transition-all
duration-300
focus:border-blue-500
focus:ring-4
focus:ring-blue-500/10
"
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="
rounded-2xl
border
border-white/10
bg-[#111827]
px-5
py-3
text-white
outline-none
appearance-none
transition-all
duration-300
focus:border-blue-500
"
                    >
                        <option value="latest" className="bg-[#111827] text-white">
                            Latest
                        </option>

                        <option value="highest" className="bg-[#111827] text-white">
                            Highest Score
                        </option>

                        <option value="lowest" className="bg-[#111827] text-white">
                            Lowest Score
                        </option>

                        <option value="role" className="bg-[#111827] text-white">
                            Role A-Z
                        </option>
                    </select>

                </div>

                {interviews.length === 0 ? (
                    <div className="bg-white dark:bg-[#111827] p-10 rounded-2xl shadow text-center">
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            No interviews found. Start your first interview.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredInterviews.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className="
group
glass
rounded-3xl
border
border-white/10
p-5
cursor-pointer
transition-all
duration-300
hover:-translate-y-2
hover:border-blue-500/30
hover:shadow-[0_20px_50px_rgba(59,130,246,.18)]
"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            {item.role}
                                        </h3>

                                        <p className="text-sm mt-2 flex flex-wrap gap-2">

                                            <span className="
rounded-full
border
border-blue-500/20
bg-blue-500/10
px-3
py-1
text-xs
font-medium
text-blue-300
">
                                                {item.experience}
                                            </span>

                                            <span className="
rounded-full
border
border-violet-500/20
bg-violet-500/10
px-3
py-1
text-xs
font-medium
text-violet-300
">
                                                {item.mode}
                                            </span>

                                        </p>

                                        <p className="mt-4 text-sm text-slate-400">
                                            📅 {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center justify-end gap-3">

                                            {/* SCORE */}
                                            <div className="min-w-[90px] text-center">
                                                <p className="text-4xl font-bold text-emerald-400">
                                                    {(item.finalScore || 0)}/10
                                                </p>

                                                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                                                    Score
                                                </p>

                                                <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-white/10 mx-auto">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                                                        style={{
                                                            width: `${(item.finalScore || 0) * 10}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* STATUS BADGE */}
                                            <span
                                                className={`px-4 py-2 rounded-full border text-xs font-semibold ${item.status?.toLowerCase() === "completed"
                                                    ? "border-green-500/20 bg-green-500/15 text-green-400"
                                                    : "border-yellow-500/20 bg-yellow-500/15 text-yellow-400"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInterview(item._id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="
rounded-xl
border
border-red-500/20
bg-red-500/10
px-3 py-2
text-red-400
transition-all
duration-300
hover:bg-red-500/20
"
                                                title="Delete Interview"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FaTrash size={15} />
                                                    <span className="text-sm font-medium">
                                                        Delete
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                className="
mt-4
rounded-xl
bg-gradient-to-r
from-blue-600
via-violet-600
to-cyan-500
px-4
py-2
text-sm
font-semibold
text-white
shadow-[0_0_20px_rgba(59,130,246,.25)]
transition-all
duration-300
group-hover:scale-105
"
                                            >
                                                View Report →
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}



                {
                    showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="w-[90%] max-w-md rounded-2xl bg-white dark:bg-[#111827] p-6 shadow-2xl border border-gray-200 dark:border-gray-700">

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Delete Interview?
                                </h2>

                                <p className="mt-3 text-gray-600 dark:text-gray-300">
                                    This action cannot be undone. Are you sure you want to permanently delete this interview?
                                </p>

                                <div className="mt-6 flex justify-end gap-3">

                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setSelectedInterview(null);
                                        }}
                                        className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={deleteInterview}
                                        className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        </div>
                    )
                }

            </div >
        </div >
    );
}

export default InterviewHistory;