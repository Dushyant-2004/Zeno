"use client";

import { motion } from "framer-motion";
import TypingEffect from "./TypingEffect";
import { FiZap, FiCode, FiCpu, FiMic, FiArrowRight } from "react-icons/fi";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: <FiCode size={22} />,
    title: "Write Code",
    prompt: "Write a Python function that finds all prime numbers up to a given limit using the Sieve of Eratosthenes",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(0,240,255,0.15)",
    iconBg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-500/30",
  },
  {
    icon: <FiZap size={22} />,
    title: "Solve Problems",
    prompt: "Explain how to design a URL shortener system with high availability",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(255,149,0,0.15)",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
  },
  {
    icon: <FiCpu size={22} />,
    title: "Build Logic",
    prompt: "Help me understand dynamic programming with a step-by-step example",
    gradient: "from-emerald-500 to-green-600",
    glow: "rgba(48,209,88,0.15)",
    iconBg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    icon: <FiMic size={22} />,
    title: "Voice Chat",
    prompt: "What can you help me with using voice commands?",
    gradient: "from-purple-500 to-pink-600",
    glow: "rgba(191,90,242,0.15)",
    iconBg: "bg-purple-500/10",
    borderHover: "hover:border-purple-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12"
    >
      {/* Main Logo with rings */}
      <motion.div
        variants={itemVariants}
        className="relative mb-10"
      >
        {/* Outer rotating ring */}
        <div className="absolute inset-[-30px] animate-rotate-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,240,255,0.4)" />
                <stop offset="50%" stopColor="rgba(191,90,242,0.4)" />
                <stop offset="100%" stopColor="rgba(0,240,255,0)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#ringGrad1)" strokeWidth="0.5" strokeDasharray="8 12" />
          </svg>
        </div>

        {/* Inner rotating ring */}
        <div className="absolute inset-[-16px] animate-rotate-reverse">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(191,90,242,0.3)" />
                <stop offset="100%" stopColor="rgba(0,240,255,0)" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="72" fill="none" stroke="url(#ringGrad2)" strokeWidth="0.8" strokeDasharray="4 8" />
          </svg>
        </div>

        {/* Pulsing glow behind logo */}
        <motion.div
          className="absolute inset-[-20px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,240,255,0.2) 0%, rgba(191,90,242,0.1) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo */}
        <motion.div
          className="relative w-28 h-28 rounded-3xl flex items-center justify-center neon-glow"
          style={{
            background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(191,90,242,0.15))",
            border: "1px solid rgba(0,240,255,0.2)",
          }}
          animate={{
            borderColor: [
              "rgba(0,240,255,0.2)",
              "rgba(191,90,242,0.3)",
              "rgba(94,92,230,0.2)",
              "rgba(0,240,255,0.2)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <motion.span
            className="text-5xl font-black"
            style={{
              background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Z
          </motion.span>
        </motion.div>

        {/* Orbiting particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + i * 1.5,
              height: 4 + i * 1.5,
              top: "50%",
              left: "50%",
              background: i % 2 === 0 ? "#00f0ff" : "#bf5af2",
              boxShadow: `0 0 8px ${i % 2 === 0 ? "rgba(0,240,255,0.6)" : "rgba(191,90,242,0.6)"}`,
            }}
            animate={{
              x: [
                Math.cos((i * 72 * Math.PI) / 180) * (60 + i * 5),
                Math.cos(((i * 72 + 360) * Math.PI) / 180) * (60 + i * 5),
              ],
              y: [
                Math.sin((i * 72 * Math.PI) / 180) * (60 + i * 5),
                Math.sin(((i * 72 + 360) * Math.PI) / 180) * (60 + i * 5),
              ],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.div variants={itemVariants} className="text-center mb-3">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
          <span className="gradient-text">
            <TypingEffect text="Hello, I'm ZENO" speed={50} />
          </span>
        </h1>
      </motion.div>

      {/* Subtitle with animated underline */}
      <motion.div variants={itemVariants} className="text-center mb-3">
        <p className="text-lg sm:text-xl text-gray-400 font-light">
          Your <span className="text-cyan-400 font-medium">superintelligent</span> AI companion
        </p>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-gray-500 text-center max-w-md mb-12 text-sm leading-relaxed"
      >
        I solve complex problems, write production code, build algorithms,
        and even respond to your voice. Try me.
      </motion.p>

      {/* Suggestion cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full"
      >
        {suggestions.map((s, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{
              scale: 1.03,
              y: -4,
              transition: { type: "spring", stiffness: 300 },
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSuggestionClick(s.prompt)}
            className={`group relative text-left p-5 rounded-2xl border border-white/5 ${s.borderHover} bg-white/[0.02] backdrop-blur-sm transition-all duration-300 overflow-hidden`}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${s.glow} 0%, transparent 70%)`,
              }}
            />

            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className={`h-full bg-gradient-to-r ${s.gradient} shimmer`} />
            </div>

            <div className="relative">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.iconBg} mb-3`}>
                <span className={`bg-gradient-to-br ${s.gradient} bg-clip-text`} style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}>
                  {s.icon}
                </span>
              </div>

              {/* Title with arrow */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
                  {s.title}
                </span>
                <FiArrowRight
                  size={14}
                  className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                />
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors leading-relaxed line-clamp-2">
                {s.prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom hint */}
      <motion.div
        variants={itemVariants}
        className="mt-10 flex items-center gap-3 text-gray-600 text-xs"
      >
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <FiMic size={11} className="text-cyan-500" />
          <span>Voice enabled</span>
        </motion.div>
        <div className="w-1 h-1 rounded-full bg-gray-700" />
        <span>Powered by GPT-4o</span>
        <div className="w-1 h-1 rounded-full bg-gray-700" />
        <span>Streaming responses</span>
      </motion.div>
    </motion.div>
  );
}
