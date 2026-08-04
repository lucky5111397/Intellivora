import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";

function GoogleButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="
        mt-7
        flex
        h-14
        w-full
        items-center
        justify-center
        gap-3
        rounded-xl
        bg-white
        font-medium
        text-black
        transition-all
        duration-300
        hover:shadow-xl
      "
    >
      <FcGoogle size={22} />
      Continue with Google
    </motion.button>
  );
}

export default GoogleButton;