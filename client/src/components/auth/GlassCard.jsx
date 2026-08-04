import { motion } from "motion/react";

function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`
        w-full
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-2xl
        p-7
        shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;