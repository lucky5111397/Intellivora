import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    X,
    ChevronDown,
    ArrowRight,
    CreditCard,
    Coins,
    TrendingUp,
    Clock,
    Shield,
    LogOut,
    User as UserIcon,
} from "lucide-react";
import logoDark from "../../assets/logo-dark.png";
import { Button, Badge } from "../ui";
import { navSections } from "../../config/navConfig";

export function MobileDrawer({
    mobileOpen,
    setMobileOpen,
    userData,
    isAdmin,
    credits,
    profileInitial,
    handleNavigate,
    handleLogout,
    shouldReduceMotion,
    isPricingActive,
}) {
    const [openSection, setOpenSection] = useState(null);

    return (
        <AnimatePresence>
            {mobileOpen && (
                <>
                    {/* Semi-transparent backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
                        aria-hidden="true"
                    />

                    {/* Slide-over Drawer Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: shouldReduceMotion ? "tween" : "spring",
                            damping: 28,
                            stiffness: 280,
                            duration: shouldReduceMotion ? 0.05 : undefined,
                        }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#0E131F] border-l border-[#1E2B45] flex flex-col shadow-2xl shadow-black/90 lg:hidden overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation drawer"
                    >
                        {/* Drawer Header */}
                        <div className="h-16 px-5 border-b border-[#1E2B45] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={logoDark}
                                    alt="Intellivora"
                                    className="h-6 w-6 object-contain"
                                />
                                <span className="font-bold text-base tracking-tight text-[#F1F5F9]">
                                    Intellivora
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] border border-[#1E2B45] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                aria-label="Close drawer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer Navigation Links & Accordions */}
                        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
                            {navSections.map((section) => {
                                const isOpen = openSection === section.key;

                                return (
                                    <div
                                        key={section.key}
                                        className="rounded-xl border border-[#1E2B45] bg-[#0A0D14]/60 overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenSection(
                                                    isOpen ? null : section.key
                                                )}
                                            className="w-full flex items-center justify-between p-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-left"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="font-mono">
                                                {section.name}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${
                                                    isOpen
                                                        ? "rotate-180 text-[#38BDF8]"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{
                                                        duration: 0.2,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="border-t border-[#1E2B45] px-2 py-2 space-y-1"
                                                >
                                                    {section.items.map((item) => {
                                                        const Icon = item.icon;

                                                        if (item.disabled) {
                                                            return (
                                                                <div
                                                                    key={item.name}
                                                                    className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left opacity-50 cursor-not-allowed select-none"
                                                                >
                                                                    <div className="w-7 h-7 rounded-md bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#64748B] shrink-0 mt-0.5">
                                                                        <Icon size={14} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <p className="text-xs font-semibold text-[#94A3B8]">
                                                                                {item.name}
                                                                            </p>
                                                                            <span className="text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded bg-[#141B2D] border border-[#1E2B45] text-[#64748B]">
                                                                                SOON
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[10px] text-[#64748B] line-clamp-1">
                                                                            {item.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                key={item.name}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleNavigate(item.path)
                                                                }
                                                                className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-[#141B2D] transition-colors group cursor-pointer"
                                                            >
                                                                <div className="w-7 h-7 rounded-md bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#94A3B8] group-hover:text-[#38BDF8] shrink-0 mt-0.5">
                                                                    <Icon size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[#F1F5F9]">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-[#64748B] line-clamp-1">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}

                            {/* Pricing Direct Link in Drawer */}
                            <button
                                type="button"
                                onClick={() => handleNavigate("/pricing")}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                                    isPricingActive
                                        ? "bg-[#141B2D] border-[#2563EB]/40 text-[#F1F5F9]"
                                        : "border-[#1E2B45] bg-[#0A0D14]/60 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D]"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <CreditCard size={15} className="text-[#38BDF8]" />
                                    <span>Pricing & Credits</span>
                                </div>
                                <ArrowRight size={13} className="text-[#64748B]" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handleNavigate("/credits")}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#1E2B45] bg-[#0A0D14]/60 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Coins size={15} className="text-[#38BDF8]" />
                                    <span>Credits & Usage</span>
                                </div>
                                <ArrowRight size={13} className="text-[#64748B]" />
                            </button>
                        </div>

                        {/* Drawer Footer (Auth Zone) */}
                        <div className="p-4 border-t border-[#1E2B45] bg-[#0A0D14] shrink-0 space-y-3">
                            {userData ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-[#141B2D] border border-[#2D3E63] flex items-center justify-center text-xs font-semibold text-[#F1F5F9] shrink-0">
                                                {profileInitial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[#F1F5F9] truncate">
                                                    {userData?.name || "Candidate"}
                                                </p>
                                                <p className="text-[10px] text-[#64748B] truncate font-mono">
                                                    {userData?.email || ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant={
                                                    userData?.currentPlan === "Ultra"
                                                        ? "ai"
                                                        : userData?.currentPlan === "Pro"
                                                        ? "brand"
                                                        : "neutral"
                                                }
                                                size="sm"
                                            >
                                                {userData?.currentPlan
                                                    ? `${userData.currentPlan} Plan`
                                                    : "Free Plan"}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                                                <Coins size={12} />
                                                <span>{credits}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleNavigate("/admin")}
                                            className="w-full text-xs text-[#93C5FD] border-[#2563EB]/40 bg-[#0D1E3A]/50 hover:bg-[#0D1E3A]"
                                            leftIcon={Shield}
                                        >
                                            Admin Console
                                        </Button>
                                    )}

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleNavigate("/profile")}
                                        className="w-full text-xs"
                                        leftIcon={UserIcon}
                                    >
                                        Profile & Settings
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleNavigate("/progress")}
                                        className="w-full text-xs"
                                        leftIcon={TrendingUp}
                                    >
                                        Progress Dashboard
                                    </Button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleNavigate("/history")}
                                            className="text-xs"
                                            leftIcon={Clock}
                                        >
                                            History
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="text-xs"
                                            leftIcon={LogOut}
                                        >
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={() => handleNavigate("/auth")}
                                        className="w-full text-xs"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="md"
                                        rightIcon={ArrowRight}
                                        onClick={() => handleNavigate("/auth")}
                                        className="w-full text-xs shadow-md shadow-[#2563EB]/20"
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default MobileDrawer;
