import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Video,
  MessageSquare,
  Building,
} from "lucide-react";
import { getReplayableInterviews, getInterviewReplay } from "../../services/interviewReplayApi.js";

export default function InterviewReplayHub() {
  const { id: routeId } = useParams();
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(routeId || null);
  const [replayData, setReplayData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReplay, setLoadingReplay] = useState(false);

  useEffect(() => {
    async function loadList() {
      setLoadingList(true);
      try {
        const res = await getReplayableInterviews();
        if (res?.success && res.data) {
          setInterviews(res.data);
          if (!routeId && res.data.length > 0) {
            setSelectedId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load past interviews:", err);
      } finally {
        setLoadingList(false);
      }
    }
    loadList();
  }, [routeId]);

  useEffect(() => {
    async function loadReplay() {
      if (!selectedId) return;
      setLoadingReplay(true);
      try {
        const res = await getInterviewReplay(selectedId);
        if (res?.success && res.data) {
          setReplayData(res.data);
        }
      } catch (err) {
        console.error("Failed to load replay:", err);
      } finally {
        setLoadingReplay(false);
      }
    }
    loadReplay();
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-[#06080B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Video className="w-3.5 h-3.5" /> Performance Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interview Replay Hub
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
              Review your past AI interview sessions turn-by-turn. Inspect telemetry on confidence,
              communication, and correctness.
            </p>
          </div>

          <Link
            to="/interview"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg self-start md:self-auto hover:bg-cyan-400 transition-all"
          >
            Start New Interview &rarr;
          </Link>
        </div>

        {/* Main Grid: Past Interviews Sidebar & Replay Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Past Sessions */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Past Recorded Sessions
            </h3>

            {loadingList ? (
              <div className="py-10 text-center text-xs text-slate-500">Loading sessions...</div>
            ) : interviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0D121D] border border-slate-800 text-center text-xs text-slate-400">
                No completed interviews yet. Start your first AI mock interview!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {interviews.map((iv) => {
                  const isSelected = iv._id === selectedId;
                  return (
                    <button
                      key={iv._id}
                      onClick={() => setSelectedId(iv._id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/10"
                          : "bg-[#0D121D] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white truncate max-w-[180px]">{iv.role}</span>
                        <span className="text-cyan-400 font-extrabold">{iv.finalScore}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{iv.mode} Mode ({iv.experience})</span>
                        <span>{new Date(iv.createdAt).toLocaleDateString()}</span>
                      </div>
                      {iv.targetCompany && (
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-cyan-400" /> {iv.targetCompany}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Replay Details Pane */}
          <div className="lg:col-span-8">
            {loadingReplay ? (
              <div className="py-24 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : replayData ? (
              <div className="space-y-6">
                {/* Scorecard Hero Banner */}
                <div className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div>
                      <h2 className="text-xl font-bold text-white">{replayData.session?.role}</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        {replayData.session?.mode} Track &bull; {replayData.session?.experience} Level &bull; {replayData.session?.targetCompany || "Standard Bar"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-extrabold text-cyan-400">
                        {replayData.metrics?.overallScore || 0}%
                      </span>
                      <span className="text-xs text-slate-500">Overall</span>
                    </div>
                  </div>

                  {/* 3 Metric Dimension Cards */}
                  <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                    <div className="p-3 bg-[#06080B] rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confidence</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        {replayData.metrics?.averageConfidence || 0}%
                      </span>
                    </div>
                    <div className="p-3 bg-[#06080B] rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Communication</span>
                      <span className="text-lg font-extrabold text-cyan-400">
                        {replayData.metrics?.averageCommunication || 0}%
                      </span>
                    </div>
                    <div className="p-3 bg-[#06080B] rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Correctness</span>
                      <span className="text-lg font-extrabold text-indigo-400">
                        {replayData.metrics?.averageCorrectness || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Trajectory */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" /> Turn-by-Turn Replay
                  </h3>

                  {(replayData.questions || []).map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0D121D] rounded-2xl border border-slate-800 p-6 space-y-4 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            Turn {idx + 1}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                            {q.question}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (q.score || 0) >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : (q.score || 0) >= 60
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {q.score || 0}%
                        </span>
                      </div>

                      {/* Candidate Answer Transcript */}
                      <div className="p-3.5 rounded-xl bg-[#06080B] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Candidate Transcript:
                        </span>
                        {q.answer || "No verbal transcript recorded."}
                      </div>

                      {/* AI Coaching Feedback */}
                      {q.feedback && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                            AI Feedback & Recommendations:
                          </span>
                          {q.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-sm text-slate-500">
                Select an interview from the list to view its replay.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
