import React, { useState, useEffect } from "react";
import CoinParticleFX from "./CoinParticleFX";

const DailyStreakModal = ({ streak = 1, xpEarned = 50, coinsEarned = 25, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [triggerParticles, setTriggerParticles] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    // Delay appearance slightly for smooth entry transition
    const t1 = setTimeout(() => setVisible(true), 150);
    const t2 = setTimeout(() => setShowBadges(true), 500);
    const t3 = setTimeout(() => setTriggerParticles(true), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: visible ? "rgba(15, 23, 42, 0.75)" : "rgba(15, 23, 42, 0)",
        backdropFilter: visible ? "blur(12px)" : "none",
        WebkitBackdropFilter: visible ? "blur(12px)" : "none",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        padding: 20,
      }}
      onClick={handleClose}
    >
      {/* Coin particle explosion */}
      {triggerParticles && <CoinParticleFX trigger={triggerParticles} count={30} />}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)",
          borderRadius: 24,
          padding: "36px 28px 28px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.35), 0 0 0 1px rgba(249, 115, 22, 0.3)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 70%)",
            pointerEvents: "none",
            borderRadius: "50%",
          }}
        />

        {/* Pulsing Flame Icon Container */}
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(245, 158, 11, 0.15))",
            border: "2px solid rgba(249, 115, 22, 0.5)",
            boxShadow: "0 0 30px rgba(249, 115, 22, 0.4), inset 0 0 15px rgba(249, 115, 22, 0.3)",
          }}
        >
          <span
            className="flame-pulse-anim"
            style={{
              fontSize: 52,
              filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.8))",
              display: "inline-block",
            }}
          >
            🔥
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#f97316",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Daily Login Bonus
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#ffffff",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          {streak > 1 ? `${streak}-Day Streak!` : "Streak Started!"}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {streak > 1
            ? "You're on fire! Keep logging in every day to build your streak and maximize your rewards."
            : "Welcome back! Log in every day to grow your streak and earn extra XP & Coins."}
        </p>

        {/* Reward Badges Container */}
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            marginBottom: 28,
            opacity: showBadges ? 1 : 0,
            transform: showBadges ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* XP Reward Badge */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(251, 191, 36, 0.15)",
            }}
          >
            <span style={{ fontSize: 22 }}>⭐</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fbbf24" }}>+{xpEarned} XP</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>XP Earned</div>
            </div>
          </div>

          {/* Coin Reward Badge */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.15)",
            }}
          >
            <span style={{ fontSize: 22 }}>🪙</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f97316" }}>+{coinsEarned}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Coins</div>
            </div>
          </div>
        </div>

        {/* Claim / Continue Button */}
        <button
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "#ffffff",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(249, 115, 22, 0.4)",
            transition: "all 0.2s ease",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Claim & Continue 🚀
        </button>
      </div>

      <style>{`
        @keyframes flamePulseKeyframe {
          0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(249,115,22,0.6)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 20px rgba(249,115,22,0.9)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(249,115,22,0.6)); }
        }
        .flame-pulse-anim {
          animation: flamePulseKeyframe 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DailyStreakModal;
