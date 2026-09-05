import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { FaCoins } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import logoDark from "../assets/logo-dark.png";
import { toast } from "sonner";
function Navbar() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", {
                withCredentials: true,
            });

            dispatch(setUserData(null));
            setShowCreditPopup(false);
            setShowUserPopup(false);

            toast.success("Logged out successfully");

            navigate("/");
        } catch (error) {
            console.log(error);
            console.error("Logout error:", error?.message || error);

            toast.error("Failed to logout. Please try again.");
        }
    };

    return (
        <div className="sticky top-0 z-50 flex justify-center px-4 pt-4 backdrop-blur-xl">
            {/* Backdrop dismissal for popups */}
            {(showCreditPopup || showUserPopup) && (
                <div
                    className="fixed inset-0 z-[99990]"
                    onClick={() => {
                        setShowCreditPopup(false);
                        setShowUserPopup(false);
                    }}
                />
            )}

            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-7xl
glass
px-6
py-3
flex
items-center
justify-between">
                {/* Logo */}
                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 cursor-pointer"
                >
                    <img
                        src={logoDark}
                        alt="Intellivora"
                        className="h-10 w-10 object-contain"
                    />

                    <h1 className="hidden md:block text-lg font-bold tracking-wide text-white">
                        Intellivora
                    </h1>
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl px-2 py-1">
                    {[
                        { name: "Aptitude", path: "/aptitude" },
                        { name: "Interview", path: "/interview" },
                        { name: "ATS Resume", path: "/resume" },
                        { name: "Pricing", path: "/pricing" },
                        { name: "History", path: "/history" },
                    ].map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-4">


                    {/* Credit Button */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (!userData) {
                                    navigate("/auth");
                                    return;
                                }
                                setShowCreditPopup(!showCreditPopup);
                                setShowUserPopup(false);
                            }}
                            className="
flex
items-center
gap-2
px-5
py-2.5
rounded-2xl
bg-white/5
border
border-yellow-400/20
text-white
backdrop-blur-xl
hover:bg-white/10
hover:border-yellow-400/40
hover:-translate-y-0.5
transition-all
duration-300
"
                        >
                            <FaCoins size={18} className="text-yellow-400" />

                            <span className="font-semibold text-white">
                                {userData?.credits || 0}
                            </span>

                            <span className="hidden md:inline text-sm text-slate-400">
                                Credits
                            </span>
                        </button>

                        {showCreditPopup && (
                            <div
                                className="
absolute
top-16
right-0
w-64
glass
p-5
z-[99999]
"             >
                                <div className="mb-4">
                                    <p className="text-white font-semibold">
                                        {userData?.credits || 0} Credits Remaining
                                    </p>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Buy more credits to continue practicing AI interviews.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="
w-full
rounded-xl
bg-gradient-to-r
from-indigo-600
to-violet-600
py-3
text-sm
font-semibold
text-white
hover:scale-[1.02]
transition-all
duration-300
"
                                >
                                    Buy more credits
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Button */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (!userData) {
                                    navigate("/auth");
                                    return;
                                }
                                setShowUserPopup(!showUserPopup);
                                setShowCreditPopup(false);
                            }}
                            className="
w-11
h-11
rounded-full
border
border-white/15
shadow-lg
shadow-[0_8px_25px_rgba(124,58,237,0.45)]
bg-gradient-to-br
from-blue-600
to-violet-600
text-white
flex
items-center
justify-center
text-lg
font-bold
tracking-wide
shadow-lg
transition-all
duration-300
hover:scale-105
hover:shadow-[0_10px_35px_rgba(124,58,237,0.65)]
after:absolute
after:inset-0
after:rounded-full
after:ring-2
after:ring-violet-400/20
"      >
                            {userData?.name
                                ? userData.name.slice(0, 1).toUpperCase()
                                : <FaUserAstronaut size={16} />}
                        </button>

                        {showUserPopup && (
                            <div
                                className="
absolute
top-16
right-0
w-64
rounded-2xl
border
border-white/10
shadow-2xl
glass
p-4
z-[99999]
"
                            >
                                <div className="pb-3 border-b border-white/10 mb-3">
                                    <p className="text-white font-semibold text-base">
                                        {userData?.name}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        {userData?.credits || 0} Credits Available
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/history")}
                                    className="
w-full
text-left
text-sm
py-2.5
px-3
rounded-xl
text-slate-300
hover:bg-white/5
hover:text-blue-400
transition-all
duration-300
"
                                >
                                    Interview History
                                    Activity History
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="
w-full
mt-2
text-left
text-sm
py-2.5
px-3
rounded-xl
flex
items-center
gap-2
text-red-400
hover:bg-red-500/10
hover:text-red-300
transition-all
duration-300
"
                                >
                                    <HiOutlineLogout size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </motion.div>


        </div >
    );
}

export default Navbar;