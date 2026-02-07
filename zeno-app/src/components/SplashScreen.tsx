"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#060610" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            {/* Outer ring */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{
                border: "1px solid rgba(0,240,255,0.1)",
              }}
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
            />

            {/* Inner ring */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                border: "1px solid rgba(191,90,242,0.08)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Logo container */}
            <motion.div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(191,90,242,0.08))",
                border: "1px solid rgba(0,240,255,0.12)",
                boxShadow: "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
              animate={{
                boxShadow: [
                  "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
                  "0 0 60px rgba(0,240,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                  "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="text-3xl font-black"
                style={{
                  background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Z
              </span>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={phase === "text" ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mt-8 text-center"
          >
            <h1
              className="text-2xl font-bold tracking-[0.3em]"
              style={{
                background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ZENO
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase === "text" ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-[11px] tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Intelligence Redefined
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === "text" ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-10 w-32 h-[2px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #00f0ff, #bf5af2)",
                boxShadow: "0 0 8px rgba(0,240,255,0.3)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
