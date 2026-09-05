import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import {
  getAptitudeProgress,
  getAptitudeCategories,
  getAptitudeAttempt,
  getActiveAptitudeAttempt,
  getAptitudeResult,
  startAptitudeAttempt,
  saveAptitudeAnswer,
  submitAptitudeAttempt,
} from '../aptitudeApi';

const AptitudeContext = createContext(null);

const STORAGE_ACTIVE_ID = 'aptitude_active_attempt_id';

const initialState = {
  selectedCategory: 'quantitative',
  selectedTopic: null,
  difficulty: 'Medium',
  questionCount: 5,
  timeLimit: 600,
  attemptId: null,
  questions: [],
  answers: {}, // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  markedForReview: {}, // { [questionId]: boolean }
  currentQuestionIndex: 0,
  testStartTime: null,
  status: 'idle', // 'idle' | 'in_progress' | 'submitted' | 'expired'
  isSubmitting: false,
  loading: false,
  error: null,
  result: null,
  progress: null,
  categories: [],
};

function aptitudeReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SELECT_TOPIC':
      return { ...state, selectedTopic: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_QUESTION_COUNT':
      return { ...state, questionCount: action.payload };
    case 'SET_TIME_LIMIT':
      return { ...state, timeLimit: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(0, Math.min(action.payload, Math.max(0, state.questions.length - 1))),
      };
    case 'START_TEST_SUCCESS': {
      const { attempt } = action.payload;
      const restoredAnswers = {};
      const restoredMarked = {};
      if (Array.isArray(attempt.questions)) {
        attempt.questions.forEach((q) => {
          if (q.selectedOptionKey) restoredAnswers[q.questionId] = q.selectedOptionKey;
          if (q.markedForReview) restoredMarked[q.questionId] = true;
        });
      }

      return {
        ...state,
        attemptId: attempt.attemptId || attempt._id,
        selectedCategory: attempt.category || state.selectedCategory,
        selectedTopic: attempt.topic || state.selectedTopic,
        difficulty: attempt.difficulty || state.difficulty,
        questionCount: attempt.questionCount || attempt.questions?.length || state.questionCount,
        timeLimit: attempt.timeLimitSeconds ?? state.timeLimit,
        questions: attempt.questions || [],
        answers: restoredAnswers,
        markedForReview: restoredMarked,
        currentQuestionIndex: 0,
        testStartTime: attempt.startedAt || Date.now(),
        status: attempt.status || 'in_progress',
        isSubmitting: false,
        loading: false,
        error: null,
      };
    }
    case 'ANSWER_QUESTION': {
      const { questionId, optionKey, optionIndex } = action.payload || {};
      const qId = questionId || state.questions[action.payload?.index]?.questionId || state.questions[action.payload?.index]?.id;
      if (!qId) return state;

      // Map index (0,1,2,3) to letter if needed
      let key = optionKey;
      if (!key && typeof optionIndex === 'number') {
        key = String.fromCharCode(65 + optionIndex);
      }

      const answers = { ...state.answers };
      if (key === null || key === undefined) {
        delete answers[qId];
      } else {
        answers[qId] = key;
      }
      return { ...state, answers };
    }
    case 'CLEAR_ANSWER': {
      const qId = typeof action.payload === 'number'
        ? state.questions[action.payload]?.questionId || state.questions[action.payload]?.id
        : action.payload;
      if (!qId) return state;
      const answers = { ...state.answers };
      delete answers[qId];
      return { ...state, answers };
    }
    case 'TOGGLE_MARK_REVIEW':
    case 'TOGGLE_REVIEW': {
      const qId = typeof action.payload === 'number'
        ? state.questions[action.payload]?.questionId || state.questions[action.payload]?.id
        : action.payload;
      if (!qId) return state;
      return {
        ...state,
        markedForReview: {
          ...state.markedForReview,
          [qId]: !state.markedForReview[qId],
        },
      };
    }
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        status: 'submitted',
        result: action.payload,
      };
    case 'SET_RESULT':
      return {
        ...state,
        result: action.payload,
        loading: false,
      };
    case 'RESET_TEST':
      return {
        ...initialState,
        selectedCategory: state.selectedCategory,
        selectedTopic: action.payload !== undefined ? action.payload : state.selectedTopic,
        categories: state.categories,
        progress: state.progress,
      };
    default:
      return state;
  }
}

