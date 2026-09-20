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
            title: "Product",
            links: [
                { label: "AI Interview", to: "/interview" },
                { label: "Aptitude Diagnostic", to: "/aptitude" },
                { label: "Group Discussion", to: "/gd" },
                { label: "ATS Resume Check", to: "/resume" },
                { label: "Pricing & Credits", to: "/pricing" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "About Us", to: "/about" },
                { label: "Careers", to: "/careers" },
                { label: "Blog", to: "/blog" },
                { label: "Contact", to: "/contact" },
                { label: "Press", to: "/press" },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "Documentation", to: "/docs" },
                { label: "Help Center", to: "/help" },
                { label: "Community", to: "/community" },
                { label: "FAQs", to: "/faqs" },
                { label: "Guides", to: "/guides" },
            ],
        },
        {
            title: "Legal",
            links: [
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Cookie Policy", to: "/cookies" },
                { label: "Refund Policy", to: "/refund" },
                { label: "Security", to: "/security" },
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
                    2. MAIN FOOTER CONTENT (Brand block + 4 link columns)
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

                        {/* Note: Placeholder social profile URLs to be updated with real Intellivora brand handles later */}
                        <div className="flex items-center gap-2.5 pt-1">
                            {/* GitHub */}
                            <a
                                href="https://github.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="w-9 h-9 rounded-full border border-[#1E2B45] bg-[#0E131F] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                            >
                                <svg
                                    fill="currentColor"
                                    className="w-[18px] h-[18px] text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-9 h-9 rounded-full border border-[#1E2B45] bg-[#0E131F] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                            >
                                <svg
                                    fill="currentColor"
                                    className="w-[18px] h-[18px] text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                </svg>
                            </a>

                            {/* Twitter / X */}
                            <a
                                href="https://twitter.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter / X"
                                className="w-9 h-9 rounded-full border border-[#1E2B45] bg-[#0E131F] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                            >
                                <svg
                                    fill="currentColor"
                                    className="w-[17px] h-[17px] text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-9 h-9 rounded-full border border-[#1E2B45] bg-[#0E131F] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                            >
                                <svg
                                    fill="currentColor"
                                    className="w-[18px] h-[18px] text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a
                                href="https://www.youtube.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="w-9 h-9 rounded-full border border-[#1E2B45] bg-[#0E131F] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A233A] hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                            >
                                <svg
                                    fill="currentColor"
                                    className="w-[18px] h-[18px] text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>

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

                    {/* 4 Link Columns (lg:col-span-8) */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
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