import React from "react";
import { Briefcase } from "lucide-react";
import { EmptyState, BackButton } from "@/components/ui";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Briefcase size={13} />
                        <span>Opportunities</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Careers at Intellivora
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        We're currently building and refining our core platform.
                    </p>
                </div>

                <EmptyState
                    icon={Briefcase}
                    title="No Open Positions Right Now"
                    description="Intellivora is an educational and engineering project. We are not actively hiring at this moment, but check back as the platform evolves."
                    actionLabel="Explore Platform"
                    onAction={() => window.location.href = "/"}
                />
            </div>
        </div>
    );
}

