import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HeroSection from "./home/HeroSection";
import CapabilitiesSection from "./home/CapabilitiesSection";
import MethodologySection from "./home/MethodologySection";
import PricingPreviewSection from "./home/PricingPreviewSection";
import CTASection from "./home/CTASection";

function Home() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const handleAuthRedirect = (targetPath) => {
        if (!userData) {
            navigate("/auth", { state: { from: { pathname: targetPath } } });
        } else {
            navigate(targetPath);
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="w-full bg-[#06080B] text-[#F1F5F9]">
            {/* 1. Hero Section */}
            <HeroSection
                onStart={handleAuthRedirect}
                onExplore={() => scrollToSection("modules")}
            />

            {/* 2. Core Assessment Capabilities Showcase */}
            <CapabilitiesSection onStart={handleAuthRedirect} />

            {/* 3. Methodology & Evaluation Synthesis */}
            <MethodologySection onStart={handleAuthRedirect} />

            {/* 4. Credit Economy & Pricing Preview */}
            <PricingPreviewSection onSelectPlan={() => handleAuthRedirect("/pricing")} />

            {/* 5. Final Action Call */}
            <CTASection
                onStart={handleAuthRedirect}
                onExplore={() => scrollToSection("modules")}
            />
        </div>
    );
}

export default Home;