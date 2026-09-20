import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    CheckCircle2,
    XCircle,
    Sparkles,
    ArrowRight,
    RotateCcw,
    Send,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";

/**
 * SampleQuestionPreview Component
 * A 100% client-side, interactive sample question/topic preview widget.
 *
 * @param {Object} props
 * @param {"aptitude" | "interview" | "gd"} props.type - Widget interaction mode.
 * @param {string} props.role - Target role title (e.g. "Software Engineers").
 * @param {string} props.category - Domain category (e.g. "Technical Interview", "Data Interpretation").
 * @param {string} [props.difficulty="Medium"] - Calibrated difficulty badge.
 * @param {string} props.question - Question text or GD topic title.
 * @param {string} [props.focus] - Focus description or benchmark context.
 * @param {string[]} [props.options] - Multiple-choice options (for aptitude).
 * @param {number} [props.correctAnswer] - Zero-based index of correct option (for aptitude).
 * @param {string} [props.explanation] - Detailed explanation of solution (for aptitude).
 * @param {string} [props.placeholder] - Textarea placeholder for open-ended prompt.
 */
export function SampleQuestionPreview({
    type = "interview",
    role = "Candidates",
    category = "Assessment",
    difficulty = "Medium",
    question = "",
    focus = "",
    options = [],
    correctAnswer = 0,
    explanation = "",
    placeholder = "Type a brief outline of your response...",
}) {
    const navigate = useNavigate();
    const location = useLocation();

    // Aptitude state
    const [selectedOption, setSelectedOption] = useState(null);

    // Interview / GD state
    const [userResponse, setUserResponse] = useState("");
    const [hasSubmittedResponse, setHasSubmittedResponse] = useState(false);

    const handleOptionSelect = (index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
    };

    const handleResetAptitude = () => {
        setSelectedOption(null);
    };

    const handleSubmitResponse = (e) => {
        e.preventDefault();
        if (!userResponse.trim()) return;
        setHasSubmittedResponse(true);
    };

    const handleEditResponse = () => {
        setHasSubmittedResponse(false);
    };

    const handleSignUpRedirect = () => {
        navigate("/auth", { state: { from: { pathname: location.pathname } } });
    };

    const isAptitude = type === "aptitude";

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <Card variant="default" padding="lg" className="border-[#1E2B45] bg-[#0A0D14]">
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1E2B45]/80">
                    <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">
                            {category}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                            {difficulty}
                        </Badge>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141B2D] border border-[#1E2B45] text-[11px] font-medium text-[#94A3B8]">
                        <Sparkles size={12} className="text-[#38BDF8]" />
                        <span>Preview — sign up for full AI-powered analysis</span>
                    </div>
                </div>

                {/* Question / Prompt Body */}
                <div className="py-4 space-y-2">
                    <h4 className="text-base sm:text-lg font-semibold text-[#F1F5F9] leading-snug tracking-tight">
                        {question}
                    </h4>
                    {focus && (
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                            {focus}
                        </p>
                    )}
                </div>

                {/* Interactive Mode 1: Multiple-Choice Aptitude Question */}
                {isAptitude && options.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {options.map((option, idx) => {
                                const isSelected = selectedOption === idx;
                                const isCorrect = idx === correctAnswer;
                                const hasAnswered = selectedOption !== null;

                                let optionStyle =
                                    "bg-[#0E131F] border-[#1E2B45] text-[#94A3B8] hover:border-[#2563EB]/60 hover:bg-[#141B2D] hover:text-[#F1F5F9]";

                                if (hasAnswered) {
                                    if (isSelected && isCorrect) {
                                        optionStyle =
                                            "bg-[#052E16]/60 border-[#10B981] text-[#34D399] font-medium";
                                    } else if (isSelected && !isCorrect) {
                                        optionStyle =
                                            "bg-[#280B0B]/60 border-[#EF4444] text-[#F87171]";
                                    } else if (isCorrect) {
                                        optionStyle =
                                            "bg-[#052E16]/40 border-[#10B981]/60 text-[#34D399]";
                                    } else {
                                        optionStyle =
                                            "bg-[#0E131F]/50 border-[#1E2B45]/50 text-[#64748B] opacity-60";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={hasAnswered}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all duration-150 cursor-pointer disabled:cursor-default ${optionStyle}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-6 h-6 rounded-md bg-[#06080B] border border-[#1E2B45] flex items-center justify-center text-xs font-mono font-semibold shrink-0">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="truncate">{option}</span>
                                        </div>

                                        {hasAnswered && isSelected && (
                                            <div className="shrink-0 ml-2">
                                                {isCorrect ? (
                                                    <CheckCircle2 size={16} className="text-[#10B981]" />
                                                ) : (
                                                    <XCircle size={16} className="text-[#EF4444]" />
                                                )}
                                            </div>
                                        )}
                                        {hasAnswered && !isSelected && isCorrect && (
                                            <div className="shrink-0 ml-2">
                                                <CheckCircle2 size={16} className="text-[#10B981]/70" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Box on Answer */}
                        {selectedOption !== null && (
                            <div className="p-4 rounded-xl bg-[#0E131F] border border-[#1E2B45] space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {selectedOption === correctAnswer ? (
                                            <Badge variant="success" size="sm" dot>
                                                Correct Answer
                                            </Badge>
                                        ) : (
                                            <Badge variant="error" size="sm" dot>
                                                Incorrect Answer
                                            </Badge>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetAptitude}
                                        className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                                    >
                                        <RotateCcw size={12} />
                                        <span>Try Again</span>
                                    </button>
                                </div>
                                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                                    <strong className="text-[#F1F5F9]">Explanation: </strong>
                                    {explanation}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Interactive Mode 2: Open-ended Interview / GD Prompt */}
                {!isAptitude && (
                    <div className="space-y-4 pt-2">
                        {!hasSubmittedResponse ? (
                            <form onSubmit={handleSubmitResponse} className="space-y-3">
                                <div className="relative">
                                    <textarea
                                        rows={4}
                                        value={userResponse}
                                        onChange={(e) => setUserResponse(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full rounded-xl bg-[#0E131F] border border-[#1E2B45] p-3.5 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors resize-none"
                                    />
                                    <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-[#64748B]">
                                        {userResponse.length} chars
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        rightIcon={Send}
                                        disabled={!userResponse.trim()}
                                        className="shadow-md shadow-[#2563EB]/20 text-xs"
                                    >
                                        Submit Sample Response
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-5 rounded-xl bg-[#0E131F] border border-[#1E2B45] space-y-4 animate-in fade-in duration-200">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#38BDF8]">
                                        <Sparkles size={14} />
                                        <span>Sample Response Captured</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-[#06080B] border border-[#1E2B45] text-xs text-[#94A3B8] italic">
                                        "{userResponse}"
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-[#1E2B45]/80 pt-3">
                                    <p className="text-xs sm:text-sm text-[#F1F5F9] leading-relaxed">
                                        Sign up to get real AI-powered feedback on responses like this. Our evaluation engine analyzes technical accuracy, communication structure, trade-offs, and pacing in real time.
                                    </p>
                                    <p className="text-[11px] text-[#64748B]">
                                        Full assessment includes turn-by-turn follow-up questions, speech telemetry, and an exportable performance PDF report.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleEditResponse}
                                        className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                                    >
                                        <RotateCcw size={12} />
                                        <span>Edit Response</span>
                                    </button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        rightIcon={ArrowRight}
                                        onClick={handleSignUpRedirect}
                                        className="w-full sm:w-auto text-xs shadow-md shadow-[#2563EB]/25"
                                    >
                                        Sign Up for Full AI Analysis
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Sub-widget CTA */}
            <div className="text-center pt-1">
                <p className="text-xs text-[#94A3B8]">
                    This is one of hundreds of {role}-relevant questions —{" "}
                    <button
                        type="button"
                        onClick={handleSignUpRedirect}
                        className="text-[#38BDF8] hover:text-[#60A5FA] font-medium underline underline-offset-4 cursor-pointer"
                    >
                        sign up to start your full assessment
                    </button>
                </p>
            </div>
        </div>
    );
}

export default SampleQuestionPreview;
