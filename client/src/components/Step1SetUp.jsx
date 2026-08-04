import React from "react";
import { motion } from "motion/react";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaBolt,
  FaStar,
  FaCrown,
  FaCheckCircle,
  FaClock,
  FaCoins,
} from "react-icons/fa";
import { useState } from "react";
import axios from "axios"
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "sonner";
import { ServerUrl } from "../App";

// Interview Setup Form
function Step1SetUp({ onStart }) {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch()
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [interviewPlan, setInterviewPlan] = useState("medium");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const interviewPlans = [
    {
      id: "short",
      title: "Quick Practice",
      icon: <FaBolt className="text-yellow-500 text-xl" />,
      questions: 10,
      duration: "10 min",
      credits: 100,
      description: "Fast revision before interviews",
    },
    {
      id: "medium",
      title: "Standard Interview",
      icon: <FaStar className="text-green-500 text-xl" />,
      questions: 15,
      duration: "20 min",
      credits: 150,
      description: "Balanced technical assessment",
      recommended: true,
    },
    {
      id: "long",
      title: "Full Mock Assessment",
      icon: <FaCrown className="text-purple-500 text-xl" />,
      questions: 25,
      duration: "35 min",
      credits: 250,
      description: "Complete interview simulation",
    },
  ];

  async function handleUploadResume() {
    if (!resumeFile) {
      toast.warning("Please upload your resume first.");
      return;
    }

    if (analyzing) return;

    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { withCredentials: true }
      );

      console.log(result.data);
      console.log("API Response:", result.data);
      console.log("Questions:", result.data.questions);
      console.log("InterviewId:", result.data.interviewId);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
      toast.success("Resume analyzed successfully!");
      setAnalyzing(false);
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log(error);

      setAnalyzing(false);

      toast.error("Failed to analyze resume. Please try again.");
    }
  }

  const handleStart = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        {
          role,
          experience,
          mode,
          interviewPlan,
          resumeText,
          projects,
          skills,
          cameraEnabled,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      console.log("Questions Length:", result.data.questions.length);
      console.log(result.data.questions);

      console.log("Questions:", result.data.questions);
      console.log("InterviewId:", result.data.interviewId);

      console.log("onStart chalne wala hai");

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          })
        );
      }

      setLoading(false);
      toast.success("Interview is ready!");
      onStart(result.data);
      console.log("onStart ho gaya");
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log(error);

      setLoading(false);

      toast.error("Failed to generate interview. Please try again.");
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="
min-h-screen
flex
items-center
justify-center
bg-transparent
px-6
py-10
"
    >
      <div className="
