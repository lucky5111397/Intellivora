import React from "react";

export function Tabs({ tabs, activeTab, onChange, className = "" }) {
    return (
        <div
            role="tablist"
            className={`inline-flex items-center gap-1 p-1 bg-[#0A0D14] border border-[#161F33] rounded-lg ${className}`}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(tab.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                            isActive
                                ? "bg-[#141B2D] text-[#F1F5F9] border border-[#2D3E63] shadow-sm"
                                : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0E131F]/60 border border-transparent"
                        }`}
                    >
                        {Icon && <Icon size={15} className="shrink-0" />}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span
                                className={`text-[11px] px-1.5 py-0.2 rounded-full tabular-nums ${
                                    isActive
                                        ? "bg-[#2563EB]/20 text-[#93C5FD]"
                                        : "bg-[#161F33] text-[#64748B]"
                                }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default Tabs;

