import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import {
    Video,
    Sparkles,
    Users,
    FileText,
    BookOpen,
    HelpCircle,
    Compass,
    Newspaper,
    CreditCard,
    Coins,
    Clock,
    LogOut,
    User as UserIcon,
    Shield,
    Menu,
    X,
    ChevronDown,
    ArrowRight,
    TrendingUp,
    Code2,
    BarChart2,
    Briefcase,
    GraduationCap,
    Layers,
} from "lucide-react";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import logoDark from "../assets/logo-dark.png";
import { Button, Badge } from "./ui";

export function Navbar() {
    const { userData, authLoading } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const shouldReduceMotion = useReducedMotion();

    const [activeDropdown, setActiveDropdown] = useState(null);
    const openTimeoutRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [creditMenuOpen, setCreditMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const creditRef = useRef(null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
    const [mobileUseCasesOpen, setMobileUseCasesOpen] = useState(false);
    const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 15);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Outside click & Escape key listener
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
            if (creditRef.current && !creditRef.current.contains(e.target)) {
                setCreditMenuOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setActiveDropdown(null);
                setProfileMenuOpen(false);
                setCreditMenuOpen(false);
                setMobileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Close all menus on route change
    useEffect(() => {
        setActiveDropdown(null);
        setProfileMenuOpen(false);
        setCreditMenuOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

    // Handle desktop dropdown hover timing
    const handleDropdownEnter = (name) => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        openTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(name);
        }, 100);
    };

    const handleDropdownLeave = () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 120);
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${ServerUrl}/api/auth/logout`, { withCredentials: true });
            dispatch(setUserData(null));
            toast.success("Successfully logged out");
            setProfileMenuOpen(false);
            setMobileOpen(false);
            navigate("/auth");
        } catch {
            toast.error("Logout failed. Please try again.");
        }
    };

    const handleNavigate = (path) => {
        setActiveDropdown(null);
        setProfileMenuOpen(false);
        setCreditMenuOpen(false);
        setMobileOpen(false);
        navigate(path);
    };

    // Product & Resource item definitions
    const productItems = [
        {
            name: "AI Interview",
            path: "/interview",
            icon: Video,
            description: "Adaptive technical & behavioral mock rounds with real-time feedback",
        },
        {
            name: "Aptitude Practice",
            path: "/aptitude",
            icon: Sparkles,
            description: "Timed quantitative, logical & verbal diagnostic tests",
        },
        {
            name: "Group Discussion",
            path: "/gd",
            icon: Users,
            description: "Multi-agent conversational rounds with turn-taking telemetry",
        },
        {
            name: "ATS Resume Check",
            path: "/resume",
            icon: FileText,
            description: "Deep JD-resume matching score and bullet optimization",
        },
    ];

    const resourceItems = [
        {
            name: "Documentation",
            path: "/docs",
            icon: BookOpen,
            description: "Scoring rubrics, speech models, and architecture specs",
        },
        {
            name: "Help Center",
            path: "/help",
            icon: HelpCircle,
            description: "Troubleshooting setup, audio permissions & account support",
        },
        {
            name: "FAQs",
            path: "/faqs",
            icon: HelpCircle,
            description: "Answers on credits, grading benchmarks & device requirements",
        },
        {
            name: "Guides",
            path: "/guides",
            icon: Compass,
            description: "Step-by-step role roadmaps and preparation playbooks",
        },
        {
            name: "Blog",
            path: "/blog",
            icon: Newspaper,
            description: "Engineering updates, interview trends & career advice",
        },
    ];

    const useCaseItems = [
        {
            name: "Software Engineers",
            path: "/use-cases/software-engineers",
            icon: Code2,
            description: "System design, live coding, and algorithmic rounds with AI",
        },
        {
            name: "Data Analysts",
            path: "/use-cases/data-analysts",
            icon: BarChart2,
            description: "SQL, statistical reasoning, and quantitative case studies",
        },
        {
            name: "Product & Business",
            path: "/use-cases/product-business",
            icon: Briefcase,
            description: "Product sense, estimation, and behavioral leadership rounds",
        },
        {
            name: "Campus Placements",
            path: "/use-cases/campus-placements",
            icon: GraduationCap,
            description: "Aptitude tests, group discussions, and entry-level mock rounds",
        },
        {
            name: "Consultants",
            path: "/use-cases/consultants",
            icon: Layers,
            description: "Market sizing, profitability frameworks, and structured problem solving",
        },
    ];

    const isProductsActive = productItems.some(
        (i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/")
    );
    const isUseCasesActive = useCaseItems.some(
        (i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/")
    );
    const isResourcesActive = resourceItems.some(
        (i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/")
    );
    const isPricingActive = location.pathname === "/pricing";

    const dropdownVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: shouldReduceMotion ? 0.05 : 0.16, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            y: shouldReduceMotion ? 0 : -8,
            transition: { duration: shouldReduceMotion ? 0.05 : 0.12, ease: "easeIn" },
        },
    };

    const credits = userData?.credits ?? 0;
    const creditBadgeStyle =
        credits <= 0
            ? "bg-[#280B0B] border-[#EF4444]/40 text-[#F87171] hover:border-[#EF4444]"
            : credits < 5
            ? "bg-[#271A04] border-[#F59E0B]/40 text-[#FBBF24] hover:border-[#F59E0B]"
            : "bg-[#0D1E3A] border-[#2563EB]/40 text-[#93C5FD] hover:border-[#2563EB]";

    const isAdmin = Boolean(
        userData?.email &&
        import.meta.env.VITE_ADMIN_EMAIL &&
        userData.email.trim().toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.trim().toLowerCase()
    );

    return (
        <motion.header
            animate={{
                backgroundColor: scrolled ? "rgba(6, 8, 11, 0.96)" : "rgba(6, 8, 11, 0.75)",
                borderColor: scrolled ? "#1E2B45" : "rgba(30, 43, 69, 0.35)",
                boxShadow: scrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.6)" : "none",
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors"
        >
            <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                {/* ============================================================
                    1. LEFT: LOGO + WORDMARK
                    ============================================================ */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg p-1"
                    aria-label="Intellivora Home"
                >
                    <img
                        src={logoDark}
                        alt="Intellivora Logo"
                        className="h-7 w-7 object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="font-bold text-lg tracking-tight text-[#F1F5F9] font-sans">
                        Intellivora
                    </span>
                </Link>

                {/* ============================================================
                    2. CENTER-LEFT: DESKTOP NAV WITH DROPDOWNS
                    ============================================================ */}
                <nav
                    className="hidden lg:flex items-center gap-1 bg-[#0A0D14]/80 border border-[#1E2B45]/80 rounded-xl px-2 py-1"
                    aria-label="Primary Navigation"
                >
                    {/* Products Dropdown Trigger */}
                    <div
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter("products")}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveDropdown(activeDropdown === "products" ? null : "products")
                            }
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                isProductsActive || activeDropdown === "products"
                                    ? "text-[#F1F5F9] bg-[#141B2D]"
                                    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                            }`}
                            aria-expanded={activeDropdown === "products"}
                            aria-haspopup="true"
                        >
                            <span>Products</span>
                            <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                    activeDropdown === "products" ? "rotate-180 text-[#38BDF8]" : ""
                                }`}
                            />
                            {isProductsActive && (
                                <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                            )}
                        </button>

                        {/* Products Dropdown Panel */}
                        <AnimatePresence>
                            {activeDropdown === "products" && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute left-0 mt-2 w-80 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-2 z-50 backdrop-blur-xl"
                                >
                                    <div className="space-y-1">
                                        {productItems.map((item) => {
                                            const Icon = item.icon;
                                            const isItemActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className={`group flex items-start gap-3 p-2.5 rounded-lg transition-all duration-150 text-left ${
                                                        isItemActive
                                                            ? "bg-[#141B2D] border border-[#2563EB]/40"
                                                            : "hover:bg-[#141B2D] border border-transparent"
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#06080B] border border-[#1E2B45] flex items-center justify-center text-[#94A3B8] group-hover:text-[#38BDF8] group-hover:border-[#2563EB]/50 transition-colors shrink-0 mt-0.5">
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white transition-colors">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Use Cases Dropdown Trigger */}
                    <div
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter("use-cases")}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveDropdown(activeDropdown === "use-cases" ? null : "use-cases")
                            }
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                isUseCasesActive || activeDropdown === "use-cases"
                                    ? "text-[#F1F5F9] bg-[#141B2D]"
                                    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                            }`}
                            aria-expanded={activeDropdown === "use-cases"}
                            aria-haspopup="true"
                        >
                            <span>Use Cases</span>
                            <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                    activeDropdown === "use-cases" ? "rotate-180 text-[#38BDF8]" : ""
                                }`}
                            />
                            {isUseCasesActive && (
                                <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                            )}
                        </button>

                        {/* Use Cases Dropdown Panel */}
                        <AnimatePresence>
                            {activeDropdown === "use-cases" && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute left-0 mt-2 w-80 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-2 z-50 backdrop-blur-xl"
                                >
                                    <div className="space-y-1">
                                        {useCaseItems.map((item) => {
                                            const Icon = item.icon;
                                            const isItemActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className={`group flex items-start gap-3 p-2.5 rounded-lg transition-all duration-150 text-left ${
                                                        isItemActive
                                                            ? "bg-[#141B2D] border border-[#2563EB]/40"
                                                            : "hover:bg-[#141B2D] border border-transparent"
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#06080B] border border-[#1E2B45] flex items-center justify-center text-[#94A3B8] group-hover:text-[#38BDF8] group-hover:border-[#2563EB]/50 transition-colors shrink-0 mt-0.5">
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white transition-colors">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Resources Dropdown Trigger */}
                    <div
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter("resources")}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveDropdown(
                                    activeDropdown === "resources" ? null : "resources"
                                )
                            }
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                isResourcesActive || activeDropdown === "resources"
                                    ? "text-[#F1F5F9] bg-[#141B2D]"
                                    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                            }`}
                            aria-expanded={activeDropdown === "resources"}
                            aria-haspopup="true"
                        >
                            <span>Resources</span>
                            <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                    activeDropdown === "resources"
                                        ? "rotate-180 text-[#38BDF8]"
                                        : ""
                                }`}
                            />
                            {isResourcesActive && (
                                <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                            )}
                        </button>

                        {/* Resources Dropdown Panel */}
                        <AnimatePresence>
                            {activeDropdown === "resources" && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute left-0 mt-2 w-80 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-2 z-50 backdrop-blur-xl"
                                >
                                    <div className="space-y-1">
                                        {resourceItems.map((item) => {
                                            const Icon = item.icon;
                                            const isItemActive = location.pathname === item.path;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className={`group flex items-start gap-3 p-2.5 rounded-lg transition-all duration-150 text-left ${
                                                        isItemActive
                                                            ? "bg-[#141B2D] border border-[#2563EB]/40"
                                                            : "hover:bg-[#141B2D] border border-transparent"
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#06080B] border border-[#1E2B45] flex items-center justify-center text-[#94A3B8] group-hover:text-[#38BDF8] group-hover:border-[#2563EB]/50 transition-colors shrink-0 mt-0.5">
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <p className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white transition-colors">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pricing Direct Link */}
                    <Link
                        to="/pricing"
                        className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                            isPricingActive
                                ? "text-[#F1F5F9] bg-[#141B2D]"
                                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                        }`}
                    >
                        <span>Pricing</span>
                        {isPricingActive && (
                            <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                        )}
                    </Link>
                </nav>

                {/* ============================================================
                    3. RIGHT SIDE: AUTH-AWARE ACTIONS
                    ============================================================ */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* State A: Loading Skeleton */}
                    {authLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-8 rounded-lg bg-[#0E131F] border border-[#1E2B45] animate-pulse" />
                            <div className="w-24 h-8 rounded-lg bg-[#141B2D] border border-[#1E2B45] animate-pulse" />
                        </div>
                    ) : userData ? (
                        <>
                            {/* Progress text link */}
                            <Link
                                to="/progress"
                                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                    location.pathname === "/progress"
                                        ? "text-[#F1F5F9] bg-[#141B2D]"
                                        : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                                }`}
                            >
                                <TrendingUp size={14} className="text-[#38BDF8]" />
                                <span>Progress</span>
                            </Link>

                            {/* History text link */}
                            <Link
                                to="/history"
                                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                    location.pathname === "/history"
                                        ? "text-[#F1F5F9] bg-[#141B2D]"
                                        : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                                }`}
                            >
                                <Clock size={14} />
                                <span>History</span>
                            </Link>

                            {/* Credits Badge & Dropdown */}
                            <div className="relative" ref={creditRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCreditMenuOpen(!creditMenuOpen);
                                        setProfileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${creditBadgeStyle}`}
                                    aria-expanded={creditMenuOpen}
                                    aria-label="View credit balance"
                                >
                                    <Coins size={14} className="shrink-0" />
                                    <span className="font-mono tabular-nums">{credits}</span>
                                    <span className="hidden sm:inline text-[11px] opacity-80 font-normal">
                                        Credits
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {creditMenuOpen && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute right-0 mt-2 w-72 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-4 z-50 backdrop-blur-xl"
                                        >
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2B45]">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-mono">
                                                    Credit Balance
                                                </span>
                                                <div className="flex items-center gap-2">
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
                                                        {userData?.currentPlan ? `${userData.currentPlan} Plan` : "Free Plan"}
                                                    </Badge>
                                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD]">
                                                        {credits} Available
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                                                Credits power AI mock interviews, multi-agent discussions, and ATS resume scans.
                                            </p>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                rightIcon={ArrowRight}
                                                onClick={() => handleNavigate("/pricing")}
                                                className="w-full text-xs"
                                            >
                                                Get More Credits
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile Avatar & Action Menu */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileMenuOpen(!profileMenuOpen);
                                        setCreditMenuOpen(false);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#2D3E63] hover:border-[#3B82F6] flex items-center justify-center text-xs font-semibold text-[#F1F5F9] transition-all cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                    aria-expanded={profileMenuOpen}
                                    aria-label="User account menu"
                                >
                                    {userData?.name ? (
                                        userData.name.charAt(0).toUpperCase()
                                    ) : (
                                        <UserIcon size={15} className="text-[#94A3B8]" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="absolute right-0 mt-2 w-60 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-2 z-50 backdrop-blur-xl"
                                        >
                                            {/* User Info Header */}
                                            <div className="px-3 py-2 border-b border-[#1E2B45] mb-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-[#F1F5F9] truncate">
                                                        {userData?.name || "Candidate"}
                                                    </p>
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
                                                        {userData?.currentPlan ? `${userData.currentPlan} Plan` : "Free Plan"}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-[#64748B] truncate font-mono mt-0.5">
                                                    {userData?.email || ""}
                                                </p>
                                            </div>

                                            {/* Links */}
                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleNavigate("/admin")}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#93C5FD] hover:text-[#F1F5F9] hover:bg-[#0D1E3A] rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                                >
                                                    <Shield size={14} className="text-[#3B82F6]" />
                                                    <span className="font-semibold">Admin Console</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleNavigate("/progress")}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                            >
                                                <TrendingUp size={14} className="text-[#38BDF8]" />
                                                <span>Progress Dashboard</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleNavigate("/history")}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                            >
                                                <Clock size={14} className="text-[#38BDF8]" />
                                                <span>Activity History</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleNavigate("/pricing")}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                            >
                                                <CreditCard size={14} className="text-[#38BDF8]" />
                                                <span>Billing & Plans</span>
                                            </button>

                                            <div className="my-1 border-t border-[#1E2B45]" />

                                            {/* Logout */}
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#280B0B] hover:text-[#F87171] rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                                            >
                                                <LogOut size={14} />
                                                <span>Sign Out</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/auth")}
                                className="text-xs"
                            >
                                Login
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                rightIcon={ArrowRight}
                                onClick={() => navigate("/auth")}
                                className="text-xs shadow-md shadow-[#2563EB]/25"
                            >
                                Get Started
                            </Button>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle Button (lg:hidden) */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F] border border-[#1E2B45] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileOpen}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {mobileOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <X size={18} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Menu size={18} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* ============================================================
                4. MOBILE DRAWER WITH ACCORDIONS & AUTH ZONE
                ============================================================ */}
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
                                {/* Products Accordion */}
                                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14]/60 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                                        className="w-full flex items-center justify-between p-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-left"
                                        aria-expanded={mobileProductsOpen}
                                    >
                                        <span className="font-mono">Products</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                mobileProductsOpen ? "rotate-180 text-[#38BDF8]" : ""
                                            }`}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {mobileProductsOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="border-t border-[#1E2B45] px-2 py-2 space-y-1"
                                            >
                                                {productItems.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.name}
                                                            type="button"
                                                            onClick={() => handleNavigate(item.path)}
                                                            className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-[#141B2D] transition-colors group"
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

                                {/* Use Cases Accordion */}
                                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14]/60 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setMobileUseCasesOpen(!mobileUseCasesOpen)}
                                        className="w-full flex items-center justify-between p-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-left"
                                        aria-expanded={mobileUseCasesOpen}
                                    >
                                        <span className="font-mono">Use Cases</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                mobileUseCasesOpen ? "rotate-180 text-[#38BDF8]" : ""
                                            }`}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {mobileUseCasesOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="border-t border-[#1E2B45] px-2 py-2 space-y-1"
                                            >
                                                {useCaseItems.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.name}
                                                            type="button"
                                                            onClick={() => handleNavigate(item.path)}
                                                            className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-[#141B2D] transition-colors group"
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

                                {/* Resources Accordion */}
                                <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14]/60 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileResourcesOpen(!mobileResourcesOpen)
                                        }
                                        className="w-full flex items-center justify-between p-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-left"
                                        aria-expanded={mobileResourcesOpen}
                                    >
                                        <span className="font-mono">Resources</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                mobileResourcesOpen ? "rotate-180 text-[#38BDF8]" : ""
                                            }`}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {mobileResourcesOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="border-t border-[#1E2B45] px-2 py-2 space-y-1"
                                            >
                                                {resourceItems.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.name}
                                                            type="button"
                                                            onClick={() => handleNavigate(item.path)}
                                                            className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-[#141B2D] transition-colors group"
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
                            </div>

                            {/* Drawer Footer (Auth Zone) */}
                            <div className="p-4 border-t border-[#1E2B45] bg-[#0A0D14] shrink-0 space-y-3">
                                {userData ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#2D3E63] flex items-center justify-center text-xs font-semibold text-[#F1F5F9] shrink-0">
                                                    {userData?.name
                                                        ? userData.name.charAt(0).toUpperCase()
                                                        : "C"}
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
                                                    {userData?.currentPlan ? `${userData.currentPlan} Plan` : "Free Plan"}
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
        </motion.header>
    );
}

export default Navbar;