"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Conversation } from "@/hooks/useZenoChat";
import {
  FiPlus,
  FiMessageSquare,
  FiTrash2,
  FiX,
  FiClock,
  FiZap,
  FiLogOut,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentSessionId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const { data: session } = useSession();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="fixed left-0 top-0 bottom-0 w-80 z-50 flex flex-col overflow-hidden"
        style={{
          background: "rgba(8,8,16,0.97)",
          backdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(0,240,255,0.06)",
        }}
      >
        {/* Sidebar inner glow line */}
        <div
          className="absolute top-0 right-0 w-[1px] h-full"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(0,240,255,0.1) 30%, rgba(191,90,242,0.08) 70%, transparent)",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-3">
            {/* Neon Z logo */}
            <div
              className="relative w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(191,90,242,0.12))",
                border: "1px solid rgba(0,240,255,0.15)",
                boxShadow: "0 0 12px rgba(0,240,255,0.08)",
              }}
            >
              <span
                className="text-xs font-black"
                style={{
                  background: "linear-gradient(135deg, #00f0ff, #bf5af2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Z
              </span>
            </div>
            <div>
              <h2 className="text-gray-200 font-semibold text-sm tracking-wide">History</h2>
              <p className="text-[9px] text-gray-600 mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <FiX size={16} />
          </motion.button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="group w-full relative flex items-center gap-2.5 p-3 rounded-xl text-sm transition-all overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,255,0.06), rgba(191,90,242,0.04))",
              border: "1px solid rgba(0,240,255,0.1)",
            }}
          >
            {/* Hover shimmer */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.03), transparent)",
              }}
            />
            <FiPlus size={16} className="text-cyan-400" />
            <span className="text-gray-300 font-medium">New Chat</span>
            <FiZap size={11} className="ml-auto text-cyan-600" />
          </motion.button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-thumb-white/5 space-y-0.5">
          <AnimatePresence mode="popLayout">
            {conversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <FiMessageSquare size={20} className="text-gray-700" />
                </div>
                <p className="text-gray-600 text-xs">No conversations yet</p>
                <p className="text-gray-700 text-[10px] mt-1">Start chatting with ZENO!</p>
              </motion.div>
            ) : (
              conversations.map((conv, index) => {
                const isActive = conv.sessionId === currentSessionId;
                return (
                  <motion.div
                    key={conv.sessionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => {
                      onSelectConversation(conv.sessionId);
                      onClose();
                    }}
                    className="group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: isActive
                        ? "rgba(0,240,255,0.04)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(0,240,255,0.08)"
                        : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <motion.div
                        layoutId="activeConv"
                        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                        style={{
                          background: "linear-gradient(to bottom, #00f0ff, #bf5af2)",
                          boxShadow: "0 0 6px rgba(0,240,255,0.3)",
                        }}
                      />
                    )}

                    <FiMessageSquare
                      size={14}
                      className="flex-shrink-0 mt-1"
                      style={{
                        color: isActive
                          ? "rgba(0,240,255,0.6)"
                          : "rgba(255,255,255,0.15)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] truncate"
                        style={{
                          color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {conv.title}
                      </p>
                      <div
                        className="flex items-center gap-1.5 mt-1.5"
                        style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}
                      >
                        <FiClock size={9} />
                        {formatDistanceToNow(new Date(conv.updatedAt), {
                          addSuffix: true,
                        })}
                        <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                        {conv.messageCount} msgs
                      </div>
                    </div>

                    {/* Delete button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.sessionId);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "rgba(255,55,95,0.7)";
                        e.currentTarget.style.background = "rgba(255,55,95,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.2)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <FiTrash2 size={13} />
                    </motion.button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer with User Profile */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
        >
          {session?.user && (
            <div className="flex items-center gap-3 mb-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                  style={{ border: "1px solid rgba(0,240,255,0.15)" }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(191,90,242,0.12))",
                    border: "1px solid rgba(0,240,255,0.15)",
                    color: "rgba(0,240,255,0.7)",
                  }}
                >
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{session.user.name}</p>
                <p className="text-[9px] text-gray-600 truncate">{session.user.email}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signOut()}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,55,95,0.7)";
                  e.currentTarget.style.background = "rgba(255,55,95,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.background = "transparent";
                }}
                title="Sign out"
              >
                <FiLogOut size={14} />
              </motion.button>
            </div>
          )}
          <p className="text-[9px] tracking-widest uppercase text-center" style={{ color: "rgba(255,255,255,0.12)" }}>
            ZENO v1.0
          </p>
        </div>
      </motion.aside>
    </>
  );
}
