import { useState } from "react";
import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";

function OTPInput({ onBack, onVerify }) {
    const [otp, setOtp] = useState("");

    return (
        <motion.div
            key="otp"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
        >
            <button
                onClick={onBack}
                className="mb-5 text-indigo-400 hover:text-indigo-300"
            >
                ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">
                Verify OTP
            </h2>

            <p className="mt-2 text-sm text-slate-400">
                Enter the 6 digit verification code.
            </p>

            <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onVerify(otp);
                    }
                }}
                placeholder="123456"
                className="
    mt-6
    h-16
    w-full
    rounded-2xl
    border
    border-white/10
    bg-white/5
    px-6
    text-center
    text-4xl
    font-semibold
    tracking-[10px]
    text-white
    outline-none
    backdrop-blur-xl
    transition-all
    duration-300
    placeholder:text-slate-500
    focus:border-cyan-400/50
    focus:bg-white/10
    focus:shadow-[0_0_25px_rgba(34,211,238,0.15)]
  "
            />

            <button
                onClick={() => onVerify(otp)}
                className="
    group
    mt-6
    relative
    flex
    h-16
    w-full
    items-center
    justify-center
    overflow-hidden
    rounded-2xl
    bg-gradient-to-r
    from-indigo-600
    via-violet-600
    to-cyan-500
    text-white
    text-lg
    font-semibold
    transition-all
    duration-300
    hover:scale-[1.02]
    hover:shadow-[0_0_35px_rgba(99,102,241,0.35)]
    active:scale-[0.98]
  "
            >
                <span className="relative z-10 flex items-center gap-3">
                    Verify OTP
                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>

                <div
                    className="
      absolute
      inset-0
      opacity-0
      bg-white/10
      transition-opacity
      duration-300
      group-hover:opacity-100
    "
                />
            </button>
            <div className="mt-5 text-center">
                <p className="text-sm text-slate-400">
                    Didn't receive the OTP?
                </p>

                <button className="mt-1 text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                    Resend OTP
                </button>
            </div>
        </motion.div>
    );
}

export default OTPInput;