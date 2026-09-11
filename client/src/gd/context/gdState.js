/**
 * Pure state reducer and initial state for Group Discussion sessions.
 * Isolated from JSX to facilitate unit testing and state portability.
 */

export const STORAGE_ACTIVE_GD_ID = "gd_active_session_id";

export const initialGDState = {
  session: null,
  sessionId: null,
  status: "idle", // 'idle' | 'setup' | 'lobby' | 'in_progress' | 'completed' | 'aborted' | 'failed'
  topic: "",
  category: "Technology & AI",
  difficulty: "mid",
  durationMinutes: 10,
  maxTurns: 30,
  transcript: [],
  activeSpeakerId: null,
  telemetry: {
    candidateSpeakingTimeSeconds: 0,
    candidateTurnCount: 0,
    agent1SpeakingTimeSeconds: 0,
    agent2SpeakingTimeSeconds: 0,
    agent3SpeakingTimeSeconds: 0,
    totalSessionDurationSeconds: 0,
    totalTurnsCount: 0,
    interruptionsCount: 0,
  },
  evaluation: null,
  stats: null,
  recentSessions: [],
  loading: false,
  error: null,
  isDiscussionComplete: false,
};

export function gdReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_OVERVIEW":
      return {
        ...state,
        stats: action.payload.stats || null,
        recentSessions: action.payload.recentSessions || [],
        loading: false,
        error: null,
      };

    case "SET_SESSION": {
      const sess = action.payload;
      if (!sess) return state;

      return {
        ...state,
        session: sess,
        sessionId: sess._id || sess.sessionId || state.sessionId,
        status: sess.status || state.status,
        topic: sess.topic || state.topic,
        category: sess.category || state.category,
        difficulty: sess.difficulty || state.difficulty,
        durationMinutes: sess.durationMinutes ?? state.durationMinutes,
        maxTurns: sess.maxTurns ?? state.maxTurns,
        transcript: Array.isArray(sess.transcript) ? sess.transcript : state.transcript,
        activeSpeakerId: sess.activeSpeakerId !== undefined ? sess.activeSpeakerId : state.activeSpeakerId,
        telemetry: sess.telemetry ? { ...state.telemetry, ...sess.telemetry } : state.telemetry,
        evaluation: sess.evaluation !== undefined ? sess.evaluation : state.evaluation,
        loading: false,
        error: null,
        isDiscussionComplete: sess.status === "completed",
      };
    }

    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
        session: state.session ? { ...state.session, status: action.payload } : null,
      };

    case "SET_ACTIVE_SPEAKER":
      return { ...state, activeSpeakerId: action.payload };

    case "APPEND_TURN": {
      const turn = action.payload;
      if (!turn) return state;
      const updatedTranscript = [...state.transcript, turn];

      return {
        ...state,
        transcript: updatedTranscript,
        activeSpeakerId: turn.speakerId || state.activeSpeakerId,
        session: state.session ? { ...state.session, transcript: updatedTranscript } : null,
      };
    }

    case "UPDATE_TELEMETRY":
      return {
        ...state,
        telemetry: { ...state.telemetry, ...action.payload },
      };

    case "FINISH_SUCCESS": {
      const { evaluation, session } = action.payload;
      return {
        ...state,
        status: "completed",
        evaluation,
        activeSpeakerId: null,
        isDiscussionComplete: true,
        session: session || (state.session ? { ...state.session, status: "completed", evaluation } : null),
        loading: false,
      };
    }

    case "ABORT_SUCCESS":
      return {
        ...state,
        status: "aborted",
        activeSpeakerId: null,
        session: state.session ? { ...state.session, status: "aborted", refunded: action.payload.refunded } : null,
        loading: false,
      };

    case "RESET_SESSION":
      return {
        ...initialGDState,
        stats: state.stats,
        recentSessions: state.recentSessions,
      };

    default:
      return state;
  }
}