w-full
max-w-6xl
rounded-3xl
border
border-white/10
bg-[#0B1220]
shadow-[0_20px_80px_rgba(0,0,0,0.45)]
grid
md:grid-cols-2
overflow-hidden
">

        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0B1220] to-[#111827] p-10 lg:p-12 flex flex-col justify-center border-r border-white/10"
        >

          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-violet-500/10 blur-[100px]" />

          <div className="relative z-10">

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-blue-300">
              AI Powered Interview
            </span>

            <h2 className="mt-6 text-4xl font-bold leading-tight text-white">
              Prepare Like It's
              <span className="block gradient-text mt-2">
                Your Real Interview
              </span>
            </h2>

            <p className="mt-5 max-w-md text-slate-400 leading-7">
              Practice realistic AI interviews, receive instant feedback,
              improve communication skills and build confidence before your
              next opportunity.
            </p>

            <div className="mt-10 space-y-4">

              {[
                {
                  icon: <FaUserTie className="text-blue-400 text-lg" />,
                  title: "Choose Your Role",
                  desc: "Select role and experience level.",
                },
                {
                  icon: <FaMicrophoneAlt className="text-violet-400 text-lg" />,
                  title: "AI Voice Interview",
                  desc: "Realistic interview conversation.",
                },
                {
                  icon: <FaChartLine className="text-cyan-400 text-lg" />,
                  title: "Detailed AI Report",
                  desc: "Get instant performance insights.",
                },
              ].map((item, index) => (

                <motion.div
                  key={index}
                  whileHover={{ x: 6 }}
                  className="glass flex items-center gap-4 p-4"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                    {item.icon}
                  </div>

                  <div>
                    <h4 className="font-semibold text-white">
                      {item.title}
                    </h4>

                    <p className="text-sm text-slate-400">
                      {item.desc}
                    </p>
                  </div>

                </motion.div>

              ))}

            </div>

          </div>

        </motion.div>

        <motion.div
          transition={{ duration: 0.7 }}
          className="bg-[#0B1220] p-8 lg:p-10"
        >
          <div className="mb-8 flex items-start justify-between">

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
                Interview Setup
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                Configure Your Interview
              </h2>

              <p className="mt-2 text-slate-400">
                Select your preferences before starting your AI interview.
              </p>
            </div>

          </div>

          <div className="space-y-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Target Role
            </label>

            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-slate-500" />

              <input
                type="text"
                placeholder="Enter role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="
w-full
rounded-xl
border
border-white/10
bg-white/5
py-3
pl-12
pr-4
text-white
placeholder:text-slate-500
outline-none
transition
focus:border-blue-500
focus:bg-white/10
"
              />
            </div>

            <label className="mt-5 mb-2 block text-sm font-medium text-slate-300">
              Experience
            </label>

            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-slate-500" />

              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="
w-full
rounded-xl
border
border-white/10
bg-white/5
py-3
pl-12
pr-4
text-white
placeholder:text-slate-500
outline-none
transition
focus:border-blue-500
focus:bg-white/10
"
              />
            </div>

            <label className="mt-5 mb-2 block text-sm font-medium text-slate-300">
              Interview Type
            </label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="
w-full
rounded-xl
border
border-white/10
bg-[#111827]
px-4
py-3
text-white
outline-none
focus:border-blue-500
"
            >
              <option value="Technical" className="bg-[#111827] text-white">
                Technical Interview
              </option>

              <option value="HR" className="bg-[#111827] text-white">
                HR Interview
              </option>
            </select>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">

              <h3 className="text-lg font-semibold text-white">
                Interview Preferences
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Configure optional interview settings.
              </p>

              <div className="mt-5 flex items-center justify-between">

                <div>
                  <p className="font-medium text-white">
                    🎥 Camera
                  </p>

                  <p className="text-sm text-slate-400">
                    Recommended for eye-contact analysis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`relative h-7 w-14 rounded-full transition-all ${cameraEnabled
                      ? "bg-blue-600"
                      : "bg-white/10"
                    }`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${cameraEnabled
                        ? "left-8"
                        : "left-1"
                      }`}
                  />
                </button>

              </div>

            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Your Interview Plan
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the interview experience that best matches your preparation goal.
              </p>

              <div className="space-y-3">
                {interviewPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setInterviewPlan(plan.id)}
                    className={`relative cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${interviewPlan === plan.id
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          {plan.icon}

                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              {plan.title}
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              {plan.description}
                            </p>

                            {plan.recommended && (
                              <span className="mt-2 inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-green-500" />
                            {plan.questions} Questions
                          </span>

                          <span className="flex items-center gap-1">
                            <FaClock />
                            {plan.duration}
                          </span>

                          <span className="flex items-center gap-1">
                            <FaCoins className="text-yellow-500" />
                            {plan.credits} Credits
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${interviewPlan === plan.id
                          ? "border-blue-500 bg-blue-500"
                          : "border-white/20"
                          }`}
                      >
                        {interviewPlan === plan.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="
glass
cursor-pointer
rounded-2xl
border-2
border-dashed
border-white/10
px-6
py-8
text-center
transition-all
duration-300
hover:border-blue-500/40
hover:bg-white/10
">
                <FaFileUpload className="mx-auto mb-4 text-5xl text-blue-400" />

                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])} />

                <p className="font-medium text-white">
                  {resumeFile
                    ? resumeFile.name
                    : "Click to upload resume (Optional)"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  PDF format • Max 5MB • AI analyzes skills & projects
                </p>
                {resumeFile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume()
                    }}
                    className="
mt-5
rounded-xl
bg-gradient-to-r
from-blue-600
to-violet-600
px-6
py-3
font-medium
text-white
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]
">
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}

              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="
glass
space-y-5
rounded-2xl
p-6
">
                <h3 className="text-lg font-semibold text-white">Resume Analysis Result</h3>

                {projects.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-blue-400">
                      projects:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                )}

                {skills.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-blue-400">
                      skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className="
rounded-full
border
border-blue-500/20
bg-blue-500/10
px-3
py-1
text-sm
text-blue-300
">{s}</span>
                      ))}
                    </div>
                  </div>

                )}

              </motion.div>
            )}



            <motion.button
              onClick={handleStart}
              disabled={!role || !experience}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="
mt-6
w-full
rounded-2xl
bg-gradient-to-r
from-blue-600
via-violet-600
to-blue-500
py-4
text-base
font-semibold
text-white
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]
disabled:cursor-not-allowed
disabled:opacity-50
disabled:hover:scale-100
">
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  "Preparing Interview..."
                ) : (
                  <>
                    <FaBolt />
                    Start AI Interview
                  </>
                )}
              </div>
            </motion.button>

          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default Step1SetUp;