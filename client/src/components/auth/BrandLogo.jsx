import { motion } from "framer-motion";
import logo from "../../assets/intellivora-logo-white.png";

function BrandLogo({ small = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center"
    >
      <img
        src={logo}
        alt="INTELLIVORA"
        className={`
  ${small
            ? "w-44"
            : "w-[260px] lg:w-[300px] xl:w-[340px]"
          }
  h-auto
  object-contain
  select-none
`}
        draggable="false"
      />
    </motion.div>
  );
}

export default BrandLogo;