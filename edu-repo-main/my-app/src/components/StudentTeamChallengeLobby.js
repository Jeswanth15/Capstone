import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const StudentTeamChallengeLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const studentId = getUserIdFromToken();

  const [lobbyData, setLobbyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const pollTimerRef = useRef(null);

  const fetchLobby = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await TeamChallengeService.getLobbyStatus(id, studentId);
      const data = res.data;
      setLobbyData(data);
      setError("");

      // Automatically navigate to player if session has started (ACTIVE, COMPLETED, or questions generated)
      if (data.sessionStatus === "ACTIVE" || data.sessionStatus === "COMPLETED" || data.generationStatus === "GENERATED" || data.generationStatus === "GENERATING") {
        setTimeout(() => {
          navigate(`/student/team-challenges/${id}/play`);
        }, 1200);
      }
    } catch (err) {
      console.error("Error fetching lobby status:", err);
      setError("Failed to load lobby status.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobby(true);

    // Poll every 2 seconds
    pollTimerRef.current = setInterval(() => {
      fetchLobby(false);
    }, 2000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [id, studentId]);

  const handleToggleReady = async () => {
    setToggling(true);
    try {
      const res = await TeamChallengeService.toggleReady(id, studentId);
      const data = res.data;
      setLobbyData(data);

      if (data.sessionStatus === "ACTIVE" || data.generationStatus === "GENERATED" || data.generationStatus === "GENERATING") {
        setTimeout(() => {
          navigate(`/student/team-challenges/${id}/play`);
        }, 1000);
      }
    } catch (err) {
      console.error("Error toggling ready:", err);
      setError("Failed to update ready status.");
    } finally {
      setToggling(false);
    }
  };

  if (loading && !lobbyData) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#f3f4f6" }}>
        <h2>Loading Team Lobby...</h2>
      </div>
    );
  }

  if (error && !lobbyData) {
    return (
      <div style={{ padding: "3rem", maxWidth: "600px", margin: "0 auto", textAlign: "center", color: "#fca5a5" }}>
        <h3>Error Loading Lobby</h3>
        <p>{error}</p>
        <button onClick={() => navigate("/student/team-challenges")} style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", background: "#374151", color: "#fff", border: "none", cursor: "pointer" }}>
          Back to Team Challenges
        </button>
      </div>
    );
  }

  const {
    subjectName,
    moduleName,
    teamName,
    totalTeamMembers = 0,
    readyMembersCount = 0,
    majorityThreshold = 0,
    majorityReached = false,
    sessionStatus,
    generationStatus,
    isCurrentUserReady,
    members = [],
  } = lobbyData || {};

  return (
    <div style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto", color: "#f3f4f6" }}>
      {/* Lobby Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(52, 211, 153, 0.15)", border: "1px solid #10b981", padding: "0.35rem 1rem", borderRadius: "20px", color: "#34d399", fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.75rem" }}>
          🛡️ TEAM LOBBY
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 0.5rem 0", color: "#ffffff" }}>
          {teamName}
        </h1>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>
          Subject: <span style={{ color: "#34d399", fontWeight: "600" }}>{subjectName}</span> | Module: <span style={{ color: "#a78bfa", fontWeight: "600" }}>{moduleName}</span>
        </p>
      </div>

      {/* Main Lobby Card */}
      <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "24px", padding: "2rem", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}>
        {/* Status Indicator Banner */}
        <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1.25rem", borderRadius: "16px", background: majorityReached ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)", border: `1px solid ${majorityReached ? "#22c55e" : "#f59e0b"}` }}>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: majorityReached ? "#4ade80" : "#fbbf24", marginBottom: "0.25rem" }}>
            {readyMembersCount} / {totalTeamMembers} Ready
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: majorityReached ? "#86efac" : "#fef08a" }}>
            {majorityReached ? "🎉 Majority reached! Starting challenge & generating questions..." : `Waiting for majority... (${majorityThreshold} members needed)`}
          </div>
        </div>

        {/* Member Status List */}
        <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#d1d5db", marginBottom: "1rem" }}>
          Team Members:
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          {members.map((m) => (
            <div
              key={m.userId}
              style={{
                display: "flex",
                alignItems: "center",
                justify: "space-between",
                padding: "0.875rem 1.25rem",
                borderRadius: "12px",
                background: m.isReady ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${m.isReady ? "rgba(34, 197, 94, 0.3)" : "#374151"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{m.isReady ? "✓" : "○"}</span>
                <div>
                  <div style={{ fontWeight: "600", color: m.isReady ? "#4ade80" : "#e5e7eb", fontSize: "0.95rem" }}>
                    {m.name} {m.userId === parseInt(studentId, 10) && "(You)"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{m.email}</div>
                </div>
              </div>

              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "20px",
                  background: m.isReady ? "#22c55e" : "#374151",
                  color: m.isReady ? "#ffffff" : "#9ca3af",
                }}
              >
                {m.isReady ? "Ready" : "Waiting"}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div style={{ textAlign: "center" }}>
          {sessionStatus === "ACTIVE" || generationStatus === "GENERATING" || generationStatus === "GENERATED" ? (
            <div style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid #3b82f6", color: "#93c5fd", padding: "1rem", borderRadius: "14px", fontWeight: "700" }}>
              ⚡ Challenge Activated! Generating your team's 10 questions...
            </div>
          ) : (
            <button
              onClick={handleToggleReady}
              disabled={toggling}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "14px",
                background: isCurrentUserReady
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                fontSize: "1.1rem",
                fontWeight: "800",
                border: "none",
                cursor: toggling ? "not-allowed" : "pointer",
                boxShadow: isCurrentUserReady ? "0 4px 14px rgba(239, 68, 68, 0.4)" : "0 4px 14px rgba(16, 185, 129, 0.4)",
                transition: "transform 0.15s ease",
              }}
            >
              {toggling ? "Updating..." : isCurrentUserReady ? "Cancel Ready Status" : "⚔️ I'm Ready / Start Challenge"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTeamChallengeLobby;
