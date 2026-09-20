import React, { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";
import { fetchAdminSubscribers, deleteAdminSubscriber } from "../adminApi";
import { Button, Input, BackButton, EmptyState, Skeleton } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({
    totalSubscribers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);

  const loadSubscribers = useCallback(
    async (page = 1, query = activeSearch) => {
      setIsLoading(true);
      try {
        const data = await fetchAdminSubscribers(page, 20, query);
        if (data?.success) {
          setSubscribers(data.subscribers || []);
          setPagination(
            data.pagination || {
              totalSubscribers: 0,
              totalPages: 1,
              currentPage: 1,
              limit: 20,
            }
          );
        } else {
          toast.error(data?.message || "Failed to load newsletter subscribers.");
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Failed to load subscribers."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    loadSubscribers(1, activeSearch);
  }, [loadSubscribers, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleConfirmDelete = async () => {
    if (!subscriberToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteAdminSubscriber(subscriberToDelete._id);
      if (result?.success) {
        toast.success(`Removed ${subscriberToDelete.email} from subscribers.`);
        setSubscribers((prev) => prev.filter((s) => s._id !== subscriberToDelete._id));
        setPagination((prev) => ({
          ...prev,
          totalSubscribers: Math.max(0, prev.totalSubscribers - 1),
        }));
        setSubscriberToDelete(null);
      } else {
        toast.error(result?.message || "Failed to remove subscriber.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to remove subscriber."
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
                <span className="text-[#38BDF8] font-semibold">Newsletter Subscribers</span>
              </nav>
            </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                <Shield size={13} className="text-[#3B82F6]" />
                <span>Marketing & Audience</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                Newsletter Subscribers
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                View captured email addresses, sign-up dates, and manage mailing list subscriptions.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={() => loadSubscribers(pagination.currentPage, activeSearch)}
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
              placeholder="Search by subscriber email..."
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

        {/* Directory Table */}
        <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-3 border-b border-[#1E2B45]/40"
                >
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-56 bg-[#141B2D]" />
                    <Skeleton className="h-3 w-32 bg-[#141B2D]" />
                  </div>
                  <Skeleton className="h-7 w-24 bg-[#141B2D]" />
                  <Skeleton className="h-8 w-20 bg-[#141B2D]" />
                </div>
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={Mail}
                title="No Subscribers Found"
                description={
                  activeSearch
                    ? `No subscribers matched the query "${activeSearch}". Try searching with a different email address.`
                    : "No newsletter subscribers have been recorded yet."
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
                    <th className="py-3.5 px-4 font-semibold">Subscriber Email</th>
                    <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Subscribed</th>
                    <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Source</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B45]/50 text-xs">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber._id}
                      className="hover:bg-[#0E131F]/50 transition-colors group"
                    >
                      {/* Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8] shrink-0">
                            <Mail size={14} />
                          </div>
                          <span className="font-semibold text-[#F1F5F9] font-mono">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      {/* Subscribed Date */}
                      <td className="py-4 px-4 text-[#94A3B8] font-mono text-[11px] hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#64748B]" />
                          <span>{formatDate(subscriber.subscribedAt || subscriber.createdAt)}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#141B2D] border border-[#1E2B45] text-[#93C5FD]">
                          {subscriber.source || "footer"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSubscriberToDelete(subscriber)}
                          className="text-xs text-[#EF4444] hover:bg-[#280B0B] hover:text-[#F87171] p-1.5 h-auto"
                          title="Remove subscriber"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && subscribers.length > 0 && (
            <div className="py-3.5 px-4 border-t border-[#1E2B45] bg-[#0E131F]/50 flex items-center justify-between text-xs text-[#94A3B8]">
              <div>
                Showing <span className="text-[#F1F5F9] font-mono">{subscribers.length}</span> of{" "}
                <span className="text-[#F1F5F9] font-mono">
                  {pagination.totalSubscribers}
                </span>{" "}
                subscribers
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px]">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pagination.currentPage <= 1 || isLoading}
                    onClick={() =>
                      loadSubscribers(pagination.currentPage - 1, activeSearch)
                    }
                    className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.currentPage >= pagination.totalPages || isLoading
                    }
                    onClick={() =>
                      loadSubscribers(pagination.currentPage + 1, activeSearch)
                    }
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

        {/* Confirmation Modal for Delete Action */}
        {subscriberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border border-[#1E2B45] bg-[#0E131F] p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#280B0B] border border-[#EF4444]/40 flex items-center justify-center text-[#F87171]">
                  <AlertTriangle size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => setSubscriberToDelete(null)}
                  disabled={isDeleting}
                  className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#F1F5F9]">
                  Remove Newsletter Subscriber
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-[#F1F5F9] font-mono">
                    {subscriberToDelete.email}
                  </span>{" "}
                  from the newsletter subscribers list? They will no longer receive weekly intelligence dispatches.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E2B45]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubscriberToDelete(null)}
                  disabled={isDeleting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmDelete}
                  isLoading={isDeleting}
                  className="text-xs"
                >
                  Remove Subscriber
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

