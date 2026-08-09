import React, { useState, useEffect } from 'react';
import { generateQuestions, submitPracticeResult, getPracticeHistory } from '../services/practiceService';
import { getSyllabusByClassSubject, getPerformancePrediction } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from '../utils/authHelper';
import GamificationService from '../services/GamificationService';
import { triggerRewardAnimation } from './CoinParticleFX';

const DailyChallenge = () => {
    const navigate = useNavigate();
    const userId = getUserIdFromToken() || 1;

    // Challenge States
    const [step, setStep] = useState(0); // 0: Landing, 1: Loading Quiz, 2: Active Quiz, 3: Score Review
    const [pageLoading, setPageLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Scanned Weak Data
    const [weakSubject, setWeakSubject] = useState(null);
    const [weakModule, setWeakModule] = useState('');
    const [scannedReason, setScannedReason] = useState('');

    // Quiz Running Data
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [savingResult, setSavingResult] = useState(false);

    // Load metrics and discover weak subject & module
    useEffect(() => {
        const discoverChallenge = async () => {
            try {
                // 1. Fetch performance predictions
                const perfRes = await getPerformancePrediction(userId);
                const perfData = perfRes.data;

                if (!perfData || perfData.error) {
                    throw new Error(perfData?.error || "Could not retrieve your academic performance trends.");
                }

                // Get weak subjects list or determine from all subjects
                const weakList = perfData.weakSubjects || [];
                const allSubjects = perfData.subjects || [];

                let chosenSubject = null;
                let reason = "This subject was identified by machine learning analysis as needing reinforcement.";

                if (weakList.length > 0) {
                    chosenSubject = weakList[0];
                    if (chosenSubject.reason && chosenSubject.reason.length > 0) {
                        reason = chosenSubject.reason[0];
                    }
                } else if (allSubjects.length > 0) {
                    // Fallback: Pick subject with the lowest score
                    const sorted = [...allSubjects].sort((a, b) => {
                        const scoreA = (a.practiceAverage || 75) + (a.examAverage || 70);
                        const scoreB = (b.practiceAverage || 75) + (b.examAverage || 70);
                        return scoreA - scoreB;
                    });
                    chosenSubject = sorted[0];
                    reason = "We have selected this subject today to test your general consistency.";
                }

                if (!chosenSubject) {
                    throw new Error("No academic subject mappings found. Please contact administration.");
                }

                setWeakSubject(chosenSubject);
                setScannedReason(reason);

                const classSubId = chosenSubject.classSubjectId;
                if (!classSubId) {
                    // If classSubjectId is missing (extreme edge case)
                    setWeakModule("General Review");
                    setPageLoading(false);
                    return;
                }

                // 2. Discover weak module
                let determinedModule = '';
                try {
                    // Try fetching practice history to find poorest performing module
                    const history = await getPracticeHistory(userId);
                    const subjectHistory = (history || []).filter(h => h.classSubjectId === classSubId && h.moduleName);
                    
                    if (subjectHistory.length > 0) {
                        // Aggregate scores per module
                        const moduleAgg = {};
                        subjectHistory.forEach(h => {
                            if (!moduleAgg[h.moduleName]) {
                                moduleAgg[h.moduleName] = { sum: 0, count: 0 };
                            }
                            moduleAgg[h.moduleName].sum += h.score;
                            moduleAgg[h.moduleName].count += 1;
                        });

                        // Sort by lowest average score
                        const sortedModules = Object.keys(moduleAgg).map(m => ({
                            name: m,
                            avg: moduleAgg[m].sum / moduleAgg[m].count
                        })).sort((a, b) => a.avg - b.avg);

                        determinedModule = sortedModules[0].name;
                        setScannedReason(prev => `${prev} Your average practice score in module "${determinedModule}" is ${Math.round(sortedModules[0].avg)}%.`);
                    }
                } catch (historyErr) {
                    console.log("No practice history found or failed to fetch:", historyErr);
                }

                if (!determinedModule) {
                    try {
                        // Try syllabus fallback
                        const syllabusRes = await getSyllabusByClassSubject(classSubId);
                        const syllabusData = syllabusRes.data || [];
                        if (syllabusData.length > 0 && syllabusData[0].moduleName) {
                            determinedModule = syllabusData[0].moduleName;
                        }
                    } catch (syllabusErr) {
                        console.log("No syllabus found or failed to fetch:", syllabusErr);
                    }
                }

                // Default fallback
                setWeakModule(determinedModule || "Module 1");
                
            } catch (err) {
                console.error("Discovery error:", err);
                setErrorMsg(err.message || "Failed to initialize Daily Challenge.");
            } finally {
                setPageLoading(false);
            }
        };

        discoverChallenge();
    }, [userId]);

    // Handle Quiz question generation
    const handleStartChallenge = async () => {
        setStep(1);
        setErrorMsg('');
        try {
            const classSubId = weakSubject?.classSubjectId;
            // Generate questions from the weak subject & module
            const payloadContent = `Generate daily challenge questions for subject: ${weakSubject?.subject}, module: ${weakModule}`;
            const generated = await generateQuestions(payloadContent, "MEDIUM", null, weakModule, classSubId);
            
            if (!generated || generated.length === 0) {
                throw new Error("Unable to synthesize AI questions. Please verify service connection.");
            }
            
            setQuestions(generated);
            setStep(2);
        } catch (err) {
            console.error("Quiz generation failed:", err);
            setErrorMsg(err.message || "Failed to generate questions. Please try again.");
            setStep(0);
        }
    };

    // Handle Option selection
    const selectOption = (opt) => {
        setAnswers({ ...answers, [currentQIndex]: opt });
    };

    // Next/Prev questions
    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(currentQIndex - 1);
        }
    };

    // Quiz submission
    const handleFinishChallenge = async () => {
        setSavingResult(true);
        let correctCount = 0;
        let wrongCount = 0;

        questions.forEach((q, i) => {
            if (answers[i] === q.correctOption) {
                correctCount++;
            } else {
                wrongCount++;
            }
        });

        const calculatedScore = correctCount;
        const calculatedPct = Math.round((calculatedScore / questions.length) * 100);

        setScore(calculatedScore);
        setPercentage(calculatedPct);

        try {
            // Save as PracticeHistory item but prefixed with Daily Challenge
            await submitPracticeResult({
                topic: `Daily Challenge: ${weakSubject?.subject}`,
                moduleName: weakModule,
                classSubjectId: weakSubject?.classSubjectId,
                score: calculatedPct,
                totalQuestions: questions.length,
                correctAnswers: correctCount,
                wrongAnswers: wrongCount,
                userId: userId
            });

            // Gamification Reward: Daily Challenge
            const dateStr = new Date().toISOString().split('T')[0];
            await GamificationService.awardReward(userId, `Daily Challenge - ${dateStr}`);
            triggerRewardAnimation({ coins: 30, xp: 100 });
        } catch (err) {
            console.error("Failed to save daily challenge progress:", err);
        } finally {
            setSavingResult(false);
            setStep(3);
        }
    };

    if (pageLoading) {
        return (
            <div style={{ padding: 100, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 50, height: 50, border: "5px solid #e2e8f0", borderTop: "5px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <div style={{ color: "#64748b", fontWeight: 700, fontSize: 16 }}>Scanning performance models...</div>
            </div>
        );
    }

    if (errorMsg && step === 0) {
        return (
            <div style={{ maxWidth: 600, margin: "100px auto", background: "#fef2f2", borderRadius: 24, border: "1px solid #fee2e2", padding: 40, textAlign: "center", boxShadow: "0 10px 30px rgba(239, 68, 68, 0.05)" }}>
                <div style={{ fontSize: 50, marginBottom: 20 }}>⚠</div>
                <h3 style={{ fontSize: 20, color: "#991b1b", margin: "0 0 12px" }}>Daily Quest Sync Failed</h3>
                <p style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>{errorMsg}</p>
                <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}>
                    Retry Sync
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60, paddingLeft: 20, paddingRight: 20 }}>
            {/* Step 0: Landing */}
            {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {/* Header */}
                    <div style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", borderRadius: 24, padding: 40, color: "white", boxShadow: "0 12px 36px rgba(239,68,68,0.2)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>🏆</div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>Daily AI Challenge</h1>
                        <p style={{ margin: 0, color: "#fef3c7", fontSize: 16, fontWeight: 500 }}>A custom AI quest generated daily to drill down your weakest areas.</p>
                    </div>

                    {/* Quest Card */}
                    <div style={{ background: "white", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", padding: 36, display: "flex", flexDirection: "column", gap: 28, animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                        <div>
                            <span style={{ fontSize: 11, fontWeight: 800, background: "#fef3c7", color: "#d97706", padding: "6px 12px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.5px" }}>Target Domain</span>
                            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "16px 0 6px", color: "#1e293b" }}>{weakSubject?.subject}</h2>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>Module: <span style={{ color: "#ef4444" }}>{weakModule}</span></div>
                        </div>

                        <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, borderLeft: "4px solid #ef4444" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>System Diagnostics:</div>
                            <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{scannedReason}</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>
                                <div style={{ fontSize: 20 }}>🎯</div>
                                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>Questions</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginTop: 2 }}>10 MCQs</div>
                            </div>
                            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>
                                <div style={{ fontSize: 20 }}>⚡</div>
                                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>Rewards</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginTop: 2 }}>Double Exp</div>
                            </div>
                            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 16, textAlign: "center" }}>
                                <div style={{ fontSize: 20 }}>⏳</div>
                                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>Focus</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginTop: 2 }}>Weak Link</div>
                            </div>
                        </div>

                        <button onClick={handleStartChallenge} style={{ width: "100%", padding: 18, borderRadius: 16, background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "white", fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(239, 68, 68, 0.3)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                            Launch Quest
                        </button>
                    </div>
                </div>
            )}

            {/* Step 1: Loading Quiz */}
            {step === 1 && (
                <div style={{ padding: 80, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 64, height: 64, border: "6px solid #f1f5f9", borderTop: "6px solid #f59e0b", borderRadius: "50%", animation: "spin 1.2s linear infinite" }} />
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Synthesizing Custom Quest...</h3>
                    <p style={{ color: "#64748b", fontSize: 14, maxWidth: 400, margin: 0, lineHeight: 1.6 }}>AI is referencing ingested materials and curriculum logs to craft a targeted practice set for {weakSubject?.subject}.</p>
                </div>
            )}

            {/* Step 2: Active Quiz */}
            {step === 2 && questions.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Status Header */}
                    <div style={{ background: "white", borderRadius: 20, padding: 20, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                        <div>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>STUDY PLAN DRILL</span>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginTop: 2 }}>{weakSubject?.subject} • {weakModule}</div>
                        </div>
                        <div style={{ background: "#fffbeb", color: "#d97706", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                            ⭐ 2X Boost
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
                            <span>Question {currentQIndex + 1} of {questions.length}</span>
                            <span>{Math.round(((Object.keys(answers).length) / questions.length) * 100)}% Answered</span>
                        </div>
                        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${((currentQIndex + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg, #f59e0b, #ef4444)", transition: "width 0.3s ease" }} />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div style={{ background: "white", borderRadius: 24, border: "1px solid #e2e8f0", padding: 40, boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 28, lineHeight: 1.5 }}>
                            {questions[currentQIndex]?.questionText}
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {questions[currentQIndex]?.options.map((opt, oIdx) => {
                                const isSelected = answers[currentQIndex] === opt;
                                return (
                                    <div key={oIdx} onClick={() => selectOption(opt)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16, border: isSelected ? "2px solid #ef4444" : "1px solid #e2e8f0", background: isSelected ? "#fff5f5" : "white", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc" }} onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "white" }}>
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isSelected ? "#ef4444" : "#cbd5e1"}`, background: isSelected ? "#ef4444" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                                        </div>
                                        <span style={{ fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#ef4444" : "#475569", lineHeight: 1.4 }}>{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button onClick={prevQuestion} disabled={currentQIndex === 0} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 700, cursor: currentQIndex === 0 ? "not-allowed" : "pointer", opacity: currentQIndex === 0 ? 0.5 : 1 }}>
                            ← Back
                        </button>

                        {currentQIndex < questions.length - 1 ? (
                            <button onClick={nextQuestion} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#1e293b", color: "white", fontWeight: 700, cursor: "pointer" }}>
                                Next Question →
                            </button>
                        ) : (
                            <button onClick={handleFinishChallenge} disabled={savingResult || Object.keys(answers).length < questions.length} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 800, cursor: (savingResult || Object.keys(answers).length < questions.length) ? "not-allowed" : "pointer", boxShadow: "0 6px 18px rgba(16,185,129,0.25)", opacity: (savingResult || Object.keys(answers).length < questions.length) ? 0.7 : 1 }}>
                                {savingResult ? "Saving progress..." : "Submit Quest Answers"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Score Review */}
            {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "fadeIn 0.6s ease" }}>
                    <div style={{ background: "white", borderRadius: 32, padding: 48, textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 15px 35px rgba(0,0,0,0.04)" }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, color: "#1e293b" }}>Challenge Complete!</h2>
                        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px" }}>Daily Quest for {weakSubject?.subject} recorded.</p>

                        <div style={{ width: 200, height: 200, margin: "0 auto 36px", borderRadius: "50%", background: percentage < 50 ? "#fff5f5" : "#f0fdf4", border: "12px solid white", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                            <div style={{ fontSize: 60, fontWeight: 900, color: percentage < 50 ? "#ef4444" : "#10b981", lineHeight: 1 }}>{score}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", marginTop: 4, borderTop: "2px solid #f1f5f9", paddingTop: 4, width: 80 }}>/ {questions.length} PTS</div>
                        </div>

                        {percentage < 50 ? (
                            <div style={{ background: "#fff5f5", border: "1px solid #fee2e2", padding: 24, borderRadius: 16, marginBottom: 32, textAlign: "left" }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#c53030", marginBottom: 6 }}>💡 Recommended Follow-up:</div>
                                <p style={{ margin: 0, fontSize: 13, color: "#9b2c2c", lineHeight: 1.6 }}>You encountered some roadblocks with these questions. Try reviewing the core material for <b>{weakModule}</b> and retake practice sets during study hours.</p>
                            </div>
                        ) : (
                            <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", padding: 24, borderRadius: 16, marginBottom: 32, textAlign: "left" }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 6 }}>🌟 Growth Detected!</div>
                                <p style={{ margin: 0, fontSize: 13, color: "#15803d", lineHeight: 1.6 }}>Great performance. Re-evaluating your performance metrics overnight may elevate this subject's categorization.</p>
                            </div>
                        )}

                        <button onClick={() => navigate("/student")} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#1e293b", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>
                            Back to Student Dashboard
                        </button>
                    </div>

                    {/* Explanations Card */}
                    <div style={{ background: "white", borderRadius: 24, border: "1px solid #e2e8f0", padding: 36, boxShadow: "0 8px 24px rgba(0,0,0,0.02)" }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", marginBottom: 24 }}>Review Solutions</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {questions.map((q, idx) => {
                                const isCorrect = answers[idx] === q.correctOption;
                                return (
                                    <div key={idx} style={{ padding: "20px 24px", borderRadius: 16, background: isCorrect ? "#f0fdf4" : "#fff5f5", border: `1px solid ${isCorrect ? "#dcfce7" : "#fee2e2"}` }}>
                                        <div style={{ display: "flex", justifyItems: "flex-start", gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontWeight: 800, color: isCorrect ? "#166534" : "#991b1b" }}>Q{idx + 1}.</span>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: isCorrect ? "#15803d" : "#991b1b" }}>{q.questionText}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>
                                            <div><b>Your Answer:</b> <span style={{ color: isCorrect ? "#166534" : "#b91c1c" }}>{answers[idx] || "Unanswered"}</span></div>
                                            {!isCorrect && <div><b>Correct Option:</b> <span style={{ color: "#166534", fontWeight: 600 }}>{q.correctOption}</span></div>}
                                            {q.explanation && <div style={{ marginTop: 8, background: "rgba(255,255,255,0.5)", padding: 12, borderRadius: 8, fontSize: 12, border: "1px dashed rgba(0,0,0,0.05)" }}><b>AI Explanation:</b> {q.explanation}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DailyChallenge;
