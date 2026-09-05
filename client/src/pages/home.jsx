import React from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsBarChart,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { ArrowRight, FileText, Clock, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

// Main Home Component
function Home() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate()
  return (
    <div className="min-h-screen text-white">
      <Navbar />

      <div className="relative overflow-hidden flex-1 px-6 pt-12 pb-8">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-500/15 blur-[120px]" />
          <div className="absolute top-32 -right-16 h-80 w-80 rounded-full bg-violet-500/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <div className="flex justify-center mb-6">
            <div className="glass px-3 py-1.5 text-xs flex items-center gap-2 text-slate-400">
              <HiSparkles
                size={12}
                className="text-blue-400"
              />
              🚀 AI-Powered Career Intelligence Platform
            </div>
          </div>
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto text-white"
            >
              Ace Every Interview
              With AI{" "}
              <span className="block mt-3">
                <span
                  className="
inline-flex
items-center
rounded-2xl
border
border-blue-500/20
bg-white/5
backdrop-blur-xl
px-8
py-2
text-5xl
md:text-6xl
font-extrabold
tracking-wide
bg-gradient-to-r
from-blue-400
via-violet-400
to-cyan-400
bg-clip-text
text-transparent
shadow-[0_0_40px_rgba(59,130,246,0.20)]
"
                >
                  INTELLIVORA
                </span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mt-4 max-w-lg mx-auto text-sm leading-6 text-slate-400"
            >
              Practice realistic AI interviews, improve your resume, receive instant feedback, and build confidence before your dream job interview.
            </motion.p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.button
                onClick={() => {
                  if (!userData) {
                    navigate("/auth");
                    return;
                  }
                  navigate("/interview");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex h-14 w-full max-w-[260px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] px-6 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[0_20px_60px_rgba(79,70,229,0.22)]"
              >
                <ArrowRight size={18} className="text-white transition-transform duration-300 group-hover:translate-x-1" />
                Start AI Interview
              </motion.button>
              <motion.button
                onClick={() => navigate("/resume")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex h-14 w-full max-w-[290px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] px-6 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[0_20px_60px_rgba(124,58,237,0.20)]"
              >
                <div className="inline-flex items-center gap-2">
                  <FileText size={18} className="text-white" />
                  <span className="font-semibold whitespace-nowrap">
                    ATS Score Checker
                  </span>


                </div>


              </motion.button>
              <motion.button
                onClick={() => {
                  if (!userData) {
                    navigate("/auth");
                    return;
                  }
                  navigate("/history");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex h-14 w-full max-w-[260px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#334155] px-6 text-sm font-semibold text-white shadow transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[0_18px_50px_rgba(28,36,48,0.18)]"
              >
                <Clock size={18} className="text-white" />
                Interview History
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("/aptitude")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex h-14 w-full max-w-[260px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#334155] px-6 text-sm font-semibold text-white shadow transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[0_18px_50px_rgba(28,36,48,0.18)]"
              >
                <Calculator size={18} className="text-white" />
                Aptitude
              </motion.button>
            </div>
          </div>
          <div className="text-center mb-10">
            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-semibold">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white">
              Get Interview Ready in{" "}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>

            <p className="mt-4 max-w-xl mx-auto text-slate-400 text-base leading-7">
              From resume analysis to AI-powered mock interviews and detailed performance reports —
              everything you need to prepare smarter.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: <BsRobot size={24} />,
                step: "GET STARTED",
                title: "Create Your Interview",
                desc: "Select your interview type, target role and upload your resume to generate a personalized AI interview experience.",
              },
              {
                icon: <BsMic size={24} />,
                step: "PRACTICE",
                title: "Complete AI Interview",
                desc: "Answer AI-generated questions using voice or text while receiving a realistic interview simulation with time limits.",
              },
              {
                icon: <BsBarChart size={24} />,
                step: "IMPROVE",
                title: "Analyze & Improve",
                desc: "Receive detailed AI feedback, performance scores, downloadable reports and track your interview progress over time.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className="glass p-5 text-center"
              >
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400">
                  {item.icon}
                </div>

                <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
                  {item.step}
                </span>

                <h3 className="mt-3 text-lg font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400 leading-6">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>


          <div className="mt-32 mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Why Choose{" "}
              <span className="gradient-text">Intellivora?</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  image: evalImg,
                  title: "AI Answer Evaluation",
                  desc: "Get detailed scores for communication, technical accuracy and confidence after every interview.",
                },
                {
                  image: resumeImg,
                  title: "Resume Based Interview",
                  desc: "AI creates personalized interview questions directly from your uploaded resume.",
                },
                {
                  image: pdfImg,
                  title: "Download PDF Report",
                  desc: "Download a professional report with strengths, weaknesses and improvement suggestions.",
                },
                {
                  image: analyticsImg,
                  title: "Interview History & Analytics",
                  desc: "Track your overall progress, previous interviews and performance trends over time.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glass p-8"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex justify-center md:w-1/3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-contain"
                      />
                    </div>

                    <div className="md:w-2/3 text-center md:text-left">
                      <h3 className=" font-semibold text-white mb-3">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm text-slate-400 leading-6">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center mb-16"
            >
              Interview <span className="gradient-text">Modes</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  img: hrImg,
                  title: "HR Interview Mode",
                  desc: "Practice behavioral, HR and communication interviews with realistic AI conversations.",
                },
                {
                  img: techImg,
                  title: "Technical Interview",
                  desc: "Prepare for coding, projects and technical discussions generated according to your role.",
                },
                {
                  img: confidenceImg,
                  title: "Confidence Analysis",
                  desc: "AI analyzes confidence, clarity, fluency and speaking style after every interview.",
                },
                {
                  img: creditImg,
                  title: "Credits System",
                  desc: "Use credits to unlock premium AI interview sessions and advanced reports.",
                },
              ].map((mode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="glass p-6"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-2/3 text-center md:text-left">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {mode.title}
                      </h3>

                      <p className="mt-3 text-sm text-slate-400 leading-6">
                        {mode.desc}
                      </p>
                    </div>

                    <div className="flex justify-center md:w-1/3">
                      <img
                        src={mode.img}
                        alt={mode.title}
                        className="w-28 h-28 object-contain transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

            </div>
          </div>


        </div>
      </div>

      <Footer />

    </div >
  );
}

export default Home;