export function AptitudeProvider({ children }) {
  const [state, dispatch] = useReducer(aptitudeReducer, initialState);

  // Fetch progress on mount
  const fetchProgress = useCallback(async () => {
    try {
      const res = await getAptitudeProgress();
      dispatch({ type: 'SET_PROGRESS', payload: res.data });
      return res.data;
    } catch (err) {
      console.warn('[Aptitude Context] Error fetching progress:', err.message);
      return null;
    }
  }, []);

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const res = await getAptitudeCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: res.data });
      return res.data;
    } catch (err) {
      console.warn('[Aptitude Context] Error fetching categories:', err.message);
      return [];
    }
  }, []);

  // Start test with backend API
  const startTest = useCallback(async (customConfig = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const payload = {
      category: customConfig.category || state.selectedCategory || 'quantitative',
      topic: customConfig.topic || state.selectedTopic,
      difficulty: customConfig.difficulty || state.difficulty || 'Medium',
      questionCount: Number(customConfig.questionCount || state.questionCount || 5),
      timeLimitSeconds: Number(customConfig.timeLimitSeconds ?? state.timeLimit ?? 600),
    };

    try {
      const res = await startAptitudeAttempt(payload);
      const attempt = res.data;
      if (attempt.attemptId) {
        localStorage.setItem(STORAGE_ACTIVE_ID, attempt.attemptId);
      }
      dispatch({ type: 'START_TEST_SUCCESS', payload: { attempt } });
      return { success: true, attempt };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start test';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return {
        success: false,
        error: errorMsg,
        status: err.response?.status || 500,
      };
    }
  }, [state.selectedCategory, state.selectedTopic, state.difficulty, state.questionCount, state.timeLimit]);

  // Answer question with optimistic update + backend persistence
  const selectAnswer = useCallback(async (questionId, optionKey) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, optionKey } });

    const activeId = state.attemptId || localStorage.getItem(STORAGE_ACTIVE_ID);
    if (activeId && questionId) {
      try {
        await saveAptitudeAnswer(activeId, {
          questionId,
          selectedOptionKey: optionKey ?? null,
          markedForReview: Boolean(state.markedForReview[questionId]),
        });
      } catch (err) {
        console.warn('[Aptitude Context] Error syncing answer to server:', err.message);
      }
    }
  }, [state.attemptId, state.markedForReview]);

  // Clear answer
  const clearAnswer = useCallback(async (questionId) => {
    dispatch({ type: 'CLEAR_ANSWER', payload: questionId });

    const activeId = state.attemptId || localStorage.getItem(STORAGE_ACTIVE_ID);
    if (activeId && questionId) {
      try {
        await saveAptitudeAnswer(activeId, {
          questionId,
          selectedOptionKey: null,
          markedForReview: Boolean(state.markedForReview[questionId]),
        });
      } catch (err) {
        console.warn('[Aptitude Context] Error clearing answer on server:', err.message);
      }
    }
  }, [state.attemptId, state.markedForReview]);

  // Toggle mark for review
  const toggleReview = useCallback(async (questionId) => {
    const nextMarked = !state.markedForReview[questionId];
    dispatch({ type: 'TOGGLE_MARK_REVIEW', payload: questionId });

    const activeId = state.attemptId || localStorage.getItem(STORAGE_ACTIVE_ID);
    if (activeId && questionId) {
      try {
        await saveAptitudeAnswer(activeId, {
          questionId,
          selectedOptionKey: state.answers[questionId] || null,
          markedForReview: nextMarked,
        });
      } catch (err) {
        console.warn('[Aptitude Context] Error syncing review toggle to server:', err.message);
      }
    }
  }, [state.attemptId, state.markedForReview, state.answers]);

  // Submit test
  const submitTest = useCallback(async (targetAttemptId) => {
    const activeId = targetAttemptId || state.attemptId || localStorage.getItem(STORAGE_ACTIVE_ID);
    if (!activeId) {
      return { success: false, error: 'No active attempt to submit' };
    }

    if (state.isSubmitting) {
      return { success: false, error: 'Submission in progress' };
    }

    dispatch({ type: 'SUBMIT_START' });

    try {
      const res = await submitAptitudeAttempt(activeId);
      localStorage.removeItem(STORAGE_ACTIVE_ID);
      dispatch({ type: 'SUBMIT_SUCCESS', payload: res.data });
      // Refresh progress in background
      fetchProgress();
      return { success: true, result: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Submission failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg, status: err.response?.status || 500 };
    }
  }, [state.attemptId, state.isSubmitting, fetchProgress]);

  // Fetch persisted result
  const fetchResult = useCallback(async (attemptId) => {
    if (!attemptId) return null;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await getAptitudeResult(attemptId);
      dispatch({ type: 'SET_RESULT', payload: res.data });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Result not found';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return null;
    }
  }, []);

  // Recover active test on page refresh
  const recoverActiveTest = useCallback(async () => {
    // If questions are already in state, active attempt is loaded
    if (state.questions.length > 0 && state.status === 'in_progress') {
      return state;
    }

    const savedId = localStorage.getItem(STORAGE_ACTIVE_ID);

    try {
      let attempt = null;
      if (savedId) {
        const res = await getAptitudeAttempt(savedId);
        attempt = res.data;
      } else {
        const res = await getActiveAptitudeAttempt();
        attempt = res.data;
      }

      if (attempt && attempt.status === 'in_progress') {
        localStorage.setItem(STORAGE_ACTIVE_ID, attempt.attemptId || attempt._id);
        dispatch({ type: 'START_TEST_SUCCESS', payload: { attempt } });
        return attempt;
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_ID);
        return null;
      }
    } catch (_err) {
      localStorage.removeItem(STORAGE_ACTIVE_ID);
      return null;
    }
  }, []);

  // Reset test state for retake
  const resetTest = useCallback((topicSlug) => {
    localStorage.removeItem(STORAGE_ACTIVE_ID);
    dispatch({ type: 'RESET_TEST', payload: topicSlug });
  }, []);

  // Load progress and categories on initial mount
  useEffect(() => {
    fetchCategories();
    fetchProgress();
  }, [fetchCategories, fetchProgress]);

  const value = {
    state,
    dispatch,
    startTest,
    selectAnswer,
    clearAnswer,
    toggleReview,
    submitTest,
    fetchProgress,
    fetchCategories,
    fetchResult,
    recoverActiveTest,
    resetTest,
  };

  return <AptitudeContext.Provider value={value}>{children}</AptitudeContext.Provider>;
}

export function useAptitude() {
  const context = useContext(AptitudeContext);
  if (!context) throw new Error('useAptitude must be used within an AptitudeProvider');
  return context;
}

export default AptitudeContext;
