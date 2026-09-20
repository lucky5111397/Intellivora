import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Button, Input, BackButton } from "@/components/ui";
import { toast } from "sonner";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Your name is required.";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!formData.message.trim()) {
            newErrors.message = "Message is required.";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            toast.success("Message received! Our team will get back to you shortly.");
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#06080B] text-[#F1F5F9] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <BackButton to="/" fallback="/" />
                </div>

                <div className="space-y-3 pb-6 border-b border-[#1E2B45]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                        <Mail size={13} />
                        <span>Support & Feedback</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9]">
                        Get in Touch
                    </h1>
                    <p className="text-sm text-[#94A3B8]">
                        Have a question about credits, technical issues, or feedback on our simulations? Let us know.
                    </p>
                </div>

                {submitted ? (
                    <div className="p-8 rounded-xl bg-[#0A0D14] border border-[#1E2B45] text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-[#0D2818] border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-[#F1F5F9]">Message Sent</h2>
                        <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
                            Thank you for reaching out, {formData.name}. We've received your message and will review it promptly.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); setErrors({}); }}>
                            Send Another Message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-5 bg-[#0A0D14] border border-[#1E2B45] rounded-xl p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Your Name *"
                                placeholder="Jane Doe"
                                value={formData.name}
                                error={errors.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                }}
                            />
                            <Input
                                label="Email Address *"
                                type="email"
                                placeholder="jane@example.com"
                                value={formData.email}
                                error={errors.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: undefined });
                                }}
                            />
                        </div>

                        <Input
                            label="Subject"
                            placeholder="e.g. Question regarding interview telemetry"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />

                        <div className="space-y-1.5">
                            <label htmlFor="contact-message" className="text-xs font-medium text-[#94A3B8] tracking-wide">
                                Message *
                            </label>
                            <textarea
                                id="contact-message"
                                rows={4}
                                placeholder="Describe your question or feedback..."
                                value={formData.message}
                                onChange={(e) => {
                                    setFormData({ ...formData, message: e.target.value });
                                    if (errors.message) setErrors({ ...errors, message: undefined });
                                }}
                                className={`w-full px-3 py-2.5 rounded-lg bg-[#0E131F] border ${
                                    errors.message ? "border-[#EF4444] focus:border-[#EF4444]" : "border-[#1E2B45] focus:border-[#2563EB]"
                                } text-sm text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none transition-colors`}
                            />
                            {errors.message && (
                                <p className="text-xs text-[#F87171] leading-none mt-0.5">{errors.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            rightIcon={Send}
                            className="w-full sm:w-auto"
                        >
                            Submit Inquiry
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

