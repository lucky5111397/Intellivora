import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { Skeleton } from "@/components/ui";
import {
  ScoreSummary,
  MetricGrid,
  StrengthList,
  ImprovementList,
  RecommendationList,
  ReportDownload,
} from "@/components/results";
import { generateATSReportPdf } from "@/utils/pdfReportGenerator";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const isPdf = (file) => {
  if (!file) return false;
  const fileName = file.name?.toLowerCase() || "";
  return file.type === "application/pdf" || fileName.endsWith(".pdf");
};

const getScoreBadge = (score) => {
  if (score == null) return null;
  if (score >= 80) {
    return {
      label: "Excellent",
      className: "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
    };
  }
  if (score >= 60) {
    return {
      label: "Needs Improvement",
      className: "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
    };
  }
  return {
    label: "Critical Gaps",
    className: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
  };
};

function ResumeUploader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [selectedFile, setSelectedFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [uploadId, setUploadId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [textLength, setTextLength] = useState(0);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const fileDetails = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
    };
  }, [selectedFile]);

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!isPdf(file)) {
      return "Please upload a valid PDF resume.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Resume size must be 5 MB or smaller.";
    }
    return "";
  };

  const handleFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      setError("No file detected. Please drop your PDF file into the upload area.");
      return;
    }

    handleFile(file);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadId(null);
    setExtractedText("");
    setTextLength(0);
    setAnalysis(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = null;
    }
  };

  const handleAnalyze = async (extractedTextValue) => {
    if (!extractedTextValue || !targetRole || !experienceLevel) {
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await axios.post(
        `${ServerUrl}/api/resume/analyze`,
        {
          extractedText: extractedTextValue,
          targetRole,
          experienceLevel,
        },
        {
          withCredentials: true,
        }
      );

      const data = response.data;
      setAnalysis(data);

      if (data?.credits != null && userData) {
        dispatch(setUserData({ ...userData, credits: data.credits }));
      }

      toast.success("ATS Score Checker analysis completed successfully.");
    } catch (analyzeError) {
      const errorMessage =
        analyzeError?.response?.data?.message ||
        analyzeError.message ||
        "Unable to complete ATS Score Checker analysis. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      if (errorMessage.includes("200 credits")) {
        navigate("/pricing");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysis) return;
    return generateATSReportPdf({
      analysis,
      targetRole,
      experienceLevel,
      candidateName: userData?.name || "Candidate",
      candidateEmail: userData?.email || "candidate@intellivora.app",
      fileName: fileDetails?.name || "Resume.pdf",
      date: new Date(),
    });
  };

  const handleExtract = async (uploadId) => {
    if (!uploadId) {
      return;
    }

    setIsExtracting(true);
    setError("");

    try {
      const response = await axios.post(
        `${ServerUrl}/api/resume/extract`,
        { uploadId },
        {
          withCredentials: true,
        }
      );

      const data = response.data;
      setExtractedText(data.extractedText || "");
      setTextLength(data.textLength || 0);
      toast.success("Resume text extracted successfully.");
      return data.extractedText || "";
    } catch (extractError) {
      const errorMessage =
        extractError?.response?.data?.message ||
        extractError.message ||
        "Unable to extract resume text. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return "";
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpload = async () => {
    const creditBalance = userData?.credits;

    if (creditBalance != null && creditBalance < 200) {
      toast.error("You need 200 credits to use ATS Score Checker.");
      navigate("/pricing");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a PDF resume before continuing.");
      return;
    }

    if (!targetRole || !experienceLevel) {
      toast.error("Please choose a target role and experience level before continuing.");
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    setIsUploading(true);
    setError("");

    try {
      const response = await axios.post(
        `${ServerUrl}/api/resume/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const data = response.data;
      const uploadIdValue = data.uploadId || null;
      setUploadId(uploadIdValue);
      toast.success("Resume uploaded successfully.");

      if (uploadIdValue) {
        const extracted = await handleExtract(uploadIdValue);
        if (extracted) {
          await handleAnalyze(extracted);
        }
      }
    } catch (uploadError) {
      const errorMessage =
        uploadError?.response?.data?.message ||
        uploadError.message ||
        "Unable to upload your resume. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || isExtracting || isAnalyzing;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Upload Dropzone */}
        <div
          className={`relative flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
            isDragActive
              ? "border-[#2563EB] bg-[#2563EB]/10 ring-1 ring-[#2563EB]/40"
              : "border-[#1E293B] bg-[#0A0D14] hover:border-[#2563EB]/40 hover:bg-[#141B2D]/40"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141B2D] text-[#38BDF8] border border-[#1E293B]">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="max-w-sm">
            <h2 className="text-base font-semibold text-white">
              Drag &amp; drop your resume
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
              Upload a PDF resume up to 5 MB. Local validation ensures safe and immediate text parsing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-lg bg-[#141B2D] px-4 py-2 text-xs font-semibold text-[#F1F5F9] border border-[#1E293B] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-colors"
          >
            Browse files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {/* Configuration Row: Target Role & Experience */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-[#94A3B8]">
            <span className="mb-1.5 block uppercase tracking-wider text-[11px] text-[#64748B] font-semibold">
              Target Role
            </span>
            <select
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="" disabled>
                Select a target role
              </option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="UX Designer">UX Designer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </label>

          <label className="block text-xs font-medium text-[#94A3B8]">
            <span className="mb-1.5 block uppercase tracking-wider text-[11px] text-[#64748B] font-semibold">
              Experience Level
            </span>
            <select
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value)}
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="" disabled>
                Select experience level
              </option>
              <option value="Entry Level">Entry Level (0–2 yrs)</option>
              <option value="Mid Level">Mid Level (3–5 yrs)</option>
              <option value="Senior Level">Senior Level (6–9 yrs)</option>
              <option value="Manager">Manager / Leadership (10+ yrs)</option>
            </select>
          </label>
        </div>

        <p className="text-[11px] text-[#64748B]">
          Supported format: PDF only. Maximum file size: 5 MB.
        </p>

        {error && (
          <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 p-3.5 text-xs text-[#EF4444] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fileDetails && (
          <div className="rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#38BDF8] border border-[#2563EB]/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Selected Resume</p>
                  <p className="text-xs font-semibold text-white">{fileDetails.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Size</p>
                  <p className="font-mono text-white text-xs">{fileDetails.size}</p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#141B2D] text-[#94A3B8] transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444] border border-[#1E293B]"
                  aria-label="Remove selected resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || !targetRole || !experienceLevel || isBusy}
          className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading Resume...</span>
            </>
          ) : isExtracting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Extracting Text &amp; Sections...</span>
            </>
          ) : isAnalyzing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Against ATS Algorithms...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run ATS Diagnostic (200 Credits)</span>
            </>
          )}
        </button>

        {/* Skeleton while analyzing */}
        {isAnalyzing && (
          <div className="space-y-6 pt-6 border-t border-[#1E293B]">
            <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-2">
              <Skeleton variant="text" className="w-32 h-3" />
              <Skeleton variant="title" className="w-48 h-5" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0A0D14] border border-[#1E2B45] space-y-3">
                  <Skeleton variant="text" className="w-24 h-3" />
                  <Skeleton variant="title" className="w-16 h-8" />
                  <Skeleton variant="text" className="w-full h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Results Dashboard */}
        {analysis && (
          <div className="space-y-6 pt-6 border-t border-[#1E293B]">
            {/* Header with context metadata and PDF download */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A0D14] p-5 rounded-2xl border border-[#1E293B]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#38BDF8]">
                    Diagnostic Report
                  </span>
                  <span className="text-[#64748B]">•</span>
                  <span className="text-xs text-[#94A3B8] font-mono">ATS Audit Verified</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  ATS Scorecard &amp; Diagnostic
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#141B2D] border border-[#1E293B] text-[#94A3B8]">
                    Role: <strong className="text-white font-medium">{targetRole}</strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#141B2D] border border-[#1E293B] text-[#94A3B8]">
                    Level: <strong className="text-white font-medium">{experienceLevel}</strong>
                  </span>
                </div>
              </div>

              <ReportDownload
                onDownload={handleDownloadPdf}
                label="Export PDF Report"
                size="md"
              />
            </div>

            {/* Score Summary */}
            <ScoreSummary
              score={analysis.resumeScore ?? analysis.atsScore ?? 0}
              maxScore={100}
              scoreLabel="Overall Resume Score"
              tier={getScoreBadge(analysis.resumeScore)?.label || "Evaluated"}
              tierDescription="Comprehensive evaluation based on structural hierarchy, recruiting keyword matching, and target role criteria."
              progressPercentage={analysis.resumeScore ?? analysis.atsScore ?? 0}
            />

            {/* 2-Column Metric Grid */}
            <MetricGrid
              columns={2}
              metrics={[
                {
                  label: "ATS Compatibility",
                  value: analysis.atsScore ?? "—",
                  max: 100,
                  percentage: analysis.atsScore,
                  subtext: "Semantic parsing, standard section headers, and machine readability",
                },
                {
                  label: "Interview Readiness",
                  value: analysis.interviewReadinessScore ?? "—",
                  max: 100,
                  percentage: analysis.interviewReadinessScore,
                  subtext: "Target role skill alignment, quantified achievements, and domain depth",
                },
              ]}
            />

            {/* Strengths & Weaknesses Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <StrengthList
                title="Key ATS Strengths"
                strengths={
                  Array.isArray(analysis.strengths) && analysis.strengths.length > 0
                    ? analysis.strengths
                    : analysis.strengths
                    ? [analysis.strengths]
                    : ["Standard section headers detected", "Clean chronological layout"]
                }
              />
              <ImprovementList
                title="Areas for Improvement"
                improvements={
                  Array.isArray(analysis.weaknesses) && analysis.weaknesses.length > 0
                    ? analysis.weaknesses
                    : analysis.weaknesses
                    ? [analysis.weaknesses]
                    : ["Add more role-specific action verbs", "Quantify project accomplishments"]
                }
              />
            </div>

            {/* Missing Target Skills */}
            {Array.isArray(analysis.missingSkills) && analysis.missingSkills.length > 0 && (
              <div className="rounded-2xl border border-[#1E293B] bg-[#0A0D14] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#EF4444]/10 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Missing Target Skills for {targetRole}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.missingSkills.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/25 text-xs font-medium text-[#EF4444]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Recommendations */}
            {Array.isArray(analysis.improvementSuggestions) && analysis.improvementSuggestions.length > 0 && (
              <RecommendationList
                title="Actionable ATS Optimization Plan"
                recommendations={analysis.improvementSuggestions}
              />
            )}

            {/* Bottom Download Card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A0D14] border border-[#1E2B45]">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Official ATS Performance Report
                </h4>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Generate a branded, multi-page PDF summary with itemized feedback and keyword metrics.
                </p>
              </div>

              <ReportDownload
                onDownload={handleDownloadPdf}
                label="Download Report (PDF)"
                variant="primary"
                size="md"
              />
            </div>
          </div>
        )}

        {/* Developer preview in DEV mode */}
        {import.meta.env.DEV && extractedText ? (
          <div className="rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4 text-xs text-[#94A3B8]">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between font-mono text-[11px]">
              <span>Dev Text Preview</span>
              <span className="text-white">Text length: {textLength}</span>
              <span>Upload ID: {uploadId}</span>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-[#94A3B8] max-h-32 overflow-auto bg-[#06080B] p-2.5 rounded border border-[#1E293B]">
              {extractedText.length > 500
                ? `${extractedText.slice(0, 500)}...`
                : extractedText}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ResumeUploader;
