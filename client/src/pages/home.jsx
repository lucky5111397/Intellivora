import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PRICING_PLANS } from "../config/pricingPlans";
import {
    Mic,
    Timer,
    FileText,
    Users,
    ArrowRight,
    SlidersHorizontal,
    CheckCircle2,
    Check,
    AlertCircle,
    Clock,
    TrendingUp,
    ShieldAlert,
    Database,
    Gavel,
    BarChart3,
    Network,
    Terminal,
    CheckCheck,
    PauseCircle,
    Bookmark,
    Wand2,
} from "lucide-react";

function Home() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Showcase 2 interactive question selection
    const [selectedAptOption, setSelectedAptOption] = useState("B");
    const [activePaletteQuestion, setActivePaletteQuestion] = useState(18);

    const handleAuthRedirect = (targetPath) => {
        if (!userData) {
            navigate("/auth", { state: { from: { pathname: targetPath } } });
        } else {
            navigate(targetPath);
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-[#f1f5f9] font-['Geist',sans-serif] selection:bg-[#2563eb] selection:text-white">
            <Navbar />

            <main className="w-full">
                {/* ========================================================================= */}
                {/* 1. HERO SECTION                                                           */}
                {/* ========================================================================= */}
                <section className="relative w-full overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                    {/* Ambient Radial Glow Field */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[#2563eb]/10 blur-[140px] pointer-events-none rounded-full" />
                    <div className="absolute top-40 right-10 w-[500px] h-[300px] bg-[#3b82f6]/5 blur-[120px] pointer-events-none rounded-full" />

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1b33] border border-[#2563eb]/30 text-[#adc6ff] shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
                            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
                                AI-Powered Career Preparation & Assessment Platform
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#f1f5f9] max-w-4xl leading-[1.15] mb-6">
                            Prepare for Every Stage of Your Career Journey.
                        </h1>

                        {/* Supporting Copy */}
                        <p className="text-sm sm:text-base lg:text-lg text-[#a7b0ba] max-w-3xl mb-10 leading-relaxed font-normal">
                            INTELLIVORA combines AI mock interviews, timed aptitude tests, ATS resume analysis, and multi-agent group discussions into one unified, enterprise-grade career preparation workspace.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
                            <button
                                onClick={() => handleAuthRedirect("/interview")}
                                className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#f1f5f9] text-sm font-semibold px-6 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                            >
                                <span>Start Practicing</span>
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => scrollToSection("modules")}
                                className="inline-flex items-center justify-center gap-2 bg-[#111923] hover:bg-[#17212b] border border-[#202a34] text-[#f1f5f9] text-sm font-medium px-6 py-3.5 rounded-lg transition-all cursor-pointer"
                            >
                                <span>Explore Assessments</span>
                                <SlidersHorizontal size={16} className="text-[#a7b0ba]" />
                            </button>
                        </div>

                        {/* Hero Visual: Candidate Workspace Dashboard Preview */}
                        <div className="w-full text-left bg-[#0a0f14] border border-[#202a34] rounded-xl p-3 sm:p-6 shadow-2xl relative">
                            {/* Top Workspace Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 bg-[#0f1720] px-4 py-3 rounded-lg border border-[#151d25]">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                                    <span className="text-xs font-semibold text-[#f1f5f9]">
                                        Production Candidate Workspace
                                    </span>
                                    <span className="font-mono text-xs text-[#69737d] hidden sm:inline">
                                        | ID: #USR-90214
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] bg-[#17212b] border border-[#2a3540] text-[#adc6ff] px-2.5 py-1 rounded">
                                        SYS: ACTIVE
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1b33] border border-[#2563eb]/30 text-[#adc6ff] text-[11px] font-medium">
                                        <Database size={13} className="text-[#3b82f6]" />
                                        <span>Demo Workspace Data</span>
                                    </span>
                                </div>
                            </div>

                            {/* 4 Core Modules Overview Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                {/* Card 1: Mock Interview */}
                                <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/80 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-semibold text-[#adc6ff] bg-[#0b1b33] px-2 py-0.5 rounded border border-[#2563eb]/20">
                                                VOICE & TECH
                                            </span>
                                            <Mic size={18} className="text-[#3b82f6]" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#f1f5f9] mb-1">
                                            Mock Interview
                                        </h3>
                                        <p className="text-xs text-[#a7b0ba] mb-4">
                                            Senior Distributed Systems Engineer
                                        </p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-[#f1f5f9] font-mono">84</span>
                                            <span className="text-xs text-[#a7b0ba]">/ 100 Overall</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div>
                                                <div className="flex justify-between text-[#a7b0ba] text-[11px] mb-1">
                                                    <span>Technical Correctness</span>
                                                    <span className="text-[#f1f5f9] font-mono font-medium">88%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "88%" }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[#a7b0ba] text-[11px] mb-1">
                                                    <span>Communication Cadence</span>
                                                    <span className="text-[#f1f5f9] font-mono font-medium">82%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: "82%" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-[#151d25] flex items-center justify-between text-[11px]">
                                        <span className="text-[#69737d] font-mono">Report #IV-2041</span>
                                        <button
                                            onClick={() => handleAuthRedirect("/interview")}
                                            className="text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer font-medium"
                                        >
                                            View Breakdown →
                                        </button>
                                    </div>
                                </div>

                                {/* Card 2: Timed Aptitude */}
                                <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/80 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-semibold text-[#adc6ff] bg-[#0b1b33] px-2 py-0.5 rounded border border-[#2563eb]/20">
                                                PROCTORED
                                            </span>
                                            <Timer size={18} className="text-[#3b82f6]" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#f1f5f9] mb-1">
                                            Timed Aptitude
                                        </h3>
                                        <p className="text-xs text-[#a7b0ba] mb-4">
                                            Core CS & Quantitative Diagnostic
                                        </p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-[#f1f5f9] font-mono">78</span>
                                            <span className="text-xs text-[#a7b0ba]">/ 100 Composite</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 text-center bg-[#05070a] p-2 rounded border border-[#151d25]">
                                            <div>
                                                <span className="text-[10px] text-[#69737d] block uppercase">Quant</span>
                                                <span className="font-mono text-xs text-[#f1f5f9] font-semibold">82%</span>
                                            </div>
                                            <div className="bg-[#17212b] rounded">
                                                <span className="text-[10px] text-[#69737d] block uppercase">Logic</span>
                                                <span className="font-mono text-xs text-[#22c55e] font-semibold">86%</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-[#69737d] block uppercase">Verbal</span>
                                                <span className="font-mono text-xs text-[#f1f5f9] font-semibold">74%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-[#151d25] flex items-center justify-between text-[11px]">
                                        <span className="text-[#69737d] font-mono">91st Percentile</span>
                                        <button
                                            onClick={() => handleAuthRedirect("/aptitude")}
                                            className="text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer font-medium"
                                        >
                                            Open Solution Key →
                                        </button>
                                    </div>
                                </div>

                                {/* Card 3: ATS Resume Score */}
                                <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/80 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-semibold text-[#adc6ff] bg-[#0b1b33] px-2 py-0.5 rounded border border-[#2563eb]/20">
                                                BENCHMARK
                                            </span>
                                            <FileText size={18} className="text-[#3b82f6]" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#f1f5f9] mb-1">
                                            ATS Resume Score
                                        </h3>
                                        <p className="text-xs text-[#a7b0ba] mb-4">
                                            Target: Staff SRE Architect
                                        </p>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-2xl font-bold text-[#22c55e] font-mono">91</span>
                                            <span className="text-xs text-[#a7b0ba]">/ 100 Match</span>
                                        </div>
                                        <div className="bg-[#05070a] p-2.5 rounded border border-[#151d25] space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-[#a7b0ba]">Keyword Coverage</span>
                                                <span className="text-[#f1f5f9] font-mono font-semibold">28 / 32</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#ef4444] text-[11px]">
                                                <AlertCircle size={13} />
                                                <span>4 Critical Technical Gaps</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-[#151d25] flex items-center justify-between text-[11px]">
                                        <span className="text-[#69737d] font-mono">PDF Synced • 2h ago</span>
                                        <button
                                            onClick={() => handleAuthRedirect("/resume")}
                                            className="text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer font-medium"
                                        >
                                            Remediate Gaps →
                                        </button>
                                    </div>
                                </div>

                                {/* Card 4: Group Discussion */}
                                <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/80 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-semibold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-0.5 rounded flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                                                LIVE SIMULATION
                                            </span>
                                            <Users size={18} className="text-[#3b82f6]" />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#f1f5f9] mb-1">
                                            Group Discussion
                                        </h3>
                                        <p className="text-xs text-[#a7b0ba] mb-3">
                                            Workplace Automation Governance
                                        </p>
                                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                            <div className="bg-[#05070a] p-1.5 rounded border border-[#151d25]">
                                                <span className="text-[#69737d] block truncate">Articulation</span>
                                                <span className="font-mono text-[#f1f5f9] font-medium">84%</span>
                                            </div>
                                            <div className="bg-[#05070a] p-1.5 rounded border border-[#151d25]">
                                                <span className="text-[#69737d] block truncate">Leadership</span>
                                                <span className="font-mono text-[#f1f5f9] font-medium">79%</span>
                                            </div>
                                            <div className="bg-[#05070a] p-1.5 rounded border border-[#151d25]">
                                                <span className="text-[#69737d] block truncate">Listening</span>
                                                <span className="font-mono text-[#f1f5f9] font-medium">88%</span>
                                            </div>
                                            <div className="bg-[#05070a] p-1.5 rounded border border-[#151d25]">
                                                <span className="text-[#69737d] block truncate">Logic</span>
                                                <span className="font-mono text-[#f1f5f9] font-medium">86%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-[#151d25] flex items-center justify-between text-[11px]">
                                        <span className="text-[#69737d]">3 AI Peers + Mod</span>
                                        <button
                                            onClick={() => handleAuthRedirect("/gd")}
                                            className="text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer font-medium"
                                        >
                                            Live Replay →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Live Verification Stream Activity Ribbon */}
                            <div className="bg-[#0f1720] border border-[#151d25] rounded-lg p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 font-medium text-[#f1f5f9]">
                                    <Clock size={15} className="text-[#3b82f6]" />
                                    <span>Live Verification Stream:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-[#a7b0ba]">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                                        <span>Voice Transcription calibrated for <strong>Distributed Caching</strong></span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                        <span>Aptitude Quant rubric updated to 2025 standard</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono text-[#adc6ff]">
                                        <span>SYNC_LATENCY: 18ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 2. CORE CAPABILITIES (4 PRIMARY PREPARATION MODULES)                      */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#0a0f14] py-20 border-t border-[#151d25]" id="modules">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Section Header */}
                        <div className="max-w-3xl mb-14">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1b33] border border-[#2563eb]/30 text-[#adc6ff] text-xs font-semibold uppercase tracking-wider mb-3">
                                <span>Unified Recruitment Architecture</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f1f5f9] tracking-tight mb-4">
                                One Platform. Multiple Ways to Prepare.
                            </h2>
                            <p className="text-sm sm:text-base text-[#a7b0ba] leading-relaxed">
                                Master each sequential hurdle of corporate hiring workflows with dedicated simulation engines built on high-fidelity evaluative rubrics.
                            </p>
                        </div>

                        {/* 2x2 Module Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Module 1: AI Mock Technical Interviews */}
                            <div className="bg-[#111923] border border-[#202a34] p-6 sm:p-8 rounded-xl flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/70 transition-all group">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-2.5 py-1 rounded bg-[#0f1720] border border-[#202a34] text-[#a7b0ba] text-[11px] font-semibold uppercase tracking-wider">
                                            VOICE & TECHNICAL
                                        </span>
                                        <div className="w-10 h-10 rounded-lg bg-[#17212b] border border-[#2a3540] flex items-center justify-center text-[#3b82f6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                                            <Mic size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#f1f5f9] mb-3">
                                        AI Mock Technical Interviews
                                    </h3>
                                    <p className="text-sm text-[#a7b0ba] mb-6 leading-relaxed">
                                        Conduct high-pressure, voice-enabled technical screening sessions tailored precisely to your target job title, seniority tier, and uploaded resume profile.
                                    </p>
                                    <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#a7b0ba]">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Role & seniority customization across 140+ tech & engineering tracks</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Dynamic question branching based on real-time candidate answers</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Calibrated difficulty curves: Junior, Mid-Level, Staff, and Principal</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Objective evaluation rubrics: Technical correctness, cadence & conciseness</span>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleAuthRedirect("/interview")}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer"
                                >
                                    <span>Practice Interview</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Module 2: Timed Aptitude Assessments */}
                            <div className="bg-[#111923] border border-[#202a34] p-6 sm:p-8 rounded-xl flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/70 transition-all group">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-2.5 py-1 rounded bg-[#0f1720] border border-[#202a34] text-[#a7b0ba] text-[11px] font-semibold uppercase tracking-wider">
                                            PROCTORED & TIMED
                                        </span>
                                        <div className="w-10 h-10 rounded-lg bg-[#17212b] border border-[#2a3540] flex items-center justify-center text-[#3b82f6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                                            <Timer size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#f1f5f9] mb-3">
                                        Timed Aptitude Assessments
                                    </h3>
                                    <p className="text-sm text-[#a7b0ba] mb-6 leading-relaxed">
                                        Standardized, high-stakes cognitive and technical screening tests with automated server sync, live countdown clocks, and instant answer-key analytics.
                                    </p>
                                    <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#a7b0ba]">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Quantitative, Logical Reasoning, Verbal, and Core Computer Science tracks</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Strict server-side proctor countdown with automated section progression</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Question palette navigation with Review, Unattempted, and Answered states</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Comprehensive percentile diagnostics and step-by-step solutions</span>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleAuthRedirect("/aptitude")}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer"
                                >
                                    <span>Start Aptitude Test</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Module 3: ATS Resume Analyzer */}
                            <div className="bg-[#111923] border border-[#202a34] p-6 sm:p-8 rounded-xl flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/70 transition-all group">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-2.5 py-1 rounded bg-[#0f1720] border border-[#202a34] text-[#a7b0ba] text-[11px] font-semibold uppercase tracking-wider">
                                            ROLE-TARGETED
                                        </span>
                                        <div className="w-10 h-10 rounded-lg bg-[#17212b] border border-[#2a3540] flex items-center justify-center text-[#3b82f6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#f1f5f9] mb-3">
                                        ATS Resume Analyzer
                                    </h3>
                                    <p className="text-sm text-[#a7b0ba] mb-6 leading-relaxed">
                                        Diagnostic parsing engine that scans your CV through enterprise applicant tracking models to expose missing keywords, weak framing, and format errors.
                                    </p>
                                    <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#a7b0ba]">
                                        <li className="flex items-start gap-2.5">
                                             <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Server-side PDF extraction with tabular parsing and encoding sanity checks</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Target role matching against live enterprise corporate job descriptions</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Critical keyword gap detection with quantified relevance weighting</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Line-by-line rewrite suggestions formulated in impact-driven STAR format</span>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleAuthRedirect("/resume")}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer"
                                >
                                    <span>Analyze Resume</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Module 4: AI Group Discussion Simulator */}
                            <div className="bg-[#111923] border border-[#202a34] p-6 sm:p-8 rounded-xl flex flex-col justify-between hover:border-[#2a3540] hover:bg-[#17212b]/70 transition-all group">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-2.5 py-1 rounded bg-[#0b1b33] border border-[#2563eb]/40 text-[#adc6ff] text-[11px] font-semibold uppercase tracking-wider">
                                            MULTI-AGENT ENGINE • UNIQUE
                                        </span>
                                        <div className="w-10 h-10 rounded-lg bg-[#17212b] border border-[#2a3540] flex items-center justify-center text-[#3b82f6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
                                            <Users size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-[#f1f5f9] mb-3">
                                        AI Group Discussion Simulator
                                    </h3>
                                    <p className="text-sm text-[#a7b0ba] mb-6 leading-relaxed">
                                        Step into high-stakes simulated campus and executive group discussions with 3 autonomous AI peers and an AI moderator who challenge, rebut, and steer topics.
                                    </p>
                                    <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#a7b0ba]">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Distinct AI archetypes: Analytical Skeptic, Strategic Leader, and Creative Ethicist</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Real-time voice queue with dynamic interruptions and floor-sharing enforcement</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>4-Pillar evaluation: Articulation, Leadership, Active Listening & Critical Thinking</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <span>Live moderator interventions when discussion strays from premise constraints</span>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleAuthRedirect("/gd")}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer"
                                >
                                    <span>Enter GD Room</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 3. PREPARATION JOURNEY (HOW IT WORKS)                                     */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#05070a] py-20 border-t border-[#151d25]" id="how-it-works">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#adc6ff] bg-[#0b1b33] border border-[#2563eb]/30 px-3 py-1 rounded">
                                Methodology
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f1f5f9] tracking-tight mt-3 mb-4">
                                A Structured Path from Resume to Offer
                            </h2>
                            <p className="text-sm sm:text-base text-[#a7b0ba] leading-relaxed">
                                Systematic preparation engineered around the actual filters deployed by elite tech enterprises and institutional recruiters.
                            </p>
                        </div>

                        {/* 5 Step Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Step 01 */}
                            <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] transition-all">
                                <div>
                                    <div className="font-mono text-xs font-bold text-[#3b82f6] mb-3">
                                        STEP // 01
                                    </div>
                                    <h4 className="text-base font-semibold text-[#f1f5f9] mb-2">
                                        Build Profile
                                    </h4>
                                    <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                        Define your target role, seniority level, target industry sector, and upload your baseline CV.
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#151d25] font-mono text-[10px] text-[#69737d]">
                                    CFG: CANDIDATE_TARGET
                                </div>
                            </div>

                            {/* Step 02 */}
                            <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] transition-all">
                                <div>
                                    <div className="font-mono text-xs font-bold text-[#3b82f6] mb-3">
                                        STEP // 02
                                    </div>
                                    <h4 className="text-base font-semibold text-[#f1f5f9] mb-2">
                                        Select Module
                                    </h4>
                                    <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                        Choose between Technical Mock, Timed Aptitude, ATS Resume Audit, or Multi-Agent GD.
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#151d25] font-mono text-[10px] text-[#69737d]">
                                    MOD: APPT_INTERVIEW_GD
                                </div>
                            </div>

                            {/* Step 03 */}
                            <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] transition-all">
                                <div>
                                    <div className="font-mono text-xs font-bold text-[#3b82f6] mb-3">
                                        STEP // 03
                                    </div>
                                    <h4 className="text-base font-semibold text-[#f1f5f9] mb-2">
                                        Simulate & Run
                                    </h4>
                                    <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                        Engage with low-latency voice AI, solve strict proctored countdowns, or counter autonomous peers.
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#151d25] font-mono text-[10px] text-[#69737d]">
                                    EXEC: REALTIME_VOICE
                                </div>
                            </div>

                            {/* Step 04 */}
                            <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] transition-all">
                                <div>
                                    <div className="font-mono text-xs font-bold text-[#3b82f6] mb-3">
                                        STEP // 04
                                    </div>
                                    <h4 className="text-base font-semibold text-[#f1f5f9] mb-2">
                                        AI Evaluation
                                    </h4>
                                    <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                        Receive instantaneous multi-dimensional scoring against rigorous institutional rubric benchmarks.
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#151d25] font-mono text-[10px] text-[#69737d]">
                                    METRIC: 4_PILLAR_SCORE
                                </div>
                            </div>

                            {/* Step 05 */}
                            <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between hover:border-[#2a3540] transition-all">
                                <div>
                                    <div className="font-mono text-xs font-bold text-[#3b82f6] mb-3">
                                        STEP // 05
                                    </div>
                                    <h4 className="text-base font-semibold text-[#f1f5f9] mb-2">
                                        Track & Iterate
                                    </h4>
                                    <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                        Benchmark historical performance across attempts with gap remediation and targeted drills.
                                    </p>
                                </div>
                                <div className="mt-6 pt-3 border-t border-[#151d25] font-mono text-[10px] text-[#69737d]">
                                    OUT: PLACEMENT_READY
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 4. DEEP-DIVE INTERACTIVE PRODUCT SHOWCASES                                */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#0f1720] py-20 border-t border-[#151d25]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20">
                        {/* Section Header */}
                        <div className="max-w-3xl">
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#adc6ff] bg-[#0b1b33] border border-[#2563eb]/30 px-3 py-1 rounded">
                                Under The Hood
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f1f5f9] tracking-tight mt-3 mb-4">
                                Engineered for Rigorous Production Simulation
                            </h2>
                            <p className="text-sm sm:text-base text-[#a7b0ba] leading-relaxed">
                                Take a granular look at the precise UI environments candidates experience inside INTELLIVORA's four core modules.
                            </p>
                        </div>

                        {/* SHOWCASE 1: AI Mock Technical Interview */}
                        <div className="bg-[#0a0f14] border border-[#202a34] rounded-xl overflow-hidden shadow-xl">
                            <div className="bg-[#111923] border-b border-[#202a34] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
                                    <span className="text-sm font-semibold text-[#f1f5f9]">
                                        AI Technical Interview Engine
                                    </span>
                                    <span className="text-[11px] font-semibold text-[#adc6ff] bg-[#0b1b33] px-2 py-0.5 rounded border border-[#2563eb]/30">
                                        STREAMING LIVE
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[#a7b0ba]">
                                    <span>Session ID: <strong className="text-[#f1f5f9] font-mono">INT-SYS-4819</strong></span>
                                    <span>Target: <strong className="text-[#f1f5f9]">Distributed Systems Engineer</strong></span>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Column: Current Question & Audio Ingest */}
                                <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-[#a7b0ba] mb-3">
                                            <span className="font-mono text-[#3b82f6] font-semibold">
                                                QUESTION 03 / 06 • SENIOR ARCHITECTURE
                                            </span>
                                            <span className="font-mono bg-[#17212b] border border-[#2a3540] text-[#f1f5f9] px-2 py-0.5 rounded">
                                                TIMER: 02:14 / 04:00
                                            </span>
                                        </div>

                                        {/* Question Prompt */}
                                        <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg mb-5">
                                            <p className="text-base sm:text-lg text-[#f1f5f9] font-medium leading-snug">
                                                “How would you handle cache invalidation and prevent thundering herd scenarios across a globally distributed read-heavy microservice fleet?”
                                            </p>
                                        </div>

                                        {/* Waveform & Voice Transcription */}
                                        <div className="bg-[#05070a] border border-[#151d25] p-4 sm:p-5 rounded-lg space-y-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-[#3b82f6] font-medium">
                                                    <Mic size={16} />
                                                    <span>Microphone Active • Audio Ingestion Calibrated</span>
                                                </div>
                                                <span className="font-mono text-[#69737d]">48kHz • Opus</span>
                                            </div>

                                            {/* Audio Waveform CSS Pulse Bars */}
                                            <div className="h-10 w-full flex items-center justify-between gap-1.5 px-2">
                                                {[
                                                    { h: "12px", delay: "0ms", bg: "bg-[#2563eb]" },
                                                    { h: "32px", delay: "80ms", bg: "bg-[#3b82f6]" },
                                                    { h: "44px", delay: "160ms", bg: "bg-[#60a5fa]" },
                                                    { h: "20px", delay: "240ms", bg: "bg-[#2563eb]" },
                                                    { h: "38px", delay: "320ms", bg: "bg-[#3b82f6]" },
                                                    { h: "16px", delay: "400ms", bg: "bg-[#60a5fa]" },
                                                    { h: "34px", delay: "480ms", bg: "bg-[#2563eb]" },
                                                    { h: "42px", delay: "560ms", bg: "bg-[#3b82f6]" },
                                                    { h: "22px", delay: "640ms", bg: "bg-[#60a5fa]" },
                                                    { h: "28px", delay: "720ms", bg: "bg-[#2563eb]" },
                                                    { h: "44px", delay: "800ms", bg: "bg-[#3b82f6]" },
                                                    { h: "20px", delay: "880ms", bg: "bg-[#60a5fa]" },
                                                    { h: "10px", delay: "960ms", bg: "bg-[#2563eb]" },
                                                ].map((bar, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 ${bar.bg} rounded-full animate-pulse`}
                                                        style={{ height: bar.h, animationDelay: bar.delay }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Candidate transcription */}
                                            <p className="font-mono text-xs text-[#a7b0ba] bg-[#0a0f14] border border-[#151d25] p-3 rounded leading-relaxed">
                                                <strong className="text-[#f1f5f9]">Candidate Voice Ingest:</strong> “To prevent thundering herd during cache expiry, I implement probabilistic early expiration like XFetch, or enforce mutex leases in Redis so only a single worker queries upstream database shards...”
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                        <button
                                            onClick={() => handleAuthRedirect("/interview")}
                                            className="bg-[#17212b] hover:bg-[#1b2631] border border-[#2a3540] text-[#f1f5f9] text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            <PauseCircle size={15} />
                                            <span>Pause Interview</span>
                                        </button>
                                        <button
                                            onClick={() => handleAuthRedirect("/interview")}
                                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                                        >
                                            <span>Submit Answer & Next</span>
                                            <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Telemetry Meters */}
                                <div className="lg:col-span-4 bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider font-semibold text-[#adc6ff] mb-4">
                                            Real-Time Rubric Telemetry
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-[#a7b0ba]">Technical Correctness</span>
                                                    <span className="font-mono text-[#f1f5f9] font-bold">88%</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#22c55e] rounded-full" style={{ width: "88%" }} />
                                                </div>
                                                <span className="text-[11px] text-[#69737d] mt-1 block">
                                                    Mutex locking & cache-aside correctly referenced.
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-[#a7b0ba]">Delivery Confidence</span>
                                                    <span className="font-mono text-[#f1f5f9] font-bold">92%</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "92%" }} />
                                                </div>
                                                <span className="text-[11px] text-[#69737d] mt-1 block">
                                                    Low filler token ratio (1.2 per min).
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-[#a7b0ba]">Speech Cadence</span>
                                                    <span className="font-mono text-[#f1f5f9] font-bold">142 WPM</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: "80%" }} />
                                                </div>
                                                <span className="text-[11px] text-[#69737d] mt-1 block">
                                                    Target band: 130 - 155 WPM (Optimal).
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#151d25]">
                                        <span className="text-[10px] uppercase font-semibold text-[#69737d] block mb-1">
                                            AI Evaluator Directive
                                        </span>
                                        <p className="text-xs text-[#f1f5f9] leading-relaxed">
                                            “Candidate demonstrated sound mitigation tactics. Probing next on event-driven cache invalidation patterns.”
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SHOWCASE 2: Timed Aptitude Engine Preview */}
                        <div className="bg-[#0a0f14] border border-[#202a34] rounded-xl overflow-hidden shadow-xl">
                            <div className="bg-[#111923] border-b border-[#202a34] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Timer size={19} className="text-[#3b82f6]" />
                                    <span className="text-sm font-semibold text-[#f1f5f9]">
                                        Proctored Aptitude Test Environment
                                    </span>
                                    <span className="text-[11px] text-[#a7b0ba] bg-[#17212b] border border-[#2a3540] px-2 py-0.5 rounded">
                                        SECTION 2 OF 3
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-[#0b1b33] border border-[#2563eb]/40 text-[#adc6ff] px-2.5 py-1 rounded font-mono text-xs font-semibold">
                                        <Clock size={13} className="text-[#3b82f6]" />
                                        <span>24:18 REMAINING</span>
                                    </div>
                                    <span className="text-[11px] text-[#22c55e] flex items-center gap-1 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                        Auto-Save Active
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Question & Radio Selectors */}
                                <div className="lg:col-span-8 space-y-5">
                                    <div className="flex items-center justify-between text-xs text-[#a7b0ba]">
                                        <span className="font-mono text-[#3b82f6] font-semibold">
                                            QUESTION 18 / 30 • QUANTITATIVE INTERPRETATION
                                        </span>
                                        <span className="text-[#69737d] font-mono">Marks: +3.0 / -0.75</span>
                                    </div>

                                    <div className="bg-[#111923] border border-[#202a34] p-5 sm:p-6 rounded-lg">
                                        <p className="text-sm sm:text-base text-[#f1f5f9] leading-relaxed mb-6 font-medium">
                                            A distributed queue cluster processes 48,000 asynchronous payloads every 5 minutes. If throughput is scaled up by 35% through horizontal sharding, but payload validation overhead increases individual batch processing duration by 12.5%, how many payloads will the cluster process over an 8-hour shift?
                                        </p>

                                        {/* Interactive Radio Options */}
                                        <div className="space-y-2.5">
                                            {[
                                                { id: "A", label: "A) 4,968,000 payloads" },
                                                { id: "B", label: "B) 5,529,600 payloads (Selected)" },
                                                { id: "C", label: "C) 6,220,800 payloads" },
                                                { id: "D", label: "D) 5,184,000 payloads" },
                                            ].map((opt) => {
                                                const isSelected = selectedAptOption === opt.id;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => setSelectedAptOption(opt.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none text-xs sm:text-sm ${
                                                            isSelected
                                                                ? "bg-[#0b1b33] border-[#2563eb] text-[#f1f5f9]"
                                                                : "bg-[#05070a] border-[#151d25] text-[#a7b0ba] hover:bg-[#17212b] hover:border-[#2a3540]"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                                isSelected
                                                                    ? "border-[#2563eb] bg-[#2563eb]"
                                                                    : "border-[#69737d]"
                                                            }`}
                                                        >
                                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                        </div>
                                                        <span className={isSelected ? "font-medium text-[#f1f5f9]" : ""}>
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAuthRedirect("/aptitude")}
                                                className="bg-[#111923] hover:bg-[#1b2631] border border-[#202a34] text-[#f1f5f9] text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => handleAuthRedirect("/aptitude")}
                                                className="bg-[#17212b] hover:bg-[#1b2631] border border-[#2a3540] text-[#eab308] text-xs font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Bookmark size={14} />
                                                <span>Mark for Review</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleAuthRedirect("/aptitude")}
                                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                                        >
                                            Save & Next
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: 30-Question Palette Matrix */}
                                <div className="lg:col-span-4 bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-[#adc6ff]">
                                                Question Palette
                                            </span>
                                            <span className="font-mono text-xs text-[#69737d]">30 Total</span>
                                        </div>

                                        {/* Legend */}
                                        <div className="grid grid-cols-3 gap-2 text-[10px] mb-4 text-[#a7b0ba]">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded bg-[#2563eb]" />
                                                <span>Answered (14)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded bg-[#eab308]" />
                                                <span>Review (3)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2.5 h-2.5 rounded bg-[#05070a] border border-[#202a34]" />
                                                <span>Unvisited (13)</span>
                                            </div>
                                        </div>

                                        {/* Interactive Grid of 30 Buttons */}
                                        <div className="grid grid-cols-6 gap-1.5 text-center font-mono text-xs">
                                            {Array.from({ length: 30 }, (_, i) => i + 1).map((qNum) => {
                                                const isCurrent = qNum === activePaletteQuestion;
                                                const isReview = [4, 10, 17].includes(qNum);
                                                const isAnswered = qNum <= 16 || qNum === 18;

                                                let style = "bg-[#05070a] border border-[#151d25] text-[#69737d]";
                                                if (isCurrent) {
                                                    style = "bg-[#3b82f6] text-[#002a78] font-bold ring-2 ring-[#3b82f6]";
                                                } else if (isReview) {
                                                    style = "bg-[#eab308] text-[#0a0f14] font-bold";
                                                } else if (isAnswered) {
                                                    style = "bg-[#2563eb] text-white";
                                                }

                                                return (
                                                    <button
                                                        key={qNum}
                                                        onClick={() => setActivePaletteQuestion(qNum)}
                                                        className={`py-1.5 rounded text-xs transition-transform hover:scale-105 cursor-pointer ${style}`}
                                                    >
                                                        {qNum < 10 ? `0${qNum}` : qNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => handleAuthRedirect("/aptitude")}
                                            className="w-full bg-[#17212b] hover:bg-red-500/20 hover:text-red-400 border border-[#2a3540] text-[#a7b0ba] text-xs font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Submit Assessment Early
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SHOWCASE 3: ATS Resume Analysis Matrix */}
                        <div className="bg-[#0a0f14] border border-[#202a34] rounded-xl overflow-hidden shadow-xl">
                            <div className="bg-[#111923] border-b border-[#202a34] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <FileText size={19} className="text-[#3b82f6]" />
                                    <span className="text-sm font-semibold text-[#f1f5f9]">
                                        ATS Resume Compliance Breakdown
                                    </span>
                                    <span className="font-mono text-xs text-[#a7b0ba] bg-[#17212b] border border-[#2a3540] px-2 py-0.5 rounded">
                                        DOCUMENT: Alex_V_Resume_2025.pdf
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-1 rounded">
                                    Overall Compatibility: 88%
                                </span>
                            </div>

                            <div className="p-5 sm:p-7 space-y-6">
                                {/* 3 Scorecard Gauges */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-[#a7b0ba] block mb-1">ATS Parser Compatibility</span>
                                            <span className="text-2xl font-bold font-mono text-[#f1f5f9]">88%</span>
                                            <span className="text-[11px] text-[#22c55e] block mt-1">Standard format verified</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#0b1b33] border border-[#2563eb]/30 flex items-center justify-center text-[#3b82f6]">
                                            <CheckCheck size={20} />
                                        </div>
                                    </div>

                                    <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-[#a7b0ba] block mb-1">Role Keyword Match</span>
                                            <span className="text-2xl font-bold font-mono text-[#eab308]">82%</span>
                                            <span className="text-[11px] text-[#eab308] block mt-1">26 of 32 competencies</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#17212b] border border-[#2a3540] flex items-center justify-center text-[#eab308]">
                                            <ShieldAlert size={20} />
                                        </div>
                                    </div>

                                    <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-[#a7b0ba] block mb-1">Experience Alignment</span>
                                            <span className="text-2xl font-bold font-mono text-[#f1f5f9]">91%</span>
                                            <span className="text-[11px] text-[#22c55e] block mt-1">Direct Staff-level match</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#0b1b33] border border-[#2563eb]/30 flex items-center justify-center text-[#3b82f6]">
                                            <BarChart3 size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Strengths vs Critical Missing Gaps */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3.5 text-[#22c55e] text-xs font-semibold">
                                            <CheckCircle2 size={16} />
                                            <span>Verified Strengths & Hard Keywords</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {[
                                                "Distributed Systems (x8)",
                                                "Go / Microservices (x11)",
                                                "Kubernetes (x6)",
                                                "CI/CD Automation",
                                                "gRPC & Protobuf",
                                            ].map((kw) => (
                                                <span
                                                    key={kw}
                                                    className="px-2.5 py-1 rounded bg-[#05070a] border border-[#151d25] text-[#f1f5f9] text-xs font-mono"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                            Quantified metrics present in 85% of bullet points (e.g. “reduced tail latency by 32%”).
                                        </p>
                                    </div>

                                    <div className="bg-[#111923] border border-[#202a34] p-5 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3.5 text-[#ef4444] text-xs font-semibold">
                                            <AlertCircle size={16} />
                                            <span>Critical Missing Keywords (Target JDs)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {[
                                                "System Observability",
                                                "OpenTelemetry",
                                                "Redis Cluster Failover",
                                                "SLO / SLA Definition",
                                            ].map((gap) => (
                                                <span
                                                    key={gap}
                                                    className="px-2.5 py-1 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs font-mono"
                                                >
                                                    {gap}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                            Adding these 4 explicit technical terms elevates parser scoring by an estimated +8.4%.
                                        </p>
                                    </div>
                                </div>

                                {/* Remediation Banner */}
                                <div className="bg-[#17212b] border border-[#2a3540] p-4 sm:p-5 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <Wand2 size={22} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-[#f1f5f9] mb-1">
                                                Automated Resume Remediation Ready
                                            </h4>
                                            <p className="text-xs text-[#a7b0ba] leading-relaxed">
                                                Generate instant sentence revisions incorporating missing observability keywords into your existing experience blocks.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAuthRedirect("/resume")}
                                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
                                    >
                                        Review AI Rewrite Suggestions
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SHOWCASE 4: Multi-Agent Group Discussion Room */}
                        <div className="bg-[#0a0f14] border border-[#202a34] rounded-xl overflow-hidden shadow-xl">
                            <div className="bg-[#111923] border-b border-[#202a34] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                                    <span className="text-sm font-semibold text-[#f1f5f9]">
                                        AI Multi-Agent Group Discussion Room
                                    </span>
                                    <span className="text-[11px] font-semibold text-[#adc6ff] bg-[#0b1b33] px-2 py-0.5 rounded border border-[#2563eb]/30">
                                        SESSION ACTIVE
                                    </span>
                                </div>
                                <div className="text-xs text-[#a7b0ba]">
                                    Topic: <strong className="text-[#f1f5f9]">AI Governance & Corporate Workplace Automation</strong>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Dialogue Transcript Flow */}
                                <div className="lg:col-span-8 space-y-3.5">
                                    {/* Moderator */}
                                    <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-[#17212b] border border-[#2a3540] shrink-0 flex items-center justify-center text-[#3b82f6]">
                                            <Gavel size={16} />
                                        </div>
                                        <div className="text-xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-[#f1f5f9]">AI Moderator</span>
                                                <span className="font-mono text-[10px] text-[#69737d]">SYSTEM CONTROL</span>
                                            </div>
                                            <p className="text-[#a7b0ba] leading-relaxed">
                                                “Opening the floor to the candidate and peer panel. Remember to back assertions with operational metrics and balance productivity claims with ethical workforce transitions.”
                                            </p>
                                        </div>
                                    </div>

                                    {/* Samantha (Analytical) */}
                                    <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-[#17212b] border border-[#2a3540] shrink-0 flex items-center justify-center text-[#3b82f6]">
                                            <BarChart3 size={16} />
                                        </div>
                                        <div className="text-xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-[#f1f5f9]">AI Peer: Samantha</span>
                                                <span className="font-mono text-[10px] text-[#adc6ff] bg-[#0b1b33] px-1.5 py-0.5 rounded border border-[#2563eb]/20">
                                                    ANALYTICAL SKEPTIC
                                                </span>
                                            </div>
                                            <p className="text-[#a7b0ba] leading-relaxed">
                                                “Looking strictly at the Q3 enterprise adoption datasets, tier-1 automations cut back-office processing by 41%, but unexpected audit costs in non-deterministic models erode nearly half those net gains.”
                                            </p>
                                        </div>
                                    </div>

                                    {/* Candidate (You) */}
                                    <div className="bg-[#0b1b33] border border-[#2563eb]/50 p-4 rounded-lg flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-[#2563eb] text-white shrink-0 flex items-center justify-center font-bold text-xs">
                                            YOU
                                        </div>
                                        <div className="text-xs w-full">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-[#f1f5f9]">Candidate (You)</span>
                                                    <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-1.5 py-0.5 rounded font-bold">
                                                        SPEAKING NOW
                                                    </span>
                                                </div>
                                                <span className="font-mono text-[#adc6ff]">01:42 Spoken</span>
                                            </div>
                                            <p className="text-[#f1f5f9] leading-relaxed">
                                                “That is why a human-in-the-loop validation tier is vital. If we establish strict confidence thresholds where anomalies route directly to specialist review, we capture the 41% speedup while shielding against catastrophic auditing fines.”
                                            </p>
                                        </div>
                                    </div>

                                    {/* Marcus (Strategic) */}
                                    <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-[#17212b] border border-[#2a3540] shrink-0 flex items-center justify-center text-[#69737d]">
                                            <Network size={16} />
                                        </div>
                                        <div className="text-xs">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-[#f1f5f9]">AI Peer: Marcus</span>
                                                <span className="font-mono text-[10px] text-[#a7b0ba] bg-[#17212b] px-1.5 py-0.5 rounded">
                                                    STRATEGIC
                                                </span>
                                            </div>
                                            <p className="text-[#a7b0ba] leading-relaxed">
                                                “Agreed with the candidate. From an organizational risk perspective, phased departmental pilot rollouts allow compliance teams to draft guardrails concurrently.”
                                            </p>
                                        </div>
                                    </div>

                                    {/* Floor Control Bar */}
                                    <div className="p-3 bg-[#05070a] border border-[#151d25] rounded-lg flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <Mic size={15} className="text-[#22c55e] animate-pulse" />
                                            <span className="text-[#a7b0ba]">
                                                Your Floor Share: <strong className="text-[#f1f5f9] font-mono">27%</strong> (Target: 22% - 28%)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleAuthRedirect("/gd")}
                                            className="bg-[#17212b] hover:bg-[#1b2631] border border-[#2a3540] text-[#adc6ff] text-[11px] font-medium px-3 py-1.5 rounded transition-colors cursor-pointer"
                                        >
                                            Enter Live Room →
                                        </button>
                                    </div>
                                </div>

                                {/* 4-Pillar GD Evaluation Scorecard */}
                                <div className="lg:col-span-4 bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-[#adc6ff] mb-1">
                                            Live 4-Pillar GD Evaluation
                                        </div>
                                        <span className="text-[11px] text-[#69737d] block mb-4">
                                            Continuous Multi-Agent Rubric Scoring
                                        </span>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Articulation & Clarity</span>
                                                    <span className="font-mono text-[#f1f5f9] font-semibold">84%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "84%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Leadership & Initiative</span>
                                                    <span className="font-mono text-[#f1f5f9] font-semibold">79%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: "79%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Active Listening & Response</span>
                                                    <span className="font-mono text-[#22c55e] font-semibold">88%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#22c55e] rounded-full" style={{ width: "88%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Critical Thinking & Depth</span>
                                                    <span className="font-mono text-[#f1f5f9] font-semibold">86%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#05070a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "86%" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#151d25] flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-[#69737d] uppercase block">Placement Projection</span>
                                            <span className="text-xs text-[#22c55e] font-semibold">Strong Placement Readiness</span>
                                        </div>
                                        <span className="font-mono text-xs bg-[#17212b] border border-[#2a3540] text-[#f1f5f9] px-2 py-1 rounded">
                                            GD-RANK #1
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 5. UNIFIED PERFORMANCE & HISTORICAL ANALYTICS                             */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#05070a] py-20 border-t border-[#151d25]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#adc6ff] bg-[#0b1b33] border border-[#2563eb]/30 px-3 py-1 rounded">
                                Unified Intelligence
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f1f5f9] tracking-tight mt-3 mb-4">
                                Centralized Intelligence Across Every Stage
                            </h2>
                            <p className="text-sm sm:text-base text-[#a7b0ba] leading-relaxed">
                                Don't practice in disconnected silos. INTELLIVORA aggregates all diagnostic vectors into one unified competency profile.
                            </p>
                        </div>

                        {/* Convergence Flow Architecture Diagram */}
                        <div className="bg-[#0a0f14] border border-[#202a34] p-5 sm:p-8 rounded-xl mb-10 shadow-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg text-center">
                                    <Mic size={22} className="text-[#3b82f6] mx-auto mb-2" />
                                    <span className="text-xs font-semibold text-[#f1f5f9] block">Technical Mock</span>
                                    <span className="text-[11px] text-[#69737d]">Voice & Problem Solving</span>
                                </div>
                                <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg text-center">
                                    <Timer size={22} className="text-[#3b82f6] mx-auto mb-2" />
                                    <span className="text-xs font-semibold text-[#f1f5f9] block">Timed Aptitude</span>
                                    <span className="text-[11px] text-[#69737d]">Speed & Logic Benchmarks</span>
                                </div>
                                <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg text-center">
                                    <FileText size={22} className="text-[#3b82f6] mx-auto mb-2" />
                                    <span className="text-xs font-semibold text-[#f1f5f9] block">Resume ATS</span>
                                    <span className="text-[11px] text-[#69737d]">Keyword Relevance</span>
                                </div>
                                <div className="bg-[#111923] border border-[#202a34] p-4 rounded-lg text-center">
                                    <Users size={22} className="text-[#3b82f6] mx-auto mb-2" />
                                    <span className="text-xs font-semibold text-[#f1f5f9] block">Group Discussion</span>
                                    <span className="text-[11px] text-[#69737d]">Articulation & Leadership</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center my-3">
                                <div className="flex items-center gap-2 text-[#3b82f6] font-mono text-xs font-medium bg-[#0b1b33] border border-[#2563eb]/30 px-3 py-1.5 rounded-full">
                                    <span>▼ ALL VECTORS CONVERGE INTO CENTRAL DIAGNOSTIC ENGINE ▼</span>
                                </div>
                            </div>

                            {/* Timeline vs Radar Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                                {/* Activity Timeline */}
                                <div className="lg:col-span-7 bg-[#111923] border border-[#202a34] p-5 rounded-lg">
                                    <span className="text-xs font-semibold text-[#adc6ff] uppercase tracking-wider block mb-4">
                                        Unified Activity Timeline
                                    </span>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 bg-[#0a0f14] border border-[#151d25] p-3 rounded-lg">
                                            <CheckCircle2 size={18} className="text-[#22c55e] shrink-0 mt-0.5" />
                                            <div className="w-full">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-[#f1f5f9]">Technical Interview • Distributed Systems</span>
                                                    <span className="font-mono text-[#22c55e] font-bold">86 / 100</span>
                                                </div>
                                                <p className="text-xs text-[#a7b0ba]">Evaluated 6 questions on caching & replication. PDF report issued.</p>
                                                <span className="text-[10px] text-[#69737d] font-mono mt-1 block">TODAY, 09:30 AM</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-[#0a0f14] border border-[#151d25] p-3 rounded-lg">
                                            <Timer size={18} className="text-[#3b82f6] shrink-0 mt-0.5" />
                                            <div className="w-full">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-[#f1f5f9]">Aptitude Full-Length Mock 04</span>
                                                    <span className="font-mono text-[#3b82f6] font-bold">88% (94th %ile)</span>
                                                </div>
                                                <p className="text-xs text-[#a7b0ba]">Completed 30 quantitative and CS core problems with 3m 42s remaining.</p>
                                                <span className="text-[10px] text-[#69737d] font-mono mt-1 block">YESTERDAY, 04:15 PM</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-[#0a0f14] border border-[#151d25] p-3 rounded-lg">
                                            <Users size={18} className="text-[#adc6ff] shrink-0 mt-0.5" />
                                            <div className="w-full">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-[#f1f5f9]">Group Discussion: AI Ethics in Tech</span>
                                                    <span className="font-mono text-[#22c55e] font-bold">Placement-Ready</span>
                                                </div>
                                                <p className="text-xs text-[#a7b0ba]">Ranked 1st among panel. Highest marks in Active Listening.</p>
                                                <span className="text-[10px] text-[#69737d] font-mono mt-1 block">3 DAYS AGO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vector Breakdown */}
                                <div className="lg:col-span-5 bg-[#111923] border border-[#202a34] p-5 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-[#adc6ff] uppercase tracking-wider block mb-4">
                                            Competency Vector Synthesis
                                        </span>
                                        <div className="space-y-3.5">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Algorithms & Architecture</span>
                                                    <span className="font-mono text-[#f1f5f9]">88%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "88%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Quantitative Speed</span>
                                                    <span className="font-mono text-[#f1f5f9]">82%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: "82%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Resume ATS Compatibility</span>
                                                    <span className="font-mono text-[#22c55e]">91%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#22c55e] rounded-full" style={{ width: "91%" }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#a7b0ba]">Collaborative Discourse (GD)</span>
                                                    <span className="font-mono text-[#f1f5f9]">85%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: "85%" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => handleAuthRedirect("/history")}
                                            className="w-full flex items-center justify-center gap-2 bg-[#17212b] hover:bg-[#1b2631] border border-[#2a3540] text-[#f1f5f9] text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <span>View Full Longitudinal Analytics</span>
                                            <TrendingUp size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 6. CREDIT SYSTEM & PLANS (TRANSPARENT & SIMPLE)                           */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#0a0f14] py-20 border-t border-[#151d25]" id="pricing">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <span className="text-xs uppercase tracking-wider font-semibold text-[#adc6ff] bg-[#0b1b33] border border-[#2563eb]/30 px-3 py-1 rounded">
                                Universal Access
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-semibold text-[#f1f5f9] tracking-tight mt-3 mb-4">
                                Flexible Preparation with Credit-Based Access
                            </h2>
                            <p className="text-sm sm:text-base text-[#a7b0ba] leading-relaxed">
                                Use credits flexibly across all four preparation modules. New accounts include introductory practice credits.
                            </p>
                            {userData && (
                                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111923] border border-[#202a34] text-xs text-[#a7b0ba]">
                                    <span>Current Balance:</span>
                                    <span className="font-mono font-semibold text-[#adc6ff]">🪙 {userData.credits ?? 0} Credits</span>
                                    <button
                                        onClick={() => navigate("/pricing")}
                                        className="ml-2 text-[#3b82f6] hover:text-[#adc6ff] font-medium underline cursor-pointer"
                                    >
                                        Buy More Credits →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3 Tier Cards from Authoritative PRICING_PLANS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {PRICING_PLANS.map((plan) => {
                                const isFeatured = Boolean(plan.badge);

                                return (
                                    <div
                                        key={plan.id}
                                        className={`bg-[#111923] p-6 sm:p-8 rounded-xl flex flex-col justify-between shadow-md relative ${
                                            isFeatured
                                                ? "border-2 border-[#2563eb] shadow-xl"
                                                : "border border-[#202a34]"
                                        }`}
                                    >
                                        {isFeatured && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                                {plan.badge}
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[11px] font-semibold text-[#adc6ff] uppercase tracking-wider block mb-2">
                                                {plan.tagline}
                                            </span>
                                            <div className="flex items-baseline justify-between gap-2 mb-2">
                                                <h3 className="text-xl font-semibold text-[#f1f5f9]">
                                                    {plan.name}
                                                </h3>
                                                <span className="text-xl font-bold font-mono text-[#f1f5f9]">
                                                    {plan.price}
                                                </span>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1b33] border border-[#2563eb]/20 text-xs font-semibold text-[#adc6ff] mb-4">
                                                <span>🪙 {plan.credits} AI Credits</span>
                                            </div>
                                            <p className="text-xs text-[#a7b0ba] mb-6 leading-relaxed">
                                                {plan.description}
                                            </p>
                                            <div className="space-y-3 text-xs text-[#a7b0ba] mb-8">
                                                {plan.features.map((feature, fIdx) => (
                                                    <div key={fIdx} className="flex items-center gap-2.5">
                                                        <Check size={16} className="text-[#3b82f6] shrink-0" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAuthRedirect("/pricing")}
                                            className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                isFeatured
                                                    ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm"
                                                    : "bg-[#17212b] hover:bg-[#1b2631] border border-[#2a3540] text-[#f1f5f9]"
                                            }`}
                                        >
                                            {plan.ctaText}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => handleAuthRedirect("/pricing")}
                                className="text-xs text-[#3b82f6] hover:text-[#adc6ff] transition-colors cursor-pointer font-medium"
                            >
                                View Detailed Breakdown of Credit Usage & Plans →
                            </button>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 7. FINAL CTA SECTION                                                      */}
                {/* ========================================================================= */}
                <section className="w-full bg-[#05070a] py-24 border-t border-[#151d25] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1b33]/20 via-transparent to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-[#0b1b33] border border-[#2563eb]/40 flex items-center justify-center text-[#3b82f6] mb-6 shadow-sm">
                            <Terminal size={24} />
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-semibold text-[#f1f5f9] tracking-tight mb-5 leading-tight">
                            Prepare With Purpose. Perform With Confidence.
                        </h2>
                        <p className="text-sm sm:text-base text-[#a7b0ba] max-w-2xl mb-10 leading-relaxed font-normal">
                            Join career seekers practicing technical interviews, timed aptitude, ATS resume optimization, and multi-agent group discussions in one unified workspace.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
                            <button
                                onClick={() => handleAuthRedirect("/interview")}
                                className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold px-8 py-3.5 rounded-lg transition-colors cursor-pointer shadow-lg hover:shadow-blue-500/20"
                            >
                                <span>Start Practicing Now</span>
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => scrollToSection("modules")}
                                className="inline-flex items-center justify-center gap-2 bg-[#111923] hover:bg-[#17212b] border border-[#202a34] text-[#f1f5f9] text-sm font-medium px-6 py-3.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <span>Browse Modules & Syllabi</span>
                            </button>
                        </div>
                        <p className="text-xs text-[#69737d] max-w-xl">
                            INTELLIVORA provides simulated preparation tools and evaluations; it does not guarantee placement or employment.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Home;