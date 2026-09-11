import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook for media devices (webcam & microphone), audio level metering, and diagnostics.
 * Vital for the preparation lobby diagnostics (Screen 3) and live room grid (Screen 4).
 * Enforces zero resource leaks by cleaning up media tracks and AudioContext on unmount.
 */
export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isMountedRef = useRef(true);

  const isSupported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // -------------------------------------------------------------
  // Audio Level Metering via Web Audio AnalyserNode
  // -------------------------------------------------------------
  const setupAudioMeter = useCallback((mediaStream) => {
    if (typeof window === "undefined") return;

    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isMountedRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0..128 to 0..100
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (audioErr) {
      console.warn("[useMediaStream] AudioContext setup failed:", audioErr.message);
    }
  }, []);

  const cleanAudioMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // -------------------------------------------------------------
  // Media Stream Lifecycle
  // -------------------------------------------------------------
  const stopMedia = useCallback(() => {
    cleanAudioMeter();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (isMountedRef.current) {
      setStream(null);
      setHasVideo(false);
      setHasAudio(false);
      setIsLoading(false);
    }
  }, [cleanAudioMeter]);

  const startMedia = useCallback(
    async ({ video = true, audio = true } = {}) => {
      if (!isSupported) {
        setError("Camera and microphone access are not supported in this browser.");
        return null;
      }

      // Stop any existing stream before creating a new one
      stopMedia();

      setIsLoading(true);
      setError(null);
      setPermissionDenied(false);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        });

        if (!isMountedRef.current) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return null;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setHasVideo(mediaStream.getVideoTracks().length > 0);
        setHasAudio(mediaStream.getAudioTracks().length > 0);
        setIsLoading(false);

        if (audio) {
          setupAudioMeter(mediaStream);
        }

        return mediaStream;
      } catch (err) {
        if (!isMountedRef.current) return null;

        console.warn("[useMediaStream] getUserMedia error:", err.name, err.message);
        setIsLoading(false);

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionDenied(true);
          setError("Microphone or camera permission was denied. Please allow access to proceed.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No matching microphone or webcam device found on this system.");
        } else {
          setError(err.message || "Failed to access media devices.");
        }
        return null;
      }
    },
    [isSupported, stopMedia, setupAudioMeter]
  );

  // Auto cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopMedia();
    };
  }, [stopMedia]);

  return {
    stream,
    hasVideo,
    hasAudio,
    audioLevel,
    isLoading,
    error,
    permissionDenied,
    isSupported,
    startMedia,
    stopMedia,
  };
};

export default useMediaStream;
