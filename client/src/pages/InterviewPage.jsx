import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

function InterviewPage() {
  const location = useLocation();
  const initialInterviewData = location.state?.interviewData || null;
  const [step, setStep] = useState(initialInterviewData ? 2 : 1);
  const [interviewData, setInterviewData] = useState(initialInterviewData);

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