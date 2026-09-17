import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import logoDark from "../assets/logo-dark.png";
import { toast } from "sonner";
import {
    Coins,
    LogOut,
    User,
    Menu,
    X,
    Clock,
    Sparkles,
    ArrowRight,
} from "lucide-react";

function Navbar() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close popups on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowCreditPopup(false);
                setShowUserPopup(false);
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setShowCreditPopup(false);
        setShowUserPopup(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", {
                withCredentials: true,
            });

            dispatch(setUserData(null));
            setShowCreditPopup(false);
            setShowUserPopup(false);
            setMobileMenuOpen(false);

            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error?.message || error);
            toast.error("Failed to logout. Please try again.");
        }
    };

    const handleSectionOrRoute = (target) => {
        if (target.startsWith("#")) {
            if (location.pathname === "/") {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                navigate("/" + target);
            }
        } else {
            const protectedRoutes = ["/interview", "/aptitude", "/resume", "/gd", "/history"];
            if (!userData && protectedRoutes.some((route) => target === route || target.startsWith(route + "/"))) {
                navigate("/auth", { state: { from: { pathname: target } } });
            } else {
                navigate(target);
            }
        }
        setMobileMenuOpen(false);
    };

    const navItems = [
        { name: "Features", path: "#modules", isHash: true },
        { name: "How It Works", path: "#how-it-works", isHash: true },
        { name: "Mock Interview", path: "/interview" },
        { name: "Aptitude Tests", path: "/aptitude" },
        { name: "Resume ATS", path: "/resume" },
        { name: "Group Discussion", path: "/gd" },
        { name: "Pricing & Credits", path: "/pricing" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-[#05070a]/90 backdrop-blur-xl border-b border-[#151d25] transition-colors">
            {/* Backdrop dismissal for popups */}
            {(showCreditPopup || showUserPopup) && (
                <div
                    className="fixed inset-0 z-[99990]"
                    onClick={() => {
                        setShowCreditPopup(false);
                        setShowUserPopup(false);
                    }}
                    aria-hidden="true"
                />
            )}

            <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <div
                    onClick={() => handleSectionOrRoute("/")}
                    className="flex items-center gap-2.5 cursor-pointer select-none group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSectionOrRoute("/")}
                    aria-label="Intellivora Home"
                >
                    <img
                        src={logoDark}
                        alt="INTELLIVORA Logo"
                        className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="font-semibold text-base sm:text-lg tracking-tight text-[#f1f5f9] font-['Geist',sans-serif]">
                        INTELLIVORA
                    </span>
                </div>

                {/* Desktop Navigation Links */}
                <nav
                    className="hidden xl:flex items-center gap-1 bg-[#0a0f14]/80 border border-[#202a34] rounded-lg p-1"
                    aria-label="Main navigation"
                >
                    {navItems.map((item) => {
                        const isActive =
                            !item.isHash &&
                            (location.pathname === item.path ||
                                (item.path !== "/" && location.pathname.startsWith(item.path + "/")));

                        return (
                            <button
                                key={item.name}
                                onClick={() => handleSectionOrRoute(item.path)}
                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? "bg-[#17212b] text-[#f1f5f9] border border-[#2a3540] shadow-sm"
                                        : "text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923]"
                                }`}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* If Authenticated: Show Credits & Profile Avatar */}
                    {userData ? (
                        <>
                            {/* Credit Button & Popup */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowCreditPopup(!showCreditPopup);
                                        setShowUserPopup(false);
                                    }}
                                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0b1b33] border border-[#2563eb]/40 text-[#adc6ff] hover:border-[#2563eb] hover:bg-[#0b1b33]/80 transition-all text-xs font-semibold cursor-pointer"
                                    aria-expanded={showCreditPopup}
                                    aria-label="View user credits"
                                >
                                    <Coins size={14} className="text-[#3b82f6]" />
                                    <span className="font-semibold text-[#f1f5f9] font-mono">
                                        {userData?.credits ?? 0}
                                    </span>
                                    <span className="hidden sm:inline text-[#a7b0ba]">Credits</span>
                                </button>

                                {showCreditPopup && (
                                    <div className="absolute top-12 right-0 w-72 rounded-xl bg-[#17212b] border border-[#2a3540] shadow-2xl p-4 z-[99999] animate-in fade-in zoom-in-95 duration-150">
                                        <div className="pb-3 border-b border-[#202a34] mb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium uppercase tracking-wider text-[#a7b0ba]">
                                                    Credit Balance
                                                </span>
                                                <span className="font-mono text-sm font-bold text-[#3b82f6]">
                                                    {userData?.credits ?? 0}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#a7b0ba] mt-1.5 leading-relaxed">
                                                Credits unlock realistic voice interviews, proctored tests, and ATS deep scans.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowCreditPopup(false);
                                                navigate("/pricing");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] py-2 text-xs font-semibold text-[#f1f5f9] transition-all cursor-pointer shadow-sm"
                                        >
                                            <span>Buy More Credits</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Avatar & Popup */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowUserPopup(!showUserPopup);
                                        setShowCreditPopup(false);
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold border border-[#3b82f6]/50 hover:ring-2 hover:ring-[#3b82f6]/40 transition-all cursor-pointer"
                                    aria-expanded={showUserPopup}
                                    aria-label="User menu"
                                >
                                    {userData?.name ? (
                                        userData.name.slice(0, 1).toUpperCase()
                                    ) : (
                                        <User size={15} />
                                    )}
                                </button>

                                {showUserPopup && (
                                    <div className="absolute top-12 right-0 w-64 rounded-xl bg-[#17212b] border border-[#2a3540] shadow-2xl p-3.5 z-[99999] animate-in fade-in zoom-in-95 duration-150">
                                        <div className="pb-3 border-b border-[#202a34] mb-2 px-1">
                                            <p className="text-sm font-semibold text-[#f1f5f9] truncate">
                                                {userData?.name || "User"}
                                            </p>
                                            <p className="text-xs text-[#a7b0ba] mt-0.5 truncate">
                                                {userData?.email || `${userData?.credits ?? 0} Credits Available`}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    setShowUserPopup(false);
                                                    navigate("/history");
                                                }}
                                                className="w-full flex items-center gap-2.5 text-left text-xs font-medium py-2 px-2.5 rounded-lg text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923] transition-colors cursor-pointer"
                                            >
                                                <Clock size={15} className="text-[#3b82f6]" />
                                                <span>Activity History</span>
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 text-left text-xs font-medium py-2 px-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            >
                                                <LogOut size={15} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* If Unauthenticated: Show Sign In and Start Practicing */
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/auth")}
                                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923] rounded-lg transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/auth", { state: { from: { pathname: "/interview" } } })}
                                className="inline-flex items-center justify-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#f1f5f9] text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                            >
                                <Sparkles size={13} />
                                <span>Start Practicing</span>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="xl:hidden p-2 rounded-lg bg-[#0a0f14] border border-[#202a34] text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923] transition-colors cursor-pointer"
                        aria-label="Toggle mobile menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Responsive Mobile / Tablet Drawer */}
            {mobileMenuOpen && (
                <div className="xl:hidden bg-[#0a0f14] border-b border-[#202a34] px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
                        {navItems.map((item) => {
                            const isActive =
                                !item.isHash &&
                                (location.pathname === item.path ||
                                    (item.path !== "/" && location.pathname.startsWith(item.path + "/")));

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleSectionOrRoute(item.path)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                        isActive
                                            ? "bg-[#17212b] text-[#f1f5f9] border border-[#2a3540]"
                                            : "text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923]"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Mobile User Controls */}
                    <div className="pt-3 border-t border-[#151d25] flex flex-col gap-2">
                        {userData ? (
                            <>
                                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111923] text-xs">
                                    <span className="text-[#a7b0ba]">Logged in as <strong className="text-[#f1f5f9]">{userData?.name}</strong></span>
                                    <span className="font-mono text-[#3b82f6] font-semibold">{userData?.credits ?? 0} Credits</span>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate("/history");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#a7b0ba] hover:text-[#f1f5f9] hover:bg-[#111923]"
                                >
                                    <Clock size={14} className="text-[#3b82f6]" />
                                    <span>Activity History</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10"
                                >
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    onClick={() => {
                                        navigate("/auth");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-2 text-center rounded-lg bg-[#17212b] text-xs font-medium text-[#f1f5f9] hover:bg-[#1b2631]"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        navigate("/auth", { state: { from: { pathname: "/interview" } } });
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-2 text-center rounded-lg bg-[#2563eb] text-xs font-semibold text-[#f1f5f9] hover:bg-[#1d4ed8]"
                                >
                                    Start Practicing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;