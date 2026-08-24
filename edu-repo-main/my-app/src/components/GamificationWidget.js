import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GamificationWidget - Animated XP, Level Meter & Badge Unlock Reveal System
 */
const LEVEL_TITLES = [
  "Novice Learner",
  "Curious Scholar",
  "Knowledge Explorer",
  "Academic Pioneer",
  "Master Strategist",
  "Grand Polymath",
  "Edu LMS Legend",
];

// Helper Hook for Smooth Number Count-Up Animation
export const useCountUp = (targetValue, duration = 1200) => {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = prevTarget.current;
    const diff = targetValue - startValue;

    if (diff === 0) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easedProgress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        prevTarget.current = targetValue;
      }
    };

    requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count;
};

// 1. XP Counter Component
export const AnimatedXpCounter = ({ value, prefix = "", suffix = " XP" }) => {
  const displayed = useCountUp(value);
  return (
    <span>
      {prefix}
      {displayed.toLocaleString()}
      {suffix}
    </span>
  );
};

// 2. Floating XP Reward Trigger Particle Component
export const FloatingXpReward = ({ xp = 50, show = false, onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1, 0.8],
          y: [20, -40, -90, -140],
        }}
        transition={{ duration: 2, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          color: "#0f172a",
          padding: "10px 22px",
          borderRadius: 99,
          fontWeight: 900,
          fontSize: 20,
          boxShadow: "0 10px 30px rgba(245, 158, 11, 0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "2px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <span>✨</span>
        <span>+{xp} XP</span>
      </motion.div>

      {/* Trailing XP Particle trail */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.3, 1, 0],
            x: (i % 2 === 0 ? 1 : -1) * (15 + i * 8),
            y: [0, -30 - i * 15, -80],
          }}
          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fbbf24",
            boxShadow: "0 0 10px #fbbf24",
          }}
        />
      ))}
    </div>
  );
};

// 3. Premium Badge Reveal Modal Component
export const BadgeUnlockModal = ({ badge, isOpen, onClose }) => {
  if (!isOpen || !badge) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15, 23, 42, 0.82)",
          backdropFilter: "blur(16px)",
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: -20, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 28,
            padding: "36px 32px 32px",
            textAlign: "center",
            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 58, 237, 0.35)",
            position: "relative",
            overflow: "hidden",
            perspective: 1000,
          }}
        >
          {/* Shimmer Light Sweep Effect Across Badge */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-150%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
              transform: "skewX(-25deg)",
              animation: "shimmerSweep 2.5s infinite ease-in-out",
              pointerEvents: "none",
            }}
          />

          {/* Glowing Radial Depth Layer */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Badge Icon Presentation */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: [0, 1.2, 1], rotate: [ -15, 5, 0 ] }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            style={{
              width: 100,
              height: 100,
              margin: "0 auto 20px",
              borderRadius: 24,
              background: badge.bg || "linear-gradient(135deg, #7c3aed, #4338ca)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              boxShadow: "0 12px 32px rgba(124, 58, 237, 0.5), inset 0 0 15px rgba(255,255,255,0.3)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {badge.icon || "🏆"}
          </motion.div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#a78bfa",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            ✨ Achievement Unlocked
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "white",
              margin: "0 0 8px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {badge.name || "Master Explorer"}
          </h2>

          <p
            style={{
              fontSize: 13,
              color: "rgba(226, 232, 240, 0.8)",
              lineHeight: 1.5,
              margin: "0 0 24px",
            }}
          >
            {badge.description || "Demonstrated outstanding learning consistency and core topic mastery."}
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(251, 191, 36, 0.15)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              padding: "8px 18px",
              borderRadius: 99,
              color: "#fbbf24",
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 28,
            }}
          >
            <span>⭐ +{badge.xpReward || 100} XP Reward</span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "14px 24px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "white",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            Claim Badge 🚀
          </button>
        </motion.div>

        <style>{`
          @keyframes shimmerSweep {
            0% { left: -150%; }
            50% { left: 150%; }
            100% { left: 150%; }
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

// 4. Main Integrated Gamification Progress Bar & Level Card Component
const GamificationWidget = ({ status, onSimulateXp }) => {
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  if (!status) return null;

  const { totalXp = 0, currentLevel = 1, levelName = "Novice Scholar", nextLevelXpThreshold = 500, coins = 0 } = status;
  const progressPercent = Math.min((totalXp / nextLevelXpThreshold) * 100, 100);

  const mockBadge = {
    name: "AI Fast Learner",
    icon: "⚡",
    description: "Completed 5 consecutive AI quizzes with accuracy over 80%.",
    xpReward: 150,
    bg: "linear-gradient(135deg, #f59e0b, #ef4444)",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 24,
        padding: "24px 28px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.25)",
        color: "white",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        
        {/* Level & XP Overview */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              position: "relative",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 24,
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            <span>{currentLevel}</span>
            <div
              style={{
                position: "absolute",
                inset: -3,
                borderRadius: "50%",
                border: "2px solid rgba(147, 197, 253, 0.5)",
                animation: "pulseRing 2.5s infinite ease-in-out",
                pointerEvents: "none",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
                Level {currentLevel} • {levelName}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: "rgba(16, 185, 129, 0.18)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#34d399",
                  padding: "2px 10px",
                  borderRadius: 99,
                }}
              >
                {LEVEL_TITLES[(currentLevel - 1) % LEVEL_TITLES.length]}
              </span>
            </div>

            <div style={{ fontSize: 13, color: "rgba(148, 163, 184, 0.9)", marginTop: 4, fontWeight: 600 }}>
              <AnimatedXpCounter value={totalXp} /> / {nextLevelXpThreshold} XP needed for next tier
            </div>
          </div>
        </div>

        {/* Coins & Badge Trigger Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "8px 16px",
              borderRadius: 14,
              color: "#fbbf24",
              fontWeight: 800,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🪙</span>
            <span>{coins} Coins</span>
          </div>

          <button
            onClick={() => setShowBadgeModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 14,
              background: "rgba(124, 58, 237, 0.2)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#c084fc",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🏆 View Badges</span>
          </button>
        </div>

      </div>

      {/* Smooth Spring Progress Bar */}
      <div style={{ marginTop: 20 }}>
        <div style={{ width: "100%", height: 10, borderRadius: 99, background: "rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #34d399)",
              borderRadius: 99,
              boxShadow: "0 0 12px rgba(52, 211, 153, 0.5)",
            }}
          />
        </div>
      </div>

      <BadgeUnlockModal badge={mockBadge} isOpen={showBadgeModal} onClose={() => setShowBadgeModal(false)} />

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default GamificationWidget;
