import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Sparkles,
  Loader2,
  ArrowRight,
  Code2,
  HelpCircle,
  Database,
  Brain,
  MessageSquare,
} from "lucide-react";
import {
  fetchMistakes,
  fetchMistakeStats,
  updateMistakeStatus,
  updateMistakeNotes,
  deleteMistake,
  recordMistake,
} from "../../services/mistakeBankApi.js";

const MODULE_OPTIONS = [
  { key: "all", label: "All Modules" },
  { key: "quiz", label: "Technical Quiz", icon: HelpCircle },
  { key: "dsa", label: "DSA Practice", icon: Code2 },
  { key: "sql", label: "SQL Practice", icon: Database },
  { key: "aptitude", label: "Aptitude Tests", icon: Brain },
  { key: "interview", label: "Mock Interview", icon: MessageSquare },
];

const STATUS_OPTIONS = [
  { key: "all", label: "All Status" },
  { key: "unresolved", label: "Unresolved", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  { key: "reviewing", label: "Reviewing", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { key: "mastered", label: "Mastered", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
];

export default function MistakeBankPage() {
  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Expanded card state: set of mistake IDs
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Editing notes state: { [id]: noteString }
  const [editingNotes, setEditingNotes] = useState({});
  const [activeEditingId, setActiveEditingId] = useState(null);

  // Manual Add Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMistake, setNewMistake] = useState({
    sourceModule: "quiz",
    questionTitle: "",
    category: "General",
    difficulty: "medium",
    expectedAnswer: "",
    userAnswer: "",
    explanation: "",
    notes: "",
  });
  const [submittingManual, setSubmittingManual] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.allSettled([
        fetchMistakes({
          sourceModule: selectedModule,
          status: selectedStatus,
          search,
          page,
          limit: 15,
        }),
        fetchMistakeStats(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value?.data) {
        setMistakes(listRes.value.data.mistakes || []);
        setPagination(listRes.value.data.pagination || { total: 0, totalPages: 1 });
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading mistakes data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModule, selectedStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateMistakeStatus(id, newStatus);
      setMistakes((prev) =>
        prev.map((m) => (m._id === id ? { ...m, revisionStatus: newStatus } : m))
      );
      setActionMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setActionMsg(""), 3000);
      // Reload stats in background
      fetchMistakeStats().then((res) => res?.data && setStats(res.data));
    } catch (err) {
      console.error("Failed to update mistake status", err);
    }
  };

  const handleSaveNotes = async (id) => {
    const noteText = editingNotes[id] ?? "";
    try {
      await updateMistakeNotes(id, noteText);
      setMistakes((prev) =>
        prev.map((m) => (m._id === id ? { ...m, notes: noteText } : m))
      );
      setActiveEditingId(null);
      setActionMsg("Personal notes saved!");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save notes", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this mistake from your bank?")) return;
    try {
      await deleteMistake(id);
      setMistakes((prev) => prev.filter((m) => m._id !== id));
      setActionMsg("Entry removed from Mistake Bank.");
      setTimeout(() => setActionMsg(""), 3000);
      fetchMistakeStats().then((res) => res?.data && setStats(res.data));
    } catch (err) {
      console.error("Failed to delete mistake", err);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!newMistake.questionTitle.trim()) return;
    setSubmittingManual(true);
    try {
      await recordMistake(newMistake);
      setShowAddModal(false);
      setNewMistake({
        sourceModule: "quiz",
        questionTitle: "",
        category: "General",
        difficulty: "medium",
        expectedAnswer: "",
        userAnswer: "",
        explanation: "",
        notes: "",
      });
      setActionMsg("New mistake logged successfully!");
      setTimeout(() => setActionMsg(""), 3000);
      loadData();
    } catch (err) {
      console.error("Failed to add manual mistake", err);
    } finally {
      setSubmittingManual(false);
    }
  };

  const totalCount = stats?.total ?? pagination.total;
  const unresolvedCount = stats?.unresolved ?? 0;
  const reviewingCount = stats?.reviewing ?? 0;
  const masteredCount = stats?.mastered ?? 0;

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mistake Bank & Revision Hub
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
              Consolidated intelligence repository capturing all missed questions from Quiz, DSA,
              and SQL drills. Master mistakes through spaced repetition.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Log Manual Mistake
          </button>
        </div>

        {/* Action toast */}
        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {actionMsg}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Total Logged
            </div>
            <div className="text-3xl font-black text-white mt-1">{totalCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Cross-platform entries</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="text-rose-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Needs Practice
            </div>
            <div className="text-3xl font-black text-rose-400 mt-1">{unresolvedCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Unresolved questions</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> In Review
            </div>
            <div className="text-3xl font-black text-amber-400 mt-1">{reviewingCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Active remediation</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">{masteredCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Retested successfully</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          {/* Module Tabs */}
          <div className="flex flex-wrap gap-2">
            {MODULE_OPTIONS.map((mod) => (
              <button
                key={mod.key}
                onClick={() => {
                  setSelectedModule(mod.key);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedModule === mod.key
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>

          {/* Search & Status Pill Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question, concept, or tag..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </form>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400 mr-1">Status:</span>
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st.key}
                  onClick={() => {
                    setSelectedStatus(st.key);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === st.key
                      ? "bg-white text-slate-950 font-bold"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mistakes List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-xs">Loading mistake bank records...</p>
          </div>
        ) : mistakes.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Mistakes Found</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              {search || selectedModule !== "all" || selectedStatus !== "all"
                ? "No entries match your current search and filter criteria."
                : "You haven't recorded any missed questions yet. As you solve Quizzes, DSA, and SQL drills, any incorrect answers will automatically be archived here for revision."}
            </p>
            <div className="pt-2">
              <Link
                to="/prepare/quiz"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
              >
                Practice Quizzes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mistakes.map((m) => {
              const isExpanded = expandedCards.has(m._id);
              const isEditing = activeEditingId === m._id;
              const currentNotes =
                editingNotes[m._id] !== undefined ? editingNotes[m._id] : m.notes || "";

              return (
                <div
                  key={m._id}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {m.sourceModule}
                      </span>
                      {m.category && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 font-medium">
                          {m.category}
                        </span>
                      )}
                      {m.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                            m.difficulty === "hard"
                              ? "text-rose-400 bg-rose-500/10"
                              : m.difficulty === "medium"
                              ? "text-amber-400 bg-amber-500/10"
                              : "text-emerald-400 bg-emerald-500/10"
                          }`}
                        >
                          {m.difficulty}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status Pill Switcher */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleStatusChange(m._id, "unresolved")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          m.revisionStatus === "unresolved"
                            ? "bg-rose-500 text-white font-bold shadow-sm"
                            : "bg-slate-800/60 text-slate-400 hover:text-rose-300"
                        }`}
                      >
                        Unresolved
                      </button>
                      <button
                        onClick={() => handleStatusChange(m._id, "reviewing")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          m.revisionStatus === "reviewing"
                            ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                            : "bg-slate-800/60 text-slate-400 hover:text-amber-300"
                        }`}
                      >
                        Reviewing
                      </button>
                      <button
                        onClick={() => handleStatusChange(m._id, "mastered")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          m.revisionStatus === "mastered"
                            ? "bg-emerald-500 text-white font-bold shadow-sm"
                            : "bg-slate-800/60 text-slate-400 hover:text-emerald-300"
                        }`}
                      >
                        Mastered
                      </button>

                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors ml-1"
                        title="Delete from Mistake Bank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Title & Quick Preview */}
                  <div
                    onClick={() => toggleExpand(m._id)}
                    className="cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {m.questionTitle}
                    </h4>
                    <button
                      type="button"
                      className="text-slate-400 group-hover:text-white p-1 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Body: Answers, Explanation & Notes */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {m.userAnswer && (
                          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                              Your Recorded Answer
                            </span>
                            <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap break-words">
                              {m.userAnswer}
                            </p>
                          </div>
                        )}

                        {m.expectedAnswer && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                              Expected / Correct Answer
                            </span>
                            <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap break-words">
                              {m.expectedAnswer}
                            </p>
                          </div>
                        )}
                      </div>

                      {m.explanation && (
                        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                            Remediation Explanation
                          </span>
                          <p className="text-slate-300 leading-relaxed">{m.explanation}</p>
                        </div>
                      )}

                      {/* Personal Revision Notes */}
                      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Edit3 className="w-3 h-3 text-cyan-400" /> Personal Revision Notes
                          </span>
                          {!isEditing ? (
                            <button
                              onClick={() => {
                                setActiveEditingId(m._id);
                                setEditingNotes((prev) => ({
                                  ...prev,
                                  [m._id]: m.notes || "",
                                }));
                              }}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
                            >
                              Edit Notes
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveNotes(m._id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px]"
                            >
                              <Save className="w-3 h-3" /> Save
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={currentNotes}
                            onChange={(e) =>
                              setEditingNotes({
                                ...editingNotes,
                                [m._id]: e.target.value,
                              })
                            }
                            placeholder="Add tips, key pitfalls to avoid, or formulas to remember..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                          />
                        ) : (
                          <p className="text-slate-400 italic">
                            {m.notes || "No personal notes added yet. Click 'Edit Notes' to document your key takeaways."}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Log Manual Mistake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Log Custom Mistake</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Source Module</label>
                  <select
                    value={newMistake.sourceModule}
                    onChange={(e) =>
                      setNewMistake({ ...newMistake, sourceModule: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="quiz">Technical Quiz</option>
                    <option value="dsa">DSA Practice</option>
                    <option value="sql">SQL Practice</option>
                    <option value="aptitude">Aptitude</option>
                    <option value="interview">Mock Interview</option>
                    <option value="manual">Other / External</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select
                    value={newMistake.difficulty}
                    onChange={(e) =>
                      setNewMistake({ ...newMistake, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Question Title / Problem Statement *
                </label>
                <input
                  type="text"
                  required
                  value={newMistake.questionTitle}
                  onChange={(e) =>
                    setNewMistake({ ...newMistake, questionTitle: e.target.value })
                  }
                  placeholder="e.g. Inverted binary tree edge cases..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Missed Answer</label>
                  <input
                    type="text"
                    value={newMistake.userAnswer}
                    onChange={(e) =>
                      setNewMistake({ ...newMistake, userAnswer: e.target.value })
                    }
                    placeholder="What you answered incorrectly"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={newMistake.expectedAnswer}
                    onChange={(e) =>
                      setNewMistake({ ...newMistake, expectedAnswer: e.target.value })
                    }
                    placeholder="Correct solution or option"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Remediation Notes</label>
                <textarea
                  rows={2}
                  value={newMistake.notes}
                  onChange={(e) => setNewMistake({ ...newMistake, notes: e.target.value })}
                  placeholder="Key takeaway to avoid this trap in future tests..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
                >
                  {submittingManual ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save to Mistake Bank"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

