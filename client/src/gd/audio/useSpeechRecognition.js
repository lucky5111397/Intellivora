import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Provider-agnostic Speech-to-Text hook using Web Speech Recognition API.
 * Handles microphone permissions, continuous recognition, error states, and leak-proof cleanup.
 */
export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("prompt");

  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition || null
      : null;

  const isSupported = Boolean(SpeechRecognition);

  // Check initial permission status if Permissions API is available
  useEffect(() => {
    isMountedRef.current = true;
    if (!isSupported) {
      setPermissionStatus("unsupported");
      return;
    }

    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((permission) => {
          if (isMountedRef.current) {
            setPermissionStatus(permission.state);
            permission.onchange = () => {
              if (isMountedRef.current) {
                setPermissionStatus(permission.state);
              }
            };
          }
        })
        .catch(() => {
          // Permissions query not supported for microphone on some browsers
        });
    }

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [isSupported]);

  const startListening = useCallback(
    ({ continuous = true, lang = "en-US", interimResults = true } = {}) => {
      if (!isSupported) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      // Abort any existing recognition instance first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      setError(null);

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setIsListening(true);
            setError(null);
            setPermissionStatus("granted");
          }
        };

        recognition.onresult = (event) => {
          if (!isMountedRef.current) return;

          let currentInterim = "";
          let finalChunk = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";
            if (result.isFinal) {
              finalChunk += " " + text;
            } else {
              currentInterim += " " + text;
            }
          }

          if (finalChunk) {
            setTranscript((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
          }
          setInterimTranscript(currentInterim.trim());
        };

        recognition.onerror = (event) => {
          if (!isMountedRef.current) return;

          const errCode = event.error;
          let userMessage = "Microphone error occurred.";

          switch (errCode) {
            case "not-allowed":
            case "permission-denied":
              userMessage = "Microphone permission was denied. Please allow access in browser settings.";
              setPermissionStatus("denied");
              break;
            case "no-speech":
              // Non-fatal: user simply didn't speak
              return;
            case "audio-capture":
              userMessage = "No microphone was detected on your device.";
              break;
            case "network":
              userMessage = "Network error occurred during speech recognition.";
              break;
            case "aborted":
              // Intentional stop or abort
              return;
            default:
              userMessage = `Speech recognition error: ${errCode}`;
              break;
          }

          console.warn("[useSpeechRecognition] Error:", errCode);
          setError(userMessage);
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isMountedRef.current) {
            setIsListening(false);
            setInterimTranscript("");
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (startErr) {
        console.error("[useSpeechRecognition] Failed to start:", startErr);
        if (isMountedRef.current) {
          setError(startErr.message || "Failed to initialize microphone recognition.");
          setIsListening(false);
        }
      }
    },
    [isSupported, SpeechRecognition]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      recognitionRef.current = null;
    }
    if (isMountedRef.current) {
      setIsListening(false);
      setInterimTranscript("");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    permissionStatus,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
