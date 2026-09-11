import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import {
  getGDOverview,
  createGDSession,
  getGDSession,
  setGDLobbyReady,
  submitGDTurn,
  completeGDSession,
  abortGDSession,
  extractErrorMessage,
} from "../gdApi";
import {
  initialGDState,
  gdReducer,
  STORAGE_ACTIVE_GD_ID,
} from "./gdState";

export const GDContext = createContext(null);

// Helper to generate a reliable UUID for idempotency
const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const GDProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gdReducer, initialGDState);

  // -------------------------------------------------------------
  // Overview Data
  // -------------------------------------------------------------
  const fetchOverview = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await getGDOverview();
      if (response.data?.success) {
        dispatch({
          type: "SET_OVERVIEW",
          payload: {
            stats: response.data.stats,
            recentSessions: response.data.recentSessions,
          },
        });
      }
      return response.data;
    } catch (err) {
      const msg = extractErrorMessage(err);
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, []);

  // -------------------------------------------------------------
  // Session Initialization (Screen 2: Setup)
  // -------------------------------------------------------------
  const initSession = useCallback(async ({ topic, category, difficulty, durationMinutes, maxTurns }) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    const idempotencyKey = generateUUID();

    try {
      const response = await createGDSession({
        idempotencyKey,
        topic,
        category,
        difficulty,
        durationMinutes,
        maxTurns,
      });

      const { session, sessionId } = response.data;
      const targetId = sessionId || session?._id;

      if (targetId && typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_ACTIVE_GD_ID, targetId);
      }

      dispatch({ type: "SET_SESSION", payload: session });
      return response.data;
    } catch (err) {
      const msg = extractErrorMessage(err);
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, []);

  // -------------------------------------------------------------
  // Load Session by ID
  // -------------------------------------------------------------
  const loadSession = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await getGDSession(id);
      if (response.data?.session) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_ACTIVE_GD_ID, id);
        }
        dispatch({ type: "SET_SESSION", payload: response.data.session });
      }
      return response.data;
    } catch (err) {
      const msg = extractErrorMessage(err);
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, []);

  // -------------------------------------------------------------
  // Lobby Ready -> Enter Room (Screen 3: Lobby)
  // -------------------------------------------------------------
  const enterRoom = useCallback(
    async (id) => {
      const targetId = id || state.sessionId;
      if (!targetId) throw new Error("No session ID provided to enter room.");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await setGDLobbyReady(targetId);
        if (response.data?.session) {
          dispatch({ type: "SET_SESSION", payload: response.data.session });
        } else if (response.data?.success) {
          dispatch({ type: "SET_STATUS", payload: "in_progress" });
        }
        dispatch({ type: "SET_LOADING", payload: false });
        return response.data;
      } catch (err) {
        const msg = extractErrorMessage(err);
        dispatch({ type: "SET_ERROR", payload: msg });
        throw err;
      }
    },
    [state.sessionId]
  );

  // -------------------------------------------------------------
  // Submit Candidate Speech (Screen 4: Room)
  // -------------------------------------------------------------
  const sendCandidateSpeech = useCallback(
    async ({ content, durationSeconds = 0, interruptedPrevious = false }) => {
      if (!state.sessionId) throw new Error("No active GD session found.");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await submitGDTurn(state.sessionId, {
          turnType: "candidate_speech",
          content,
          durationSeconds,
          interruptedPrevious,
        });

        // Backend returns candidateTurn and subsequent agent turn if generated
        if (response.data?.candidateTurn) {
          dispatch({ type: "APPEND_TURN", payload: response.data.candidateTurn });
        }
        if (response.data?.turn) {
          dispatch({ type: "APPEND_TURN", payload: response.data.turn });
        }

        if (response.data?.isDiscussionComplete) {
          dispatch({ type: "SET_STATUS", payload: "completed" });
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return response.data;
      } catch (err) {
        const msg = extractErrorMessage(err);
        dispatch({ type: "SET_ERROR", payload: msg });
        throw err;
      }
    },
    [state.sessionId]
  );

  // -------------------------------------------------------------
  // Request AI Agent Turn / Trigger Next (Screen 4: Room)
  // -------------------------------------------------------------
  const requestAgentTurn = useCallback(async () => {
    if (!state.sessionId) throw new Error("No active GD session found.");

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await submitGDTurn(state.sessionId, {
        turnType: "agent_prompt",
      });

      if (response.data?.turn) {
        dispatch({ type: "APPEND_TURN", payload: response.data.turn });
      }

      if (response.data?.isDiscussionComplete) {
        dispatch({ type: "SET_STATUS", payload: "completed" });
      }

      dispatch({ type: "SET_LOADING", payload: false });
      return response.data;
    } catch (err) {
      const msg = extractErrorMessage(err);
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, [state.sessionId]);

  // -------------------------------------------------------------
  // Complete Session & Generate Evaluation (Screen 4/5)
  // -------------------------------------------------------------
  const finishSession = useCallback(
    async (finalTelemetry = {}) => {
      if (!state.sessionId) throw new Error("No active GD session found.");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await completeGDSession(state.sessionId, { finalTelemetry });
        if (response.data?.success) {
          dispatch({
            type: "FINISH_SUCCESS",
            payload: {
              evaluation: response.data.evaluation,
              session: response.data.session,
            },
          });
        }
        return response.data;
      } catch (err) {
        const msg = extractErrorMessage(err);
        dispatch({ type: "SET_ERROR", payload: msg });
        throw err;
      }
    },
    [state.sessionId]
  );

  // -------------------------------------------------------------
  // Abort / Terminate Session (with refund protection)
  // -------------------------------------------------------------
  const abandonSession = useCallback(async () => {
    if (!state.sessionId) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await abortGDSession(state.sessionId);
      if (response.data?.success) {
        dispatch({
          type: "ABORT_SUCCESS",
          payload: { refunded: response.data.refunded },
        });
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(STORAGE_ACTIVE_GD_ID);
        }
      }
      return response.data;
    } catch (err) {
      const msg = extractErrorMessage(err);
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, [state.sessionId]);

  const updateTelemetry = useCallback((telemetryUpdate) => {
    dispatch({ type: "UPDATE_TELEMETRY", payload: telemetryUpdate });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const resetSession = useCallback(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_ACTIVE_GD_ID);
    }
    dispatch({ type: "RESET_SESSION" });
  }, []);

  // Restore active session ID on page reload if present in localStorage
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const savedId = localStorage.getItem(STORAGE_ACTIVE_GD_ID);
    if (savedId && !state.sessionId) {
      loadSession(savedId).catch(() => {
        localStorage.removeItem(STORAGE_ACTIVE_GD_ID);
      });
    }
  }, [state.sessionId, loadSession]);

  const value = {
    ...state,
    fetchOverview,
    initSession,
    loadSession,
    enterRoom,
    sendCandidateSpeech,
    requestAgentTurn,
    finishSession,
    abandonSession,
    updateTelemetry,
    clearError,
    resetSession,
  };

  return <GDContext.Provider value={value}>{children}</GDContext.Provider>;
};

/**
 * Custom hook to consume GD context with safety assertion.
 */
export const useGD = () => {
  const context = useContext(GDContext);
  if (!context) {
    throw new Error("useGD must be used within a GDProvider.");
  }
  return context;
};

export default GDProvider;
