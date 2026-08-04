import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AiOutlineCloudUpload, AiOutlineFilePdf } from "react-icons/ai";
import { BiTrash } from "react-icons/bi";
import { FiInfo } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";

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
      toast.success("ATS Score Checker resume text extracted successfully.");
      return data.extractedText || "";
    } catch (extractError) {
      const errorMessage =
        extractError?.response?.data?.message ||
        extractError.message ||
        "Unable to extract ATS Score Checker resume text. Please try again.";
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
      toast.success("ATS Score Checker resume uploaded successfully.");

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
        "Unable to upload your resume for ATS Score Checker. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div
            className={`relative flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed px-6 py-8 text-center transition-all duration-300 ${
              isDragActive
                ? "border-cyan-400/70 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900/80 text-cyan-300 ring-1 ring-cyan-400/20">
              <AiOutlineCloudUpload size={32} />
            </div>

            <div className="max-w-sm">
              <h2 className="text-xl font-semibold text-white">Drag & drop your resume</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Upload a PDF resume under 5 MB to continue. The file is validated locally and analyzed by ATS Score Checker after upload.
              </p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-cyan-500/10 transition hover:bg-white/15"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">
                Target Role
              </span>
              <select
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                className="mt-1 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/15"
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UX Designer">UX Designer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">
                Experience Level
              </span>
              <select
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                className="mt-1 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/15"
              >
                <option value="" disabled>
                  Select experience
                </option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Manager">Manager</option>
              </select>
            </label>
          </div>

          <p className="text-sm text-slate-400">Supported format: PDF. Maximum file size: 5 MB.</p>

          {error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              <div className="flex items-center gap-3">
                <FiInfo size={20} className="text-red-300" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          {fileDetails ? (
            <div className="rounded-[28px] border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20">
                    <AiOutlineFilePdf size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Selected file</p>
                    <p className="mt-1 text-base font-semibold text-white">{fileDetails.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/90 p-4 text-sm text-slate-300 sm:w-auto">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Size</p>
                    <p className="mt-1 text-white">{fileDetails.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label="Remove selected resume"
                  >
                    <BiTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !targetRole || !experienceLevel || isUploading || isExtracting || isAnalyzing}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400"
          >
            {isUploading
              ? "Uploading..."
              : isExtracting
              ? "Extracting..."
              : isAnalyzing
              ? "Analyzing..."
              : "Continue"}
          </button>

          {analysis ? (
            <div className="space-y-6 rounded-[28px] border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-400">ATS Score Checker Analysis</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Analysis Dashboard</h3>
                </div>
                <div className="rounded-3xl bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
                  <div className="text-slate-400">Role</div>
                  <div className="font-semibold text-white">{targetRole}</div>
                  <div className="text-slate-400">Experience</div>
                  <div className="font-semibold text-white">{experienceLevel}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Resume Score</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{analysis.resumeScore ?? "—"}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">ATS Score</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{analysis.atsScore ?? "—"}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Interview Readiness</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{analysis.interviewReadinessScore ?? "—"}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Strengths</p>
                  </div>
                  <div className="text-sm leading-6 text-slate-300">
                    {Array.isArray(analysis.strengths)
                      ? analysis.strengths.map((item, index) => (
                          <p key={index} className="mb-2">
                            • {item}
                          </p>
                        ))
                      : analysis.strengths || "No strengths provided."}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Weaknesses</p>
                  </div>
                  <div className="text-sm leading-6 text-slate-300">
                    {Array.isArray(analysis.weaknesses)
                      ? analysis.weaknesses.map((item, index) => (
                          <p key={index} className="mb-2">
                            • {item}
                          </p>
                        ))
                      : analysis.weaknesses || "No weaknesses identified."}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Missing Skills</p>
                  </div>
                  <div className="text-sm leading-6 text-slate-300">
                    {Array.isArray(analysis.missingSkills)
                      ? analysis.missingSkills.map((item, index) => (
                          <p key={index} className="mb-2">
                            • {item}
                          </p>
                        ))
                      : analysis.missingSkills || "No missing skills identified."}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Improvement Suggestions</p>
                  </div>
                  <div className="text-sm leading-6 text-slate-300">
                    {Array.isArray(analysis.improvementSuggestions)
                      ? analysis.improvementSuggestions.map((item, index) => (
                          <p key={index} className="mb-2">
                            • {item}
                          </p>
                        ))
                      : analysis.improvementSuggestions || "No suggestions available."}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {import.meta.env.DEV && extractedText ? (
            <div className="rounded-[28px] border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Dev preview</span>
                <span className="font-semibold text-white">Text length: {textLength}</span>
                <span className="text-slate-400">Upload ID: {uploadId}</span>
              </div>
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                {extractedText.length > 500
                  ? `${extractedText.slice(0, 500)}...`
                  : extractedText}
              </pre>
              {analysis ? (
                <div className="mt-4 rounded-3xl border border-slate-700/70 bg-slate-900/90 p-4 text-sm text-slate-300">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    ATS analysis (dev only)
                  </div>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-200">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ResumeUploader;
