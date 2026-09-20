import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Brain,
  BookOpen,
  MessageSquare,
  FileText,
  IndianRupee,
  Mail,
} from "lucide-react";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/interviews", label: "Interviews", icon: Brain },
  { path: "/admin/aptitude", label: "Aptitude", icon: BookOpen },
  { path: "/admin/gd", label: "Group Discussion", icon: MessageSquare },
  { path: "/admin/resume", label: "ATS Resume", icon: FileText },
  { path: "/admin/payments", label: "Payments", icon: IndianRupee },
  { path: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminNav() {
  return (
    <div className="w-full border-b border-[#1E2B45] bg-[#0A0D14]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex items-center space-x-1 overflow-x-auto py-2.5 no-scrollbar scroll-smooth"
          aria-label="Admin Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 select-none ${
                    isActive
                      ? "bg-[#0D1E3A] text-[#38BDF8] border border-[#2563EB]/40 shadow-sm font-semibold"
                      : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F] border border-transparent"
                  }`
                }
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

