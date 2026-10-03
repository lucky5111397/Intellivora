import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import {
    Mail,
    ArrowRight,
    ShieldCheck,
    Lock,
    Shield,
    CheckCircle2,
    Globe,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ServerUrl } from "../App";
import logoDark from "../assets/logo-dark.png";
import { Button, Input } from "./ui";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Auth-aware destination matching Navbar's primary CTA
    const targetRoute = userData ? "/interview" : "/auth";
    const ctaLabel = userData ? "Open App" : "Get Started";

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const trimmedEmail = newsletterEmail.trim();
        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsSubscribing(true);
        try {
            const res = await axios.post(`${ServerUrl}/api/newsletter/subscribe`, {
                email: trimmedEmail,
                source: "footer",
            });

            if (res.data?.success) {
                if (res.data.alreadySubscribed) {
                    toast.info(res.data.message || "You're already subscribed to Intellivora intelligence updates!");
                } else {
                    toast.success(res.data.message || "Thank you for subscribing to Intellivora intelligence updates!");
                    setNewsletterEmail("");
                }
            } else {
                toast.error(res.data?.message || "Failed to subscribe. Please try again.");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to subscribe. Please try again later.");
        } finally {
            setIsSubscribing(false);
        }
    };

    const linkColumns = [
        {
            title: "Prepare",
            links: [
                { label: "DSA", to: "/prepare/dsa" },
                { label: "Coding Practice", to: "/prepare/coding" },
                { label: "System Design", to: "/prepare/system-design" },
                { label: "Technical Quiz", to: "/prepare/quiz" },
                { label: "SQL Practice", to: "/prepare/sql" },
            ],
        },
        {
            title: "Assess",
            links: [
                { label: "AI Interview", to: "/interview" },
                { label: "Aptitude", to: "/aptitude" },
                { label: "Group Discussion", to: "/gd" },
                { label: "Mock Placement", to: "/assess/placement" },
                { label: "Interview Replay", to: "/assess/replay" },
            ],
        },
        {
            title: "Career",
            links: [
                { label: "ATS / Resume", to: "/resume" },
                { label: "JD Analyzer", to: "/career/jd-analyzer" },
                { label: "Career Roadmap", to: "/career/roadmap" },
                { label: "Company Preparation", to: "/career/company-preparation" },
                { label: "Job Tracker", to: "/career/job-tracker" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "Pricing", to: "/pricing" },
                { label: "About", to: "/about" },
                { label: "Careers", to: "/careers" },
                { label: "Contact", to: "/contact" },
                { label: "Blog", to: "/blog" },
            ],
        },
        {
            title: "Account",
            links: [
                { label: "Login", to: "/auth" },
                { label: "Profile", to: "/profile" },
                { label: "Progress", to: "/progress" },
                { label: "History", to: "/history" },
                { label: "Credits", to: "/credits" },
            ],
        },
    ];

    const trustBadges = [
        { icon: ShieldCheck, label: "SOC 2 Compliant" },
        { icon: Lock, label: "GDPR Ready" },
        { icon: Shield, label: "256-Bit TLS Encryption" },
        { icon: CheckCircle2, label: "99.9% Uptime SLA" },
    ];

    return (
        <footer className="relative w-full bg-[#0A0D14] overflow-hidden">
            {/* Top Border: Subtle Gradient Line (transparent -> #2563EB 20% -> transparent) */}
            <div
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2563EB]/25 to-transparent"
                aria-hidden="true"
            />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
            >
                {/* ============================================================
                    1. NEWSLETTER / CTA STRIP (Contained elevated card)
                    ============================================================ */}
                <div className="relative mb-16 rounded-2xl border border-[#1E2B45] bg-[#0E131F]/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Soft blurred ambient glow orb behind newsletter strip */}
                    <div
                        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-b from-[#2563EB]/15 via-[#8B5CF6]/8 to-transparent blur-[100px] rounded-full"
                        aria-hidden="true"
                    />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-2 text-center lg:text-left max-w-xl">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-mono">
                                <Sparkles size={14} />
                                <span>Career Intelligence Dispatch</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                                Stay ahead in your career prep
                            </h3>
                            <p className="text-sm text-[#94A3B8] leading-relaxed">
                                Get weekly technical interview questions, system design breakdowns, and algorithmic insights delivered directly to your inbox.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubscribe}
                            className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0"
                        >
                            <div className="w-full sm:w-72">
                                <Input
                                    type="email"
                                    placeholder="Enter your work email..."
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    leftIcon={Mail}
                                    className="bg-[#06080B] border-[#1E2B45] h-11 text-sm focus:border-[#2563EB]"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={isSubscribing}
                                rightIcon={ArrowRight}
                                className="h-11 px-5 shadow-lg shadow-[#2563EB]/25 shrink-0"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>

                {/* ============================================================
                    2. MAIN FOOTER CONTENT (Brand block + product link columns)
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 pb-16">
                    {/* Brand Column (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="flex items-center gap-3">
                            <img
                                src={logoDark}
                                alt="Intellivora"
                                className="h-8 w-8 object-contain"
                            />
                            <span className="font-bold text-xl tracking-tight text-[#F1F5F9] font-sans">
                                Intellivora
                            </span>
                        </div>
                        <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
                            Autonomous recruitment intelligence and career rehearsal platform. Master technical interviews, timed aptitude, group discussions, and ATS audits.
                        </p>

                        {/* Open App CTA Button */}
                        <div className="pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                rightIcon={ArrowRight}
                                onClick={() => navigate(targetRoute)}
                                className="text-xs"
                            >
                                {ctaLabel}
                            </Button>
                        </div>
                    </div>

                    {/* Link Columns (lg:col-span-8) */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-5 gap-8">
                        {linkColumns.map((col, colIdx) => (
                            <motion.div
                                key={col.title}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.45,
                                    delay: colIdx * 0.06,
                                }}
                                className="space-y-4"
                            >
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] font-mono">
                                    {col.title}
                                </h4>
                                <ul className="space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            {link.to ? (
                                                <Link
                                                    to={link.to}
                                                    className="inline-block text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-all duration-150 hover:translate-x-0.5"
                                                >
                                                    {link.label}
                                                </Link>
                                            ) : (
                                                <a
                                                    href={link.href}
                                                    className="inline-block text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-all duration-150 hover:translate-x-0.5"
                                                >
                                                    {link.label}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ============================================================
                    3. TRUST / BADGE ROW
                    ============================================================ */}
                <div className="py-6 border-t border-[#1E2B45] flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                    {trustBadges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={badge.label}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E2B45] bg-[#0E131F]/60 text-xs font-mono text-[#94A3B8]"
                            >
                                <Icon size={14} className="text-[#38BDF8]" />
                                <span>{badge.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* ============================================================
                    4. BOTTOM BAR
                    ============================================================ */}
                <div className="pt-6 border-t border-[#141B2D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
                    {/* Left: Copyright */}
                    <p>© {currentYear} Intellivora. All rights reserved.</p>

                    {/* Center: System Status Indicator */}
                    <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#94A3B8] bg-[#0E131F] border border-[#1E2B45] px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                        <span>All systems operational</span>
                    </div>

                    {/* Right: Language Selector + Inline Links */}
                    <div className="flex items-center gap-5">
                        <div className="inline-flex items-center gap-1.5 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer">
                            <Globe size={13} />
                            <span>English (US)</span>
                        </div>
                        <span className="text-[#1E2B45]">|</span>
                        <Link to="/privacy" className="hover:text-[#F1F5F9] transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="hover:text-[#F1F5F9] transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}

export default Footer;