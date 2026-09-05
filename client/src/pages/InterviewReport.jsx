import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Step3Report from "../components/Step3Report";
import { FaArrowLeft, FaExclamationCircle } from "react-icons/fa";

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          { withCredentials: true }
        );
        if (mounted) {
          setReport(result.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching interview report:", err);
        if (mounted) {
          setError(err.response?.data?.message || "Interview report not found.");
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchReport();
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <p className="text-slate-400 text-base font-medium">
          Loading Interview Report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6">
        <div className="glass max-w-md w-full p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <FaExclamationCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Report Unavailable</h2>
          <p className="text-sm text-slate-400">
            {error || "We could not find the evaluation report for this session."}
          </p>
          <button
            onClick={() => navigate("/history")}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold transition cursor-pointer"
          >
            <FaArrowLeft size={14} />
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;