import React, { useState } from "react";
import axios from "axios";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "sonner";
import { PRICING_PLANS } from "../config/pricingPlans";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { BackButton } from "../components/ui";

function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state) => state.user);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const plans = PRICING_PLANS;

  const handlePayment = async (plan) => {
    if (!userData) {
      navigate("/auth", { state: { from: location } });
      return;
    }

    if (plan.id === "free") {
      toast.info("100 introductory credits are automatically credited upon account registration.");
      return;
    }

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

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "INTELLIVORA",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          try {
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
          color: "#2563EB",
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
    <div className="relative min-h-screen bg-[#06080B] text-[#F1F5F9] py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <AmbientBackground variant="subtle" />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-6">
            <BackButton to="/" fallback="/" />
          </div>

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              Transparent Credit Allocation
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Power your preparation with flexible credit packs
            </h1>

            <p className="text-sm leading-relaxed text-[#94A3B8]">
              One universal credit balance across AI Mock Interviews, Aptitude diagnostics, Group Discussions, and ATS resume audits.
            </p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isDefault = Boolean(plan.default);

            return (
              <motion.div
                key={plan.id}
                whileHover={!isDefault ? { y: -3 } : undefined}
                onClick={() => !isDefault && setSelectedPlan(plan.id)}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                  isSelected
                    ? "border-[#2563EB] bg-[#0E131F] shadow-xl shadow-[#2563EB]/10 ring-1 ring-[#2563EB]/40"
                    : "border-[#1E293B] bg-[#0A0D14] hover:border-[#1E293B]/80 hover:bg-[#0E131F]"
                } ${isDefault ? "cursor-default" : "cursor-pointer"}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-[#2563EB] text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                {isDefault && (
                  <div className="absolute top-4 right-4 bg-[#1E293B] text-[#94A3B8] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Included
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white tabular-nums font-mono">
                      {plan.price}
                    </span>
                    {plan.price !== "Free" && (
                      <span className="text-xs text-[#64748B]">one-time</span>
                    )}
                  </div>

                  <p className="mt-1 text-xs font-semibold text-[#38BDF8] tabular-nums font-mono">
                    {plan.credits} Credits Included
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
                    {plan.description}
                  </p>

                  <div className="my-6 border-t border-[#1E293B]" />

                  {/* Features List */}
                  <div className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#94A3B8]">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  {!isDefault ? (
                    <button
                      type="button"
                      disabled={loadingPlan === plan.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          setSelectedPlan(plan.id);
                        } else {
                          handlePayment(plan);
                        }
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#2563EB]/20"
                          : "bg-[#141B2D] hover:bg-[#1A233A] text-white border border-[#1E293B]"
                      }`}
                    >
                      {loadingPlan === plan.id
                        ? "Processing..."
                        : isSelected
                        ? "Proceed to Pay"
                        : "Select Pack"}
                    </button>
                  ) : (
                    <div className="text-center text-[11px] text-[#64748B] py-2">
                      Auto-credited at registration
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Support Note */}
        <div className="mt-12 text-center flex items-center justify-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Secured via Razorpay · Instant credit balance replenishment · No recurring subscriptions</span>
        </div>
      </div>
    </div>
  );
}

export default Pricing;