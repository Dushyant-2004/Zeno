"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useZenoChat";
import { FiUser, FiVolume2, FiCopy, FiCheck, FiMic } from "react-icons/fi";

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export default function ChatMessage({ message, onSpeak, isSpeaking }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [message.content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 25, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-3 px-4 py-3 ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ZENO avatar */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex-shrink-0 relative"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center neon-glow"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(191,90,242,0.15))",
              border: "1px solid rgba(0,240,255,0.2)",
            }}
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
          </div>
          {/* Online pulse dot */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gray-950"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Message bubble */}
      <motion.div
        layout
        className={`relative max-w-[80%] overflow-hidden ${
          isUser
            ? "rounded-2xl rounded-tr-sm"
            : "rounded-2xl rounded-tl-sm"
        }`}
        style={
          isUser
            ? {
                background: "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(191,90,242,0.12))",
                border: "1px solid rgba(0,240,255,0.15)",
              }
            : {
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
              }
        }
      >
        {/* Top shine line for user messages */}
        {isUser && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        )}

        {/* Streaming glow effect */}
        {message.isStreaming && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 100%, rgba(0,240,255,0.05) 0%, transparent 60%)",
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <div className="relative px-4 py-3">
          {/* Content */}
          <div className="text-[14.5px] leading-[1.8] tracking-wide">
            {isUser ? (
              <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="zeno-markdown">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.isStreaming && (
                  <motion.span
                    className="inline-block w-2 h-4 rounded-sm ml-1 align-middle"
                    style={{ background: "linear-gradient(180deg, #00f0ff, #bf5af2)" }}
                    animate={{ opacity: [1, 0.2] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Voice badge */}
          {message.isVoice && (
            <div className="flex items-center gap-1 mt-2 opacity-50">
              <FiMic size={10} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-400">Voice input</span>
            </div>
          )}

          {/* Action bar for assistant */}
          {!isUser && !message.isStreaming && message.content && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: hovered ? 1 : 0.4, y: 0 }}
                className="flex items-center gap-1 mt-3 pt-2.5 border-t border-white/[0.03]"
              >
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-cyan-400 transition-all px-2.5 py-1.5 rounded-lg hover:bg-cyan-400/5 border border-transparent hover:border-cyan-400/10"
                >
                  {copied ? <FiCheck size={12} className="text-emerald-400" /> : <FiCopy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(message.content)}
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${
                      isSpeaking
                        ? "text-purple-400 bg-purple-400/5 border-purple-400/10"
                        : "text-gray-500 hover:text-purple-400 hover:bg-purple-400/5 border-transparent hover:border-purple-400/10"
                    }`}
                  >
                    <FiVolume2 size={12} />
                    {isSpeaking ? "Speaking..." : "Speak"}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* User avatar */}
      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex-shrink-0"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(48,209,88,0.15), rgba(0,240,255,0.1))",
              border: "1px solid rgba(48,209,88,0.2)",
            }}
          >
            <FiUser className="text-emerald-400" size={15} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
