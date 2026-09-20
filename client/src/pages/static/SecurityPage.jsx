import React from "react";
import { Lock, KeyRound, Server, ShieldCheck } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Lock size={13} />
                        <span>System Architecture & Safety</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Security Overview
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        An overview of how user data, authentication, and communication streams are secured.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                            <KeyRound size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            Authentication & Credentials
                        </h2>
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                            User identity is managed via Google Firebase Authentication. Password hashes and OAuth tokens are handled using industry-standard infrastructure; passwords never touch our custom backend database in plaintext.
                        </p>
                    </div>

                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                            <Server size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            Data Transmission
                        </h2>
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                            All API interactions, speech analysis requests, and evaluation scorecards are transmitted via HTTPS / TLS encryption. Sensitive cookies use HttpOnly and SameSite flags to mitigate CSRF and XSS threats.
                        </p>
                    </div>

                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            Payment Safety
                        </h2>
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                            Payment orders and signature verifications are processed via Razorpay's PCI-DSS compliant checkout SDK. No payment card details are stored or logged on our servers.
                        </p>
                    </div>

                    <div className="bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0E131F] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                            <Lock size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            Ephemeral Media Streams
                        </h2>
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                            Camera and audio feeds in live interviews and group discussions are processed ephemerally for transcription and facial alignment telemetry without persistent recording storage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

