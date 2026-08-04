import React from "react";
import { useNavigate } from "react-router-dom";
import ResumeUploader from "../components/ResumeUploader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AiOutlineArrowLeft } from "react-icons/ai";

function Resume() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="relative px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <AiOutlineArrowLeft size={18} />
            Back
          </button>

          <div className="glass rounded-[36px] border border-white/10 bg-slate-950/85 p-8 shadow-[0_25px_120px_rgba(15,23,42,0.25)] sm:p-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                    ATS Score Checker — Step 1
                  </span>
                  <span className="inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200">
                    🪙 200 Credits
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Upload your resume
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                    Select a PDF resume under 5 MB to continue. The upload is validated locally and ready for ATS analysis.
                  </p>
                </div>
              </div>

              <ResumeUploader />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Resume;
