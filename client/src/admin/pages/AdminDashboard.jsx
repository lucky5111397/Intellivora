import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  IndianRupee,
  Activity,
  CheckCircle2,
  FileText,
  Brain,
  MessageSquare,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Coins,
  Mail,
  CreditCard,
} from "lucide-react";
import { fetchAdminAnalytics } from "../adminApi";
import { Button, ErrorState, Skeleton, BackButton } from "@/components/ui";
import AdminNav from "../components/AdminNav";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAnalytics();
      if (data?.success && data?.analytics) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data?.message || "Failed to load platform analytics.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ErrorState
            title="Failed to Load Admin Analytics"
            description={error}
            actionLabel="Try Again"
            onAction={loadData}
          />
        </div>
      </div>
    );
  }

  const modules = analytics?.modules || {
    interview: 0,
    aptitude: 0,
    gd: 0,
    resume: 0,
  };

  const totalSessions = analytics?.totalSessions || 0;

  const moduleCards = [
    {
      title: "AI Interviews",
      count: modules.interview,
      icon: Brain,
      color: "text-[#38BDF8]",
      bgColor: "bg-[#38BDF8]/10 border-[#38BDF8]/20",
      share: totalSessions > 0 ? Math.round((modules.interview / totalSessions) * 100) : 0,
      link: "/admin/interviews",
    },
    {
      title: "Aptitude Tests",
      count: modules.aptitude,
      icon: BookOpen,
      color: "text-[#A855F7]",
      bgColor: "bg-[#A855F7]/10 border-[#A855F7]/20",
      share: totalSessions > 0 ? Math.round((modules.aptitude / totalSessions) * 100) : 0,
      link: "/admin/aptitude",
    },
    {
      title: "Group Discussions",
      count: modules.gd,
      icon: MessageSquare,
      color: "text-[#22C55E]",
      bgColor: "bg-[#22C55E]/10 border-[#22C55E]/20",
      share: totalSessions > 0 ? Math.round((modules.gd / totalSessions) * 100) : 0,
      link: "/admin/gd",
    },
    {
      title: "ATS Resume Scans",
      count: modules.resume,
      icon: FileText,
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
      share: totalSessions > 0 ? Math.round((modules.resume / totalSessions) * 100) : 0,
      link: "/admin/resume",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation & Breadcrumbs */}
          <div className="space-y-3">
            <BackButton to="/" label="Back to Application" />
            <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
              <span className="text-[#38BDF8] font-semibold">Admin Console</span>
              <span>/</span>
              <span className="text-[#F1F5F9]">Platform Analytics</span>
            </nav>
          </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
              <Shield size={13} className="text-[#3B82F6]" />
              <span>Administrative Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
              Platform Analytics & Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Authoritative overview of user adoption, platform volume, and financial metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RefreshCw}
              onClick={loadData}
              isLoading={isLoading}
              className="text-xs"
            >
              Refresh
            </Button>
            <Link to="/admin/newsletter">
              <Button
                variant="outline"
                size="sm"
                leftIcon={Mail}
                className="text-xs"
              >
                Newsletter
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button
                variant="primary"
                size="sm"
                rightIcon={ArrowRight}
                className="text-xs"
              >
                Manage Users
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Stat Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                <Skeleton className="h-4 w-24 bg-[#141B2D]" />
                <Skeleton className="h-8 w-16 bg-[#141B2D]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono">
                  Total Users
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8]">
                  <Users size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#F1F5F9] tabular-nums">
                  {analytics?.totalUsers?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-[#64748B]">registered</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono">
                  Total Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#22C55E]">
                  <IndianRupee size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#22C55E] tabular-nums">
                  ₹{analytics?.totalRevenue?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-[#64748B]">INR</span>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono">
                  Total Sessions
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#A855F7]">
                  <Activity size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#F1F5F9] tabular-nums">
                  {totalSessions.toLocaleString()}
                </span>
                <span className="text-xs text-[#64748B]">completed</span>
              </div>
            </div>

            {/* Successful Orders */}
            <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/40 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-mono">
                  Orders Paid
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#F59E0B]">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#F1F5F9] tabular-nums">
                  {analytics?.successfulOrders?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-[#64748B]">transactions</span>
              </div>
            </div>
          </div>
        )}

        {/* Module Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight">
              Assessment Modules Activity
            </h2>
            <span className="text-xs font-mono text-[#64748B]">
              4 Core Training Pillars
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleCards.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.title}
                  to={mod.link}
                  className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB]/50 transition-all group space-y-4 flex flex-col justify-between block"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${mod.bgColor} ${mod.color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#94A3B8]">
                        {mod.share}%
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-medium text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-2xl font-bold font-mono text-[#F1F5F9] tabular-nums mt-0.5">
                        {mod.count.toLocaleString()}
                      </p>
                    </div>

                    {/* Share Progress Bar */}
                    <div className="h-1.5 w-full bg-[#141B2D] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                        style={{ width: `${mod.share}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#38BDF8] group-hover:translate-x-0.5 transition-transform pt-2 border-t border-[#1E2B45]/40">
                    <span>Manage records</span>
                    <ArrowRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Operations Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-[#38BDF8]" />
                <h3 className="text-sm font-semibold text-[#F1F5F9]">
                  User Management
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Inspect candidate accounts, update account status, and manually adjust credits.
              </p>
            </div>

            <Link to="/admin/users" className="self-start">
              <Button
                variant="outline"
                size="sm"
                rightIcon={ArrowRight}
                className="text-xs"
              >
                Open Directory
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#38BDF8]" />
                <h3 className="text-sm font-semibold text-[#F1F5F9]">
                  Payment Audits
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8]">
                View immutable transaction records, order tokens, and financial reconciliation logs.
              </p>
            </div>

            <Link to="/admin/payments" className="self-start">
              <Button
                variant="outline"
                size="sm"
                rightIcon={ArrowRight}
                className="text-xs"
              >
                View Payments
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#38BDF8]" />
                <h3 className="text-sm font-semibold text-[#F1F5F9]">
                  Newsletter List
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8]">
                View marketing subscriptions, search emails, and manage the dispatch subscriber list.
              </p>
            </div>

            <Link to="/admin/newsletter" className="self-start">
              <Button
                variant="outline"
                size="sm"
                rightIcon={ArrowRight}
                className="text-xs"
              >
                Manage Subscribers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

