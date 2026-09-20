import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain,
  Trash2,
  User,
  Clock,
  Award,
  FileText,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { fetchAdminInterviewDetail, deleteAdminInterview } from "../adminApi";
import { Button, BackButton, Skeleton, ErrorState } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminInterviewDetail(id);
        if (data?.success && data?.interview) {
          setInterview(data.interview);
        } else {
          throw new Error(data?.message || "Failed to load interview details.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Interview session not found."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAdminInterview(id);
      if (res?.success) {
        toast.success("Interview session deleted successfully.");
        navigate("/admin/interviews");
      } else {
        toast.error(res?.message || "Failed to delete interview.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to delete interview."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
          <BackButton to="/admin/interviews" label="Back to Interviews Directory" />
          <ErrorState
            title="Interview Not Found"
            description={error}
            actionLabel="Back to Directory"
            onAction={() => navigate("/admin/interviews")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header & Breadcrumb */}
          <div className="space-y-4">
            <div className="space-y-3">
              <BackButton to="/admin/interviews" label="Back to Interviews Directory" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <a href="/admin/interviews" className="hover:text-[#F1F5F9] transition-colors">
                  Interviews
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Session Details</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Brain size={13} className="text-[#3B82F6]" />
                  <span>Interview Session #{id.slice(-6)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  {interview?.role || "Interview Details"}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Completed on {formatDate(interview?.createdAt)} •{" "}
                  {interview?.questions?.length || 0} Questions Evaluated
                </p>
              </div>

              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="text-xs self-start sm:self-auto"
              >
                Delete Session
              </Button>
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
              <div className="p-6 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-4">
                <Skeleton className="h-6 w-48 bg-[#141B2D]" />
                <Skeleton className="h-24 w-full bg-[#141B2D]" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Candidate Info */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <User size={14} className="text-[#38BDF8]" />
                    <span>Candidate</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#F1F5F9]">
                      {interview?.userId?.name || "Deleted Candidate"}
                    </div>
                    <div className="text-xs font-mono text-[#94A3B8] truncate">
                      {interview?.userId?.email || "No email"}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Award size={14} className="text-[#38BDF8]" />
                    <span>Final Score</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#38BDF8]">
                      {interview?.finalScore ?? 0}
                    </span>
                    <span className="text-xs text-[#94A3B8]">/100</span>
                  </div>
                </div>

                {/* Configuration */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Clock size={14} className="text-[#38BDF8]" />
                    <span>Setup</span>
                  </div>
                  <div className="text-xs text-[#F1F5F9] space-y-1">
                    <div>
                      Mode: <span className="font-semibold text-[#38BDF8]">{interview?.mode}</span>
                    </div>
                    <div>
                      Experience: <span className="font-semibold text-[#F1F5F9]">{interview?.experience}</span>
                    </div>
                    {interview?.targetCompany && (
                      <div>
                        Target Company: <span className="font-semibold text-[#38BDF8]">{interview.targetCompany}</span>
                      </div>
                    )}
                    <div>
                      Plan: <span className="font-semibold text-[#F1F5F9]">{interview?.interviewPlan || "standard"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions & Feedback */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#38BDF8]" />
                    <span>Evaluated Questions ({interview?.questions?.length || 0})</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {interview?.questions?.map((q, idx) => (
                    <div
                      key={q._id || idx}
                      className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-5"
                    >
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2B45]/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#0D1E3A] border border-[#2563EB]/30 text-[#38BDF8] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            Q{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-[#F1F5F9]">
                            {q.question}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {q.difficulty && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#141B2D] border border-[#1E2B45] text-[#93C5FD]">
                              {q.difficulty}
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-[#38BDF8] px-2 py-0.5 rounded bg-[#0D1E3A] border border-[#2563EB]/40">
                            Score: {q.score ?? 0}/10
                          </span>
                        </div>
                      </div>

                      {/* Candidate Answer */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono uppercase text-[#94A3B8]">
                          Candidate Transcript
                        </span>
                        <div className="p-3.5 rounded-lg bg-[#0E131F] border border-[#1E2B45] text-xs text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">
                          {q.answer || "No response recorded."}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {q.feedback && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono uppercase text-[#38BDF8] flex items-center gap-1">
                            <MessageSquare size={13} />
                            <span>AI Evaluation & Feedback</span>
                          </span>
                          <div className="p-3.5 rounded-lg bg-[#0A192F]/50 border border-[#2563EB]/20 text-xs text-[#93C5FD] leading-relaxed whitespace-pre-wrap">
                            {q.feedback}
                          </div>
                        </div>
                      )}

                      {/* Multi-Dimensional Scoring Badges */}
                      <div className="flex items-center gap-3 pt-2 border-t border-[#1E2B45]/40 flex-wrap text-xs font-mono">
                        <div className="text-[#94A3B8]">
                          Confidence:{" "}
                          <span className="text-[#F1F5F9] font-bold">
                            {q.confidence ?? 0}/10
                          </span>
                        </div>
                        <span className="text-[#1E2B45]">•</span>
                        <div className="text-[#94A3B8]">
                          Communication:{" "}
                          <span className="text-[#F1F5F9] font-bold">
                            {q.communication ?? 0}/10
                          </span>
                        </div>
                        <span className="text-[#1E2B45]">•</span>
                        <div className="text-[#94A3B8]">
                          Correctness:{" "}
                          <span className="text-[#F1F5F9] font-bold">
                            {q.correctness ?? 0}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Context (if available) */}
              {interview?.resumeText && (
                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <FileText size={14} className="text-[#38BDF8]" />
                    <span>Source Resume Text Provided</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] text-xs text-[#94A3B8] max-h-60 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
                    {interview.resumeText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <AdminDeleteModal
            isOpen={showDeleteModal}
            title="Delete Interview Session"
            itemLabel={`${interview?.role || "Interview"} for ${interview?.userId?.name || "Candidate"}`}
            description="Are you sure you want to permanently delete this interview session, including all recorded questions, candidate transcripts, and AI evaluation feedback? This action cannot be undone."
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

