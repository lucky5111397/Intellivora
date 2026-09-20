import React, { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#06080B] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#280B0B] border border-[#B91C1C]/50 flex items-center justify-center text-[#F87171] mb-6">
                        <AlertTriangle size={28} />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F87171] mb-2">
                        System Runtime Exception
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9] mb-3">
                        Assessment Workspace Interrupted
                    </h1>
                    <p className="text-sm text-[#94A3B8] max-w-md mb-8 leading-relaxed">
                        An unhandled client error occurred. Your session state has been safeguarded.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                        <RotateCcw size={16} />
                        <span>Recover & Return Home</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

