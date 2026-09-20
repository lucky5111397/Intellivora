import React, { useState, useRef, useEffect } from "react";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import {
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Video,
  VideoOff,
  LogOut,
  Sparkles,
  Building2,
} from "lucide-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ServerUrl } from "../App";
import { AmbientBackground } from "./ui/AmbientBackground";

/**
 * Interactive Mock Interview Session Screen
 * Manages video avatar playback, SpeechSynthesis text-to-speech audio,
 * continuous Web Speech API speech recognition, and live webcam feed.
 *
 * @param {Object} props
 * @param {Object} props.interviewData
 * @param {(result: Object) => void} props.onFinish
 */
function Step2Interview({ interviewData, onFinish }) {
  const navigate = useNavigate();
  const interviewId = interviewData?.interviewId;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const questions = interviewData?.questions || [];
  const userName = interviewData?.userName || "Candidate";
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [_subtitle, setSubtitle] = useState("");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState(null);

  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const webcamStream = useRef(null);
  const [cameraOn, setCameraOn] = useState(
    Boolean(interviewData?.cameraEnabled)
  );

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        return;
      }
      // Try known male voices
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        return;
      }

      // Fallback: first voice (assume female)
      if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;

      setTimeout(loadVoices, 500);
    }
  }, []);


  const videoSource = femaleVideo;

  // ---------------- SPEAK FUNCTION ----------------

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      setSubtitle(text);

      utterance.onstart = () => {
        setIsAIPlaying(true);
        setIsUserTurn(false);

        if (videoRef.current) {
          // Advance video playback past initial freeze frame
          videoRef.current.currentTime = 1;

          // Gracefully handle browser autoplay policy restrictions
          videoRef.current.play().catch(() => { });
        }
      };

      utterance.onend = () => {
        setIsAIPlaying(false);
        setIsUserTurn(true);

        if (videoRef.current) {
          videoRef.current.pause();

          // Next time ke liye same frame par rakho
          videoRef.current.currentTime = 1;
        }

        if (isMicOn) {
          startMic();
        }

        resolve();
      };

      utterance.onerror = () => {
        setIsAIPlaying(false);

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 1;
        }

        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };
  useEffect(() => {
    if (!selectedVoice) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 200));

        if (currentIndex === questions.length - 1) {
          await speakText(
            "Alright, this one might be a bit more challenging."
          );
        }

        await speakText(currentQuestion.question);

        // Note: Microphone activation is handled automatically on utterance completion via speakText.onend
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);


  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isAIPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [currentQuestion, isIntroPhase, isAIPlaying]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimit || 60);
  }, [currentQuestion, isIntroPhase]);

  useEffect(() => {
    const savedAnswer = localStorage.getItem(
      `interview-${interviewId}-q${currentIndex}`
    );

    if (savedAnswer) {
      setAnswer(savedAnswer);
    } else {
      setAnswer("");
    }
  }, [currentIndex, interviewId]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e?.error || e);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };


  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }

    setIsMicOn(!isMicOn);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      webcamStream.current = stream;

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }

      setCameraOn(true);

      toast.success("Camera enabled.");
    } catch (error) {
      console.error("Camera error:", error?.message || error);
      toast.error("Camera permission denied.");
    }
  };

  const stopCamera = () => {
    if (webcamStream.current) {
      webcamStream.current
        .getTracks()
        .forEach((track) => track.stop());

      webcamStream.current = null;
    }

    setCameraOn(false);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;

    stopMic();
    setIsSubmitting(true);

    setThinkingStep(1);

    setTimeout(() => setThinkingStep(2), 700);

    setTimeout(() => setThinkingStep(3), 1500);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken:
            currentQuestion.timeLimit - timeLeft,
        },
        {
          withCredentials: true,
          timeout: 35000,
        }
      );
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Submit answer error:", error?.message || error);
      toast.error("Failed to submit answer. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    stopMic();
    setIsUserTurn(false);

    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    const nextIndex = currentIndex + 1;

    // Advance question index and reset countdown timer
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error?.message || error);
      toast.error("Fullscreen is not supported.");
    }
  };

  const finishInterview = async () => {
    setIsFinishing(true);
    setFinishError(null);
    stopMic();
    stopCamera();
    setIsMicOn(false);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        {
          interviewId,
        },
        {
          withCredentials: true,
          timeout: 45000,
        }
      );

      toast.success("Interview completed! Generating report...");
      onFinish(result.data);
    } catch (error) {
      console.error("Finish interview error:", error?.message || error);
      const msg = error.response?.data?.message || "Failed to finalize interview. Please check your connection and retry.";
      setFinishError(msg);
      toast.error(msg);
    } finally {
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    // Intercept browser back navigation by trapping history state
    window.history.pushState(null, "", window.location.href);

    const handleBackButton = () => {
      // Re-trap history entry to prevent premature navigation
      window.history.pushState(null, "", window.location.href);
      setShowExitDialog(true);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowExitDialog(false);
      }
    };

    if (showExitDialog) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showExitDialog]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut while user is actively typing in form inputs
      if (
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "INPUT"
      ) {
        return;
      }

      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!cameraOn) return;

    startCamera();
  }, [cameraOn]);

  useEffect(() => {
    if (interviewData?.cameraEnabled) {
      setCameraOn(true);
    }
  }, [interviewData]);

  return (
    <>
      <div className="relative min-h-screen bg-[#06080B] p-4 sm:p-6 flex items-center justify-center overflow-hidden">
        <AmbientBackground variant="subtle" />
        <div className="relative z-10 w-full max-w-7xl h-[92vh] rounded-2xl border border-[#1E2B45] bg-[#0A0D14] shadow-2xl shadow-black/60 overflow-y-auto flex flex-col lg:flex-row">
          {/* LEFT SECTION: AI AVATAR & PROCTORED STREAMS */}
          <div className="w-full lg:w-[32%] border-b lg:border-b-0 lg:border-r border-[#1E2B45] p-5 flex flex-col gap-4 bg-[#0E131F]">
            {/* AI Video Container */}
            <div className="relative h-[220px] flex-shrink-0 overflow-hidden rounded-xl border border-[#1E2B45] bg-[#06080B]">
              <video
                ref={videoRef}
                src={videoSource}
                muted
                playsInline
                preload="auto"
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#047857]/50 bg-[#062319] px-2.5 py-1 text-[11px] font-semibold text-[#34D399]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>AI INTERVIEWER</span>
                </div>
              </div>
            </div>

            {/* Webcam Preview */}
            <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                  Candidate Stream
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-semibold ${
                      cameraOn
                        ? "bg-[#062319] text-[#34D399] border border-[#047857]/40"
                        : "bg-[#141B2D] text-[#64748B] border border-[#2D3E63]"
                    }`}
                  >
                    {cameraOn ? "CAMERA ON" : "CAMERA OFF"}
                  </span>
                  <button
                    onClick={() => {
                      if (cameraOn) {
                        stopCamera();
                      } else {
                        setCameraOn(true);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#141B2D] border border-[#2D3E63] px-2.5 py-1 text-xs text-[#F1F5F9] hover:bg-[#1A233A] transition cursor-pointer"
                  >
                    {cameraOn ? (
                      <>
                        <VideoOff size={13} />
                        <span>Mute</span>
                      </>
                    ) : (
                      <>
                        <Video size={13} />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {cameraOn ? (
                <video
                  ref={webcamRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-36 w-full rounded-lg object-cover bg-black border border-[#161F33]"
                />
              ) : (
                <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-[#1E2B45] bg-[#06080B]">
                  <VideoOff size={28} className="text-[#64748B]" />
                  <p className="mt-2 text-xs text-[#64748B]">Camera Stream Disabled</p>
                </div>
              )}
            </div>

            {/* Status & Timer Card */}
            <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Turn Status
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isUserTurn
                        ? "bg-[#062319] text-[#34D399] border border-[#047857]/40"
                        : "bg-[#0D1E3A] text-[#93C5FD] border border-[#2563EB]/40"
                    }`}
                  >
                    {isUserTurn ? "● Your Turn (Speak)" : "● AI Speaking"}
                  </span>
                </div>

                <div className="flex justify-center py-2">
                  <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#161F33]">
                <div className="rounded-lg border border-[#161F33] bg-[#0E131F] p-2.5 text-center">
                  <span className="text-lg font-bold text-[#38BDF8] font-mono tabular-nums">
                    {currentIndex + 1}
                  </span>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B] mt-0.5">Current Q</p>
                </div>
                <div className="rounded-lg border border-[#161F33] bg-[#0E131F] p-2.5 text-center">
                  <span className="text-lg font-bold text-[#F1F5F9] font-mono tabular-nums">
                    {questions.length}
                  </span>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B] mt-0.5">Total Qs</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: QUESTION, RESPONSE & ACTIONS */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between bg-[#0A0D14]">
            <div>
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0D1E3A] text-[#93C5FD] border border-[#2563EB]/30">
                      Technical Assessment
                    </span>
                    {interviewData?.targetCompany && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#141B2D] text-[#38BDF8] border border-[#1E2B45]">
                        <Building2 size={12} />
                        <span>{interviewData.targetCompany}</span>
                      </span>
                    )}
                    <span className="text-xs font-mono text-[#64748B]">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">
                    Articulate Your Solution
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E2B45] bg-[#0E131F] text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#141B2D] transition cursor-pointer"
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  </button>

                  <button
                    onClick={() => setShowExitDialog(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B91C1C]/40 bg-[#280B0B] text-xs font-medium text-[#F87171] hover:bg-[#B91C1C]/30 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Exit</span>
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#141B2D]">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              {!isIntroPhase && currentQuestion && (
                <div className="rounded-xl border border-[#1E2B45] bg-[#0E131F] p-6 shadow-lg mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {currentIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                      Technical Question
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-[#F1F5F9] leading-relaxed whitespace-pre-wrap break-words">
                    {currentQuestion?.question}
                  </h3>
                </div>
              )}

              {/* Answer Input Area */}
              <div>
                <textarea
                  placeholder="Start speaking into your microphone or type your response here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[160px] w-full rounded-xl border border-[#1E2B45] bg-[#06080B] p-4 text-sm leading-relaxed text-[#F1F5F9] placeholder:text-[#64748B] resize-none outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-mono tabular-nums">{answer.length} Characters recorded</span>
                  <span>AI evaluates Technical Depth • Communication • Structure</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions / AI Feedback */}
            <div className="pt-6 mt-6 border-t border-[#161F33]">
              {!feedback ? (
                isSubmitting ? (
                  <div className="rounded-xl border border-[#8B5CF6]/40 bg-[#13122B] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#C4B5FD] mb-2">
                      <Sparkles size={16} className="animate-pulse" />
                      <span>Synthesizing answer evaluation...</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mb-3">
                      Analyzing technical accuracy, delivery cadence, and core competencies.
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#06080B]">
                      <div
                        className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500"
                        style={{
                          width: thinkingStep === 1 ? "35%" : thinkingStep === 2 ? "70%" : "100%",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isMicOn
                          ? "bg-[#0D1E3A] border border-[#2563EB] text-[#38BDF8]"
                          : "bg-[#280B0B] border border-[#B91C1C] text-[#F87171]"
                      }`}
                      aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    <button
                      type="button"
                      onClick={submitAnswer}
                      disabled={isSubmitting}
                      className="flex-1 h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Submit Response for Evaluation
                    </button>
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-[#8B5CF6]/40 bg-[#13122B] p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>AI Evaluator Feedback</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-[#F1F5F9] leading-relaxed">
                      {feedback}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isFinishing}
                    className="w-full h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isFinishing
                      ? "Finalizing Assessment Report..."
                      : currentIndex + 1 === questions.length
                      ? "Conclude Interview & Compile Report"
                      : "Proceed to Next Question →"}
                  </button>

                  {finishError && (
                    <div className="p-3 rounded-lg border border-[#B91C1C]/40 bg-[#280B0B] text-center">
                      <p className="text-xs text-[#F87171] mb-2">{finishError}</p>
                      <button
                        onClick={finishInterview}
                        disabled={isFinishing}
                        className="px-3 py-1 rounded bg-[#B91C1C]/40 hover:bg-[#B91C1C]/60 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        {isFinishing ? "Retrying..." : "Retry Finalizing"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06080B]/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-[#1E2B45] bg-[#0E131F] p-6 shadow-2xl shadow-black/80">
            <h3 className="text-lg font-bold text-[#F1F5F9]">Exit Active Interview?</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Your interview is currently in progress. Exiting will abort this session and unsubmitted questions will not be scored.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowExitDialog(false)}
                className="px-4 py-2 rounded-lg border border-[#1E2B45] bg-[#0A0D14] text-xs font-medium text-[#F1F5F9] hover:bg-[#141B2D] transition cursor-pointer"
              >
                Resume Interview
              </button>
              <button
                onClick={() => {
                  stopMic();
                  stopCamera();
                  if (recognitionRef.current) {
                    recognitionRef.current.abort();
                  }
                  window.speechSynthesis.cancel();
                  setShowExitDialog(false);
                  toast.info("Interview session exited.");
                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-xs font-semibold text-white transition cursor-pointer"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Step2Interview;