import React, { useState } from "react";
import {
    User,
    Briefcase,
    Upload,
    Mic,
    TrendingUp,
    Zap,
    Star,
    Crown,
    CheckCircle2,
    Clock,
    Coins,
    Camera,
    CameraOff,
    ArrowRight,
    Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "sonner";
import { ServerUrl } from "../App";
import { Button, Badge, Input, BackButton } from "@/components/ui";
import { companyProfiles, getCompanyOptions, getCompanyProfile } from "../config/companyProfiles";

function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [customCompany, setCustomCompany] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [interviewPlan, setInterviewPlan] = useState("medium");
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [roleError, setRoleError] = useState("");

    const companyOptions = getCompanyOptions();
    const effectiveCompany = selectedCompany === "other" ? customCompany.trim() : (companyProfiles[selectedCompany]?.name || "");
    const activeProfile = selectedCompany ? getCompanyProfile(selectedCompany, customCompany) : null;

    const interviewPlans = [
        {
            id: "short",
            title: "Quick Practice",
            icon: Zap,
            questions: 10,
            duration: "10 min",
            credits: 100,
            description: "Fast revision before interviews",
        },
        {
            id: "medium",
            title: "Standard Interview",
            icon: Star,
            questions: 15,
            duration: "20 min",
            credits: 150,
            description: "Balanced technical assessment",
            recommended: true,
        },
        {
            id: "long",
            title: "Full Mock Assessment",
            icon: Crown,
            questions: 25,
            duration: "35 min",
            credits: 250,
            description: "Complete interview simulation",
        },
    ];

    async function handleUploadResume() {
        if (!resumeFile) {
            toast.warning("Please select your resume PDF first.");
            return;
        }

        if (analyzing) return;
        setAnalyzing(true);

        const formdata = new FormData();
        formdata.append("resume", resumeFile);

        try {
            const result = await axios.post(
                `${ServerUrl}/api/interview/resume`,
                formdata,
                { withCredentials: true }
            );

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);
            toast.success("Resume parsed and context extracted!");
            setAnalyzing(false);
        } catch (error) {
            console.error("Failed to analyze resume:", error?.response?.data?.message || error?.message || error);
            setAnalyzing(false);
            toast.error(error?.response?.data?.message || "Failed to parse resume. Please try again.");
        }
    }

    const handleStart = async () => {
        if (!role.trim()) {
            setRoleError("Target role is required to configure your interview questions.");
            toast.warning("Please specify your target role.");
            return;
        }
        setRoleError("");

        setLoading(true);

        const effectiveCompany = selectedCompany === "other" ? customCompany.trim() : (companyProfiles[selectedCompany]?.name || "");

        try {
            const result = await axios.post(
                `${ServerUrl}/api/interview/generate-questions`,
                {
                    role,
                    experience,
                    mode,
                    interviewPlan,
                    resumeText,
                    projects,
                    skills,
                    cameraEnabled,
                    targetCompany: effectiveCompany || null,
                },
                { withCredentials: true }
            );

            if (userData && result.data.creditsLeft !== undefined) {
                dispatch(
                    setUserData({
                        ...userData,
                        credits: result.data.creditsLeft,
                    })
                );
            }

            setLoading(false);
            toast.success("Interview session initialized!");
            onStart(result.data);
        } catch (error) {
            console.error("Failed to generate interview:", error?.response?.data?.message || error?.message || error);
            setLoading(false);
            toast.error(error?.response?.data?.message || "Failed to generate interview. Please check your credit balance.");
        }
    };

    return (
        <div className="w-full bg-[#06080B] py-10 px-4 sm:px-6">
            <div className="w-full max-w-6xl mx-auto rounded-2xl border border-[#1E2B45] bg-[#0A0D14] shadow-2xl shadow-black/60 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Left Orientation Column */}
                <div className="lg:col-span-5 p-8 lg:p-10 bg-[#0E131F] border-b lg:border-b-0 lg:border-r border-[#1E2B45] flex flex-col justify-between">
                    <div>
                        <div className="mb-4">
                            <BackButton to="/" fallback="/" />
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="brand" size="sm">
                                MODULE CONFIGURATION
                            </Badge>
                            <span className="text-xs font-mono text-[#64748B]">Step 01 / 03</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight mb-3">
                            Configure Your AI Mock Interview
                        </h2>

                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-8">
                            Calibrate interview difficulty, targeted role expectations, and duration. Upload your resume to unlock hyper-personalized situational questions based on your actual tech stack.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0D14] border border-[#161F33]">
                                <div className="p-2 rounded-md bg-[#141B2D] text-[#38BDF8] shrink-0">
                                    <User size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[#F1F5F9]">Role-Specific Questioning</h4>
                                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Tailored to exact industry expectations and seniority levels.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0D14] border border-[#161F33]">
                                <div className="p-2 rounded-md bg-[#141B2D] text-[#A78BFA] shrink-0">
                                    <Mic size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[#F1F5F9]">Interactive Speech Pipeline</h4>
                                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Natural voice interaction with speech-to-text response logging.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0D14] border border-[#161F33]">
                                <div className="p-2 rounded-md bg-[#141B2D] text-[#34D399] shrink-0">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[#F1F5F9]">Comprehensive Rubric Report</h4>
                                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Evaluation on technical correctness, cadence, and confidence.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#161F33] flex items-center justify-between text-xs text-[#64748B]">
                        <span>Available Credits:</span>
                        <span className="font-mono font-bold text-[#38BDF8] tabular-nums">
                            {userData?.credits ?? 0} Credits
                        </span>
                    </div>
                </div>

                {/* Right Form Column */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Target Role & Experience */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                                    Target Role *
                                </label>
                                <Input
                                    leftIcon={Briefcase}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    value={role}
                                    error={roleError}
                                    onChange={(e) => {
                                        setRole(e.target.value);
                                        if (roleError) setRoleError("");
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                                    Experience Level
                                </label>
                                <Input
                                    leftIcon={Clock}
                                    placeholder="e.g. 3-5 Years"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Target Company Selector (Optional) */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
                                    <Building2 size={14} className="text-[#38BDF8]" />
                                    <span>Target Company (Optional)</span>
                                </label>
                                {effectiveCompany && (
                                    <Badge variant="brand" size="sm">
                                        Style Adapted
                                    </Badge>
                                )}
                            </div>

                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-[#0A0D14] border border-[#1E2B45] text-sm text-[#F1F5F9] outline-none cursor-pointer focus:border-[#3B82F6] transition-colors"
                            >
                                <option value="">None (General Practice)</option>
                                {companyOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name} ({opt.category === "product" ? "Product" : opt.category === "service" ? "Service" : opt.category === "startup" ? "Startup" : "Custom"})
                                    </option>
                                ))}
                            </select>

                            <AnimatePresence>
                                {selectedCompany === "other" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <Input
                                            leftIcon={Building2}
                                            placeholder="Enter company name (e.g. Netflix, Uber)"
                                            value={customCompany}
                                            onChange={(e) => setCustomCompany(e.target.value)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Active Company Info Card & Dynamic Disclaimer */}
                            {activeProfile && (effectiveCompany || selectedCompany !== "other") && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2.5 p-3 rounded-lg bg-[#0E131F] border border-[#1E2B45]/80 space-y-1.5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <span className="text-xs font-semibold text-[#F1F5F9] shrink-0">
                                            {activeProfile.name} Focus:
                                        </span>
                                        <span className="text-[11px] text-[#94A3B8]">
                                            {activeProfile.interviewStyle.focus}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[#64748B] italic leading-tight">
                                        Question style is adapted to match {activeProfile.name}'s general interview approach — not affiliated with or endorsed by {activeProfile.name}.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Interview Mode & Camera */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                                    Interview Mode
                                </label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-[#0A0D14] border border-[#1E2B45] text-sm text-[#F1F5F9] outline-none cursor-pointer focus:border-[#3B82F6]"
                                >
                                    <option value="Technical">Technical Drill (Code & Systems)</option>
                                    <option value="Behavioral">Behavioral (STAR Method)</option>
                                    <option value="Mixed">Comprehensive (Technical + Behavioral)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                                    Webcam Proctored Stream
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setCameraEnabled(!cameraEnabled)}
                                    className={`w-full h-10 px-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                        cameraEnabled
                                            ? "bg-[#062319] border-[#047857] text-[#34D399]"
                                            : "bg-[#0A0D14] border-[#1E2B45] text-[#94A3B8]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {cameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
                                        <span>{cameraEnabled ? "Camera Enabled" : "Camera Disabled"}</span>
                                    </div>
                                    <span className="text-[10px] font-mono uppercase">
                                        {cameraEnabled ? "ON" : "OFF"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Optional Resume Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-[#94A3B8]">
                                    Upload Resume (Optional Context Extraction)
                                </label>
                                {analysisDone && (
                                    <span className="text-[11px] text-[#22C55E] flex items-center gap-1">
                                        <CheckCircle2 size={13} />
                                        <span>Extracted {skills.length} skills</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                    className="flex-1 text-xs text-[#94A3B8] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#141B2D] file:text-[#F1F5F9] hover:file:bg-[#1A233A] file:cursor-pointer cursor-pointer border border-[#1E2B45] rounded-lg p-1 bg-[#0A0D14]"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    leftIcon={Upload}
                                    isLoading={analyzing}
                                    onClick={handleUploadResume}
                                >
                                    Parse
                                </Button>
                            </div>
                        </div>

                        {/* Plan / Drill Length Selection */}
                        <div>
                            <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                                Session Duration & Question Load
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {interviewPlans.map((plan) => {
                                    const isSelected = interviewPlan === plan.id;
                                    const Icon = plan.icon;
                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setInterviewPlan(plan.id)}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                                                isSelected
                                                    ? "bg-[#0D1E3A] border-[#2563EB] text-[#93C5FD]"
                                                    : "bg-[#0A0D14] border-[#1E2B45] text-[#94A3B8] hover:border-[#2D3E63]"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Icon size={16} className={isSelected ? "text-[#38BDF8]" : "text-[#64748B]"} />
                                                <span className="text-[11px] font-mono tabular-nums font-bold">
                                                    {plan.credits} cr
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-semibold text-[#F1F5F9] mb-0.5">
                                                {plan.title}
                                            </h4>
                                            <p className="text-[11px] text-[#64748B] mb-2">{plan.duration} • {plan.questions} Qs</p>
                                            <p className="text-[10px] text-[#94A3B8] leading-tight">{plan.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-8 mt-8 border-t border-[#161F33] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                            <Coins size={14} className="text-[#38BDF8]" />
                            <span>
                                Cost:{" "}
                                <span className="font-mono font-bold text-[#F1F5F9] tabular-nums">
                                    {interviewPlans.find((p) => p.id === interviewPlan)?.credits} Credits
                                </span>
                            </span>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            isLoading={loading}
                            rightIcon={ArrowRight}
                            onClick={handleStart}
                            className="w-full sm:w-auto"
                        >
                            Initialize AI Interview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Step1SetUp;