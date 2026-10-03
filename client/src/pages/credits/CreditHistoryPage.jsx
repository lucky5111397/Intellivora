import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Gift,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { fetchMyCreditTransactions } from "../../services/creditLedgerApi.js";
import BackButton from "../../components/ui/BackButton.jsx";

const TYPE_CONFIG = {
  DEDUCTION: {
    label: "Deduction",
    icon: ArrowDownLeft,
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    prefix: "-",
    amountClass: "text-rose-400 font-bold",
  },
  ADDITION: {
    label: "Added",
    icon: ArrowUpRight,
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    prefix: "+",
    amountClass: "text-emerald-400 font-bold",
  },
  REFILL: {
    label: "Monthly Refill",
    icon: RefreshCw,
    className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    prefix: "+",
    amountClass: "text-cyan-400 font-bold",
  },
  BONUS: {
    label: "Bonus / Grant",
    icon: Gift,
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    prefix: "+",
    amountClass: "text-amber-400 font-bold",
  },
  REFUND: {
    label: "Refund",
    icon: ShieldCheck,
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    prefix: "+",
    amountClass: "text-blue-400 font-bold",
  },
};

export default function CreditHistoryPage() {
  const { userData } = useSelector((state) => state.user);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetchMyCreditTransactions({ page, limit: 15 });
      if (res?.data) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load credit transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <BackButton fallback="/pricing" />
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Credit Audit Ledger
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1.5">
              Transparent, immutable ledger tracking practice credit allocation and usage.
            </p>
          </div>

          <Link
            to="/pricing"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Get More Credits
          </Link>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A1628] border border-cyan-500/20 p-6 relative overflow-hidden">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Available Practice Credits
            </div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 mt-2">
              {userData?.credits ?? 100}
            </div>
            <p className="text-slate-500 text-[11px] mt-2">
              Used across Mock Interviews, GD, and ATS audits.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Current Membership Tier
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-white capitalize">
                {userData?.plan || "Free"} Tier
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Active
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-2">
              Upgrade for higher monthly refills & unlimited practice.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Free Platform Modules
            </div>
            <div className="text-lg font-bold text-slate-200 mt-2">0 Credits Cost</div>
            <p className="text-slate-500 text-[11px] mt-2">
              Aptitude drills, DSA practice, SQL sandbox, and Quizzes are completely free.
            </p>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Transaction History
            </h2>
            <span className="text-xs text-slate-500">{pagination.total} total records</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-xs">Loading ledger entries...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Transactions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Transactions will appear here when you take mock interviews, upgrade plans, or
                consume credits.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Activity / Description</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                    <th className="py-3 px-6 text-right">Balance Snapshot</th>
                    <th className="py-3 px-6">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transactions.map((tx) => {
                    const typeConfig = TYPE_CONFIG[tx.type] || {
                      label: tx.type,
                      className: "bg-slate-800 text-slate-300",
                      prefix: "",
                      amountClass: "text-slate-300",
                    };
                    const TypeIcon = typeConfig.icon || CreditCard;

                    return (
                      <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${typeConfig.className}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-white max-w-xs truncate">
                          {tx.description || tx.metadata?.reason || "Practice Activity"}
                        </td>
                        <td className={`py-4 px-6 text-right whitespace-nowrap ${typeConfig.amountClass}`}>
                          {typeConfig.prefix}
                          {Math.abs(tx.amount)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400 whitespace-nowrap">
                          {tx.balanceAfter !== undefined ? tx.balanceAfter : "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                          {tx.referenceId ? `${tx.referenceId.slice(0, 10)}...` : tx._id.slice(0, 8)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing page {page} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

