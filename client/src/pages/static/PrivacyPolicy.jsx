import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { BackButton } from "@/components/ui";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Shield size={13} />
                        <span>Data Protection & Privacy</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                </div>

                <div className="space-y-8 text-sm text-[#94A3B8] leading-relaxed">
                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            1. Information We Collect
                        </h2>
                        <p>
                            Intellivora collects information required to provide adaptive AI mock interviews, timed aptitude assessments, multi-agent group discussions, and ATS resume audits:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#94A3B8]">
                            <li><strong>Account Data:</strong> Name, email address, and authentication credentials managed securely via Firebase Authentication.</li>
                            <li><strong>Evaluation Telemetry:</strong> Audio responses, webcam diagnostic states (processed locally during active sessions), and assessment transcripts.</li>
                            <li><strong>Resume Content:</strong> Text extracted from uploaded resumes strictly for scoring against target job descriptions.</li>
                            <li><strong>Credit & Payment Records:</strong> Transaction IDs and plan allocations processed securely via Razorpay. We do not store credit card numbers.</li>
                        </ul>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            2. How We Use Your Information
                        </h2>
                        <p>
                            Collected data is utilized exclusively to generate real-time feedback, calculate scoring rubrics, analyze ATS match percentages, and maintain your assessment history. We do not sell your personal data or session recordings to third parties.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            3. Media & Microphone Access
                        </h2>
                        <p>
                            During mock interview and group discussion sessions, browser permissions for microphone and camera are requested. Audio streams are processed using the Web Speech API and backend speech models solely for the duration of the interview session.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            4. Cookies & Local Storage
                        </h2>
                        <p>
                            We use essential session cookies and local storage to keep you authenticated, preserve active assessment progress, and retain user interface preferences.
                        </p>
                    </section>

                    <section className="space-y-3 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6">
                        <h2 className="text-base font-semibold text-[#F1F5F9]">
                            5. Contact & Data Requests
                        </h2>
                        <p>
                            For inquiries regarding your personal data, account deletion, or privacy practices, reach out to our team through our{" "}
                            <Link to="/contact" className="text-[#38BDF8] hover:underline">
                                Contact page
                            </Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

