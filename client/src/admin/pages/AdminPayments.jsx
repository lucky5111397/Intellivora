import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from "lucide-react";
import { fetchAdminPayments } from "../adminApi";
import { Button, Input, BackButton, EmptyState, Skeleton } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import { getPlanDisplayName } from "../../config/pricingPlans";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    totalPayments: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = useCallback(
    async (page = 1, query = activeSearch) => {
      setIsLoading(true);
      try {
        const data = await fetchAdminPayments(page, 20, query);
        if (data?.success) {
          setPayments(data.payments || []);
          setPagination(
            data.pagination || {
              totalPayments: 0,
              totalPages: 1,
              currentPage: 1,
              limit: 20,
            }
          );
        } else {
          toast.error(data?.message || "Failed to load payment transactions.");
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Failed to load payment records."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    loadPayments(1, activeSearch);
  }, [loadPayments, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
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
                <span className="text-[#38BDF8] font-semibold">Payment Transactions</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Shield size={13} className="text-[#3B82F6]" />
                  <span>Financial Audit Records</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  Payment Transactions & Orders
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Immutable ledger of credit purchases, Razorpay payment tokens, and reconciliation audit logs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A0D14] border border-[#1E2B45] text-xs text-[#94A3B8] font-mono">
                  <Lock size={12} className="text-[#22C55E]" />
                  <span>Audit Immutable</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={RefreshCw}
                  onClick={() => loadPayments(pagination.currentPage, activeSearch)}
                  isLoading={isLoading}
                  className="text-xs self-start sm:self-auto"
                >
                  Refresh Table
                </Button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by candidate name, email, plan ID, or Razorpay ID..."
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
            ) : payments.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={IndianRupee}
                  title="No Payments Found"
                  description={
                    activeSearch
                      ? `No transaction records matched the query "${activeSearch}".`
                      : "No payment transactions have been recorded yet."
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
                      <th className="py-3.5 px-4 font-semibold">Plan</th>
                      <th className="py-3.5 px-4 font-semibold">Amount</th>
                      <th className="py-3.5 px-4 font-semibold">Credits</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2B45]/50 text-xs">
                    {payments.map((p) => {
                      const isPaid = p.status === "paid";
                      const isFailed = p.status === "failed";

                      return (
                        <tr
                          key={p._id}
                          className="hover:bg-[#0E131F]/50 transition-colors group"
                        >
                          {/* Candidate */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#F1F5F9]">
                              {p.userId?.name || "Deleted Candidate"}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-xs">
                              {p.userId?.email || "No email available"}
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-4 px-4">
                            <span className="font-mono text-xs text-[#93C5FD] uppercase">
                              {getPlanDisplayName(p.planId)}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4">
                            <span className="font-mono font-bold text-xs text-[#22C55E]">
                              ₹{p.amount?.toLocaleString()}
                            </span>
                          </td>

                          {/* Credits */}
                          <td className="py-4 px-4">
                            <span className="font-mono text-xs text-[#F1F5F9]">
                              +{p.credits?.toLocaleString()}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#0B2518] border border-[#22C55E]/40 text-[#4ADE80]">
                                <CheckCircle2 size={11} />
                                Paid
                              </span>
                            ) : isFailed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#280B0B] border border-[#EF4444]/40 text-[#F87171]">
                                <XCircle size={11} />
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#271A04] border border-[#F59E0B]/40 text-[#FBBF24]">
                                <Clock size={11} />
                                Created
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-[#94A3B8] font-mono text-[11px] hidden md:table-cell">
                            {formatDate(p.createdAt)}
                          </td>

                          {/* Actions (Audit View Only - No Delete!) */}
                          <td className="py-4 px-4 text-right">
                            <Link
                              to={`/admin/payments/${p._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#38BDF8] hover:text-[#38BDF8] text-[11px] font-medium text-[#94A3B8] transition-colors"
                            >
                              <span>Audit</span>
                              <ExternalLink size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!isLoading && payments.length > 0 && (
              <div className="py-3.5 px-4 border-t border-[#1E2B45] bg-[#0E131F]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <div>
                  Showing <span className="text-[#F1F5F9] font-mono">{payments.length}</span> of{" "}
                  <span className="text-[#F1F5F9] font-mono">{pagination.totalPayments}</span>{" "}
                  transactions
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1 || isLoading}
                      onClick={() => loadPayments(pagination.currentPage - 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                      onClick={() => loadPayments(pagination.currentPage + 1, activeSearch)}
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
        </div>
      </div>
    </div>
  );
}

