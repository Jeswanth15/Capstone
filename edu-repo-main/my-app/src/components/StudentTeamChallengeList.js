import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserIdFromToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const StudentTeamChallengeList = () => {
  const studentId = getUserIdFromToken();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    TeamChallengeService.getStudentChallenges(studentId)
      .then((res) => {
        setChallenges(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching student challenges:", err);
        setError("Failed to load assigned team challenges.");
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", color: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "800", background: "linear-gradient(135deg, #34d399, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem 0" }}>
          My Team Challenges
        </h1>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>
          Collaborate with your teammates! Enter the lobby when your challenge window is open.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.875rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <p>Loading your team challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🛡️</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#e5e7eb", marginBottom: "0.5rem" }}>No Assigned Team Challenges</h3>
          <p style={{ color: "#9ca3af", maxWidth: "450px", margin: "0 auto", fontSize: "0.9rem" }}>
            You haven't been assigned to any upcoming team challenges by your teacher yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {challenges.map((c) => {
            // Find student's team name if available
            let studentTeamName = "Your Team";
            if (c.teams) {
              const myTeam = c.teams.find((t) => t.members && t.members.some((m) => m.userId === parseInt(studentId, 10)));
              if (myTeam) studentTeamName = myTeam.name;
            }

            return (
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
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "20px",
                        background: "rgba(52, 211, 153, 0.15)",
                        color: "#34d399",
                        border: "1px solid #10b981",
                      }}
                    >
                      🛡️ {studentTeamName}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>📅 {c.challengeDate}</span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#f3f4f6", margin: "0 0 0.5rem 0" }}>{c.title}</h3>

                  <div style={{ fontSize: "0.875rem", color: "#6ee7b7", fontWeight: "600", marginBottom: "0.75rem" }}>
                    📚 {c.subjectName} — {c.moduleName}
                  </div>

                  <div style={{ background: "#111827", borderRadius: "10px", padding: "0.75rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#d1d5db" }}>
                    <div style={{ marginBottom: "0.35rem" }}>⏰ Window: <strong>{c.startTime} – {c.endTime}</strong></div>
                    <div style={{ marginBottom: "0.35rem" }}>⏱️ Duration: <strong>{c.durationMinutes} mins</strong></div>
                    <div>❓ Questions: <strong>10 Questions</strong></div>
                  </div>
                </div>

                {c.sessionStatus === "COMPLETED" ? (
                  <Link
                    to={`/student/team-challenges/${c.id}/play`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      background: "rgba(167, 139, 250, 0.2)",
                      color: "#c084fc",
                      border: "1px solid #a78bfa",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                  >
                    📊 View Submitted Challenge (Completed)
                  </Link>
                ) : (
                  <Link
                    to={`/student/team-challenges/${c.id}/lobby`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#ffffff",
                      fontWeight: "700",
                      textDecoration: "none",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    🚀 Enter Team Lobby
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentTeamChallengeList;
