import { motion } from "framer-motion";
import { BsFileEarmarkText, BsBullseye, BsCpu } from "react-icons/bs";

const stats = [
    {
        icon: BsFileEarmarkText,
        title: "Resume",
        value: "94%",
        color: "from-blue-500 to-violet-500",
    },
    {
        icon: BsBullseye,
        title: "Accuracy",
        value: "96%",
        color: "from-violet-500 to-fuchsia-500",
    },
    {
        icon: BsCpu,
        title: "AI Score",
        value: "98%",
        color: "from-cyan-400 to-blue-500",
    },
];

function FloatingStats() {
    return (
        <div className="grid grid-cols-3 gap-3 min-w-[540px]">
            {stats.map((item, index) => {
                const Icon = item.icon;

                return (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: [0, -4, 0] }}
                        transition={{
                            delay: index * 0.15,
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                        className="glass p-3 min-w-[170px]"
                    >
                        <div
                            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                        >
                            <Icon className="text-base text-white" />
                        </div>

                        <p className="text-[11px] text-slate-500">
                            {item.title}
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-white">
                            {item.value}
                        </h3>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{
                                    duration: 1.8,
                                    delay: index * 0.25,
                                }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default FloatingStats;