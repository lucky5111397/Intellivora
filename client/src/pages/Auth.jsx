import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BsCheckCircleFill,
  BsShieldLockFill,
  BsGraphUpArrow,
  BsFileEarmarkCheckFill,
} from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice";
import BrandLogo from "../components/auth/BrandLogo";
import GlassCard from "../components/auth/GlassCard";
import GoogleButton from "../components/auth/GoogleButton";
import AuthDivider from "../components/auth/AuthDivider";
import AuroraBackground from "../components/auth/AuroraBackground";
import FloatingStats from "../components/auth/FloatingStats";
import { toast } from "sonner";
import PhoneLogin from "../components/auth/PhoneLogin";
import OTPInput from "../components/auth/OTPInput";
import {
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

function Auth({ isModel = false }) {
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authMode, setAuthMode] = useState("google");
  const [mobile, setMobile] = useState("");
  const dispatch = useDispatch()
  const navigate = useNavigate();

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    try {
      console.log("Button clicked");

      const response = await signInWithPopup(auth, provider);
      console.log("Firebase Login Success:", response);

      const user = response.user;


      console.log("Calling Backend...");

      const allowedEmails =
        import.meta.env.VITE_ALLOWED_EMAILS?.split(",").map((email) => email.trim()) || [];

      if (!allowedEmails.includes(user.email)) {
        await signOut(auth);
        toast.error("Access Denied. You are not authorized to use this application.");
        return;
      }

      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        {
          name: user.displayName,
          email: user.email,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Backend Response:", result.data);

      dispatch(setUserData(result.data));

      toast.success("Login Successful");

      navigate("/");
    } catch (error) {
      console.log(error);
      console.error("Google authentication error:", error?.message || error);

      dispatch(setUserData(null));

      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Login cancelled.");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const sendOTP = async () => {
    try {
      if (mobile.length !== 10) {
        toast.error("Enter a valid 10 digit mobile number");
        return;
      }

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      await window.recaptchaVerifier.render();

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        `+91${mobile}`,
        appVerifier
      );

      setConfirmationResult(result);

      toast.success("OTP Sent Successfully");

      setAuthMode("verify");
    } catch (error) {
      console.log(error);
      console.error("Failed to send OTP:", error?.message || error);
      toast.error("Failed to send OTP");
    }
  };
  const verifyOTP = async (otp) => {
    try {
      if (!confirmationResult) {
        toast.error("Please request OTP first.");
        return;
      }

      const userCredential = await confirmationResult.confirm(otp);
      const firebaseUser = userCredential.user;

      console.log("Firebase phone auth success:", firebaseUser);

      // Call backend to create/find user and get JWT token
      const result = await axios.post(
        ServerUrl + "/api/auth/phone",
        {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || firebaseUser.phoneNumber,
          phone: firebaseUser.phoneNumber,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Backend phone auth response:", result.data);

      dispatch(setUserData(result.data));

      toast.success("Login Successful");

      navigate("/");
    } catch (error) {
      console.log(error);
      console.error("Phone verification error:", error?.message || error);
      if (error.response?.status === 403) {
        toast.error("Access Denied. You are not authorized to use this application.");
      } else if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center px-6
  ${isModel ? "min-h-[650px]" : "h-screen"}
  bg-[#050816]`}
    >

      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 w-full ${isModel ? "max-w-5xl" : "max-w-7xl"
          }`}
      >
        <div
          className={
            isModel
              ? "flex justify-center items-center"
              : "grid lg:grid-cols-2 gap-20 items-center"
          }
        >

          {/* LEFT SIDE */}

          {!isModel && (

            <div
              className="hidden lg:flex flex-col justify-start py-6">

              <BrandLogo />

              <div className="mt-0">

                <h1 className="text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-white max-w-xl">

                  Ace Every Interview

                  with AI Intelligence

                </h1>

                <p className="mt-4 max-w-md text-base leading-6 text-slate-400">

                  Practice realistic AI interviews, receive instant feedback, improve your resume, and build confidence before your next interview.

                </p>

              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="flex items-center gap-3 text-slate-300">
                  <BsCheckCircleFill className="text-indigo-400" />
                  AI Mock Interviews
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <BsGraphUpArrow className="text-indigo-400" />
                  ATS Score
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <BsShieldLockFill className="text-indigo-400" />
                  Secure Authentication
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <BsFileEarmarkCheckFill className="text-indigo-400" />
                  Detailed AI Reports
                </div>

              </div>

              <div className="mt-5 max-w-2xl">
                <FloatingStats />
              </div>

            </div>
          )}


          {/* RIGHT SIDE */}

          <div className="flex justify-center">

            <GlassCard className={isModel ? "max-w-lg" : "max-w-lg"}>

              {/* Mobile Logo */}
              <div className="lg:hidden mb-8">
                <BrandLogo small />
              </div>

              <AnimatePresence mode="wait">

                {authMode === "google" && (
                  <motion.div
                    key="google"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                  >

                    <div className="text-center">

                      <h2 className="text-2xl font-bold text-white">
                        Welcome Back
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Continue your AI interview journey.
                      </p>

                    </div>

                    <GoogleButton onClick={handleGoogleAuth} />

                    <AuthDivider text="OR" />
                    <button
                      onClick={() => setAuthMode("otp")}
                      className="
    group
    relative
    mt-5
    flex
    h-16
    w-full
    items-center
    justify-between
    overflow-hidden
    rounded-2xl
    border
    border-indigo-500/20
    bg-gradient-to-r
    from-indigo-500/10
    via-violet-500/10
    to-cyan-500/10
    px-5
    transition-all
    duration-300
    hover:border-cyan-400/50
    hover:from-indigo-500/20
    hover:via-violet-500/20
    hover:to-cyan-500/20
    hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]
    active:scale-[0.98]
  "
                    >
                      {/* Glow Effect */}
                      <div
                        className="
      absolute
      inset-0
      opacity-0
      transition-opacity
      duration-300
      group-hover:opacity-100
      bg-gradient-to-r
      from-indigo-500/5
      via-cyan-500/5
      to-indigo-500/5
    "
                      />

                      {/* Left Side */}
                      <div className="relative z-10 flex items-center gap-4">
                        <div
                          className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-indigo-500/20
        bg-indigo-500/15
        transition-all
        duration-300
        group-hover:bg-indigo-500/25
        group-hover:rotate-6
      "
                        >
                          <FaPhoneAlt className="text-cyan-400 text-lg" />
                        </div>

                        <div className="text-left">
                          <p className="text-[16px] font-semibold text-white">
                            Continue with OTP
                          </p>

                          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                            Secure Phone Verification
                          </p>
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <HiArrowRight
                        className="
      relative
      z-10
      text-2xl
      text-cyan-400
      opacity-70
      transition-all
      duration-300
      group-hover:translate-x-1
      group-hover:opacity-100
    "
                      />
                    </button>

                    <div className="mt-8 space-y-4">

                      <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5">
                        <BsShieldLockFill className="text-indigo-400 text-base" />
                        <div>
                          <p className="text-[15px] text-white font-medium">
                            Protected Authentication
                          </p>
                          <p className="text-[15px] text-slate-400">
                            Powered by Firebase & Secure Backend
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
                        <BsGraphUpArrow className="text-indigo-400 text-lg" />
                        <div>
                          <p className="text-sm text-white font-medium">
                            AI Career Intelligence
                          </p>
                          <p className="text-xs text-slate-400">
                            Personalized interviews and detailed reports.
                          </p>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}

                {authMode === "otp" && (
                  <PhoneLogin
                    mobile={mobile}
                    setMobile={setMobile}
                    onBack={() => setAuthMode("google")}
                    onSendOTP={sendOTP}
                  />
                )}
                {authMode === "verify" && (
                  <OTPInput
                    onBack={() => setAuthMode("otp")}
                    onVerify={verifyOTP}
                  />
                )}

              </AnimatePresence>

            </GlassCard>

          </div>

        </div >

      </motion.div >

    </div >
  );
}

export default Auth;