import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Trash2,
  User,
  Clock,
  Award,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { fetchAdminGDDetail, deleteAdminGD } from "../adminApi";
import { Button, BackButton, Skeleton, ErrorState } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminGDDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminGDDetail(id);
        if (data?.success && data?.session) {
          setSession(data.session);
        } else {
          throw new Error(data?.message || "Failed to load GD session details.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "GD session not found."
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
      const res = await deleteAdminGD(id);
      if (res?.success) {
        toast.success("GD session deleted successfully.");
        navigate("/admin/gd");
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
          <BackButton to="/admin/gd" label="Back to GD Directory" />
          <ErrorState
            title="Session Not Found"
            description={error}
            actionLabel="Back to Directory"
            onAction={() => navigate("/admin/gd")}
          />
        </div>
      </div>
    );
  }

  const evaluation = session?.evaluation || {};
  const breakdown = evaluation.breakdown || {};
  const telemetry = session?.telemetry || {};

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header & Breadcrumb */}
          <div className="space-y-4">
            <div className="space-y-3">
              <BackButton to="/admin/gd" label="Back to GD Directory" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <a href="/admin/gd" className="hover:text-[#F1F5F9] transition-colors">
                  Group Discussions
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Session Details</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <MessageSquare size={13} className="text-[#3B82F6]" />
                  <span>GD Session #{id.slice(-6)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  {session?.topic || "Group Discussion"}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Category: <span className="capitalize text-[#F1F5F9]">{session?.category}</span> • Difficulty:{" "}
                  <span className="capitalize text-[#F1F5F9]">{session?.difficulty}</span> •{" "}
                  {formatDate(session?.createdAt)}
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
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Candidate */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <User size={14} className="text-[#38BDF8]" />
                    <span>Candidate</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9]">
                    {session?.userId?.name || "Deleted Candidate"}
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8] truncate">
                    {session?.userId?.email || "No email"}
                  </div>
                </div>

                {/* Overall Score */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Award size={14} className="text-[#22C55E]" />
                    <span>Evaluation Score</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#22C55E]">
                      {evaluation.overallScore ?? "—"}
                    </span>
                    <span className="text-xs text-[#94A3B8]">/100</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8]">
                    Status: <span className="font-bold uppercase text-[#F1F5F9]">{session?.status}</span>
                  </div>
                </div>

                {/* Speaking Time */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Clock size={14} className="text-[#F59E0B]" />
                    <span>Candidate Speech</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#F1F5F9]">
                    {formatSeconds(telemetry.candidateSpeakingTimeSeconds)}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Turns: {telemetry.candidateTurnCount ?? 0} of {telemetry.totalTurnsCount ?? 0}
                  </div>
                </div>

                {/* Peer Simulation */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Users size={14} className="text-[#A855F7]" />
                    <span>Multi-Agent Room</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9]">3 AI Peer Personas</div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Total Time: {formatSeconds(telemetry.totalSessionDurationSeconds)}
                  </div>
                </div>
              </div>

              {/* Evaluation Breakdown */}
              {evaluation.overallScore != null && (
                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-6">
                  <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Activity size={18} className="text-[#38BDF8]" />
                    <span>Core Competency Evaluation</span>
                  </h2>

                  {/* 4 Pillars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                      <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Articulation</span>
                      <div className="text-xl font-bold font-mono text-[#38BDF8]">
                        {breakdown.articulation ?? 0}/100
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                      <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Leadership</span>
                      <div className="text-xl font-bold font-mono text-[#A855F7]">
                        {breakdown.leadership ?? 0}/100
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                      <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Listening</span>
                      <div className="text-xl font-bold font-mono text-[#22C55E]">
                        {breakdown.listening ?? 0}/100
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0E131F] border border-[#1E2B45] space-y-1">
                      <span className="text-[11px] text-[#94A3B8] font-mono uppercase">Critical Thinking</span>
                      <div className="text-xl font-bold font-mono text-[#F59E0B]">
                        {breakdown.criticalThinking ?? 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {evaluation.strengths?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-mono uppercase text-[#4ADE80] flex items-center gap-1.5 font-bold">
                          <CheckCircle2 size={13} />
                          Key Strengths
                        </span>
                        <ul className="space-y-1.5">
                          {evaluation.strengths.map((str, i) => (
                            <li
                              key={i}
                              className="text-xs text-[#94A3B8] bg-[#0E131F] p-2.5 rounded-lg border border-[#1E2B45]/60"
                            >
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.improvements?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-mono uppercase text-[#FBBF24] flex items-center gap-1.5 font-bold">
                          <AlertTriangle size={13} />
                          Improvement Suggestions
                        </span>
                        <ul className="space-y-1.5">
                          {evaluation.improvements.map((imp, i) => (
                            <li
                              key={i}
                              className="text-xs text-[#94A3B8] bg-[#0E131F] p-2.5 rounded-lg border border-[#1E2B45]/60"
                            >
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {evaluation.detailedFeedback && (
                    <div className="space-y-2 pt-2 border-t border-[#1E2B45]/40">
                      <span className="text-xs font-mono uppercase text-[#38BDF8]">
                        Comprehensive Evaluator Feedback
                      </span>
                      <p className="text-xs text-[#F1F5F9] bg-[#0E131F] p-4 rounded-lg border border-[#1E2B45] leading-relaxed whitespace-pre-wrap">
                        {evaluation.detailedFeedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discussion Turn Transcript */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#38BDF8]" />
                    <span>Turn-by-Turn Transcript ({session?.transcript?.length || 0} Turns)</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {session?.transcript?.map((turn, idx) => {
                    const isCandidate = turn.speakerLabel === "You" || turn.speakerId === "candidate";
                    const isSystem = turn.speakerLabel === "System" || turn.speakerId === "orchestrator";

                    let borderBadge = "border-[#1E2B45] bg-[#0A0D14]";
                    let speakerColor = "text-[#A855F7]";

                    if (isCandidate) {
                      borderBadge = "border-[#2563EB]/40 bg-[#0D1E3A]/20";
                      speakerColor = "text-[#38BDF8]";
                    } else if (isSystem) {
                      borderBadge = "border-[#64748B]/30 bg-[#1E293B]/20";
                      speakerColor = "text-[#94A3B8]";
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${borderBadge} space-y-2`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${speakerColor}`}>
                              {turn.speakerLabel}
                            </span>
                            {turn.personaRole && turn.personaRole !== "candidate" && (
                              <span className="text-[10px] text-[#64748B] uppercase">
                                ({turn.personaRole.replace("_", " ")})
                              </span>
                            )}
                          </div>
                          <span className="text-[#64748B] text-[11px]">
                            Turn #{turn.turnNumber}
                          </span>
                        </div>
                        <p className="text-xs text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">
                          {turn.content}
                        </p>
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
            title="Delete GD Session"
            itemLabel={`"${session?.topic || "Discussion"}" for ${session?.userId?.name || "Candidate"}`}
            description="Are you sure you want to permanently delete this group discussion session, including all agent transcripts, telemetry logs, and evaluation reports? This action cannot be undone."
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

