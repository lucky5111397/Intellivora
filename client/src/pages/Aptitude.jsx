import React from "react";
import { Outlet } from "react-router-dom";
import { AptitudeProvider } from "../aptitude/context/aptitudeContext";

function Aptitude() {
  return (
    <AptitudeProvider>
      <div className="aptitude-module min-h-screen bg-apt-bg text-apt-text font-family-jakarta antialiased">
        <Outlet />
      </div>
    </AptitudeProvider>
  );
}

export default Aptitude;