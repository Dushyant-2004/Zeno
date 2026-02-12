"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseVoiceCommandReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

// Errors that are expected/benign and should never surface to the user
const SILENT_ERRORS = new Set([
  "no-speech",    // Mic opened but user didn't speak — completely normal
  "aborted",      // Recognition was intentionally stopped by code
]);

// Errors that are recoverable and worth a retry
const RETRYABLE_ERRORS = new Set([
  "no-speech",
  "network",
]);

const MAX_RETRIES = 2;

export function useVoiceCommand(): UseVoiceCommandReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const retryCountRef = useRef(0);
  const intentionalStopRef = useRef(false);

  const safeStartRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return false;
    try {
      recognition.start();
      return true;
    } catch {
      // Already started or other DOM exception — not a real failure
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        // Got valid speech — reset retry counter
        retryCountRef.current = 0;
        setTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error;

      // Silently ignore benign errors — do NOT use console.error
      // (Next.js dev overlay treats console.error as user-facing errors)
      if (SILENT_ERRORS.has(errorType)) {
        // Auto-retry for no-speech: user may not have started talking yet
        if (RETRYABLE_ERRORS.has(errorType) && retryCountRef.current < MAX_RETRIES && !intentionalStopRef.current) {
          retryCountRef.current += 1;
          // Small delay before retry to avoid rapid-fire restarts
          setTimeout(() => {
            if (!intentionalStopRef.current) {
              safeStartRecognition();
            }
          }, 300);
          return;
        }
        setIsListening(false);
        return;
      }

      // For real errors: use console.warn (won't trigger Next.js overlay)
      // and surface a user-friendly message
      const userMessages: Record<string, string> = {
        "not-allowed": "Microphone access denied. Please allow mic permission and try again.",
        "audio-capture": "No microphone found. Please connect a mic and try again.",
        "network": "Network error during voice recognition. Check your connection.",
        "service-not-allowed": "Speech recognition service is not available in this browser.",
      };

      const friendlyMsg = userMessages[errorType] || `Voice recognition error: ${errorType}`;
      console.warn(`[Zeno Voice] ${errorType}: ${friendlyMsg}`);
      setError(friendlyMsg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      intentionalStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [safeStartRecognition]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setError(null);
      retryCountRef.current = 0;
      intentionalStopRef.current = false;
      if (!safeStartRecognition()) {
        setError("Failed to start voice recognition. Please try again.");
      }
    }
  }, [isListening, safeStartRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      intentionalStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speak = useCallback((text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();

      // Clean markdown formatting for speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, " code block ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[-*+]\s/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      // Split text into small chunks to prevent Chrome TTS freeze/lag
      // Chrome's SpeechSynthesis hangs on text longer than ~200 chars
      const splitIntoChunks = (str: string, maxLen: number = 160): string[] => {
        const chunks: string[] = [];
        let remaining = str;

        while (remaining.length > 0) {
          if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
          }

          // Try to split at sentence boundary
          let splitAt = -1;
          const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
          for (const ender of sentenceEnders) {
            const idx = remaining.lastIndexOf(ender, maxLen);
            if (idx > 0 && idx > splitAt) {
              splitAt = idx + ender.length;
            }
          }

          // Fallback: split at comma or space
          if (splitAt <= 0) {
            splitAt = remaining.lastIndexOf(', ', maxLen);
            if (splitAt > 0) splitAt += 2;
          }
          if (splitAt <= 0) {
            splitAt = remaining.lastIndexOf(' ', maxLen);
          }
          if (splitAt <= 0) {
            splitAt = maxLen;
          }

          chunks.push(remaining.substring(0, splitAt).trim());
          remaining = remaining.substring(splitAt).trim();
        }
        return chunks.filter(c => c.length > 0);
      };

      const chunks = splitIntoChunks(cleanText);
      if (chunks.length === 0) return;

      // Get a good voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Microsoft David") ||
          v.name.includes("Samantha")
      );

      setIsSpeaking(true);

      const speakChunk = (index: number) => {
        if (!synthRef.current || index >= chunks.length) {
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
          speakChunk(index + 1);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        synthRef.current!.speak(utterance);
      };

      speakChunk(0);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    speak,
    isSpeaking,
    stopSpeaking,
  };
}
