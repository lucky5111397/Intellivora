import { motion } from "motion/react";
import { FaPhoneAlt, FaArrowRight } from "react-icons/fa";

function PhoneLogin({
    mobile,
    setMobile,
    onBack,
    onSendOTP,
}) {
    return (
        <motion.div
            key="phone-login"
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
                Continue with OTP
            </h2>

            <p className="mt-2 text-sm text-slate-400">
                Enter your mobile number to receive an OTP.
            </p>

            <div
                className="
    mt-6
    flex
    h-16
    items-center
    gap-4
    rounded-2xl
    border
    border-white/10
    bg-white/5
    px-5
    backdrop-blur-xl
    transition-all
    duration-300
    focus-within:border-cyan-400/50
    focus-within:bg-white/10
    focus-within:shadow-[0_0_25px_rgba(34,211,238,0.12)]
  "
            >
                <div
                    className="
      flex
      h-11
      w-11
      items-center
      justify-center
      rounded-xl
      bg-indigo-500/15
      border
      border-indigo-500/20
    "
                >
                    <FaPhoneAlt className="text-cyan-400 text-lg" />
                </div>

                <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSendOTP();
                        }
                    }}
                    placeholder="Enter mobile number"
                    className="
      flex-1
      bg-transparent
      text-white
      text-lg
      outline-none
      placeholder:text-slate-500
    "
                />
            </div>

            <button
                onClick={onSendOTP}
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
    font-semibold
    text-lg
    transition-all
    duration-300
    hover:scale-[1.02]
    hover:shadow-[0_0_35px_rgba(99,102,241,0.35)]
    active:scale-[0.98]
  "
            >
                <span className="relative z-10 flex items-center gap-3">
                    Send OTP
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

            {/* Firebase Invisible reCAPTCHA */}
            <div id="recaptcha-container"></div>
        </motion.div>
    );
}

export default PhoneLogin;