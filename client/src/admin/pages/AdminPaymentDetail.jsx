import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Coins,
  Receipt,
} from "lucide-react";
import { fetchAdminPaymentDetail } from "../adminApi";
import { BackButton, Skeleton, ErrorState } from "@/components/ui";
import AdminNav from "../components/AdminNav";
import { getPlanDisplayName } from "../../config/pricingPlans";

export default function AdminPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminPaymentDetail(id);
        if (data?.success && data?.payment) {
          setPayment(data.payment);
        } else {
          throw new Error(data?.message || "Failed to load payment transaction details.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Payment transaction not found."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
        <AdminNav />
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          <BackButton to="/admin/payments" label="Back to Payments Directory" />
          <ErrorState
            title="Transaction Not Found"
            description={error}
            actionLabel="Back to Directory"
            onAction={() => navigate("/admin/payments")}
          />
        </div>
      </div>
    );
  }

  const isPaid = payment?.status === "paid";
  const isFailed = payment?.status === "failed";

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header & Breadcrumb */}
          <div className="space-y-4">
            <div className="space-y-3">
              <BackButton to="/admin/payments" label="Back to Payments Directory" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <a href="/admin/payments" className="hover:text-[#F1F5F9] transition-colors">
                  Payments
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Transaction Audit</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Receipt size={13} className="text-[#3B82F6]" />
                  <span>Transaction #{id.slice(-8)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  Payment Audit Record
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Initiated on {formatDate(payment?.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0B2518] border border-[#22C55E]/40 text-[#4ADE80]">
                    <CheckCircle2 size={13} />
                    Paid & Settled
                  </span>
                ) : isFailed ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#280B0B] border border-[#EF4444]/40 text-[#F87171]">
                    <XCircle size={13} />
                    Failed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#271A04] border border-[#F59E0B]/40 text-[#FBBF24]">
                    <Clock size={13} />
                    Created (Pending)
                  </span>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0A0D14] border border-[#1E2B45] text-xs text-[#94A3B8] font-mono">
                  <Lock size={12} className="text-[#22C55E]" />
                  <span>Immutable</span>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                    <Skeleton className="h-4 w-24 bg-[#141B2D]" />
                    <Skeleton className="h-8 w-36 bg-[#141B2D]" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Candidate */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <User size={14} className="text-[#38BDF8]" />
                    <span>Candidate</span>
                  </div>
                  <div className="text-base font-bold text-[#F1F5F9]">
                    {payment?.userId?.name || "Deleted Candidate"}
                  </div>
                  <div className="text-xs font-mono text-[#94A3B8] truncate">
                    {payment?.userId?.email || "No email"}
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B] pt-1">
                    Current Balance: {payment?.userId?.credits?.toLocaleString() || 0} credits
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <IndianRupee size={14} className="text-[#22C55E]" />
                    <span>Amount Paid</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#22C55E]">
                    ₹{payment?.amount?.toLocaleString() || 0}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Plan Tier: <span className="uppercase text-[#93C5FD] font-bold">{getPlanDisplayName(payment?.planId)}</span>
                  </div>
                </div>

                {/* Credits Credited */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Coins size={14} className="text-[#38BDF8]" />
                    <span>Credits Issued</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#38BDF8]">
                    +{payment?.credits?.toLocaleString() || 0}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Direct candidate credit allotment
                  </div>
                </div>
              </div>

              {/* Gateway Reconciliation Details */}
              <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#F1F5F9] uppercase font-mono tracking-wider">
                  Payment Gateway Reconciliation Identifiers
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                    <span className="text-[11px] text-[#94A3B8] font-mono uppercase">
                      Razorpay Order ID
                    </span>
                    <div className="text-xs font-mono text-[#F1F5F9] break-all select-all font-semibold">
                      {payment?.razorpayOrderId || "—"}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                    <span className="text-[11px] text-[#94A3B8] font-mono uppercase">
                      Razorpay Payment ID
                    </span>
                    <div className="text-xs font-mono text-[#F1F5F9] break-all select-all font-semibold">
                      {payment?.razorpayPaymentId || "—"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                    <Calendar size={13} className="text-[#64748B]" />
                    <span>Created: {formatDate(payment?.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                    <Calendar size={13} className="text-[#64748B]" />
                    <span>Last Updated: {formatDate(payment?.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Audit Integrity Notice */}
              <div className="p-5 rounded-xl border border-[#2563EB]/30 bg-[#0D1E3A]/20 flex items-start gap-3 text-xs text-[#93C5FD]">
                <Lock size={18} className="text-[#38BDF8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-[#F1F5F9]">
                    Financial Ledger Audit Guarantee
                  </div>
                  <p className="leading-relaxed">
                    This transaction record is permanently preserved in the platform audit log. Financial and credit transaction records cannot be edited, modified, or deleted by any administrative role, ensuring compliance with billing reconciliation standards.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

