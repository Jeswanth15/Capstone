import React from "react";

/**
 * BadgeCard - Premium Achievement Badge Component
 * Features subtle 3D depth tilt, light sweep animation, category styling, and unlock state.
 */
const BadgeCard = ({ badge, isUnlocked = true, onSelect }) => {
  const { title, category, description, xpReward = 50, icon = "🏆", unlockedAt } = badge;

  return (
    <div
      onClick={() => onSelect && onSelect(badge)}
      className={`badge-surface ${isUnlocked ? "unlocked" : "locked"}`}
      style={{
        position: "relative",
        background: isUnlocked
          ? "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))"
          : "rgba(15,23,42,0.5)",
        border: isUnlocked
          ? "1px solid rgba(251,191,36,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isUnlocked
          ? "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "none",
        opacity: isUnlocked ? 1 : 0.55,
      }}
      onMouseEnter={(e) => {
        if (isUnlocked) {
          e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
          e.currentTarget.style.boxShadow = "0 16px 36px rgba(245,158,11,0.25)";
        }
      }}
      onMouseLeave={(e) => {
        if (isUnlocked) {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        }
      }}
    >
      {/* Badge Icon Emblem Container */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: isUnlocked
            ? "linear-gradient(135deg, #f59e0b, #d97706)"
            : "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          boxShadow: isUnlocked ? "0 8px 20px rgba(245,158,11,0.4)" : "none",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: isUnlocked ? "#fbbf24" : "rgba(148,163,184,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {category || "ACHIEVEMENT"}
      </span>

      <h4
        style={{
          margin: "0 0 6px",
          color: isUnlocked ? "white" : "rgba(226,232,240,0.7)",
          fontSize: 15,
          fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {title}
      </h4>

      <p
        style={{
          margin: 0,
          color: "rgba(148,163,184,0.85)",
          fontSize: 12,
          lineHeight: 1.4,
          marginBottom: 12,
        }}
      >
        {description}
      </p>

      {/* XP Reward Pill */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: isUnlocked ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
          border: isUnlocked
            ? "1px solid rgba(245,158,11,0.3)"
            : "1px solid rgba(255,255,255,0.08)",
          padding: "4px 12px",
          borderRadius: 99,
        }}
      >
        <span style={{ fontSize: 12 }}>⭐</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: isUnlocked ? "#fbbf24" : "rgba(148,163,184,0.6)",
          }}
        >
          +{xpReward} XP
        </span>
      </div>
    </div>
  );
};

export default BadgeCard;
