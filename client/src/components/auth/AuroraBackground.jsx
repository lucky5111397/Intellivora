import { motion } from "framer-motion";

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Top Left */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-44 -left-44 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]"
      />

      {/* Bottom Right */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-44 -right-44 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-[120px]"
      />

      {/* Center Glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]"
      />
    </div>
  );
}

export default AuroraBackground;