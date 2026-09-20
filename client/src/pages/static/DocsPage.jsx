import React from "react";
import { Code2 } from "lucide-react";
import { EmptyState, BackButton } from "@/components/ui";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Code2 size={13} />
                        <span>Platform Documentation</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Documentation & API Reference
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Developer guides, scoring rubrics, and technical specifications for Intellivora simulations.
                    </p>
                </div>

                <EmptyState
                    icon={Code2}
                    title="Documentation In Progress"
                    description="Comprehensive documentation on our speech synthesis pipeline, multi-agent GD orchestrator, and ATS parsing algorithms is currently being compiled."
                    actionLabel="View FAQs"
                    onAction={() => window.location.href = "/faqs"}
                />
            </div>
        </div>
    );
}

