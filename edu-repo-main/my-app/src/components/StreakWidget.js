import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StreakWidget - Automatic LeetCode / Chess.com Style Streak Indicator
 * - Automatic 7-day weekly calculation based on gamStatus.currentStreak (No manual button)
 * - Header Pill component (LeetCode style 🔥 3) with interactive popover drawer
 * - Main Dashboard card view for Student Page
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to calculate active 7-day calendar array automatically based on current streak
const getAutomaticWeeklyCalendar = (streakCount = 1) => {
  const todayIdx = (new Date().getDay() + 6) % 7; // Convert 0-Sun to 6-Sun, 0-Mon
  const calendar = DAYS.map((day, idx) => {
    // Days up to today within the active streak range are marked active
    const daysBeforeToday = todayIdx - idx;
    const isActive = daysBeforeToday >= 0 && daysBeforeToday < streakCount;
    const isToday = idx === todayIdx;

    return {
      short: day,
      active: isActive,
      isToday: isToday,
    };
  });

  return calendar;
};

// 1. Chess.com / LeetCode Style Header Pill Badge with Popover
export const HeaderStreakBadge = ({ streakCount = 1 }) => {
  const [showPopover, setShowPopover] = useState(false);
  const calendar = getAutomaticWeeklyCalendar(streakCount);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Header Pill */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPopover(!showPopover)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(249, 115, 22, 0.14)",
          border: "1px solid rgba(249, 115, 22, 0.4)",
          padding: "6px 14px",
          borderRadius: 99,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
          color: "#ffedd5",
          fontWeight: 800,
          fontSize: 13,
          userSelect: "none",
        }}
      >
        <span className="flame-breath" style={{ fontSize: 16 }}>
          🔥
        </span>
        <span style={{ color: "#f97316", fontWeight: 900 }}>{streakCount}</span>
        <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 700 }}>Day Streak</span>
      </motion.div>

      {/* LeetCode / Chess.com Style Popover Calendar */}
      <AnimatePresence>
        {showPopover && (
          <>
            {/* Backdrop overlay to close popover */}
            <div
              onClick={() => setShowPopover(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9990,
                background: "transparent",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                zIndex: 9999,
                width: 320,
                background: "#0f172a",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 20,
                padding: "20px 22px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(249, 115, 22, 0.2)",
                color: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>🔥</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "white" }}>
                      {streakCount}-Day Streak
                    </h4>
                    <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>
                      🟢 Automatically Synced
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPopover(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                Your streak updates automatically when you log in or complete daily AI practice drills.
              </p>

              {/* 7-Day Calendar Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {calendar.map((item) => (
                  <div key={item.short} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                      {item.short}
                    </div>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        margin: "0 auto",
                        background: item.active
                          ? "linear-gradient(135deg, #f97316, #ea580c)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: item.isToday
                          ? "2px solid #38bdf8"
                          : item.active
                          ? "1px solid rgba(249, 115, 22, 0.5)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "white",
                        boxShadow: item.active ? "0 0 10px rgba(249, 115, 22, 0.4)" : "none",
                      }}
                    >
                      {item.active ? "✓" : "•"}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. Main Dashboard Automatic Streak Card
const StreakWidget = ({ streakCount = 3 }) => {
  const calendar = getAutomaticWeeklyCalendar(streakCount);

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
        borderRadius: 24,
        padding: "24px 28px",
        border: "1px solid rgba(249, 115, 22, 0.25)",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.25)",
        color: "white",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial Background Glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        {/* Left: Flame & Counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              filter: [
                "drop-shadow(0 0 10px rgba(249,115,22,0.6))",
                "drop-shadow(0 0 20px rgba(249,115,22,0.9))",
                "drop-shadow(0 0 10px rgba(249,115,22,0.6))",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(234, 88, 12, 0.15))",
              border: "1.5px solid rgba(249, 115, 22, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🔥
          </motion.div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>
              Active Learning Streak
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "white",
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: 1,
                }}
              >
                {streakCount}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fdba74" }}>Day Streak!</span>
            </div>
          </div>
        </div>

        {/* Right: Automatic Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            padding: "8px 18px",
            borderRadius: 99,
            color: "#34d399",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <span>✓ Synced & Active Today</span>
        </div>
      </div>

      {/* 7-Day Weekly Calendar Row (Automatic Calculation) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {calendar.map((item) => (
          <div key={item.short} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: item.isToday ? "#38bdf8" : "rgba(148, 163, 184, 0.8)" }}>
              {item.short}
            </span>
            <motion.div
              animate={{
                scale: item.active ? [1, 1.06, 1] : 1,
              }}
              transition={{ duration: 1.5, repeat: item.active ? Infinity : 0 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: item.active
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "rgba(255, 255, 255, 0.05)",
                border: item.isToday
                  ? "2px solid #38bdf8"
                  : item.active
                  ? "1px solid rgba(251, 146, 60, 0.6)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.active ? "white" : "rgba(255,255,255,0.3)",
                boxShadow: item.active ? "0 0 12px rgba(249, 115, 22, 0.4)" : "none",
              }}
            >
              {item.active ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700 }}>•</span>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakWidget;
