"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMic, FiSquare } from "react-icons/fi";

interface ChatInputProps {
  onSend: (message: string, isVoice?: boolean) => void;
  isLoading: boolean;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  onToggleVoice: () => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  isListening,
  isSupported,
  transcript,
  onToggleVoice,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle transcript from voice
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
      setTimeout(() => {
        onSend(transcript, true);
        setInput("");
      }, 500);
    }
  }, [transcript, isListening, onSend]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative"
    >
      {/* Listening overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full px-5 py-2.5 backdrop-blur-xl"
            style={{
              background: "rgba(255,55,95,0.08)",
              border: "1px solid rgba(255,55,95,0.2)",
            }}
          >
            {/* Animated sound waves */}
            <div className="flex items-center gap-0.5 h-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-red-400"
                  animate={{
                    height: [4, 12 + Math.random() * 8, 4],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-red-300 text-sm font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container with animated border */}
      <div className="relative group">
        {/* Animated border glow */}
        <div
          className={`absolute -inset-[1px] rounded-2xl transition-opacity duration-500 ${
            focused ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(0,240,255,0.3), rgba(191,90,242,0.2), rgba(0,240,255,0.1))",
            filter: "blur(1px)",
          }}
        />

        {/* Outer glow when focused */}
        <div
          className={`absolute -inset-[8px] rounded-3xl transition-opacity duration-700 ${
            focused ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "radial-gradient(ellipse, rgba(0,240,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div
          className="relative flex items-end gap-2 rounded-2xl p-2.5 transition-all duration-300"
          style={{
            background: focused
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.02)",
            border: `1px solid ${focused ? "rgba(0,240,255,0.15)" : "rgba(255,255,255,0.06)"}`,
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Voice button */}
          {isSupported && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleVoice}
              className="flex-shrink-0 relative p-3 rounded-xl transition-all duration-300"
              style={
                isListening
                  ? {
                      background: "rgba(255,55,95,0.1)",
                      border: "1px solid rgba(255,55,95,0.2)",
                    }
                  : {
                      background: "transparent",
                      border: "1px solid transparent",
                    }
              }
              title={isListening ? "Stop listening" : "Start voice command"}
            >
              {isListening ? (
                <FiSquare size={18} className="text-red-400" />
              ) : (
                <FiMic size={18} className="text-gray-500 hover:text-cyan-400 transition-colors" />
              )}

              {/* Mic pulse ring when listening */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ border: "1px solid rgba(255,55,95,0.3)" }}
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isListening ? "Listening..." : "Ask ZENO anything..."}
            disabled={isListening}
            rows={1}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 resize-none outline-none text-sm py-3 px-2 max-h-[200px] scrollbar-thin scrollbar-thumb-white/5"
          />

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 relative p-3 rounded-xl transition-all duration-300 overflow-hidden"
            style={
              input.trim() && !isLoading
                ? {
                    background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(191,90,242,0.15))",
                    border: "1px solid rgba(0,240,255,0.2)",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                  }
            }
          >
            {isLoading ? (
              <motion.div
                className="w-[18px] h-[18px] rounded-full"
                style={{ border: "2px solid rgba(0,240,255,0.2)", borderTopColor: "#00f0ff" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <FiSend
                size={18}
                className={`transition-colors duration-300 ${
                  input.trim() ? "text-cyan-400" : "text-gray-700"
                }`}
              />
            )}

            {/* Send button glow */}
            {input.trim() && !isLoading && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow: "0 0 15px rgba(0,240,255,0.15)",
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Bottom hints */}
      <div className="flex items-center justify-between mt-2.5 px-3">
        <p className="text-[10px] text-gray-700 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded text-gray-600 text-[9px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            Enter
          </kbd>
          <span>send</span>
          <span className="text-gray-800 mx-0.5">/</span>
          <kbd className="px-1.5 py-0.5 rounded text-gray-600 text-[9px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            Shift+Enter
          </kbd>
          <span>new line</span>
        </p>
        {isSupported && !isListening && (
          <motion.p
            className="text-[10px] text-gray-700 flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FiMic size={9} className="text-cyan-600" />
            Voice ready
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
