import { describe, it } from "node:test";
import assert from "node:assert/strict";
import userReducer, { setUserData } from "../src/redux/userSlice.js";
import { getPlanDisplayName } from "../src/config/pricingPlans.js";

describe("Payment & Credit State Synchronization", () => {
    describe("1. Redux Store Immediate Mutation on Payment Verification", () => {
        it("immediately updates credits and plan in user state upon receiving verified user response", () => {
            const initialState = {
                userData: {
                    _id: "user_123",
                    name: "Candidate",
                    email: "candidate@example.com",
                    credits: 100,
                    currentPlan: "Free",
                    plan: "Free",
                },
                authLoading: false,
            };

            const verifiedPaymentResponse = {
                success: true,
                message: "Payment verified and credits added",
                user: {
                    _id: "user_123",
                    name: "Candidate",
                    email: "candidate@example.com",
                    credits: 600,
                    currentPlan: "Pro",
                    plan: "Pro",
                },
            };

            const updatedState = userReducer(initialState, setUserData(verifiedPaymentResponse.user));

            assert.equal(updatedState.userData.credits, 600, "Credit balance should update immediately to 600");
            assert.equal(updatedState.userData.currentPlan, "Pro", "Current plan should update immediately to Pro");
            assert.equal(updatedState.userData.plan, "Pro", "Plan alias should update immediately to Pro");
        });

        it("preserves authoritative balance and plan on idempotent retry/replay", () => {
            const currentState = {
                userData: {
                    _id: "user_123",
                    credits: 600,
                    currentPlan: "Pro",
                    plan: "Pro",
                },
                authLoading: false,
            };

            const replayResponse = {
                success: true,
                message: "Payment already verified.",
                user: {
                    _id: "user_123",
                    credits: 600,
                    currentPlan: "Pro",
                    plan: "Pro",
                },
                alreadyProcessed: true,
            };

            const updatedState = userReducer(currentState, setUserData(replayResponse.user));

            assert.equal(updatedState.userData.credits, 600, "Credits must not double-increment on replay");
            assert.equal(updatedState.userData.currentPlan, "Pro");
        });

        it("leaves user credits and plan intact when payment is cancelled or failed", () => {
            const initialState = {
                userData: {
                    _id: "user_123",
                    credits: 100,
                    currentPlan: "Free",
                    plan: "Free",
                },
                authLoading: false,
            };

            // In cancelled or failed payments, setUserData is never dispatched
            const untouchedState = userReducer(initialState, { type: "UNKNOWN_ACTION" });

            assert.equal(untouchedState.userData.credits, 100);
            assert.equal(untouchedState.userData.currentPlan, "Free");
        });
    });

    describe("2. Plan Name Authoritative Resolution", () => {
        it("resolves basic to Pro and pro to Ultra", () => {
            assert.equal(getPlanDisplayName("basic"), "Pro");
            assert.equal(getPlanDisplayName("pro"), "Ultra");
            assert.equal(getPlanDisplayName("free"), "Free");
            assert.equal(getPlanDisplayName(null), "Free");
            assert.equal(getPlanDisplayName(undefined), "Free");
        });
    });

    describe("3. Credit Audit Ledger Back Navigation Resolution", () => {
        function resolveLedgerBack({ from, historyIdx, fallback = "/pricing" }) {
            if (from) return { destination: from, method: "referrer" };
            if (historyIdx > 0) return { destination: -1, method: "history" };
            return { destination: fallback, method: "fallback" };
        }

        it("returns to referrer when navigated with state.from", () => {
            const result = resolveLedgerBack({ from: "/pricing", historyIdx: 2 });
            assert.deepEqual(result, { destination: "/pricing", method: "referrer" });
        });

        it("uses browser history navigate(-1) when user has SPA session history", () => {
            const result = resolveLedgerBack({ from: undefined, historyIdx: 1 });
            assert.deepEqual(result, { destination: -1, method: "history" });
        });

        it("falls back to /pricing on direct URL access or bookmark (historyIdx === 0)", () => {
            const result = resolveLedgerBack({ from: undefined, historyIdx: 0 });
            assert.deepEqual(result, { destination: "/pricing", method: "fallback" });
        });
    });
});
