import React, { useEffect, useState } from "react";
import { getUserIdFromToken, getDecodedToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const GamificationProfileWidget = () => {
  const userId = getUserIdFromToken();
  const decoded = getDecodedToken();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await TeamChallengeService.getUserGamificationProfile(userId);
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching gamification profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)" }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontWeight: 600 }}>Loading Rewards & Level Profile…</p>
      </div>
    );
  }

  const user = profile || {
    name: decoded?.name || decoded?.sub || "Student",
    totalXp: 0,
    currentLevel: 1,
    xpRequiredForNextLevel: 100,
    levelProgressPercentage: 0.0,
    coins: 0,
    currentStreak: 1,
    badges: []
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Hero Level Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
        borderRadius: 24, padding: "36px", marginBottom: 32,
        color: "white", boxShadow: "0 16px 40px rgba(49,46,129,0.25)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22,
              background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: "1px", textTransform: "uppercase" }}>
                Gamification Status
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: "2px 0 0", fontFamily: "'Outfit', sans-serif" }}>
                {user.name}
              </h1>
              <div style={{ fontSize: 13, color: "#c7d2fe", marginTop: 4 }}>
                Active Student Competitor
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 16, textAlign: "center", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>⭐ {user.totalXp}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e0e7ff", marginTop: 2 }}>Total XP</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 16, textAlign: "center", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fb923c" }}>🪙 {user.coins}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e0e7ff", marginTop: 2 }}>Coins</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 16, textAlign: "center", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f43f5e" }}>🔥 {user.currentStreak}d</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e0e7ff", marginTop: 2 }}>Streak</div>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div style={{ marginTop: 28, background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
            <span>Level {user.currentLevel}</span>
            <span>Level {user.currentLevel + 1} ({Math.round(user.levelProgressPercentage)}% Progress)</span>
          </div>
          <div style={{ width: "100%", height: 10, borderRadius: 99, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${user.levelProgressPercentage}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #38bdf8, #818cf8)", transition: "width 0.5s ease" }} />
          </div>
          <div style={{ fontSize: 11.5, color: "#a5b4fc", marginTop: 6, textAlign: "right" }}>
            {user.totalXp} / {user.xpRequiredForNextLevel} XP required for next level
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div style={{ background: "var(--surface-1)", borderRadius: 24, padding: "28px 32px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
          Earned Badges & Achievements
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
          Unlock reusable achievement badges by completing team challenges and capturing module territories.
        </p>

        {(!user.badges || user.badges.length === 0) ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)", border: "1px dashed var(--border-medium)", borderRadius: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
            <p style={{ fontWeight: 600, margin: 0 }}>No badges unlocked yet. Complete team challenges to earn your first badge!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {user.badges.map((b) => (
              <div
                key={b.badgeCode}
                style={{
                  background: "var(--surface-2)", borderRadius: 18, padding: "20px",
                  border: "1px solid var(--border-subtle)", display: "flex", gap: 14, alignItems: "flex-start"
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14, background: "rgba(139,92,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0
                }}>
                  {b.icon || "🏆"}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{b.badgeName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>{b.description}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8b5cf6", marginTop: 6 }}>
                    Unlocked: {new Date(b.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default GamificationProfileWidget;
