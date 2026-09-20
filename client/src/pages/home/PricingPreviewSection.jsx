import React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Button, Badge } from "@/components/ui";
import { PRICING_PLANS } from "@/config/pricingPlans";

export function PricingPreviewSection({ onSelectPlan }) {
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.08,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <section id="pricing" className="w-full py-20 sm:py-28 border-t border-[#161F33] bg-[#06080B] relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-[#2563EB]/5 blur-[160px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <Badge variant="brand" size="md" className="mb-4">
                        Transparent Credit Economy
                    </Badge>
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F5F9] mb-5 font-sans">
                        Pay Only for What You Rehearse.
                    </h2>
                    <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
                        No recurring monthly subscriptions. Buy flexible credit packs that never expire and deploy them across interviews, aptitude, ATS audits, or GD simulations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING_PLANS.map((plan, index) => {
                        const isPro = plan.id === "pro";
                        return (
                            <motion.div
                                key={plan.id}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative shadow-xl ${
                                    isPro
                                        ? "bg-[#0E131F] border-2 border-[#2563EB] shadow-2xl shadow-[#2563EB]/15 ring-1 ring-[#38BDF8]/40"
                                        : "bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2D3E63] hover:bg-[#0E131F] shadow-black/60"
                                }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge variant="brand" size="sm" className="shadow-md">
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-[#F1F5F9]">{plan.name}</h3>
                                        <span className="text-xs font-mono text-[#38BDF8] bg-[#052028] px-2.5 py-1 rounded-md border border-[#0E7490]/50 font-bold tabular-nums">
                                            {plan.credits} Credits
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#94A3B8] mb-6 min-h-[36px] leading-relaxed">{plan.description}</p>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl sm:text-5xl font-extrabold text-[#F1F5F9] font-mono tabular-nums tracking-tight">
                                            {plan.price}
                                        </span>
                                        <span className="text-xs text-[#94A3B8] font-medium">one-time</span>
                                    </div>

                                    <div className="space-y-3.5 pt-6 border-t border-[#161F33] mb-8">
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#94A3B8]">
                                                <Check size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant={isPro ? "primary" : "secondary"}
                                    size="md"
                                    className={`w-full ${isPro ? "shadow-lg shadow-[#2563EB]/25" : ""}`}
                                    onClick={() => onSelectPlan(plan)}
                                >
                                    {plan.ctaText}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default PricingPreviewSection;
