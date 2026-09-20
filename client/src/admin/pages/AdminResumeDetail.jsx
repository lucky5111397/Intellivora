import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  User,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { fetchAdminResumeDetail, deleteAdminResume } from "../adminApi";
import { Button, BackButton, Skeleton, ErrorState } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAdminResumeDetail(id);
        if (data?.success && data?.analysis) {
          setAnalysis(data.analysis);
        } else {
          throw new Error(data?.message || "Failed to load resume analysis details.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Resume analysis not found."
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
      const res = await deleteAdminResume(id);
      if (res?.success) {
        toast.success("Resume analysis record deleted successfully.");
        navigate("/admin/resume");
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
          <BackButton to="/admin/resume" label="Back to Resume Directory" />
          <ErrorState
            title="Analysis Not Found"
            description={error}
            actionLabel="Back to Directory"
            onAction={() => navigate("/admin/resume")}
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
              <BackButton to="/admin/resume" label="Back to Resume Directory" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <a href="/admin/resume" className="hover:text-[#F1F5F9] transition-colors">
                  ATS Resume Scans
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">Analysis Details</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <FileText size={13} className="text-[#3B82F6]" />
                  <span>Resume Scan #{id.slice(-6)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  {analysis?.targetRole || "Resume Analysis"}
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Experience Level: <span className="capitalize text-[#F1F5F9]">{analysis?.experienceLevel}</span> •{" "}
                  Analyzed on {formatDate(analysis?.createdAt)}
                </p>
              </div>

              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                className="text-xs self-start sm:self-auto"
              >
                Delete Analysis
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
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Candidate Profile */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <User size={14} className="text-[#38BDF8]" />
                    <span>Candidate</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9]">
                    {analysis?.userId?.name || "Deleted Candidate"}
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8] truncate">
                    {analysis?.userId?.email || "No email"}
                  </div>
                </div>

                {/* ATS Compatibility */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <CheckCircle2 size={14} className="text-[#22C55E]" />
                    <span>ATS Match</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#22C55E]">
                      {analysis?.atsScore ?? 0}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Parser compliance rating
                  </div>
                </div>

                {/* Resume Quality Score */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Award size={14} className="text-[#38BDF8]" />
                    <span>Resume Score</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#38BDF8]">
                      {analysis?.resumeScore ?? 0}
                    </span>
                    <span className="text-xs text-[#94A3B8]">/100</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Content & impact weighting
                  </div>
                </div>

                {/* Interview Readiness */}
                <div className="p-5 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#94A3B8]">
                    <Lightbulb size={14} className="text-[#F59E0B]" />
                    <span>Readiness Score</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#F59E0B]">
                      {analysis?.interviewReadinessScore ?? 0}
                    </span>
                    <span className="text-xs text-[#94A3B8]">/100</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-mono">
                    Role alignment evaluation
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F1F5F9]">
                    <CheckCircle2 size={16} className="text-[#22C55E]" />
                    <span>Identified Strengths ({analysis?.strengths?.length || 0})</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis?.strengths?.length > 0 ? (
                      analysis.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-xs text-[#94A3B8] bg-[#0E131F] p-3 rounded-lg border border-[#1E2B45]/60 flex items-start gap-2"
                        >
                          <span className="text-[#22C55E] mt-0.5">•</span>
                          <span className="flex-1">{s}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-[#64748B]">No explicit strengths detected.</p>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F1F5F9]">
                    <XCircle size={16} className="text-[#EF4444]" />
                    <span>Identified Weaknesses ({analysis?.weaknesses?.length || 0})</span>
                  </div>
                  <ul className="space-y-2">
                    {analysis?.weaknesses?.length > 0 ? (
                      analysis.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="text-xs text-[#94A3B8] bg-[#0E131F] p-3 rounded-lg border border-[#1E2B45]/60 flex items-start gap-2"
                        >
                          <span className="text-[#EF4444] mt-0.5">•</span>
                          <span className="flex-1">{w}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-[#64748B]">No explicit weaknesses flagged.</p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Skills Gap */}
              <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F1F5F9]">
                  <AlertTriangle size={16} className="text-[#F59E0B]" />
                  <span>Missing Skills Gap ({analysis?.missingSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.missingSkills?.length > 0 ? (
                    analysis.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-md text-xs font-mono bg-[#271A04] border border-[#F59E0B]/40 text-[#FBBF24]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-[#64748B]">All required core skills are present in resume.</p>
                  )}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F1F5F9]">
                  <Lightbulb size={16} className="text-[#38BDF8]" />
                  <span>Actionable Improvement Suggestions</span>
                </div>
                <ul className="space-y-2.5">
                  {analysis?.improvementSuggestions?.length > 0 ? (
                    analysis.improvementSuggestions.map((sug, i) => (
                      <li
                        key={i}
                        className="text-xs text-[#F1F5F9] bg-[#0E131F] p-3.5 rounded-lg border border-[#1E2B45] leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded bg-[#0D1E3A] border border-[#2563EB]/40 text-[#38BDF8] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="flex-1">{sug}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-[#64748B]">No improvement suggestions recorded.</p>
                  )}
                </ul>
              </div>

              {/* Privacy & Retention Badge */}
              <div className="p-4 rounded-xl border border-[#1E2B45]/60 bg-[#0A0D14]/50 flex items-center gap-3 text-xs text-[#94A3B8]">
                <ShieldCheck size={18} className="text-[#22C55E] shrink-0" />
                <span>
                  <strong className="text-[#F1F5F9]">Privacy Protected:</strong> In compliance with Intellivora's candidate data privacy policy, raw resume documents and extracted text are ephemeral and are not persisted in the database. Only structured evaluation scores and gap analysis are retained.
                </span>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <AdminDeleteModal
            isOpen={showDeleteModal}
            title="Delete Resume Analysis"
            itemLabel={`"${analysis?.targetRole || "Resume Analysis"}" for ${analysis?.userId?.name || "Candidate"}`}
            description="Are you sure you want to permanently delete this resume analysis record, including all ATS evaluations, strengths, weaknesses, and missing skill telemetry? This action cannot be undone."
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

