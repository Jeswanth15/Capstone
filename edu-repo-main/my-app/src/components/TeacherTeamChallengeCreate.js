import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const TeacherTeamChallengeCreate = () => {
  const navigate = useNavigate();
  const teacherId = getUserIdFromToken();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [challengeDate, setChallengeDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("20:00");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [maxChatMessages, setMaxChatMessages] = useState(5);

  const [teamSize, setTeamSize] = useState(4);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Default team name presets
  const TEAM_NAME_PRESETS = [
    "Code Warriors",
    "Stack Masters",
    "Queue Masters",
    "Array Experts",
    "Algorithm Aces",
    "Binary Bosses",
  ];

  // Fetch classes on mount
  useEffect(() => {
    TeamChallengeService.getTeacherClasses(teacherId || "")
      .then((res) => {
        let list = Array.isArray(res.data) ? res.data : [];
        if (list.length === 0) {
          // Fallback to fetch classrooms endpoint if needed
          axios
            .get("http://localhost:8080/api/classrooms", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((cRes) => setClasses(Array.isArray(cRes.data) ? cRes.data : []))
            .catch(() => setClasses([]));
        } else {
          setClasses(list);
        }
      })
      .catch((err) => {
        console.error("Error fetching teacher classes:", err);
        setError("Failed to load classes.");
        setClasses([]);
      });
  }, [teacherId]);

  // When class changes, fetch subjects & students
  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      setStudents([]);
      setSelectedSubjectId("");
      return;
    }
    TeamChallengeService.getSubjectsForClass(selectedClassId, teacherId || "")
      .then((res) => {
        let list = Array.isArray(res.data) ? res.data : [];
        if (list.length === 0) {
          // Fallback to /api/class-subjects/get
          axios
            .get("http://localhost:8080/api/class-subjects/get", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((csRes) => {
              const allCs = Array.isArray(csRes.data) ? csRes.data : [];
              const filtered = allCs.filter((cs) => cs.classroomId === parseInt(selectedClassId, 10));
              setSubjects(filtered.length > 0 ? filtered : allCs);
            })
            .catch(() => setSubjects([]));
        } else {
          setSubjects(list);
        }
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
      });

    TeamChallengeService.getClassroomStudents(selectedClassId)
      .then((res) => {
        const studentList = Array.isArray(res.data) ? res.data : [];
        setStudents(studentList);
        autoGenerateTeams(studentList, teamSize);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        setStudents([]);
      });
  }, [selectedClassId, teacherId, teamSize]);

  // When subject changes, fetch uploaded modules/syllabus
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) {
      setModules([]);
      setSelectedModule("");
      return;
    }
    const csId = selectedSubjectId;
    TeamChallengeService.getModulesForClassSubject(csId)
      .then((res) => {
        const modArr = Array.isArray(res.data) ? res.data : [];
        setModules(modArr);
        if (modArr.length > 0) {
          const firstMod = typeof modArr[0] === "string" ? modArr[0] : modArr[0].moduleName || modArr[0].title;
          setSelectedModule(firstMod);
        }
      })
      .catch((err) => {
        console.error("Error fetching modules:", err);
        setModules([]);
      });
  }, [selectedClassId, selectedSubjectId]);

  const autoGenerateTeams = (studentList, size) => {
    if (!studentList || studentList.length === 0) {
      setTeams([]);
      return;
    }
    const shuffled = [...studentList];
    const generatedTeams = [];
    let teamIndex = 0;

    for (let i = 0; i < shuffled.length; i += size) {
      const chunk = shuffled.slice(i, i + size);
      const teamName = TEAM_NAME_PRESETS[teamIndex % TEAM_NAME_PRESETS.length] || `Team ${teamIndex + 1}`;
      generatedTeams.push({
        name: teamName,
        studentIds: chunk.map((s) => s.userId || s.id),
        members: chunk,
      });
      teamIndex++;
    }
    setTeams(generatedTeams);
  };

  const handleTeamSizeChange = (newSize) => {
    const size = parseInt(newSize, 10) || 4;
    setTeamSize(size);
    autoGenerateTeams(students, size);
  };

  const handleTeamNameChange = (index, newName) => {
    const updated = [...teams];
    updated[index].name = newName;
    setTeams(updated);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!selectedClassId || !selectedSubjectId || !selectedModule) {
      setError("Please select Class, Subject, and Uploaded Learning Material/Module.");
      return;
    }

    if (teams.length === 0) {
      setError("Please assign students into at least one team.");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim() || undefined,
      classId: parseInt(selectedClassId, 10),
      subjectId: parseInt(selectedSubjectId, 10),
      classSubjectId: parseInt(selectedSubjectId, 10),
      moduleName: selectedModule,
      difficulty: difficulty,
      challengeDate: challengeDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      questionCount: 10,
      maxChatMessagesPerStudent: parseInt(maxChatMessages, 10) || 5,
      teacherId: parseInt(teacherId, 10),
      teams: teams.map((t) => ({
        name: t.name,
        studentIds: t.studentIds,
      })),
    };

    try {
      await TeamChallengeService.createChallenge(payload);
      setSuccessMsg("Challenge published successfully! Questions will be generated on-demand when student teams reach majority start.");
      setTimeout(() => {
        navigate("/teacher/team-challenges/list");
      }, 1800);
    } catch (err) {
      console.error("Error creating challenge:", err);
      setError(err.response?.data?.message || "Failed to publish challenge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto", color: "#f3f4f6" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "2rem" }}>⚔️</span>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", background: "linear-gradient(135deg, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
            Create AI Team Challenge
          </h1>
        </div>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>
          Configure a team-based collaborative challenge. Questions are generated <strong>on-demand</strong> per team session when students start.
        </p>
      </div>

      {/* Info Alert */}
      <div style={{ background: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167, 139, 250, 0.3)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "2rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.25rem" }}>🔒</span>
        <div style={{ fontSize: "0.875rem", color: "#e9d5ff" }}>
          <strong>Zero Pre-Generation Guarantee:</strong> You will not see or know the generated questions before students start. Exactly 10 questions will be generated by Gemini for each team session upon majority start.
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.875rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid #22c55e", color: "#86efac", padding: "0.875rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem" }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Step 1: Class, Subject & Learning Material */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#a78bfa", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>1️⃣</span> Select Learning Material
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {/* Select Class */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Class <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              >
                <option value="">-- Select Class --</option>
                {Array.isArray(classes) &&
                  classes.map((cls) => {
                    const cId = cls.classId || cls.id;
                    const cName = cls.name || cls.classroomName || `Class ${cId}`;
                    return (
                      <option key={cId} value={cId}>
                        {cName} {cls.section ? `(${cls.section})` : ""}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Select Subject */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Subject <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={!selectedClassId}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem", opacity: !selectedClassId ? 0.5 : 1 }}
              >
                <option value="">-- Select Subject --</option>
                {Array.isArray(subjects) &&
                  subjects.map((sub) => {
                    const sId = sub.subjectId || sub.id;
                    const sName = sub.name || sub.subjectName || `Subject ${sId}`;
                    return (
                      <option key={sId} value={sId}>
                        {sName}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Select Existing Module / Learning Material */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Uploaded Module / Material <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedSubjectId}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem", opacity: !selectedSubjectId ? 0.5 : 1 }}
              >
                <option value="">-- Select Module --</option>
                {Array.isArray(modules) &&
                  modules.map((mod, idx) => {
                    const mName = typeof mod === "string" ? mod : mod.moduleName || mod.title || `Module ${idx + 1}`;
                    return (
                      <option key={idx} value={mName}>
                        {mName}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Challenge Configuration */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#a78bfa", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>2️⃣</span> Challenge Parameters
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {/* Title */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Challenge Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures Linked List Showdown"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>

            {/* Difficulty */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Challenge Date */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Challenge Date
              </label>
              <input
                type="date"
                value={challengeDate}
                onChange={(e) => setChallengeDate(e.target.value)}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>

            {/* Window Start */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>

            {/* Window End */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Challenge Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>

            {/* Questions count - Read-only 10 */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Number of Questions
              </label>
              <input
                type="text"
                value="10 Questions (Fixed)"
                disabled
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #374151", color: "#9ca3af", fontSize: "0.95rem", cursor: "not-allowed" }}
              />
            </div>

            {/* Max Chat Messages */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#d1d5db" }}>
                Max Chat Messages / Student
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxChatMessages}
                onChange={(e) => setMaxChatMessages(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.95rem" }}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Team Assignment */}
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#a78bfa", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>3️⃣</span> Team Formation ({teams.length} Teams, {students.length} Students)
            </h2>
            {students.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Members per team:</span>
                <select
                  value={teamSize}
                  onChange={(e) => handleTeamSizeChange(e.target.value)}
                  style={{ padding: "0.4rem 0.75rem", borderRadius: "8px", background: "#111827", border: "1px solid #4b5563", color: "#f3f4f6", fontSize: "0.875rem" }}
                >
                  <option value="2">2 Members</option>
                  <option value="3">3 Members</option>
                  <option value="4">4 Members</option>
                  <option value="5">5 Members</option>
                  <option value="6">6 Members</option>
                </select>
              </div>
            )}
          </div>

          {students.length === 0 ? (
            <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
              {selectedClassId ? "No students currently enrolled in this classroom." : "Select a class above to load students."}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {teams.map((t, idx) => (
                <div key={idx} style={{ background: "#111827", border: "1px solid #374151", borderRadius: "12px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>🛡️</span>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                      style={{ background: "transparent", border: "none", borderBottom: "1px dashed #6b7280", color: "#f3f4f6", fontWeight: "700", fontSize: "0.95rem", width: "100%", outline: "none" }}
                    />
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                    {t.members.length} Members (Majority needed to start: {Math.floor(t.members.length / 2) + 1})
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {t.members.map((m) => (
                      <li key={m.userId} style={{ fontSize: "0.85rem", color: "#d1d5db", background: "rgba(255, 255, 255, 0.03)", padding: "0.4rem 0.6rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ color: "#a78bfa" }}>👤</span> {m.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit / Publish Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.875rem 2rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              border: "none",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
              transition: "transform 0.15s ease",
            }}
          >
            {loading ? "Publishing Challenge..." : "🚀 Publish Challenge"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherTeamChallengeCreate;
