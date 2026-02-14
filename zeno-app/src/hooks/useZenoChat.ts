"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  isStreaming?: boolean;
  hasFileContext?: boolean;
  imageUrl?: string;
  isImageLoading?: boolean;
}

export interface Conversation {
  sessionId: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFileInfo {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  wordCount?: number;
  pageCount?: number;
  status: "uploading" | "processing" | "ready" | "error";
  errorMessage?: string;
}

interface UseZenoChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  conversations: Conversation[];
  uploadedFiles: UploadedFileInfo[];
  sendMessage: (content: string, isVoice?: boolean) => Promise<void>;
  sendMessageStream: (content: string, isVoice?: boolean) => Promise<void>;
  loadConversation: (sessionId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  deleteConversation: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  clearError: () => void;
  addUploadedFile: (file: UploadedFileInfo) => void;
  removeUploadedFile: (fileId: string) => void;
}

export function useZenoChat(): UseZenoChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ============ IMAGE GENERATION DETECTION ============
  const IMAGE_TRIGGER_PATTERNS = [
    /^generate\s+(an?\s+)?image\s+(of|for|about|showing|depicting|with)\b/i,
    /^create\s+(an?\s+)?image\s+(of|for|about|showing|depicting|with)\b/i,
    /^make\s+(an?\s+)?(image|picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
    /^draw\s+(an?\s+)?(image|picture|art|artwork|illustration)?\s*(of|for|about|showing|depicting|with)?\b/i,
    /^(paint|sketch|design|illustrate)\b/i,
    /^generate\s+(an?\s+)?(picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
    /^create\s+(an?\s+)?(picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
    /^(show|give)\s+me\s+(an?\s+)?(image|picture|photo|art)\s+(of|for|about|showing|depicting|with)\b/i,
    /^imagine\b/i,
    /^visualize\b/i,
  ];

  const isImageRequest = useCallback(
    (message: string): boolean => {
      return IMAGE_TRIGGER_PATTERNS.some((pattern) => pattern.test(message.trim()));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ============ SEND IMAGE GENERATION REQUEST ============
  const sendImageRequest = useCallback(
    async (content: string, isVoice = false) => {
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        isVoice,
      };

      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "Generating your image...",
        timestamp: new Date(),
        isImageLoading: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Image generation failed");
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: data.message.content,
                  imageUrl: data.image.url,
                  isImageLoading: false,
                }
              : msg
          )
        );

        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Image generation failed");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, I couldn't generate the image. Please try again.",
                  isImageLoading: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const sendMessage = useCallback(
    async (content: string, isVoice = false) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        isVoice,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
            isVoice,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to get response");
        }

        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const sendMessageStream = useCallback(
    async (content: string, isVoice = false) => {
      if (!content.trim() || isLoading) return;

      // Check if this is an image generation request
      if (isImageRequest(content)) {
        return sendImageRequest(content, isVoice);
      }

      // Abort previous stream if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        isVoice,
      };

      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
            isVoice,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to connect to stream");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.content) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              }

              if (data.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                if (data.sessionId) {
                  setSessionId(data.sessionId);
                }
              }
            } catch (parseErr) {
              // Skip malformed chunks
              if ((parseErr as Error).message !== "Unexpected end of JSON input") {
                console.warn("Stream parse warning:", parseErr);
              }
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        const error = err as { message?: string };
        setError(error.message || "Stream error occurred");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false, content: msg.content || "Sorry, an error occurred." }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, sessionId, isImageRequest, sendImageRequest]
  );

  const loadConversation = useCallback(async (targetSessionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat?sessionId=${targetSessionId}`);
      const data = await response.json();

      if (data.success && data.messages) {
        setMessages(
          data.messages.map((m: { role: string; content: string; timestamp: string; isVoice?: boolean }) => ({
            id: uuidv4(),
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            isVoice: m.isVoice,
          }))
        );
        setSessionId(targetSessionId);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err: unknown) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  const deleteConversation = useCallback(
    async (targetSessionId: string) => {
      try {
        await fetch(`/api/conversations?sessionId=${targetSessionId}`, {
          method: "DELETE",
        });
        setConversations((prev) =>
          prev.filter((c) => c.sessionId !== targetSessionId)
        );
        if (targetSessionId === sessionId) {
          setMessages([]);
          setSessionId(uuidv4());
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to delete conversation");
      }
    },
    [sessionId]
  );

  const startNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setSessionId(uuidv4());
    setError(null);
    setUploadedFiles([]);
  }, []);

  // File management
  const addUploadedFile = useCallback((file: UploadedFileInfo) => {
    setUploadedFiles((prev) => [...prev, file]);
  }, []);

  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    conversations,
    uploadedFiles,
    sendMessage,
    sendMessageStream,
    loadConversation,
    loadConversations,
    deleteConversation,
    startNewChat,
    clearError,
    addUploadedFile,
    removeUploadedFile,
  };
}
