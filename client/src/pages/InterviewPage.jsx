import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";
import { ServerUrl } from "../App";

function InterviewPage() {
  const location = useLocation();
  const initialInterviewData = location.state?.interviewData || null;
  const [step, setStep] = useState(initialInterviewData ? 2 : 1);
  const [interviewData, setInterviewData] = useState(initialInterviewData);
  const [isRecovering, setIsRecovering] = useState(!initialInterviewData);

  // Synchronize active interview ID in sessionStorage
  useEffect(() => {
    if (interviewData?.interviewId) {
      sessionStorage.setItem("active_interview_id", interviewData.interviewId);
    }
  }, [interviewData]);

  // Recover active interview on page refresh / direct navigation
  useEffect(() => {
    if (initialInterviewData) {
      setIsRecovering(false);
      return;
    }

    const activeId = sessionStorage.getItem("active_interview_id");
    if (!activeId) {
      setIsRecovering(false);
      return;
    }

    let isMounted = true;
    axios
      .get(`${ServerUrl}/api/interview/${activeId}`, { withCredentials: true })
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.interviewId && res.data.status !== "Completed") {
          setInterviewData(res.data);
          setStep(2);
        } else {
          sessionStorage.removeItem("active_interview_id");
          setStep(1);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        sessionStorage.removeItem("active_interview_id");
        setStep(1);
      })
      .finally(() => {
        if (isMounted) setIsRecovering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialInterviewData]);

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Restoring active interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] text-white">
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            sessionStorage.removeItem("active_interview_id");
            setInterviewData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report report={interviewData} />
      )}
    </div>
  );
}

export default InterviewPage;
