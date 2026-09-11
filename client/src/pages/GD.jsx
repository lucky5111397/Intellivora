import React from "react";
import { Outlet } from "react-router-dom";
import { GDProvider } from "../gd/context/gdContext";

function GD() {
  return (
    <GDProvider>
      <div className="gd-module min-h-screen bg-[#050816] text-slate-100 font-family-jakarta antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Outlet />
      </div>
    </GDProvider>
  );
}

export default GD;
