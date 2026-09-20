import React from "react";
import { Terminal, ArrowRight, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui";

export function CTASection({ onStart, onExplore }) {
    return (
        <section className="w-full bg-[#06080B] py-24 sm:py-32 border-t border-[#161F33] relative overflow-hidden">
            {/* Atmospheric Gradient Flare */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D1E3A]/25 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#2563EB]/10 blur-[130px] pointer-events-none rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center flex flex-col items-center z-10"
            >
                <div className="w-14 h-14 rounded-2xl bg-[#0D1E3A] border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8] mb-8 shadow-lg shadow-[#2563EB]/15">
                    <Terminal size={24} />
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#F1F5F9] tracking-tight mb-6 leading-tight font-sans">
                    Prepare With Purpose. <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F1F5F9] via-[#93C5FD] to-[#38BDF8]">
                        Perform With Confidence.
                    </span>
                </h2>
                <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mb-10 leading-relaxed font-normal">
                    Join ambitious career seekers practicing technical interviews, timed aptitude, ATS resume optimization, and multi-agent group discussions in one unified workspace.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                    <Button
                        variant="primary"
                        size="lg"
                        rightIcon={ArrowRight}
                        onClick={() => onStart("/interview")}
                        className="shadow-xl shadow-[#2563EB]/25"
                    >
                        Start Practicing Now
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        leftIcon={SlidersHorizontal}
                        onClick={onExplore}
                    >
                        Browse Modules & Syllabi
                    </Button>
                </div>
                <p className="text-xs text-[#94A3B8] max-w-xl">
                    INTELLIVORA provides simulated preparation tools and evaluations; it does not guarantee placement or employment.
                </p>
            </motion.div>
        </section>
    );
}

export default CTASection;
