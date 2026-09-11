import React from "react";
import { useParams, Link } from "react-router-dom";

export const GDOverviewPlaceholder = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
      <span className="text-2xl">🎙️</span>
    </div>
    <h1 className="text-2xl font-bold text-slate-100 mb-2">Group Discussion Hub</h1>
    <p className="text-slate-400 max-w-md mb-6">
      AI Group Discussion simulator foundation initialized. Full hub interface will be implemented in GD-05.
    </p>
    <Link
      to="/gd/setup"
      className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
    >
      Start New GD
    </Link>
  </div>
);

export const GDSetupPlaceholder = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="p-4 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4">
      <span className="text-2xl">⚙️</span>
    </div>
    <h1 className="text-2xl font-bold text-slate-100 mb-2">Configure Discussion</h1>
    <p className="text-slate-400 max-w-md mb-6">
      Topic selection and parameters screen will be implemented in GD-05.
    </p>
    <Link to="/gd" className="text-indigo-400 hover:underline text-sm">
      ← Back to Overview
    </Link>
  </div>
);

export const GDLobbyPlaceholder = () => {
  const { id } = useParams();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
        <span className="text-2xl">🎥</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Preparation Lobby</h1>
      <p className="text-slate-400 max-w-md mb-2">Session ID: {id}</p>
      <p className="text-slate-500 text-sm max-w-md mb-6">
        Webcam, microphone diagnostics, and roster preview will be implemented in GD-06.
      </p>
      <Link
        to={`/gd/room/${id}`}
        className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
      >
        Enter Room
      </Link>
    </div>
  );
};

export const GDRoomPlaceholder = () => {
  const { id } = useParams();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
        <span className="text-2xl">💬</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Live Discussion Room</h1>
      <p className="text-slate-400 max-w-md mb-2">Session ID: {id}</p>
      <p className="text-slate-500 text-sm max-w-md mb-6">
        Multi-agent grid, waveforms, and live speech recognition will be implemented in GD-06.
      </p>
      <Link
        to={`/gd/analysis/${id}`}
        className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
      >
        View Analysis
      </Link>
    </div>
  );
};

export const GDAnalysisPlaceholder = () => {
  const { id } = useParams();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
        <span className="text-2xl">📊</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Discussion Scorecard & Analysis</h1>
      <p className="text-slate-400 max-w-md mb-2">Session ID: {id}</p>
      <p className="text-slate-500 text-sm max-w-md mb-6">
        4-pillar breakdown, telemetry scorecard, and turn feedback will be implemented in GD-07.
      </p>
      <Link to="/gd" className="text-indigo-400 hover:underline text-sm">
        ← Back to Overview
      </Link>
    </div>
  );
};
