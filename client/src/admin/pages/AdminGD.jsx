import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Clock,
} from "lucide-react";
import { fetchAdminGD, deleteAdminGD } from "../adminApi";
import { Button, Input, BackButton, EmptyState, Skeleton } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminGD() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    totalSessions: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSessions = useCallback(
    async (page = 1, query = activeSearch) => {
      setIsLoading(true);
      try {
        const data = await fetchAdminGD(page, 20, query);
        if (data?.success) {
          setSessions(data.sessions || []);
          setPagination(
            data.pagination || {
              totalSessions: 0,
              totalPages: 1,
              currentPage: 1,
              limit: 20,
            }
          );
        } else {
          toast.error(data?.message || "Failed to load GD sessions.");
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Failed to load GD sessions."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    loadSessions(1, activeSearch);
  }, [loadSessions, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteAdminGD(sessionToDelete._id);
      if (res?.success) {
        toast.success("GD session deleted successfully.");
        setSessions((prev) => prev.filter((s) => s._id !== sessionToDelete._id));
        setPagination((prev) => ({
          ...prev,
          totalSessions: Math.max(0, prev.totalSessions - 1),
        }));
        setSessionToDelete(null);
      } else {
        toast.error(res?.message || "Failed to delete GD session.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to delete GD session."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation & Header */}
          <div className="space-y-4">
            <div className="space-y-3">
              <BackButton to="/admin" label="Back to Admin Console" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Group Discussions</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Shield size={13} className="text-[#3B82F6]" />
                  <span>Multi-Agent Simulation Records</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  Group Discussion Sessions
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Review candidate GD performances, turn transcripts, AI evaluation metrics, and manage session records.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => loadSessions(pagination.currentPage, activeSearch)}
                isLoading={isLoading}
                className="text-xs self-start sm:self-auto"
              >
                Refresh Table
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by candidate name, email, topic, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Search}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="md" className="text-xs">
                Search
              </Button>
              {activeSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleClearSearch}
                  className="text-xs text-[#94A3B8]"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Table Container */}
          <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-3 border-b border-[#1E2B45]/40"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48 bg-[#141B2D]" />
                      <Skeleton className="h-3 w-32 bg-[#141B2D]" />
                    </div>
                    <Skeleton className="h-7 w-20 bg-[#141B2D]" />
                    <Skeleton className="h-8 w-24 bg-[#141B2D]" />
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={MessageSquare}
                  title="No GD Sessions Found"
                  description={
                    activeSearch
                      ? `No GD sessions matched the query "${activeSearch}".`
                      : "No group discussion sessions have been recorded yet."
                  }
                  actionLabel={activeSearch ? "Reset Search" : undefined}
                  onAction={activeSearch ? handleClearSearch : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E2B45] bg-[#0E131F]/70 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      <th className="py-3.5 px-4 font-semibold">Candidate</th>
                      <th className="py-3.5 px-4 font-semibold">Discussion Topic</th>
                      <th className="py-3.5 px-4 font-semibold">Duration</th>
                      <th className="py-3.5 px-4 font-semibold">Score</th>
                      <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2B45]/50 text-xs">
                    {sessions.map((session) => (
                      <tr
                        key={session._id}
                        className="hover:bg-[#0E131F]/50 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#F1F5F9]">
                            {session.userId?.name || "Deleted Candidate"}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-xs">
                            {session.userId?.email || "No email available"}
                          </div>
                        </td>

                        {/* Topic & Category */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-[#F1F5F9] line-clamp-1">
                            {session.topic}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="capitalize">{session.category}</span>
                            <span>•</span>
                            <span className="capitalize">{session.difficulty}</span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-[#94A3B8] font-mono text-xs">
                            <Clock size={12} />
                            {session.durationMinutes} mins
                          </span>
                        </td>

                        {/* Overall Score */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#22C55E]">
                            <Award size={13} />
                            {session.evaluation?.overallScore != null
                              ? `${session.evaluation.overallScore}/100`
                              : "—"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-[#94A3B8] font-mono text-[11px] hidden md:table-cell">
                          {formatDate(session.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/gd/${session._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#38BDF8] hover:text-[#38BDF8] text-[11px] font-medium text-[#94A3B8] transition-colors"
                            >
                              <span>View</span>
                              <ExternalLink size={12} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setSessionToDelete(session)}
                              className="p-1.5 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#EF4444] hover:text-[#F87171] text-[#94A3B8] transition-colors"
                              title="Delete GD session"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!isLoading && sessions.length > 0 && (
              <div className="py-3.5 px-4 border-t border-[#1E2B45] bg-[#0E131F]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <div>
                  Showing <span className="text-[#F1F5F9] font-mono">{sessions.length}</span> of{" "}
                  <span className="text-[#F1F5F9] font-mono">{pagination.totalSessions}</span>{" "}
                  sessions
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1 || isLoading}
                      onClick={() => loadSessions(pagination.currentPage - 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                      onClick={() => loadSessions(pagination.currentPage + 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          <AdminDeleteModal
            isOpen={!!sessionToDelete}
            title="Delete GD Session"
            itemLabel={
              sessionToDelete
                ? `"${sessionToDelete.topic}" (${sessionToDelete.userId?.name || "Candidate"})`
                : undefined
            }
            description="Are you sure you want to permanently delete this group discussion session, including all agent transcripts, telemetry logs, and evaluation reports? This action cannot be undone."
            onClose={() => setSessionToDelete(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

