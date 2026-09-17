import React from "react";
import { Link } from "react-router-dom";
import logoDark from "../assets/logo-dark.png";
import {
    FaGithub,
    FaLinkedin,
    FaEnvelope,
} from "react-icons/fa";

function Footer() {
    return (
        <footer className="w-full bg-[#05070a] border-t border-[#151d25] pt-14 pb-10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand & Platform Metadata */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3.5">
                            <img
                                src={logoDark}
                                alt="INTELLIVORA"
                                className="h-7 w-7 object-contain"
                            />
                            <span className="font-semibold text-lg tracking-tight text-[#f1f5f9] font-['Geist',sans-serif]">
                                INTELLIVORA
                            </span>
                        </div>
                        <p className="text-xs text-[#a7b0ba] mb-4 leading-relaxed max-w-xs">
                            Multi-stage recruitment simulation and evaluation platform engineered for technical and executive career acceleration.
                        </p>
                        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#adc6ff] bg-[#0b1b33] border border-[#2563eb]/30 px-2.5 py-1 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                            <span>SYS.VER: 4.2.0-PROD</span>
                        </div>
                    </div>

                    {/* Platform Modules */}
                    <div>
                        <h4 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4 font-['Geist',sans-serif]">
                            Platform Modules
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#a7b0ba]">
                            <li>
                                <Link to="/interview" className="hover:text-[#f1f5f9] transition-colors">
                                    AI Mock Interviews
                                </Link>
                            </li>
                            <li>
                                <Link to="/aptitude" className="hover:text-[#f1f5f9] transition-colors">
                                    Timed Aptitude Assessments
                                </Link>
                            </li>
                            <li>
                                <Link to="/resume" className="hover:text-[#f1f5f9] transition-colors">
                                    ATS Resume Analyzer
                                </Link>
                            </li>
                            <li>
                                <Link to="/gd" className="hover:text-[#f1f5f9] transition-colors">
                                    AI Group Discussion Simulator
                                </Link>
                            </li>
                            <li>
                                <Link to="/history" className="hover:text-[#f1f5f9] transition-colors">
                                    History & Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources & Pricing */}
                    <div>
                        <h4 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4 font-['Geist',sans-serif]">
                            Resources & Plans
                        </h4>
                        <ul className="space-y-2.5 text-xs text-[#a7b0ba]">
                            <li>
                                <Link to="/pricing" className="hover:text-[#f1f5f9] transition-colors">
                                    Credit System & Plans
                                </Link>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-[#f1f5f9] transition-colors">
                                    Preparation Methodology
                                </a>
                            </li>
                            <li>
                                <a href="#modules" className="hover:text-[#f1f5f9] transition-colors">
                                    Evaluation Rubrics
                                </a>
                            </li>
                            <li>
                                <Link to="/pricing" className="hover:text-[#f1f5f9] transition-colors">
                                    Pricing FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community & Legal */}
                    <div>
                        <h4 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider mb-4 font-['Geist',sans-serif]">
                            Community & Legal
                        </h4>
                        <div className="flex gap-2.5 mb-4">
                            <a
                                href="https://github.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-[#202a34] bg-[#0a0f14] p-2 text-[#a7b0ba] hover:border-[#2563eb] hover:text-[#f1f5f9] transition-all"
                                aria-label="GitHub"
                            >
                                <FaGithub size={15} />
                            </a>
                            <a
                                href="https://linkedin.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-[#202a34] bg-[#0a0f14] p-2 text-[#a7b0ba] hover:border-[#2563eb] hover:text-[#f1f5f9] transition-all"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin size={15} />
                            </a>
                            <a
                                href="mailto:contact@intellivora.ai"
                                className="rounded-lg border border-[#202a34] bg-[#0a0f14] p-2 text-[#a7b0ba] hover:border-[#2563eb] hover:text-[#f1f5f9] transition-all"
                                aria-label="Email"
                            >
                                <FaEnvelope size={15} />
                            </a>
                        </div>
                        <p className="text-[11px] text-[#69737d] leading-relaxed">
                            Enterprise-grade mock interviews, quantitative logic diagnostics, ATS keyword audit, and multi-agent GD rehearsal.
                        </p>
                    </div>
                </div>

                {/* Bottom Disclaimer */}
                <div className="pt-6 border-t border-[#151d25] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#69737d]">
                    <p className="text-center sm:text-left">
                        INTELLIVORA provides simulated preparation tools and evaluations. It does not guarantee placement or employment.
                    </p>
                    <p className="shrink-0">
                        © {new Date().getFullYear()} INTELLIVORA Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;