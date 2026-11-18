import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserIdFromToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const TeacherTeamChallengeList = () => {
  const teacherId = getUserIdFromToken();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacherId) return;
    TeamChallengeService.getTeacherChallenges(teacherId)
      .then((res) => {
        setChallenges(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching teacher challenges:", err);
        setError("Failed to load team challenges.");
      })
      .finally(() => setLoading(false));
  }, [teacherId]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", color: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", background: "linear-gradient(135deg, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem 0" }}>
            Team Challenges
          </h1>
          <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>
            Manage and view your published collaborative AI team challenges.
          </p>
        </div>
        <Link
          to="/teacher/team-challenges/create"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            color: "#ffffff",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
          }}
        >
          <span>➕</span> Create New Challenge
        </Link>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.875rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <p>Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>⚔️</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#e5e7eb", marginBottom: "0.5rem" }}>No Team Challenges Yet</h3>
          <p style={{ color: "#9ca3af", maxWidth: "450px", margin: "0 auto 1.5rem auto", fontSize: "0.9rem" }}>
            You haven't created any team challenges. Click below to configure your first team challenge for your class.
          </p>
          <Link
            to="/teacher/team-challenges/create"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "#8b5cf6",
              color: "#ffffff",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Create Team Challenge
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {challenges.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "16px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                position: "relative",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "20px",
                      background: c.difficulty === "HARD" ? "rgba(239, 68, 68, 0.2)" : c.difficulty === "MEDIUM" ? "rgba(245, 158, 11, 0.2)" : "rgba(34, 197, 94, 0.2)",
                      color: c.difficulty === "HARD" ? "#fca5a5" : c.difficulty === "MEDIUM" ? "#fde68a" : "#86efac",
                      border: `1px solid ${c.difficulty === "HARD" ? "#ef4444" : c.difficulty === "MEDIUM" ? "#f59e0b" : "#22c55e"}`,
                    }}
                  >
                    {c.difficulty}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>📅 {c.challengeDate}</span>
                </div>

                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f3f4f6", margin: "0 0 0.5rem 0" }}>{c.title}</h3>

                <div style={{ fontSize: "0.875rem", color: "#a78bfa", fontWeight: "600", marginBottom: "0.75rem" }}>
                  📚 {c.subjectName} — {c.moduleName}
                </div>

                <div style={{ background: "#111827", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#d1d5db" }}>
                  <div style={{ marginBottom: "0.35rem" }}>🏫 Class: <strong>{c.className} {c.classSection ? `(${c.classSection})` : ""}</strong></div>
                  <div style={{ marginBottom: "0.35rem" }}>⏰ Window: <strong>{c.startTime} – {c.endTime}</strong></div>
                  <div style={{ marginBottom: "0.35rem" }}>⏱️ Duration: <strong>{c.durationMinutes} mins</strong></div>
                  <div>❓ Questions: <strong>10 (Generated on majority start)</strong></div>
                </div>

                {/* Teams summary */}
                <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1rem" }}>
                  <strong>Assigned Teams ({c.teams ? c.teams.length : 0}):</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
                    {c.teams && c.teams.map((t) => (
                      <span key={t.id} style={{ background: "rgba(167, 139, 250, 0.15)", color: "#c084fc", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem" }}>
                        🛡️ {t.name} ({t.members ? t.members.length : 0})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.75rem", color: "#6b7280", borderTop: "1px solid #374151", paddingTop: "0.75rem", fontStyle: "italic" }}>
                🔒 Questions hidden from teacher until team lobby start.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherTeamChallengeList;
