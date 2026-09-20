import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

export function AppLayout() {
    const location = useLocation();
    const pathname = location.pathname;

    // Immersive routes that should not render the standard marketing footer
    const hideFooterRoutes = [
        "/aptitude/test",
        "/gd/room",
        "/gd/lobby",
        "/interview",
        "/report",
        "/auth",
    ];
    const isImmersive = hideFooterRoutes.some((route) => pathname.startsWith(route));

    return (
        <div className="min-h-screen flex flex-col bg-[#06080B] text-[#F1F5F9] selection:bg-[#2563EB] selection:text-white">
            <Navbar />
            <main className="flex-1 w-full flex flex-col">
                <Outlet />
            </main>
            {!isImmersive && <Footer />}
        </div>
    );
}

export default AppLayout;

