import React, { useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "sonner";


function Pricing() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState("free");
    const [loadingPlan, setLoadingPlan] = useState(null);
    const dispatch = useDispatch()

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "₹0",
            credits: 100,
            description: "Perfect for beginners starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performance Report",
                "Voice Interview Access",
                "Limited History Tracking",
            ],
            default: true,
        },
        {
            id: "basic",
            name: "Starter Pack",
            price: "₹199",
            credits: 500,
            description: "Ideal for regular interview practice and skill improvement.",
            features: [
                "500 AI Interview Credits",
                "Detailed AI Feedback",
                "Performance Analytics",
                "Unlimited Interview History",
            ],
        },
        {
            id: "pro",
            name: "Pro Pack",
            price: "₹499",
            credits: 1500,
            description: "Best value for serious job preparation.",
            features: [
                "1500 AI Interview Credits",
                "Advanced AI Feedback",
                "Skill Trend Analysis",
                "Priority AI Processing",
            ],
            badge: "Best Value",
        },
    ];

    const handlePayment = async (plan) => {
        try {
            setLoadingPlan(plan.id);

            const amount =
                plan.id === "basic"
                    ? 199
                    : plan.id === "pro"
                        ? 499
                        : 0;

            const result = await axios.post(
                ServerUrl + "/api/payment/order",
                {
                    planId: plan.id,
                    amount: amount,
                    credits: plan.credits,
                },
                { withCredentials: true }
            );

            console.log(result.data);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: result.data.amount,
                currency: "INR",
                name: "INTELLIVORA",
                description: `${plan.name} - ${plan.credits} Credits`,
                order_id: result.data.id,

                handler: async function (response) {
                    try {
                        console.log(response);

                        const verifypay = await axios.post(
                            ServerUrl + "/api/payment/verify",
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { withCredentials: true }
                        );

                        dispatch(setUserData(verifypay.data.user));

                        toast.success("Payment successful! Credits added.");
                        navigate("/");
                    } catch (error) {
                        console.log(error);
                        console.error("Payment verification failed:", error?.message || error);
                        toast.error("Payment verification failed!");
                    }
                },
                modal: {
                    ondismiss: function () {
                        toast.info("Payment cancelled.");
                        setLoadingPlan(null);
                    },
                },

                theme: {
                    color: "#10b981",
                },
            };

            if (typeof window.Razorpay !== "function") {
                toast.error("Payment gateway is loading. Please check your connection and try again.");
                setLoadingPlan(null);
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.open();

            setLoadingPlan(null);
        } catch (error) {
            console.error("Payment initiation failed:", error?.message || error);
            setLoadingPlan(null);

            toast.error("Unable to start payment. Please try again.");
        }
    };


    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white pt-4 pb-4 px-6">

            {/* Background Glow */}
            <div className="absolute inset-0">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
                <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-violet-500/10 blur-[140px]" />
                <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}

                <div className="max-w-7xl mx-auto mb-4">

                    <button
                        onClick={() => navigate("/")}
                        className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500 hover:bg-white/10"
                    >
                        <FaArrowLeft className="text-white" />
                    </button>

                    <div className="text-center">

                        <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                            Pricing Plans
                        </span>

                        <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-white leading-tight">
                            Choose the Perfect{" "}
                            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Credit Pack
                            </span>
                        </h1>

                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
                            Unlock AI interview credits, personalized feedback,
                            resume-based interviews and detailed performance reports.
                        </p>

                    </div>

                </div>

                {/* Cards */}
                <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={!plan.default && { scale: 1.03 }}
                                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                                className={`
relative
overflow-hidden
rounded-3xl
border
p-5
transition-all
duration-300
cursor-pointer

${isSelected
                                        ? "border-blue-500/60 bg-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.25)] scale-[1.02]"
                                        : "border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500/30 hover:-translate-y-2"
                                    }

${plan.default ? "cursor-default" : ""}
`}                       >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Default Tag */}
                                {plan.default && (
                                    <div className="absolute top-6 right-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 dark:text-gray-200 text-xs px-3 py-1 rounded-full">
                                        Default
                                    </div>
                                )}

                                {/* Plan Name */}
                                <h3 className="text-xl font-bold text-white">
                                    {plan.name}
                                </h3>

                                {/* Price */}
                                <div className="mt-4">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                        {plan.price}
                                    </span>

                                    <p className="mt-2 text-slate-300">
                                        {plan.credits} Credits
                                    </p>
                                </div>

                                {/* Description */}
                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    {plan.description}
                                </p>

                                {/* Features */}
                                <div className="mt-6 space-y-3 text-left">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <FaCheckCircle className="text-emerald-500 text-sm" />
                                            <span className="text-gray-700 dark:text-gray-200 text-sm">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {!plan.default &&
                                    <button
                                        disabled={loadingPlan === plan.id}
                                        onClick={() => {
                                            if (!isSelected) {
                                                setSelectedPlan(plan.id);
                                            } else {
                                                handlePayment(plan);
                                            }
                                        }}
                                        className={`w-full mt-8 py-3 rounded-xl font-semibold transition-all duration-300 ${isSelected
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {
                                            loadingPlan === plan.id
                                                ? "Processing..."
                                                : isSelected
                                                    ? "Proceed to Pay"
                                                    : "Select Plan"
                                        }
                                    </button>
                                }

                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Pricing;