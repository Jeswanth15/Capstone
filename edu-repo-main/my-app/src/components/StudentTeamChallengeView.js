import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserIdFromToken, getDecodedToken } from "../utils/authHelper";
import TeamChallengeService from "../services/TeamChallengeService";

const StudentTeamChallengeView = () => {
  const SockJS = window.SockJS;
  const Stomp = window.Stomp;

  const { id } = useParams();
  const navigate = useNavigate();
  const studentId = getUserIdFromToken();
  const decoded = getDecodedToken();
  const currentStudentName = decoded?.sub || decoded?.name || "Student";

  const [sessionData, setSessionData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of questionNumber -> { selectedOption, selectedByStudentId, selectedByStudentName }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  // Submission States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedByName, setSubmittedByName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stompClientRef = useRef(null);

  const fetchQuestionsAndAnswers = async () => {
    setLoading(true);
    try {
      const qRes = await TeamChallengeService.getSessionQuestions(id, studentId);
      const data = qRes.data;
      setSessionData(data);
      setQuestions(data.questions || []);

      if (data.status === "COMPLETED") {
        setIsSubmitted(true);
        setSubmittedByName(data.submittedByName || "a teammate");
      }

      if (data.durationMinutes) {
        setTimeLeftSeconds(data.durationMinutes * 60);
      }

      // Fetch initial team answers
      try {
        const ansRes = await TeamChallengeService.getSessionAnswers(id, studentId);
        const ansList = ansRes.data || [];
        const ansMap = {};
        ansList.forEach((a) => {
          ansMap[a.questionNumber] = {
            selectedOption: a.selectedOption,
            selectedByStudentId: a.studentId,
            selectedByStudentName: a.studentName,
          };
        });
        setSelectedAnswers(ansMap);
      } catch (aErr) {
        console.error("Error fetching initial team answers:", aErr);
      }
    } catch (err) {
      console.error("Error fetching session questions:", err);
      setError("Failed to load challenge questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsAndAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, studentId]);

  // WebSocket STOMP real-time connection
  useEffect(() => {
    if (!sessionData?.sessionId || !SockJS || !Stomp) return;

    try {
      const socket = new SockJS("http://localhost:8080/ws-transport");
      const client = Stomp.over(socket);
      client.debug = null; // Suppress verbose debug logs

      client.connect(
        {},
        () => {
          // Subscribe to real-time team answer broadcast topic
          client.subscribe(`/topic/team-session/${sessionData.sessionId}/answer`, (msg) => {
            const body = JSON.parse(msg.body);
            if (body && body.questionNumber) {
              setSelectedAnswers((prev) => ({
                ...prev,
                [body.questionNumber]: {
                  selectedOption: body.selectedOption,
                  selectedByStudentId: body.studentId,
                  selectedByStudentName: body.studentName,
                },
              }));
            }
          });

          // Subscribe to real-time team challenge submission topic
          client.subscribe(`/topic/team-session/${sessionData.sessionId}/submit`, (msg) => {
            const body = JSON.parse(msg.body);
            if (body && body.status === "COMPLETED") {
              setIsSubmitted(true);
              setSubmittedByName(body.submittedByStudentName || "a teammate");
            }
          });
        },
        (err) => {
          console.error("WebSocket connection error:", err);
        }
      );

      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.disconnect();
        }
      };
    } catch (wsErr) {
      console.error("Error setting up WebSocket:", wsErr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.sessionId]);

  // Real-time synchronization polling fallback (every 2 seconds)
  useEffect(() => {
    if (!id || !studentId || isSubmitted) return;

    const pollInterval = setInterval(async () => {
      try {
        const qRes = await TeamChallengeService.getSessionQuestions(id, studentId);
        if (qRes?.data?.status === "COMPLETED") {
          setIsSubmitted(true);
          setSubmittedByName(qRes.data.submittedByName || "a teammate");
          clearInterval(pollInterval);
          return;
        }

        const ansRes = await TeamChallengeService.getSessionAnswers(id, studentId);
        const ansList = ansRes.data || [];
        const ansMap = {};
        ansList.forEach((a) => {
          ansMap[a.questionNumber] = {
            selectedOption: a.selectedOption,
            selectedByStudentId: parseInt(a.studentId, 10),
            selectedByStudentName: a.studentName,
          };
        });
        setSelectedAnswers(ansMap);
      } catch (pollErr) {
        // Silent catch for poll errors
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [id, studentId, isSubmitted]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || timeLeftSeconds <= 0) {
      if (timeLeftSeconds === 0 && !isSubmitted && !submitting && sessionData) {
        handleFinishChallenge();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds, isSubmitted, submitting, sessionData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = async (qNum, optionText) => {
    if (isSubmitted) return;

    // Optimistic UI update
    setSelectedAnswers((prev) => ({
      ...prev,
      [qNum]: {
        selectedOption: optionText,
        selectedByStudentId: parseInt(studentId, 10),
        selectedByStudentName: currentStudentName,
      },
    }));

    // Broadcast via STOMP WebSocket if available
    if (stompClientRef.current && stompClientRef.current.connected && sessionData?.sessionId) {
      try {
        stompClientRef.current.send(
          `/app/team-session/${id}/select-answer`,
          {},
          JSON.stringify({
            sessionId: sessionData.sessionId,
            questionNumber: qNum,
            selectedOption: optionText,
            studentId: parseInt(studentId, 10),
            studentName: currentStudentName,
          })
        );
      } catch (wsSendErr) {
        console.error("Error sending WebSocket answer:", wsSendErr);
      }
    }

    // Save/persist via REST endpoint
    try {
      await TeamChallengeService.selectAnswer(id, studentId, qNum, optionText);
    } catch (err) {
      console.error("Error persisting answer:", err);
    }
  };

  const handleFinishChallenge = async () => {
    if (submitting || isSubmitted) return;
    setSubmitting(true);

    // 1. Broadcast STOMP WebSocket submit event
    if (stompClientRef.current && stompClientRef.current.connected && sessionData?.sessionId) {
      try {
        stompClientRef.current.send(
          `/app/team-session/${id}/submit`,
          {},
          JSON.stringify({
            sessionId: sessionData.sessionId,
            studentId: parseInt(studentId, 10),
            studentName: currentStudentName,
          })
        );
      } catch (wsSendErr) {
        console.error("Error sending WebSocket submit:", wsSendErr);
      }
    }

    // 2. Call REST submit endpoint to update database state
    try {
      const res = await TeamChallengeService.submitChallenge(id, studentId);
      setIsSubmitted(true);
      if (res?.data) {
        navigate(`/student/team-challenges/${id}/results`, { state: { resultDTO: res.data } });
        return;
      }
    } catch (err) {
      console.error("Error submitting team challenge:", err);
      setIsSubmitted(true);
      setSubmittedByName(currentStudentName);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#f3f4f6" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚡</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Generating Your Team's 10 Questions...</h2>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>
          Gemini is synthesizing a unique question set grounded in your module material. Please wait...
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div style={{ padding: "3rem", maxWidth: "600px", margin: "0 auto", textAlign: "center", color: "#fca5a5" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Unable to Load Questions</h3>
        <p style={{ color: "#d1d5db", marginBottom: "1.5rem" }}>{error || "Questions are still being generated by AI. Try refreshing in a few moments."}</p>
        <button
          onClick={fetchQuestionsAndAnswers}
          style={{ padding: "0.75rem 1.5rem", borderRadius: "10px", background: "#8b5cf6", color: "#fff", border: "none", fontWeight: "600", cursor: "pointer" }}
        >
          🔄 Refresh Questions
        </button>
      </div>
    );
  }

  // --- Completed Screen Rendering ---
  if (isSubmitted) {
    const answeredCount = Object.keys(selectedAnswers).length;
    return (
      <div style={{ padding: "2.5rem 1.5rem", maxWidth: "780px", margin: "0 auto", color: "#f3f4f6" }}>
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "24px", padding: "2.5rem", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🏁</div>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "0.3rem 0.8rem", borderRadius: "20px", border: "1px solid #10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Challenge Completed Overall
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "1rem", marginBottom: "0.5rem", color: "#ffffff" }}>
            Team Challenge Submitted!
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1rem", marginBottom: "1.75rem" }}>
            The test for team <strong style={{ color: "#c084fc" }}>{sessionData?.teamName || "Code Warriors"}</strong> was submitted overall by{" "}
            <span style={{ color: "#34d399", fontWeight: "700", textDecoration: "underline" }}>
              {submittedByName || "a teammate"}
            </span>.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "#111827", padding: "1.25rem", borderRadius: "16px", border: "1px solid #374151" }}>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", fontWeight: "700" }}>Total Questions</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#a78bfa", marginTop: "0.25rem" }}>{questions.length}</div>
            </div>
            <div style={{ background: "#111827", padding: "1.25rem", borderRadius: "16px", border: "1px solid #374151" }}>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", fontWeight: "700" }}>Team Answers Marked</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#34d399", marginTop: "0.25rem" }}>{answeredCount} / {questions.length}</div>
            </div>
          </div>

          <div style={{ textAlign: "left", background: "#111827", border: "1px solid #374151", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#e5e7eb", marginBottom: "1rem" }}>📋 Team Answer Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {questions.map((q, idx) => {
                const ans = selectedAnswers[q.questionNumber];
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "#1f2937", borderRadius: "10px", border: "1px solid #374151" }}>
                    <div style={{ fontSize: "0.9rem", color: "#d1d5db", fontWeight: "600", flex: 1, paddingRight: "1rem" }}>
                      Q{idx + 1}. {q.questionText}
                    </div>
                    <div>
                      {ans ? (
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.6rem", borderRadius: "10px", background: "rgba(167, 139, 250, 0.2)", color: "#c084fc", border: "1px solid #a78bfa" }}>
                          ✓ {ans.selectedOption} ({ans.selectedByStudentName})
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", padding: "0.25rem 0.6rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", border: "1px solid #ef4444" }}>
                          Not Answered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate("/student/team-challenges")}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
            }}
          >
            ← Return to Team Challenges Lobby
          </button>
        </div>
      </div>
    );
  }

  // --- Active Test View ---
  const currentQ = questions[currentIndex] || {};
  const currentAnswerInfo = selectedAnswers[currentQ.questionNumber];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div style={{ padding: "2rem", maxWidth: "860px", margin: "0 auto", color: "#f3f4f6" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "1rem 1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: "700" }}>
              🛡️ TEAM SESSION — {sessionData?.teamName || "Code Warriors"}
            </span>
            <span style={{ fontSize: "0.75rem", background: "rgba(52, 211, 153, 0.2)", color: "#6ee7b7", padding: "0.15rem 0.5rem", borderRadius: "12px", border: "1px solid #10b981", fontWeight: "600" }}>
              🟢 Live WebSocket Active
            </span>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#ffffff", marginTop: "0.2rem" }}>
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", padding: "0.5rem 1rem", borderRadius: "12px", color: "#fca5a5", fontWeight: "800", fontSize: "1.1rem" }}>
          <span>⏰</span> {formatTime(timeLeftSeconds)}
        </div>
      </div>

      {/* Progress Dots */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.75rem" }}>
        {questions.map((q, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              flex: 1,
              height: "8px",
              borderRadius: "4px",
              background: idx === currentIndex ? "#a78bfa" : selectedAnswers[q.questionNumber] ? "#10b981" : "#374151",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Question Card */}
      <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "24px", padding: "2rem", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#9ca3af", background: "#111827", padding: "0.25rem 0.6rem", borderRadius: "6px" }}>
            {currentQ.moduleName || "Module Material"}
          </span>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#c084fc" }}>
            {currentQ.difficulty || "MEDIUM"}
          </span>
        </div>

        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", lineHeight: 1.5, marginBottom: "1.75rem" }}>
          {currentQ.questionText}
        </h2>

        {/* Options List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
          {currentQ.options &&
            currentQ.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = currentAnswerInfo && currentAnswerInfo.selectedOption === opt;
              const isSelectedByMe = isSelected && parseInt(currentAnswerInfo.selectedByStudentId, 10) === parseInt(studentId, 10);

              return (
                <div
                  key={oIdx}
                  onClick={() => handleOptionSelect(currentQ.questionNumber, opt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderRadius: "14px",
                    background: isSelected ? "rgba(167, 139, 250, 0.15)" : "#111827",
                    border: `2px solid ${isSelected ? "#a78bfa" : "#374151"}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 12px rgba(167, 139, 250, 0.2)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: isSelected ? "#a78bfa" : "#374151",
                        color: isSelected ? "#ffffff" : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        justify: "center",
                        fontWeight: "700",
                        fontSize: "0.9rem",
                      }}
                    >
                      {letter}
                    </span>
                    <span style={{ fontSize: "1rem", color: isSelected ? "#f3f4f6" : "#d1d5db", fontWeight: isSelected ? "600" : "400" }}>
                      {opt}
                    </span>
                  </div>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "12px",
                        background: isSelectedByMe ? "rgba(52, 211, 153, 0.2)" : "rgba(167, 139, 250, 0.25)",
                        color: isSelectedByMe ? "#34d399" : "#c084fc",
                        border: `1px solid ${isSelectedByMe ? "#10b981" : "#a78bfa"}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span>✓</span> {isSelectedByMe ? "Marked by You" : `Marked by ${currentAnswerInfo.selectedByStudentName}`}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* Navigation & Submit Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              background: "#374151",
              color: "#ffffff",
              border: "none",
              fontWeight: "600",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {!isLastQuestion && (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "10px",
                  background: "#374151",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            )}

            <button
              onClick={handleFinishChallenge}
              disabled={submitting}
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "10px",
                background: submitting ? "#6b7280" : "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              }}
            >
              {submitting ? "Submitting..." : "Finish Challenge 🏁"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTeamChallengeView;
