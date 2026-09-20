import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trash2,
  User,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { fetchAdminAptitudeDetail, deleteAdminAptitude } from "../adminApi";
import { Button, BackButton, Skeleton, ErrorState } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminAptitudeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminAptitudeDetail(id);
        if (data?.success && data?.attempt) {
          setAttempt(data.attempt);
        } else {
          throw new Error(data?.message || "Failed to load aptitude attempt details.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Aptitude attempt not found."
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
      const res = await deleteAdminAptitude(id);
      if (res?.success) {
        toast.success("Aptitude attempt deleted successfully.");
        navigate("/admin/aptitude");
      } else {
        toast.error(res?.message || "Failed to delete attempt.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to delete attempt."
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

  const formatSeconds = (totalSeconds) => {
    if (!totalSeconds) return "0s";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
        <AdminNav />
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          <BackButton to="/admin/aptitude" label="Back to Aptitude Directory" />
          <ErrorState
            title="Attempt Not Found"
            description={error}
            actionLabel="Back to Directory"
            onAction={() => navigate("/admin/aptitude")}
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
              <BackButton to="/admin/aptitude" label="Back to Aptitude Directory" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <a href="/admin/aptitude" className="hover:text-[#F1F5F9] transition-colors">
                  Aptitude
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Attempt Details</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <BookOpen size={13} className="text-[#3B82F6]" />
                  <span>Aptitude Test #{id.slice(-6)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  {attempt?.topic || "Aptitude Test Attempt"}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Category: <span className="capitalize text-[#F1F5F9]">{attempt?.category}</span> • Difficulty:{" "}
                  <span className="capitalize text-[#F1F5F9]">{attempt?.difficulty}</span>
                  {attempt?.targetCompany && (
                    <> • Target Company: <span className="text-[#38BDF8] font-semibold">{attempt.targetCompany}</span></>
                  )}{" "}
                  • {formatDate(attempt?.createdAt)}
                </p>
              </div>

              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="text-xs self-start sm:self-auto"
              >
                Delete Attempt
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                    <Skeleton className="h-4 w-24 bg-[#141B2D]" />
                    <Skeleton className="h-8 w-20 bg-[#141B2D]" />
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
              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Candidate */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <User size={14} className="text-[#38BDF8]" />
                    <span>Candidate</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9]">
                    {attempt?.userId?.name || "Deleted Candidate"}
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8] truncate">
                    {attempt?.userId?.email || "No email"}
                  </div>
                </div>

                {/* Score & Marks */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Target size={14} className="text-[#22C55E]" />
                    <span>Total Score</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-[#F1F5F9]">
                      {attempt?.score ?? 0}
                    </span>
                    <span className="text-xs text-[#94A3B8]">/{attempt?.totalMarks ?? 0} marks</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8]">
                    Accuracy: <span className="font-bold text-[#38BDF8]">{attempt?.accuracy ?? 0}%</span>
                  </div>
                </div>

                {/* Question Breakdown */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <HelpCircle size={14} className="text-[#A855F7]" />
                    <span>Questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#4ADE80] font-bold">
                      {attempt?.correctCount ?? 0} Correct
                    </span>
                    <span className="text-[#F87171] font-bold">
                      {attempt?.incorrectCount ?? 0} Wrong
                    </span>
                    <span className="text-[#94A3B8] font-bold">
                      {attempt?.skippedCount ?? 0} Skipped
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Total: {attempt?.questionCount ?? 0} questions
                  </div>
                </div>

                {/* Timing */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Clock size={14} className="text-[#F59E0B]" />
                    <span>Duration</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#F1F5F9]">
                    {formatSeconds(attempt?.timeTakenSeconds)}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Limit: {formatSeconds(attempt?.timeLimitSeconds)}
                  </div>
                </div>
              </div>

              {/* Questions Detail */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#38BDF8]" />
                    <span>Questions & Attempt Breakdown</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {attempt?.questions?.map((q, idx) => {
                    const isCorrect = q.result === "correct";
                    const isIncorrect = q.result === "incorrect";
                    const isSkipped = q.result === "skipped" || !q.selectedOptionKey;

                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-4"
                      >
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#1E2B45]/60 pb-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#0D1E3A] border border-[#2563EB]/30 text-[#38BDF8] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="text-sm font-semibold text-[#F1F5F9] leading-relaxed">
                              {q.questionSnapshot}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isCorrect && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#0B2518] text-[#4ADE80] border border-[#22C55E]/30">
                                <CheckCircle2 size={12} />
                                Correct (+{q.marksAwarded ?? 1})
                              </span>
                            )}
                            {isIncorrect && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#280B0B] text-[#F87171] border border-[#EF4444]/30">
                                <XCircle size={12} />
                                Incorrect
                              </span>
                            )}
                            {isSkipped && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#141B2D] text-[#94A3B8] border border-[#1E2B45]">
                                <AlertCircle size={12} />
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.optionsSnapshot?.map((opt) => {
                            const isSelected = q.selectedOptionKey === opt.key;
                            const isRightAnswer = q.correctOptionKey === opt.key;

                            let cardStyle = "bg-[#0E131F] border-[#1E2B45] text-[#94A3B8]";
                            if (isRightAnswer) {
                              cardStyle = "bg-[#0B2518] border-[#22C55E]/50 text-[#4ADE80]";
                            } else if (isSelected && !isRightAnswer) {
                              cardStyle = "bg-[#280B0B] border-[#EF4444]/50 text-[#F87171]";
                            }

                            return (
                              <div
                                key={opt.key}
                                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${cardStyle}`}
                              >
                                <span className="font-mono font-bold shrink-0">{opt.key}.</span>
                                <span className="flex-1">{opt.text}</span>
                                {isSelected && (
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 shrink-0">
                                    Candidate
                                  </span>
                                )}
                                {isRightAnswer && (
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 shrink-0">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanationSnapshot && (
                          <div className="p-3 rounded-lg bg-[#0A192F]/40 border border-[#2563EB]/20 text-xs text-[#93C5FD] leading-relaxed">
                            <span className="font-bold font-mono uppercase text-[10px] block text-[#38BDF8] mb-1">
                              Explanation:
                            </span>
                            {q.explanationSnapshot}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <AdminDeleteModal
            isOpen={showDeleteModal}
            title="Delete Aptitude Attempt"
            itemLabel={`${attempt?.topic || "Aptitude Test"} for ${attempt?.userId?.name || "Candidate"}`}
            description="Are you sure you want to permanently delete this aptitude attempt record, including all submitted answers, question snapshots, and accuracy scores? This action cannot be undone."
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

