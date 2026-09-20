import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Reusable modal for confirming deletions across all admin modules.
 * Ensures destructive operations always require explicit confirmation.
 */
export default function AdminDeleteModal({
  isOpen,
  title = "Confirm Deletion",
  description,
  itemLabel,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#1E2B45] bg-[#0E131F] p-6 shadow-2xl space-y-5 text-left">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#280B0B] border border-[#EF4444]/40 flex items-center justify-center text-[#F87171] shrink-0">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#F1F5F9]">{title}</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {description || (
              <>
                Are you sure you want to permanently delete{" "}
                {itemLabel && (
                  <span className="font-semibold text-[#F1F5F9] font-mono">
                    {itemLabel}
                  </span>
                )}
                ? This action cannot be undone.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E2B45]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            className="text-xs"
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

