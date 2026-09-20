import React, { forwardRef } from "react";

/**
 * Form Input Primitive
 * Obsidian styled text input supporting validation error messages, helper text, and icon adornments.
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {React.ElementType} [props.leftIcon]
 * @param {React.ElementType} [props.rightIcon]
 * @param {string} [props.className=""]
 * @param {string} [props.type="text"]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.id]
 */
export const Input = forwardRef(function Input(
    {
        label,
        error,
        helperText,
        leftIcon: LeftIcon,
        rightIcon: RightIcon,
        className = "",
        type = "text",
        disabled = false,
        id,
        ...props
    },
    ref
) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-medium text-[#94A3B8] tracking-wide"
                >
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {LeftIcon && (
                    <div className="absolute left-3 text-[#64748B] pointer-events-none flex items-center justify-center">
                        <LeftIcon size={16} />
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    disabled={disabled}
                    className={`w-full h-10 px-3 ${LeftIcon ? "pl-9" : ""} ${RightIcon ? "pr-9" : ""} rounded-lg bg-[#0A0D14] border ${
                        error
                            ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                            : "border-[#1E2B45] focus:border-[#3B82F6] focus:ring-[#3B82F6]/20"
                    } text-sm text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
                    {...props}
                />

                {RightIcon && (
                    <div className="absolute right-3 text-[#64748B] flex items-center justify-center">
                        <RightIcon size={16} />
                    </div>
                )}
            </div>

            {error ? (
                <p className="text-xs text-[#F87171] leading-none mt-0.5">{error}</p>
            ) : helperText ? (
                <p className="text-xs text-[#64748B] leading-none mt-0.5">{helperText}</p>
            ) : null}
        </div>
    );
});

export default Input;

