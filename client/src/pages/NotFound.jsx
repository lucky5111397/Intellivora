import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui";

export function NotFound() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-[#06080B]">
            <div className="w-16 h-16 rounded-2xl bg-[#0E131F] border border-[#1E2B45] flex items-center justify-center text-[#38BDF8] mb-6">
                <Compass size={32} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] mb-2">
                404 Error — Route Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F5F9] mb-4">
                This destination doesn't exist.
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-md mb-8 leading-relaxed">
                The requested assessment module or page could not be located. It may have been moved or archived.
            </p>
            <Link to="/">
                <Button variant="primary" size="md" leftIcon={ArrowLeft}>
                    Return to Platform Home
                </Button>
            </Link>
        </div>
    );
}

export default NotFound;

