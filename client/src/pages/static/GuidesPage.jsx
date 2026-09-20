import React from "react";
import { Compass } from "lucide-react";
import { EmptyState, BackButton } from "@/components/ui";

export default function GuidesPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Compass size={13} />
                        <span>Curriculum & Prep</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Interview Guides & Roadmaps
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Structured learning pathways and role-specific preparation playbooks.
                    </p>
                </div>

                <EmptyState
                    icon={Compass}
                    title="Interview Guides In Preparation"
                    description="Our curriculum team is developing comprehensive preparation roadmaps for Frontend, Backend, Full Stack, SRE, and Engineering Manager roles."
                    actionLabel="View FAQs"
                    onAction={() => window.location.href = "/faqs"}
                />
            </div>
        </div>
    );
}

