"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: "#060610" }}
    >
      {/* Background ambient glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,240,255,0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full translate-x-32 -translate-y-20"
        style={{
          background:
            "radial-gradient(circle, rgba(191,90,242,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full mx-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative mb-8"
        >
          {/* Outer ring */}
          <motion.div
            className="absolute -inset-6 rounded-full"
            style={{ border: "1px solid rgba(0,240,255,0.08)" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Logo container */}
          <motion.div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(191,90,242,0.08))",
              border: "1px solid rgba(0,240,255,0.12)",
              boxShadow:
                "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
            animate={{
              boxShadow: [
                "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
                "0 0 60px rgba(0,240,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                "0 0 40px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span
              className="text-2xl font-black"
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

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1
            className="text-3xl font-bold tracking-[0.25em] mb-2"
            style={{
              background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ZENO
          </h1>
          <p
            className="text-xs tracking-[0.15em] uppercase"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Intelligence Redefined
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full"
        >
          <div
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* Card top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)",
              }}
            />

            <p
              className="text-center text-sm mb-6"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Sign in to continue
            </p>

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,240,255,0.06), rgba(191,90,242,0.04))",
                border: "1px solid rgba(0,240,255,0.12)",
              }}
            >
              {/* Hover shimmer effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,240,255,0.04), transparent)",
                }}
              />

              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <FiLoader size={18} className="text-cyan-400" />
                </motion.div>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}

              <span style={{ color: "rgba(255,255,255,0.8)" }}>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </motion.button>
          </div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6 text-[10px] tracking-wider"
            style={{ color: "rgba(255,255,255,0.12)" }}
          >
            Powered by AI · Secured by Google
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
