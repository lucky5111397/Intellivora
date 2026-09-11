import { useState, useRef, useEffect, useCallback } from "react";
import { getAudioProfile, matchVoiceForProfile } from "./audioProfiles";

/**
 * Sequential Text-to-Speech audio queue hook for multi-agent discussions.
 * Manages utterance playback, persona voice switching, queue ordering, and lifecycle cleanup.
 */
export const useSpeechQueue = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeakerId, setCurrentSpeakerId] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [queueLength, setQueueLength] = useState(0);
  const [voices, setVoices] = useState([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const queueRef = useRef([]);
  const activeUtteranceRef = useRef(null);
  const isPlayingRef = useRef(false);
  const keepaliveTimerRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

  // -------------------------------------------------------------
  // Load Voices
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
        setVoicesLoaded(true);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // Retry once after a brief interval for browsers with delayed voice lists
    const timer = setTimeout(updateVoices, 300);

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSupported]);

  // -------------------------------------------------------------
  // Chrome Keepalive: Prevent utterance cutoff on long turns
  // -------------------------------------------------------------
  const startKeepalive = useCallback(() => {
    if (keepaliveTimerRef.current) clearInterval(keepaliveTimerRef.current);
    keepaliveTimerRef.current = setInterval(() => {
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) return;
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);
  }, []);

  const stopKeepalive = useCallback(() => {
    if (keepaliveTimerRef.current) {
      clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------
  // Play Next Item in Queue
  // -------------------------------------------------------------
  const processNext = useCallback(() => {
    if (!isSupported || isPlayingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0 && !isPlayingRef.current) {
        setIsSpeaking(false);
        setCurrentSpeakerId(null);
        setCurrentTurn(null);
        setQueueLength(0);
      }
      return;
    }

    const item = queueRef.current.shift();
    setQueueLength(queueRef.current.length);

    if (!item || !item.text || !item.text.trim()) {
      processNext();
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    setCurrentSpeakerId(item.speakerId || "orchestrator");
    setCurrentTurn(item);

    const profile = getAudioProfile(item.speakerId);
    const utterance = new SpeechSynthesisUtterance(item.text.trim());

    // Apply persona acoustic tuning
    utterance.rate = item.rate ?? profile.rate;
    utterance.pitch = item.pitch ?? profile.pitch;
    utterance.volume = item.volume ?? profile.volume;

    const matchedVoice = matchVoiceForProfile(voices, profile);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    activeUtteranceRef.current = utterance;

    utterance.onstart = () => {
      startKeepalive();
      if (typeof item.onStart === "function") {
        try {
          item.onStart(item);
        } catch (e) {
          console.error("[useSpeechQueue] onStart callback error:", e);
        }
      }
    };

    const handleEnd = () => {
      stopKeepalive();
      isPlayingRef.current = false;
      activeUtteranceRef.current = null;
      if (typeof item.onEnd === "function") {
        try {
          item.onEnd(item);
        } catch (e) {
          console.error("[useSpeechQueue] onEnd callback error:", e);
        }
      }
      // Process next item in sequence
      processNext();
    };

    utterance.onend = handleEnd;

    utterance.onerror = (event) => {
      // "interrupted" or "canceled" are standard cancellation events
      if (event.error !== "interrupted" && event.error !== "canceled") {
        console.warn("[useSpeechQueue] Speech synthesis error:", event.error);
      }
      handleEnd();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (speakError) {
      console.error("[useSpeechQueue] Failed to execute speak():", speakError);
      handleEnd();
    }
  }, [isSupported, voices, startKeepalive, stopKeepalive]);

  // Trigger next whenever voices change or queue was populated
  useEffect(() => {
    if (!isPlayingRef.current && queueRef.current.length > 0) {
      processNext();
    }
  }, [voices, processNext]);

  // -------------------------------------------------------------
  // Public Controls
  // -------------------------------------------------------------
  const enqueue = useCallback(
    (item) => {
      if (!item || !item.text) return;
      queueRef.current.push(item);
      setQueueLength(queueRef.current.length);
      if (!isPlayingRef.current) {
        processNext();
      }
    },
    [processNext]
  );

  const cancel = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
    stopKeepalive();
    isPlayingRef.current = false;
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSpeakerId(null);
    setCurrentTurn(null);

    if (isSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isSupported, stopKeepalive]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const clear = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
  }, []);

  const skip = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      // onend / onerror will advance to next item
    }
  }, [isSupported, isSpeaking]);

  // Cleanup on unmount: cancel speech and clear timers
  useEffect(() => {
    return () => {
      stopKeepalive();
      if (isSupported && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported, stopKeepalive]);

  return {
    enqueue,
    cancel,
    pause,
    resume,
    clear,
    skip,
    isSpeaking,
    isPaused,
    currentSpeakerId,
    currentTurn,
    queueLength,
    voices,
    voicesLoaded,
    isSupported,
  };
};

export default useSpeechQueue;
