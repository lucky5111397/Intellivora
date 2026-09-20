import React from "react";
import { Newspaper } from "lucide-react";
import { EmptyState, BackButton } from "@/components/ui";

export default function PressPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Newspaper size={13} />
                        <span>Media & News</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Press & Media Kit
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Press releases, product announcements, and brand assets for Intellivora.
                    </p>
                </div>

                <EmptyState
                    icon={Newspaper}
                    title="Press Coverage Coming Soon"
                    description="Product announcements, case studies, and brand media kits will be published here."
                    actionLabel="Return Home"
                    onAction={() => window.location.href = "/"}
                />
            </div>
        </div>
    );
}

