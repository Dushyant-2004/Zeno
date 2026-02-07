"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useZenoChat } from "@/hooks/useZenoChat";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";
import ParticleBackground from "@/components/ParticleBackground";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import Sidebar from "@/components/Sidebar";
import SplashScreen from "@/components/SplashScreen";
import {
  FiMenu,
  FiPlus,
  FiAlertCircle,
  FiX,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function Home() {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    conversations,
    sendMessageStream,
    loadConversation,
    loadConversations,
    deleteConversation,
    startNewChat,
    clearError,
  } = useZenoChat();

  const {
    isListening,
    transcript,
    isSupported,
    error: voiceError,
    toggleListening,
    speak,
    isSpeaking,
    stopSpeaking,
  } = useVoiceCommand();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Show errors as toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [error, voiceError, clearError]);

  // Auto-speak assistant responses
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.isStreaming) {
        speak(lastMessage.content);
      }
    }
  }, [messages, autoSpeak, speak]);

  const handleSend = useCallback(
    (content: string, isVoice = false) => {
      sendMessageStream(content, isVoice);
    },
    [sendMessageStream]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessageStream(suggestion);
    },
    [sendMessageStream]
  );

  const handleSpeak = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speak(text);
      }
    },
    [isSpeaking, speak, stopSpeaking]
  );

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Animated background */}
      <ParticleBackground />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentSessionId={sessionId}
        onNewChat={() => {
          startNewChat();
          loadConversations();
        }}
        onSelectConversation={(id) => {
          loadConversation(id);
        }}
        onDeleteConversation={(id) => {
          deleteConversation(id);
          loadConversations();
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(8,8,16,0.6)",
          backdropFilter: "blur(40px)",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 10%, rgba(0,240,255,0.08) 50%, transparent 90%)",
          }}
        />

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <FiMenu size={18} />
          </motion.button>

          <div className="flex items-center gap-2.5">
            <motion.div
              className="relative w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.1), rgba(191,90,242,0.1))",
                border: "1px solid rgba(0,240,255,0.12)",
              }}
              animate={{
                boxShadow: [
                  "0 0 12px rgba(0,240,255,0.08)",
                  "0 0 20px rgba(191,90,242,0.12)",
                  "0 0 12px rgba(0,240,255,0.08)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span
                className="text-sm font-black"
                style={{
                  background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Z
              </span>
            </motion.div>
            <div>
              <h1 className="text-sm font-bold tracking-wider gradient-text">ZENO</h1>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#30d158",
                    boxShadow: "0 0 6px rgba(48,209,88,0.4)",
                  }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Auto-speak toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              toast.success(
                autoSpeak ? "Auto-speak disabled" : "Auto-speak enabled"
              );
            }}
            className="p-2 rounded-xl transition-all duration-200"
            style={
              autoSpeak
                ? {
                    color: "rgba(0,240,255,0.7)",
                    background: "rgba(0,240,255,0.06)",
                    border: "1px solid rgba(0,240,255,0.1)",
                  }
                : {
                    color: "rgba(255,255,255,0.25)",
                    border: "1px solid transparent",
                  }
            }
            title={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
          >
            {autoSpeak ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          </motion.button>

          {/* New chat button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              startNewChat();
              loadConversations();
            }}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: "rgba(255,255,255,0.25)" }}
            title="New Chat"
          >
            <FiPlus size={18} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Chat Area */}
      <div
        ref={chatContainerRef}
        className="relative z-10 flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="py-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onSpeak={handleSpeak}
                    isSpeaking={isSpeaking}
                  />
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading &&
                  !messages.some((m) => m.isStreaming) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3 px-4 py-4"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,240,255,0.1), rgba(191,90,242,0.1))",
                          border: "1px solid rgba(0,240,255,0.12)",
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Z
                        </span>
                      </div>
                      <div
                        className="rounded-2xl rounded-tl-sm px-5 py-3"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: "#00f0ff" }}
                              animate={{
                                y: [0, -6, 0],
                                opacity: [0.3, 1, 0.3],
                                boxShadow: [
                                  "0 0 2px rgba(0,240,255,0.2)",
                                  "0 0 8px rgba(0,240,255,0.5)",
                                  "0 0 2px rgba(0,240,255,0.2)",
                                ],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 mx-4 mb-2"
          >
            <div
              className="max-w-4xl mx-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: "rgba(255,55,95,0.06)",
                border: "1px solid rgba(255,55,95,0.12)",
                color: "rgba(255,55,95,0.8)",
              }}
            >
              <FiAlertCircle size={15} />
              <span className="flex-1 text-xs">{error}</span>
              <button
                onClick={clearError}
                className="hover:opacity-70 transition-opacity"
              >
                <FiX size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="relative z-10 px-4 pb-4 pt-2">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            isListening={isListening}
            isSupported={isSupported}
            transcript={transcript}
            onToggleVoice={toggleListening}
          />
        </div>
      </div>
    </div>
  );
}
