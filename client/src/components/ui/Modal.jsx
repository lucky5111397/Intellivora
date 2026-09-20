import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Accessible Modal Dialog Primitive
 * Implements WCAG 2.1 compliance with focus trapping, Escape key dismiss,
 * body scroll locking, and focus restoration to the previously active element upon closing.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {"sm" | "md" | "lg" | "xl" | "full"} [props.size="md"]
 * @param {boolean} [props.closeOnEsc=true]
 * @param {boolean} [props.closeOnBackdrop=true]
 * @param {string} [props.className=""]
 * @returns {JSX.Element}
 */
export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
    closeOnEsc = true,
    closeOnBackdrop = true,
    className = "",
}) {
    const modalRef = useRef(null);
    const previousActiveElementRef = useRef(null);

    // Focus trap and body scroll lock
    useEffect(() => {
        if (isOpen) {
            previousActiveElementRef.current = document.activeElement;
            document.body.style.overflow = "hidden";

            // Focus the first focusable element or the modal container
            const timer = setTimeout(() => {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelectorAll(
                        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusable.length > 0) {
                        focusable[0].focus();
                    } else {
                        modalRef.current.focus();
                    }
                }
            }, 50);

            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = "";
            if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
                previousActiveElementRef.current.focus();
            }
        }
    }, [isOpen]);

    // Keyboard handlers (Escape & Tab focus trap)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && closeOnEsc) {
                onClose?.();
                return;
            }

            if (e.key === "Tab" && modalRef.current) {
                const focusable = Array.from(
                    modalRef.current.querySelectorAll(
                        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    )
                );

                if (focusable.length === 0) {
                    e.preventDefault();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeOnEsc, onClose]);

    const sizeStyles = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with Motion Fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-[#06080B]/85 backdrop-blur-md"
                        onClick={closeOnBackdrop ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal Dialog with Motion Scale & Slide */}
                    <motion.div
                        ref={modalRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative w-full ${sizeStyles[size] || sizeStyles.md} bg-[#0E131F] border border-[#1E2B45] rounded-xl shadow-2xl shadow-black/80 p-6 overflow-hidden z-10 ${className}`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                {title && (
                                    <h2 className="text-lg font-semibold text-[#F1F5F9] tracking-tight">
                                        {title}
                                    </h2>
                                )}
                                {description && (
                                    <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-1 rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#141B2D] transition-colors cursor-pointer"
                                    aria-label="Close dialog"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-sm text-[#F1F5F9]">{children}</div>

                        {/* Footer */}
                        {footer && (
                            <div className="mt-6 pt-4 border-t border-[#161F33] flex items-center justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default Modal;
