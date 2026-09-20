import React from "react";
import { Cookie } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Cookie size={13} />
                        <span>Storage & Tracking</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Cookie Policy
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                </div>

                <div className="space-y-8 text-sm text-[#94A3B8] leading-relaxed">
                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            1. What Are Cookies?
                        </h2>
                        <p>
                            Cookies and browser storage mechanisms (such as localStorage) are small text files stored on your device that enable our application to recognize your session and persist critical assessment states.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            2. Cookies We Use
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#94A3B8]">
                            <li><strong>Essential Authentication Cookies:</strong> HttpOnly session tokens verified via our backend to securely validate your identity.</li>
                            <li><strong>Session State Storage:</strong> Browser localStorage is used to persist active timed aptitude test IDs, allowing you to resume if accidentally disconnected.</li>
                            <li><strong>Preferences:</strong> Used to remember your chosen theme, volume settings, and fullscreen states.</li>
                        </ul>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            3. Managing Cookies
                        </h2>
                        <p>
                            You can modify your browser settings to reject cookies; however, disabling essential session cookies will prevent login and access to proctored assessments.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

