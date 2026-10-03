import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, Coins, LogOut, User as UserIcon, History, TrendingUp, Shield } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import logoDark from "../../assets/logo-dark.png";
import { Button } from "../ui";
import { setUserData } from "../../redux/userSlice";
import { apiClient } from "../../services/apiClient.js";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";

export function Navbar() {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const shouldReduceMotion = useReducedMotion();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const openTimeoutRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    useEffect(() => {
        setActiveDropdown(null);
        setMobileOpen(false);
        setProfileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") setProfileMenuOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    }, []);

    const handleDropdownEnter = (sectionKey) => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        openTimeoutRef.current = setTimeout(() => setActiveDropdown(sectionKey), 100);
    };

    const handleDropdownLeave = () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 120);
    };

    const handleNavigate = (path) => {
        setActiveDropdown(null);
        setMobileOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            await apiClient.get("/auth/logout");
            dispatch(setUserData(null));
            toast.success("Successfully logged out");
            handleNavigate("/auth");
        } catch {
            toast.error("Logout failed. Please try again.");
        }
    };

    const isAdmin = Boolean(
        userData?.email &&
        import.meta.env.VITE_ADMIN_EMAIL &&
        userData.email.trim().toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.trim().toLowerCase()
    );
    const credits = userData?.credits ?? 0;
    const profileInitial = (() => {
        const email = typeof userData?.email === "string" ? userData.email.trim() : "";
        const firstLetter = email.match(/[A-Za-z]/)?.[0];
        return firstLetter ? firstLetter.toUpperCase() : "U";
    })();
    const isPricingActive = location.pathname === "/pricing";
    const dropdownVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -8 },
        visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0.05 : 0.16 } },
        exit: { opacity: 0, y: shouldReduceMotion ? 0 : -8, transition: { duration: shouldReduceMotion ? 0.05 : 0.12 } },
    };

    return (
        <motion.header
            className="sticky top-0 z-40 w-full border-b border-[#1E2B45]/70 bg-[#06080B]/90 backdrop-blur-xl"
            initial={false}
            animate={{ borderColor: location.pathname === "/" ? "rgba(30,43,69,.7)" : "#1E2B45" }}
        >
            <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-2.5 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]" aria-label="Intellivora Home">
                    <img src={logoDark} alt="Intellivora Logo" className="h-7 w-7 object-contain" />
                    <span className="font-bold text-lg tracking-tight text-[#F1F5F9]">Intellivora</span>
                </Link>

                <DesktopNav
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    handleDropdownEnter={handleDropdownEnter}
                    handleDropdownLeave={handleDropdownLeave}
                    dropdownVariants={dropdownVariants}
                />

                <div className="flex items-center gap-2">
                    {userData ? (
                        <div className="hidden lg:flex items-center gap-2">
                            <Link to="/credits" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#93C5FD] bg-[#0D1E3A] border border-[#2563EB]/40" aria-label="Credits">
                                <Coins size={14} /> {credits}
                            </Link>
                            <div className="relative" ref={profileRef}>
                                <button
                                    type="button"
                                    onClick={() => setProfileMenuOpen((open) => !open)}
                                    className="w-8 h-8 rounded-full bg-[#141B2D] border border-[#2D3E63] hover:bg-[#1B2740] hover:border-[#3B82F6] hover:ring-2 hover:ring-[#2563EB]/20 flex items-center justify-center text-xs font-semibold text-[#F1F5F9] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                                    aria-label="Open profile menu"
                                    aria-expanded={profileMenuOpen}
                                    aria-haspopup="menu"
                                >
                                    {profileInitial}
                                </button>
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            className="absolute right-0 mt-2 w-48 rounded-xl border border-[#1E2B45] bg-[#0E131F] p-2 shadow-2xl shadow-black/70 z-50"
                                            role="menu"
                                        >
                                            <Link to="/profile" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#94A3B8] hover:bg-[#141B2D] hover:text-[#F1F5F9]">
                                                <UserIcon size={14} /> Profile
                                            </Link>
                                            <Link to="/progress" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#94A3B8] hover:bg-[#141B2D] hover:text-[#F1F5F9]">
                                                <TrendingUp size={14} /> Progress
                                            </Link>
                                            <Link to="/history" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#94A3B8] hover:bg-[#141B2D] hover:text-[#F1F5F9]">
                                                <History size={14} /> History
                                            </Link>
                                            {isAdmin && (
                                                <button type="button" role="menuitem" onClick={() => handleNavigate("/admin")} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-[#93C5FD] hover:bg-[#0D1E3A] hover:text-[#F1F5F9]">
                                                    <Shield size={14} /> Admin
                                                </button>
                                            )}
                                            <div className="my-1 border-t border-[#1E2B45]" />
                                            <button type="button" role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-[#EF4444] hover:bg-[#280B0B] hover:text-[#F87171]">
                                                <LogOut size={14} /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleNavigate("/auth")}>Login</Button>
                            <Button variant="primary" size="sm" onClick={() => handleNavigate("/auth")}>Get Started</Button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F] border border-[#1E2B45]"
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            <MobileDrawer
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                userData={userData}
                isAdmin={isAdmin}
                credits={credits}
                profileInitial={profileInitial}
                handleNavigate={handleNavigate}
                handleLogout={handleLogout}
                shouldReduceMotion={shouldReduceMotion}
                isPricingActive={isPricingActive}
            />
        </motion.header>
    );
}

export default Navbar;
