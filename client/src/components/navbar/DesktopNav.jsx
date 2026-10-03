import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { navSections, directNavLinks } from "../../config/navConfig";

export function DesktopNav({
    activeDropdown,
    setActiveDropdown,
    handleDropdownEnter,
    handleDropdownLeave,
    dropdownVariants,
}) {
    const location = useLocation();

    return (
        <nav
            className="hidden lg:flex items-center gap-1 bg-[#0A0D14]/80 border border-[#1E2B45]/80 rounded-xl px-2 py-1"
            aria-label="Primary Navigation"
        >
            {navSections.map((section) => {
                const isSectionActive = section.items.some(
                    (i) =>
                        i.path &&
                        (location.pathname === i.path ||
                            location.pathname.startsWith(i.path + "/"))
                );

                return (
                    <div
                        key={section.key}
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter(section.key)}
                        onMouseLeave={handleDropdownLeave}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveDropdown(
                                    activeDropdown === section.key
                                        ? null
                                        : section.key
                                )
                            }
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                                isSectionActive || activeDropdown === section.key
                                    ? "text-[#F1F5F9] bg-[#141B2D]"
                                    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                            }`}
                            aria-expanded={activeDropdown === section.key}
                            aria-haspopup="true"
                        >
                            <span>{section.name}</span>
                            <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${
                                    activeDropdown === section.key
                                        ? "rotate-180 text-[#38BDF8]"
                                        : ""
                                }`}
                            />
                            {isSectionActive && (
                                <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                            )}
                        </button>

                        <AnimatePresence>
                            {activeDropdown === section.key && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="absolute left-0 mt-2 w-80 bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/70 p-2 z-50 backdrop-blur-xl"
                                >
                                    <div className="space-y-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;

                                            if (item.disabled) {
                                                return (
                                                    <div
                                                        key={item.name}
                                                        className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent opacity-50 cursor-not-allowed select-none text-left"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[#06080B] border border-[#1E2B45] flex items-center justify-center text-[#64748B] shrink-0 mt-0.5">
                                                            <Icon size={16} />
                                                        </div>
                                                        <div className="space-y-0.5 min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-xs font-semibold text-[#94A3B8]">
                                                                    {item.name}
                                                                </p>
                                                                <span className="text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded bg-[#141B2D] border border-[#1E2B45] text-[#64748B]">
                                                                    SOON
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const isItemActive =
                                                location.pathname === item.path ||
                                                location.pathname.startsWith(
                                                    item.path + "/"
                                                );

                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() =>
                                                        setActiveDropdown(null)
                                                    }
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
                );
            })}

            {directNavLinks.map((link) => {
                const isLinkActive = location.pathname === link.path;
                return (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                            isLinkActive
                                ? "text-[#F1F5F9] bg-[#141B2D]"
                                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]"
                        }`}
                    >
                        <span>{link.name}</span>
                        {isLinkActive && (
                            <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#2563EB] rounded-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

export default DesktopNav;
