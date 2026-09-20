import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  CheckCircle2,
} from "lucide-react";
import { fetchAdminResume, deleteAdminResume } from "../adminApi";
import { Button, Input, BackButton, EmptyState, Skeleton } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminResume() {
  const [analyses, setAnalyses] = useState([]);
  const [pagination, setPagination] = useState({
    totalAnalyses: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAnalyses = useCallback(
    async (page = 1, query = activeSearch) => {
      setIsLoading(true);
      try {
        const data = await fetchAdminResume(page, 20, query);
        if (data?.success) {
          setAnalyses(data.analyses || []);
          setPagination(
            data.pagination || {
              totalAnalyses: 0,
              totalPages: 1,
              currentPage: 1,
              limit: 20,
            }
          );
        } else {
          toast.error(data?.message || "Failed to load resume analyses.");
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Failed to load resume records."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    loadAnalyses(1, activeSearch);
  }, [loadAnalyses, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteAdminResume(analysisToDelete._id);
      if (res?.success) {
        toast.success("Resume analysis record deleted successfully.");
        setAnalyses((prev) => prev.filter((a) => a._id !== analysisToDelete._id));
        setPagination((prev) => ({
          ...prev,
          totalAnalyses: Math.max(0, prev.totalAnalyses - 1),
        }));
        setAnalysisToDelete(null);
      } else {
        toast.error(res?.message || "Failed to delete resume analysis.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to delete resume analysis."
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
                <span className="text-[#38BDF8] font-semibold">ATS Resume Scans</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Shield size={13} className="text-[#3B82F6]" />
                  <span>ATS Analytics Records</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  ATS Resume Analyses
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Review candidate resume evaluations, ATS compatibility scores, skills gap analysis, and manage records.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => loadAnalyses(pagination.currentPage, activeSearch)}
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
                placeholder="Search by candidate name, email, target role, or experience..."
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
            ) : analyses.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={FileText}
                  title="No Resume Analyses Found"
                  description={
                    activeSearch
                      ? `No resume analysis records matched the query "${activeSearch}".`
                      : "No ATS resume analyses have been recorded yet."
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
                      <th className="py-3.5 px-4 font-semibold">Target Role</th>
                      <th className="py-3.5 px-4 font-semibold">ATS Score</th>
                      <th className="py-3.5 px-4 font-semibold">Resume Score</th>
                      <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2B45]/50 text-xs">
                    {analyses.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-[#0E131F]/50 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#F1F5F9]">
                            {item.userId?.name || "Deleted Candidate"}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-xs">
                            {item.userId?.email || "No email available"}
                          </div>
                        </td>

                        {/* Role & Experience */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-[#F1F5F9]">{item.targetRole}</div>
                          <div className="text-[11px] text-[#94A3B8] font-mono capitalize">
                            {item.experienceLevel} Level
                          </div>
                        </td>

                        {/* ATS Score */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                              item.atsScore >= 75
                                ? "bg-[#0B2518] text-[#4ADE80] border border-[#22C55E]/30"
                                : item.atsScore >= 50
                                ? "bg-[#271A04] text-[#FBBF24] border border-[#F59E0B]/30"
                                : "bg-[#280B0B] text-[#F87171] border border-[#EF4444]/30"
                            }`}
                          >
                            <CheckCircle2 size={11} />
                            {item.atsScore}%
                          </span>
                        </td>

                        {/* Overall Resume Score */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#38BDF8]">
                            <Award size={13} />
                            {item.resumeScore}/100
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-[#94A3B8] font-mono text-[11px] hidden md:table-cell">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/resume/${item._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#38BDF8] hover:text-[#38BDF8] text-[11px] font-medium text-[#94A3B8] transition-colors"
                            >
                              <span>View</span>
                              <ExternalLink size={12} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setAnalysisToDelete(item)}
                              className="p-1.5 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#EF4444] hover:text-[#F87171] text-[#94A3B8] transition-colors"
                              title="Delete resume analysis"
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
            {!isLoading && analyses.length > 0 && (
              <div className="py-3.5 px-4 border-t border-[#1E2B45] bg-[#0E131F]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <div>
                  Showing <span className="text-[#F1F5F9] font-mono">{analyses.length}</span> of{" "}
                  <span className="text-[#F1F5F9] font-mono">{pagination.totalAnalyses}</span>{" "}
                  analyses
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1 || isLoading}
                      onClick={() => loadAnalyses(pagination.currentPage - 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                      onClick={() => loadAnalyses(pagination.currentPage + 1, activeSearch)}
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
            isOpen={!!analysisToDelete}
            title="Delete Resume Analysis"
            itemLabel={
              analysisToDelete
                ? `${analysisToDelete.targetRole} (${analysisToDelete.userId?.name || "Candidate"})`
                : undefined
            }
            description="Are you sure you want to permanently delete this resume analysis record, including all ATS evaluations, strengths, weaknesses, and missing skill telemetry? This action cannot be undone."
            onClose={() => setAnalysisToDelete(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

