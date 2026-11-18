import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getUserIdFromToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const TeamChallengeResultView = () => {
  const { id } = useParams(); // challengeId or sessionId
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = getUserIdFromToken();

  const [result, setResult] = useState(location.state?.resultDTO || null);
  const [loading, setLoading] = useState(!location.state?.resultDTO);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  useEffect(() => {
    if (result) {
      if (result.isModuleCapturedNow) {
        setShowCaptureModal(true);
      }
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await TeamChallengeService.submitChallenge(id, studentId);
        setResult(res.data);
        if (res.data?.isModuleCapturedNow) {
          setShowCaptureModal(true);
        }
      } catch (err) {
        console.error("Error fetching challenge results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, studentId, result]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-secondary)" }}>
        <div className="spinner spinner-lg" style={{ borderTopColor: "#8b5cf6", margin: "0 auto 16px" }} />
        <p style={{ fontWeight: 600 }}>Calculating Deterministic Team Evaluation & Territory Points…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", padding: 40, background: "var(--surface-1)", borderRadius: 24, border: "1px solid var(--border-light)" }}>
        <h2>Result Not Found</h2>
        <button onClick={() => navigate("/student/team-challenges")} style={{ padding: "10px 20px", borderRadius: 12, background: "var(--primary-color)", color: "white", border: "none", cursor: "pointer", fontWeight: 700, marginTop: 16 }}>
          Return to Team Challenges
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      
      {/* CAPTURE NOTIFICATION OVERLAY BANNER */}
      {showCaptureModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
            borderRadius: 28, padding: "40px 48px", maxWidth: 500, width: "100%",
            textAlign: "center", border: "2px solid rgba(167,139,250,0.5)",
            boxShadow: "0 20px 60px rgba(124,58,237,0.5)",
            animation: "slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🏰</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
              Territory Overthrown!
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              MODULE CAPTURED!
            </h2>
            <p style={{ color: "#ddd6fe", fontSize: 15, margin: "16px 0 24px", lineHeight: 1.5 }}>
              <strong style={{ color: "white" }}>{result.teamName}</strong> has overtaken <span style={{ color: "#fb7185" }}>{result.previousModuleControllerTeam || "the previous leader"}</span> and captured control of the <strong style={{ color: "#f59e0b" }}>{result.moduleName}</strong> territory!
            </p>
            <button
              onClick={() => setShowCaptureModal(false)}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", color: "white", fontWeight: 800, fontSize: 15,
                cursor: "pointer", boxShadow: "0 6px 20px rgba(16,185,129,0.4)"
              }}
            >
              Claim Victory & Continue 🎉
            </button>
          </div>
        </div>
      )}

      {/* Main Results Card */}
      <div style={{
        background: "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2) 100%)",
        borderRadius: 28, border: "1px solid var(--border-light)", boxShadow: "var(--shadow-lg)",
        overflow: "hidden"
      }}>
        
        {/* Banner Header */}
        <div style={{
          background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
          padding: "36px 40px", color: "white", textAlign: "center", position: "relative"
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#a5b4fc", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
            Official Challenge Evaluation
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            TEAM CHALLENGE COMPLETE
          </h1>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e7ff", marginTop: 6 }}>
            {result.teamName} — {result.challengeTitle}
          </div>
        </div>

        {/* Score & Metrics Bar */}
        <div style={{ padding: "32px 40px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            
            {/* Score */}
            <div style={{ background: "var(--surface-1)", borderRadius: 20, padding: "20px", border: "1px solid var(--border-light)", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Team Score</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#8b5cf6", fontFamily: "'Outfit', sans-serif", margin: "4px 0" }}>
                {result.score} <span style={{ fontSize: 16, color: "var(--text-tertiary)", fontWeight: 600 }}>/ 100</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                {result.correctAnswers} / {result.totalQuestions} Correct ({result.percentage}%)
              </div>
            </div>

            {/* XP Awarded */}
            <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: 20, padding: "20px", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>XP Earned</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981", fontFamily: "'Outfit', sans-serif", margin: "4px 0" }}>
                +{result.xpEarned} <span style={{ fontSize: 16 }}>XP</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
                Awarded to all team members
              </div>
            </div>

            {/* Level & Progress */}
            <div style={{ background: "var(--surface-1)", borderRadius: 20, padding: "20px", border: "1px solid var(--border-light)", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Student Level</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#3b82f6", fontFamily: "'Outfit', sans-serif", margin: "4px 0" }}>
                Lvl {result.currentUserLevel}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>
                Total XP: {result.currentUserTotalXp}
              </div>
            </div>

          </div>

          {/* Module Territory Control Banner */}
          <div style={{
            marginTop: 24, background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
            borderRadius: 20, padding: "20px 24px", border: "1.5px solid rgba(139,92,246,0.3)",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "1px" }}>
                🏰 Module Territory Status
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text-primary)", marginTop: 2, fontFamily: "'Outfit', sans-serif" }}>
                {result.moduleName} — Rank #{result.moduleRankPosition}
              </div>
            </div>
            <div style={{ background: "var(--surface-1)", padding: "8px 16px", borderRadius: 12, border: "1px solid var(--border-subtle)", fontSize: 13, fontWeight: 800, color: "#6366f1" }}>
              Controlled By 👑 {result.currentModuleControllerTeam} ({result.modulePointsTotal} pts)
            </div>
          </div>
        </div>

        {/* Question Evaluations Table */}
        <div style={{ padding: "32px 40px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
            Deterministic Answer Evaluation
          </h3>

          <div className="table-scroll-wrapper">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>Q#</th>
                  <th style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>Submitted Answer</th>
                  <th style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>Correct Answer</th>
                  <th style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", textAlign: "center" }}>Result</th>
                  <th style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", textAlign: "right" }}>Marks</th>
                </tr>
              </thead>
              <tbody>
                {(result.questionEvaluations || []).map((q) => (
                  <tr key={q.questionNumber}>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 800 }}>Q{q.questionNumber}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", color: q.isCorrect ? "var(--text-primary)" : "#ef4444" }}>
                      {q.selectedOption || <span style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>No Answer</span>}
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700, color: "#10b981" }}>{q.correctOption}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", textAlign: "center" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                        background: q.isCorrect ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: q.isCorrect ? "#10b981" : "#ef4444"
                      }}>
                        {q.isCorrect ? "✓ Correct" : "✕ Incorrect"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", textAlign: "right", fontWeight: 800, color: q.isCorrect ? "#10b981" : "var(--text-tertiary)" }}>
                      +{q.marksObtained}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/student/team-challenges")}
              style={{
                padding: "14px 36px", borderRadius: 16, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                border: "none", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(109,40,217,0.3)"
              }}
            >
              Return to Module Territory Hub →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamChallengeResultView;
