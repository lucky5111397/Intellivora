import React, { useState, useRef, useEffect } from "react";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaExpand } from "react-icons/fa";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { ServerUrl } from "../App";

// AI Interview Screen
function Step2Interview({ interviewData, onFinish }) {
  const navigate = useNavigate();
  const interviewId = interviewData?.interviewId;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const questions = interviewData?.questions || [];
  const userName = interviewData?.userName || "Candidate";
  console.log("Step2Interview Loaded");
  console.log("Interview Data:", interviewData);
  console.log("Questions:", questions);
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
  const [subtitle, setSubtitle] = useState("");
  const [showExitDialog, setShowExitDialog] = useState(false);

  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const webcamStream = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  (
    interviewData?.cameraEnabled || false
  );

  const currentQuestion = questions[currentIndex];
  console.log("========== DEBUG ==========");
  console.log(interviewData);
  console.log(questions);
  console.log(currentQuestion);
  console.log(currentQuestion?.question);
  console.log("===========================");
  console.log("Current Question Object:", currentQuestion);

  console.log("Questions:", questions);
  console.log("Current Index:", currentIndex);
  console.log("Current Question:", currentQuestion);
  console.log("Feedback:", feedback);

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Interview...
      </div>
    );
  }

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
          // Video ko thoda aage se start karo
          videoRef.current.currentTime = 1;

          // Agar autoplay block ho jaye to error na aaye
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

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText(
            "Alright, this one might be a bit more challenging."
          );
        }

        await speakText(currentQuestion.question);

        // startMic ki zarurat nahi hai.
        // speakText ke onend me already hai.
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
  }, [currentIndex]);

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
      console.log(e);
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
      console.log(error);
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
      console.log("Answer Sending:", answer);
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken:
            currentQuestion.timeLimit - timeLeft,
        }, { withCredentials: true }
      );
      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)

    }
  };

  const handleNext = () => {
    console.log("Next Clicked");
    stopMic();
    setIsUserTurn(false);

    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    const nextIndex = currentIndex + 1;

    // Question aur timer ko turant update karo
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
      console.log(error);
      toast.error("Fullscreen is not supported.");
    }
  };

  const finishInterview = async () => {
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
        }
      );

      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
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
    // Current page ko history me dubara push karo
    window.history.pushState(null, "", window.location.href);

    const handleBackButton = () => {
      // Dobara current page push karo
      window.history.pushState(null, "", window.location.href);

      // Popup open karo
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
      // Agar user textarea me type kar raha hai to ignore karo
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
      <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0B1220] to-[#111827] p-6 flex items-center justify-center">

        <div className="w-full max-w-7xl h-[92vh] rounded-3xl border border-white/10 bg-[#0B1220] shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-y-auto flex flex-col lg:flex-row">

          {/* LEFT SECTION */}

          <div className="w-full lg:w-[30%] border-r border-white/10 p-6 flex flex-col gap-5">

            {/* AI VIDEO */}

            {/* AI VIDEO */}

            <div className="relative h-[240px] flex-shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">

              <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />


              <video
                ref={videoRef}
                src={videoSource}
                muted
                playsInline
                preload="auto"
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-5 left-5 z-10">

                <div className="
inline-flex
items-center
gap-2
rounded-full
border
border-emerald-500/20
bg-emerald-500/15
px-3
py-2
text-xs
font-semibold
text-emerald-300
">

                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>

                  LIVE

                </div>

              </div>

            </div>

            {/* Webcam Preview */}

            <div
              className="
mt-6
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-5
"
            >

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-semibold text-white">
                  Your Camera
                </h3>

                <div className="flex items-center gap-3">

                  <span
                    className="
rounded-full
bg-blue-500/10
px-3
py-1
text-xs
font-medium
text-blue-300
"
                  >
                    {cameraOn ? "ON" : "OFF"}
                  </span>

                  <button
                    onClick={() => {
                      if (cameraOn) {
                        stopCamera();
                      } else {
                        setCameraOn(true);
                      }
                    }}
                    className="
flex
items-center
gap-2
rounded-xl
bg-white/10
px-3
py-2
text-xs
text-white
hover:bg-white/20
transition
"
                  >
                    {cameraOn ? (
                      <>
                        <FaVideoSlash />
                        Turn Off
                      </>
                    ) : (
                      <>
                        <FaVideo />
                        Turn On
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
                  className="
h-40
w-full
rounded-2xl
object-cover
bg-black
shadow-lg
"
                />

              ) : (

                <div className="
flex
h-40
flex-col
items-center
justify-center
rounded-2xl
border
border-dashed
border-white/10
bg-[#111827]
">

                  <FaVideoSlash
                    size={40}
                    className="text-slate-500"
                  />

                  <p className="mt-4 text-sm text-slate-400">
                    Camera Disabled
                  </p>

                </div>

              )}

            </div>

            {/* STATUS */}

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  Interview Progress
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${isUserTurn
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-300"
                    }`}
                >
                  {isUserTurn ? "Your Turn" : "AI Speaking"}
                </span>

              </div>

              <div className="mt-6">

                <div className="mb-2 flex justify-between text-xs text-slate-400">

                  <span>Progress</span>

                  <span>
                    {currentIndex + 1} / {questions.length}
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: .5 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                  />

                </div>

              </div>

              <div className="my-6 border-t border-white/10"></div>

              <div className="flex justify-center">

                <Timer
                  timeLeft={timeLeft}
                  totalTime={currentQuestion?.timeLimit}
                />

              </div>

              <div className="my-6 border-t border-white/10"></div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

                  <h3 className="text-3xl font-bold text-blue-400">
                    {currentIndex + 1}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                    Current
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

                  <h3 className="text-3xl font-bold text-violet-400">
                    {questions.length}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                    Total
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SECTION STARTS */}

          <div className="flex-1 p-8 flex flex-col">

            {/* Header */}

            <div className="flex items-center justify-between mb-8">

              <div>

                <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                  AI Technical Interview
                </span>

                <h2 className="mt-5 text-3xl font-bold text-white">
                  Answer The Question Carefully
                </h2>

                <p className="mt-2 text-slate-400">
                  Think clearly before submitting your answer.
                </p>

              </div>
              <div className="flex items-center gap-4">

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="
rounded-2xl
border
border-blue-500/20
bg-blue-500/10
px-3
py-2
font-semibold
text-blue-300
hover:bg-blue-500/20
transition
"
                >
                  <div className="flex items-center gap-3">
                    <FaExpand />
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExitDialog(true)}
                  className="
    rounded-2xl
    border
    border-red-500/20
    bg-red-500/10
    px-3
    py-2
    font-semibold
    text-red-400
    transition
    hover:bg-red-500/20
    "
                >
                  Exit
                </motion.button>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 text-center">

                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Progress
                  </p>

                  <h3 className="mt-2 text-3xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {currentIndex + 1}/{questions.length}
                  </h3>

                </div>

              </div>

            </div>

            {/* Progress */}

            <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">

              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: .5 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
              />

            </div>

      

      
            {/* ================= QUESTION  ================= */}

            {!isIntroPhase && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="
relative
mt-8
rounded-3xl
border
border-white/10
bg-[#1F2937]
p-8
shadow-lg
flex
flex-col
justify-center
"
              >
                {/* Glow */}
                <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

                {/* Header */}
                <div className="flex items-center gap-4">
                  <div
                    className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-gradient-to-r
          from-blue-600
          to-violet-600
          text-lg
          font-bold
          text-white
        "
                  >
                    {currentIndex + 1}
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
                      Question {currentIndex + 1}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Take a moment to understand the question before answering.
                    </p>
                  </div>
                </div>

                {/* Question */}
                <div className="mt-8">
                  <h2
                    className="
                    text-2xl
font-semibold
leading-relaxed

text-white
whitespace-pre-wrap
break-words
"
                  >
                    {currentQuestion?.question}
                  </h2>
                </div>
              </motion.div>
            )}

            {/* Answer */}

            <textarea
              placeholder="Start speaking or type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="
mt-6
min-h-[180px]
w-full
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-6
text-base
leading-8
text-white
placeholder:text-slate-500
resize-none
outline-none
transition-all
duration-300
focus:border-blue-500
focus:ring-4
focus:ring-blue-500/10
"
            />

            <div className="mt-3 flex items-center justify-between">

              <p className="text-sm font-medium text-slate-400">
                {answer.length} Characters
              </p>

              <p className="text-sm text-slate-500">
                AI evaluates Confidence • Communication • Technical Skills
              </p>

            </div>

            {!feedback ? (

              isSubmitting ? (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="
mt-8
rounded-3xl
border
border-blue-500/20
bg-blue-500/10
backdrop-blur-xl
p-8
"
                >

                  <h3 className="text-xl font-semibold text-white">
                    AI is analyzing your answer...
                  </h3>

                  <p className="mt-3 text-slate-400">
                    Evaluating technical knowledge, confidence and communication.
                  </p>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">

                    <motion.div
                      animate={{
                        width:
                          thinkingStep === 1
                            ? "30%"
                            : thinkingStep === 2
                              ? "65%"
                              : "100%",
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                    />

                  </div>

                </motion.div>

              ) : (

                <div className="mt-8 flex gap-4">

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={toggleMic}
                    className="
flex
h-16
w-16
items-center
justify-center
rounded-2xl
bg-gradient-to-r
from-blue-600
to-violet-600
text-white
shadow-[0_0_25px_rgba(59,130,246,.35)]
"
                  >
                    {isMicOn ? (
                      <FaMicrophone size={22} />
                    ) : (
                      <FaMicrophoneSlash size={22} />
                    )}
                  </motion.button>

                  <motion.button
                    onClick={submitAnswer}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="
flex-1
rounded-2xl
bg-gradient-to-r
from-blue-600
via-violet-600
to-cyan-500
py-4
font-semibold
text-white
shadow-[0_0_35px_rgba(59,130,246,.35)]
disabled:opacity-50
"
                  >
                    Submit Answer
                  </motion.button>

                </div>

              )

            ) : (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="
mt-8
rounded-3xl
border
border-blue-500/20
bg-blue-500/10
backdrop-blur-xl
p-6
"
              >

                <h3 className="mb-3 text-lg font-semibold text-blue-300">
                  AI Feedback
                </h3>

                <p className="leading-8 text-slate-300">
                  {feedback}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="
mt-6
w-full
rounded-2xl
bg-gradient-to-r
from-blue-600
via-violet-600
to-cyan-500
py-4
font-semibold
text-white
shadow-[0_0_30px_rgba(59,130,246,.30)]
"
                >
                  {currentIndex + 1 === questions.length
                    ? "Finish Interview"
                    : "Next Question"}
                </motion.button>

              </motion.div>

            )}

          </div>
        </div>
      </div>

      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
          >

            <h2 className="text-2xl font-bold text-white">
              Exit Interview?
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Your interview is currently in progress.
              If you leave now, your current progress may not be saved.
            </p>

            <div className="mt-8 flex gap-4">

              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10"
              >
                Continue
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

                  toast.info("Interview exited.");

                  navigate("/");
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
              >
                Exit
              </button>

            </div>

          </motion.div>

        </div>
      )
      }
    </>
  );
}

export default Step2Interview;