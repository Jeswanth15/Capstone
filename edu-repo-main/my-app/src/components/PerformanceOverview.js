import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Count up hook for smooth numeric animation (0 -> target %)
const useCountUp = (target = 0, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = 0;
    const endValue = Number(target) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (endValue - startValue) * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
};

// Circular SVG Progress Ring
const CircularProgressRing = ({ percentage = 45, label = "Mastery", color = "#ef4444", size = 110 }) => {
  const animatedPct = useCountUp(percentage);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(226, 232, 240, 0.8)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      {/* Centered Percentage Text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>
          {animatedPct}%
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
};

// Animated Horizontal Progress Bar
const AnimatedProgressBar = ({ value = 0, color = "#3b82f6" }) => {
  const animatedVal = useCountUp(value);
  return (
    <div style={{ width: "100%", height: 8, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${animatedVal}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.8s ease-out",
        }}
      />
    </div>
  );
};

const PerformanceOverview = ({ data }) => {
  if (!data)
    return (
      <div style={{ padding: 24, background: "white", borderRadius: 20, textAlign: "center", color: "#64748b", border: "1px solid #e2e8f0" }}>
        ⌛ Running machine learning diagnostic models...
      </div>
    );
  if (data.error)
    return (
      <div style={{ padding: 24, background: "#fef2f2", borderRadius: 20, textAlign: "center", color: "#dc2626", border: "1px solid #fee2e2" }}>
        ❌ {data.error}
      </div>
    );

  const { strongSubjects = [], weakSubjects = [], subjects = [] } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }} id="performance-report">
      
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print, nav, sidebar, footer, .hero-section { display: none !important; }
          body { background: white !important; }
          #performance-report { margin: 0 !important; width: 100% !important; }
          .responsive-grid-main { display: block !important; }
        }
      `}</style>

      {/* Main Analysis Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "white",
          borderRadius: 24,
          padding: 32,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#6366f1", letterSpacing: "1px", textTransform: "uppercase" }}>
              AI Diagnostics
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: "2px 0 0", color: "#1e293b", fontFamily: "'Outfit', sans-serif" }}>
              Weak Topic & Performance Analysis
            </h2>
          </div>

          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              padding: "10px 18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <span>🖨️</span> Print Report
          </button>
        </div>

        {/* 2-Column Split: Strong vs Weak Topics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          
          {/* Strong Subjects Column */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#059669", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              🟢 Strong Domain Strengths
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {strongSubjects.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  style={{
                    background: "#f0fdf4",
                    padding: 20,
                    borderRadius: 18,
                    border: "1px solid #dcfce7",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, color: "#166534", fontSize: 15 }}>✓ {s.subject}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: 99 }}>
                      {s.confidence}% Confidence
                    </span>
                  </div>

                  <AnimatedProgressBar value={s.confidence} color="#10b981" />

                  <div style={{ marginTop: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>
                      {Array.isArray(s.reason) ? s.reason[0] : s.reason}
                    </p>
                  </div>
                </motion.div>
              ))}
              {strongSubjects.length === 0 && (
                <p style={{ fontSize: 13, color: "#64748b" }}>Keep practicing to discover your primary strengths!</p>
              )}
            </div>
          </div>

          {/* Weak Subjects Column */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#dc2626", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ Weak Topics (Needs Attention)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {weakSubjects.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.15 }}
                  style={{
                    background: "#fff1f2",
                    padding: 20,
                    borderRadius: 20,
                    border: "1px solid #fee2e2",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.05)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 900, color: "#991b1b", fontSize: 16 }}>⚠ {s.subject}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: s.risk === "Critical" ? "#ef4444" : "#f59e0b",
                            color: "white",
                            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                          }}
                        >
                          {s.risk} Risk ({s.probability || 45}%)
                        </span>
                      </div>
                    </div>

                    {/* Circular Chart for Weak Subject */}
                    <CircularProgressRing percentage={s.probability || 45} label="Risk" color="#ef4444" size={72} />
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <AnimatedProgressBar value={s.probability || 45} color="#ef4444" />
                  </div>

                  <div style={{ marginTop: 14, background: "rgba(255,255,255,0.6)", padding: 12, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#7f1d1d", textTransform: "uppercase", marginBottom: 4 }}>
                      Diagnostic Reason:
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#b91c1c", lineHeight: 1.4 }}>
                      {Array.isArray(s.reason) ? s.reason[0] : s.reason}
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    style={{ marginTop: 12 }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#991b1b", textTransform: "uppercase", marginBottom: 4 }}>
                      💡 Actionable Recommendation:
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#7f1d1d", fontWeight: 600 }}>
                      {Array.isArray(s.recommendation) ? s.recommendation[0] : s.recommendation}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
              {weakSubjects.length === 0 && (
                <p style={{ fontSize: 13, color: "#64748b" }}>Doing great! No major weak topics identified.</p>
              )}
            </div>
          </div>

        </div>
      </motion.div>

      {/* Subject Deep Dive Section */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1e293b", margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
          Subject Comparison & Progress Trends
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {subjects.map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              style={{
                background: "white",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{sub.subject}</h4>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: sub.trend === "Declining" ? "#fee2e2" : "#dcfce7",
                    color: sub.trend === "Declining" ? "#dc2626" : "#16a34a",
                  }}
                >
                  {sub.trend || "Improving"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <MetricRow label="Confidence" value={sub.confidence} color="#3b82f6" />
                <MetricRow label="Attendance" value={sub.attendance} color="#10b981" />
                <MetricRow label="AI Practice" value={sub.practiceAverage} color="#8b5cf6" />
                <MetricRow label="Latest Exam" value={sub.examAverage} color="#f59e0b" />
              </div>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 4 }}>RECOMMENDATION:</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "#334155" }}>
                  {Array.isArray(sub.recommendation) ? sub.recommendation[0] : sub.recommendation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value = 0, color = "#3b82f6" }) => {
  const numVal = typeof value === "number" ? value : parseInt(value) || 75;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{numVal}%</span>
      </div>
      <AnimatedProgressBar value={numVal} color={color} />
    </div>
  );
};

export default PerformanceOverview;
