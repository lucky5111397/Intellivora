import React from "react";

export function Skeleton({ className = "", variant = "text", ...props }) {
    const variantStyles = {
        text: "h-4 w-full rounded",
        title: "h-6 w-3/4 rounded-md",
        avatar: "h-10 w-10 rounded-full shrink-0",
        card: "h-32 w-full rounded-xl",
        button: "h-10 w-24 rounded-lg",
    };

    return (
        <div
            className={`animate-pulse bg-[#141B2D]/80 border border-[#161F33] ${variantStyles[variant] || ""} ${className}`}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="p-6 rounded-xl bg-[#0E131F] border border-[#1E2B45] space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <div className="space-y-2 flex-1">
                    <Skeleton variant="title" className="w-1/2" />
                    <Skeleton variant="text" className="w-1/3" />
                </div>
            </div>
            <Skeleton variant="card" className="h-20" />
            <div className="flex justify-between pt-2">
                <Skeleton variant="button" />
                <Skeleton variant="button" className="w-16" />
            </div>
        </div>
    );
}

export default Skeleton;

