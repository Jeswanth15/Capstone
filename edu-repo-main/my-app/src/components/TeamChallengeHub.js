import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecodedToken, getUserIdFromToken } from "../utils/authHelper";
import { getAllSubjects } from "../utils/api";
import TeamChallengeService from "../services/TeamChallengeService";

const DEFAULT_SUBJECTS = [
  { subjectId: 101, name: "Data Structures", code: "CS201", icon: "🌳" },
  { subjectId: 102, name: "Database Management", code: "CS202", icon: "🗄️" },
  { subjectId: 103, name: "Operating Systems", code: "CS203", icon: "⚙️" },
  { subjectId: 104, name: "Computer Networks", code: "CS204", icon: "🌐" },
];

const TeamChallengeHub = () => {
  const decoded = getDecodedToken();
  const navigate = useNavigate();
  const studentId = getUserIdFromToken();
  const role = decoded?.role || "STUDENT";

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);

  // Load subjects & challenges on mount
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const subRes = await getAllSubjects();
        const apiSubs = subRes.data || [];
        setSubjects(apiSubs.length > 0 ? apiSubs : DEFAULT_SUBJECTS);

        if (role === "STUDENT" && studentId) {
          const chRes = await TeamChallengeService.getStudentChallenges(studentId);
          setChallenges(chRes.data || []);
        } else if (role === "TEACHER" && decoded?.userId) {
          const chRes = await TeamChallengeService.getTeacherChallenges(decoded.userId);
          setChallenges(chRes.data || []);
        }
      } catch (err) {
        console.error("Error initializing TeamChallengeHub:", err);
        setSubjects(DEFAULT_SUBJECTS);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [role, studentId, decoded?.userId]);

  // Load modules whenever a subject is selected
  const handleSelectSubject = async (subj) => {
    setSelectedSubject(subj);
    setModulesLoading(true);
    try {
      const res = await TeamChallengeService.getSubjectModules(subj.subjectId);
      setModules(res.data || []);
    } catch (err) {
      console.error("Error loading subject modules:", err);
      setModules([
        { moduleName: "Arrays", controllingTeamName: "UNCLAIMED", controllingTeamPoints: 0, competingTeams: [] },
        { moduleName: "Linked List", controllingTeamName: "UNCLAIMED", controllingTeamPoints: 0, competingTeams: [] },
        { moduleName: "Stack & Queue", controllingTeamName: "UNCLAIMED", controllingTeamPoints: 0, competingTeams: [] },
        { moduleName: "Trees", controllingTeamName: "UNCLAIMED", controllingTeamPoints: 0, competingTeams: [] },
        { moduleName: "Graphs", controllingTeamName: "UNCLAIMED", controllingTeamPoints: 0, competingTeams: [] },
      ]);
    } finally {
      setModulesLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-secondary)" }}>
        <div className="spinner spinner-lg" style={{ borderTopColor: "#8b5cf6", margin: "0 auto 16px" }} />
        <p style={{ fontWeight: 600 }}>Loading Team Challenge Territories…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
        borderRadius: 24, padding: "32px 36px", marginBottom: 32,
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: "0 16px 40px rgba(49,46,129,0.25)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -40, right: 30, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)", filter: "blur(25px)" }} />
        
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
               🏰 Territory Conquest Mode
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: 0, letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>
              Team Challenges & Module Territories
            </h1>
            <p style={{ color: "#c7d2fe", fontSize: 13.5, margin: "6px 0 0" }}>
              Compete in team challenges, earn XP, and capture control of module territories for your team!
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate(role === "TEACHER" ? "/teacher/team-challenges/list" : "/student/team-challenges/list")}
              style={{
                padding: "10px 18px", borderRadius: 12, background: "rgba(167,139,250,0.2)",
                border: "1px solid rgba(167,139,250,0.4)", color: "#e9d5ff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", backdropFilter: "blur(8px)"
              }}
            >
              📋 {role === "TEACHER" ? "All Created Challenges List" : "My Team Challenges List"}
            </button>
            <button
              onClick={() => navigate("/student/leaderboard")}
              style={{
                padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 13, fontWeight: 700,
                cursor: "pointer", backdropFilter: "blur(8px)"
              }}
            >
              🏆 Leaderboard
            </button>
            {role === "TEACHER" && (
              <button
                onClick={() => navigate("/teacher/team-challenges/create")}
                style={{
                  padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none", color: "white", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                }}
              >
                ➕ Create Challenge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1: SUBJECT SELECTION */}
      {!selectedSubject ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Step 1: Select Academic Subject
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Choose a subject to view its module territory map and competing teams.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {subjects.map((sub) => (
                <div
                  key={sub.subjectId}
                  onClick={() => handleSelectSubject(sub)}
                  style={{
                    background: "var(--surface-1)", borderRadius: 20, padding: "24px",
                    border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)",
                    cursor: "pointer", transition: "all 0.25s ease",
                    display: "flex", flexDirection: "column", gap: 14
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(139,92,246,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: "rgba(139,92,246,0.12)", color: "#8b5cf6",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>
                      {sub.icon || "📚"}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: "var(--surface-2)", color: "var(--text-tertiary)" }}>
                      {sub.code || `SUB-${sub.subjectId}`}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      Explore territory modules & team ranks
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 12, fontWeight: 700, color: "#8b5cf6" }}>
                    <span>View Territory Map</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ALL ACTIVE & CREATED CHALLENGES LIST */}
          <div style={{ background: "var(--surface-1)", borderRadius: 24, padding: "28px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                  ⚔️ All Active & Upcoming Team Challenges ({challenges.length})
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {role === "TEACHER" ? "All team challenges created by you across all subjects." : "All team challenges assigned to you."}
                </p>
              </div>
              <button
                onClick={() => navigate(role === "TEACHER" ? "/teacher/team-challenges/list" : "/student/team-challenges/list")}
                style={{
                  padding: "8px 16px", borderRadius: 10, background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", fontSize: 12.5, fontWeight: 700, cursor: "pointer"
                }}
              >
                View Detailed Table →
              </button>
            </div>

            {challenges.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-tertiary)", border: "1px dashed var(--border-medium)", borderRadius: 16 }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>⚔️</span>
                No active team challenges found. {role === "TEACHER" ? "Click 'Create Challenge' above to create one." : "Check back when your teacher assigns a new challenge."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {challenges.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                      padding: "16px 20px", borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{c.title}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                          background: c.difficulty === "HARD" ? "rgba(239, 68, 68, 0.2)" : c.difficulty === "MEDIUM" ? "rgba(245, 158, 11, 0.2)" : "rgba(34, 197, 94, 0.2)",
                          color: c.difficulty === "HARD" ? "#fca5a5" : c.difficulty === "MEDIUM" ? "#fde68a" : "#86efac",
                          border: `1px solid ${c.difficulty === "HARD" ? "#ef4444" : c.difficulty === "MEDIUM" ? "#f59e0b" : "#22c55e"}`
                        }}>
                          {c.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span>📚 {c.subjectName || `Subject ${c.subjectId}`}</span>
                        <span>🏰 Module: {c.moduleName}</span>
                        <span>📅 Date: {c.challengeDate}</span>
                        <span>⏱️ Window: {c.startTime} - {c.endTime} ({c.durationMinutes} mins)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(role === "STUDENT" ? `/student/team-challenges/${c.id}/lobby` : `/teacher/team-challenges/list`)}
                      style={{
                        padding: "9px 20px", borderRadius: 12,
                        background: role === "STUDENT" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                        border: "none", color: "white", fontWeight: 800, fontSize: 12.5, cursor: "pointer"
                      }}
                    >
                      {role === "STUDENT" ? "Enter Lobby →" : "View Details →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STEP 2: MODULE TERRITORY GRID */
        <div>
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <button
                onClick={() => setSelectedSubject(null)}
                style={{
                  background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                  borderRadius: 10, padding: "6px 14px", fontSize: 12.5, fontWeight: 700,
                  color: "var(--text-secondary)", cursor: "pointer", marginBottom: 10
                }}
              >
                ← Back to Subjects
              </button>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                {selectedSubject.name} — Module Territory Control Map
              </h2>
            </div>
          </div>

          {modulesLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-tertiary)" }}>
               <div className="spinner" style={{ margin: "0 auto 12px" }} />
               <p style={{ fontSize: 13, fontWeight: 600 }}>Calculating module control points…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              
              {/* Territory Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {modules.map((mod) => {
                  const hasLeader = mod.controllingTeamName && mod.controllingTeamName !== "UNCLAIMED";
                  return (
                    <div
                      key={mod.moduleName}
                      style={{
                        background: "var(--surface-1)", borderRadius: 22, padding: "24px",
                        border: hasLeader ? "1.5px solid rgba(139,92,246,0.35)" : "1px solid var(--border-light)",
                        boxShadow: hasLeader ? "0 10px 30px rgba(139,92,246,0.12)" : "var(--shadow-sm)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16
                      }}
                    >
                      {/* Territory Top Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Territory Castle
                          </div>
                          <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", margin: "4px 0 0", fontFamily: "'Outfit', sans-serif" }}>
                            🏰 {mod.moduleName}
                          </h3>
                        </div>
                        <span style={{ fontSize: 18 }}>
                          {hasLeader ? "👑" : "🛡️"}
                        </span>
                      </div>

                      {/* Control Status Box */}
                      <div style={{
                        background: hasLeader ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))" : "var(--surface-2)",
                        borderRadius: 16, padding: "14px 16px",
                        border: hasLeader ? "1px solid rgba(139,92,246,0.25)" : "1px solid var(--border-subtle)"
                      }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: hasLeader ? "#8b5cf6" : "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          CONTROLLED BY
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: hasLeader ? "var(--text-primary)" : "var(--text-secondary)", marginTop: 2 }}>
                          {hasLeader ? `👑 ${mod.controllingTeamName}` : "Unclaimed Territory"}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: hasLeader ? "#6366f1" : "var(--text-tertiary)", marginTop: 4 }}>
                          {mod.controllingTeamPoints || 0} Accumulated Points
                        </div>
                      </div>

                      {/* Competing Teams Leaderboard List */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase" }}>
                          Territory Rankings
                        </div>
                        {(!mod.competingTeams || mod.competingTeams.length === 0) ? (
                          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic", padding: "6px 0" }}>
                            No team challenges completed yet in this module.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {mod.competingTeams.slice(0, 3).map((ct) => (
                              <div
                                key={ct.teamId}
                                style={{
                                  display: "flex", justifyContent: "space-between", alignItems: "center",
                                  fontSize: 12.5, padding: "6px 10px", borderRadius: 10,
                                  background: ct.isLeader ? "rgba(139,92,246,0.08)" : "transparent"
                                }}
                              >
                                <span style={{ fontWeight: ct.isLeader ? 800 : 600, color: ct.isLeader ? "#8b5cf6" : "var(--text-secondary)" }}>
                                  #{ct.rank} {ct.teamName}
                                </span>
                                <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                                  {ct.accumulatedPoints} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Challenges List for this Subject */}
              <div style={{ background: "var(--surface-1)", borderRadius: 24, padding: "28px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
                  Active Challenges for {selectedSubject.name}
                </h3>
                
                {(() => {
                  const filtered = challenges.filter(c => Number(c.subjectId) === Number(selectedSubject.subjectId) || c.subjectName === selectedSubject.name);
                  if (filtered.length === 0) {
                    return (
                      <div style={{ padding: "30px", textAlign: "center", color: "var(--text-tertiary)", border: "1px dashed var(--border-medium)", borderRadius: 16 }}>
                        No active challenges currently open for this subject.
                      </div>
                    );
                  }
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {filtered.map(c => (
                        <div
                          key={c.id}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                            padding: "16px 20px", borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border-subtle)"
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{c.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, display: "flex", gap: 12 }}>
                              <span>🏰 Module: {c.moduleName}</span>
                              <span>⏱️ {c.durationMinutes} mins</span>
                              <span>⚡ {c.questionCount} Questions</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(role === "STUDENT" ? `/student/team-challenges/${c.id}/lobby` : `/teacher/team-challenges`)}
                            style={{
                              padding: "9px 20px", borderRadius: 12, background: "var(--primary-color)",
                              border: "none", color: "white", fontWeight: 800, fontSize: 12.5, cursor: "pointer"
                            }}
                          >
                            {role === "STUDENT" ? "Enter Lobby →" : "View Challenge Details"}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamChallengeHub;
