import React from "react";
import { BookOpen } from "lucide-react";
import { EmptyState, BackButton } from "@/components/ui";

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <BookOpen size={13} />
                        <span>Engineering & Insights</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Intellivora Blog
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Technical articles, algorithmic teardowns, and modern career prep strategies.
                    </p>
                </div>

                <EmptyState
                    icon={BookOpen}
                    title="Blog Posts Coming Soon"
                    description="Our team is preparing in-depth guides on AI voice prompting, quantitative aptitude mastery, and system design interview patterns."
                    actionLabel="Return Home"
                    onAction={() => window.location.href = "/"}
                />
            </div>
        </div>
    );
}

