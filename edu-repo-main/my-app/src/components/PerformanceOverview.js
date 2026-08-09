import React from 'react';

const PerformanceOverview = ({ data }) => {
  if (!data) return <div style={{ padding: 20, background: "white", borderRadius: 20, textAlign: "center", color: "#64748b" }}>⌛ Predicting performance trends...</div>;
  if (data.error) return <div style={{ padding: 20, background: "#fef2f2", borderRadius: 20, textAlign: "center", color: "#dc2626" }}>❌ {data.error}</div>;

  const { strongSubjects = [], weakSubjects = [], subjects = [] } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }} id="performance-report">
      {/* Overview Card */}
      <div style={{ 
        background: "white", 
        borderRadius: 24, 
        padding: 32, 
        border: "1px solid #e2e8f0", 
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#1e293b" }}>Performance Overview</h2>
          <button 
            onClick={() => window.print()}
            className="no-print"
            style={{
              padding: "10px 20px",
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
              transition: "all 0.2s"
            }}
          >
            <span>🖨️</span> Print Report
          </button>
        </div>
        <style>{`
          @media print {
            .no-print, nav, sidebar, footer, .hero-section { display: none !important; }
            body { background: white !important; }
            #performance-report { margin: 0 !important; width: 100% !important; }
            .responsive-grid-main { display: block !important; }
          }
        `}</style>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Strong Subjects */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#059669", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              🟢 Strong Subjects
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {strongSubjects.map((s, idx) => (
                <div key={idx} style={{ background: "#f0fdf4", padding: 16, borderRadius: 16, border: "1px solid #dcfce7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700 }}>✓ {s.subject}</span>
                    <span style={{ fontSize: 13, background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 8 }}>{s.confidence}%</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Strength:</div>
                    <p style={{ margin: "4px 0", fontSize: 12, color: "#15803d" }}>
                      {Array.isArray(s.reason) ? s.reason[0] : s.reason}
                    </p>
                  </div>
                </div>
              ))}
              {strongSubjects.length === 0 && <p style={{ fontSize: 13, color: "#64748b" }}>Keep practicing to identify your strengths!</p>}
            </div>
          </div>

          {/* Weak Subjects */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠ Weak Subjects
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {weakSubjects.map((s, idx) => (
                <div key={idx} style={{ background: "#fff1f2", padding: 16, borderRadius: 16, border: "1px solid #fee2e2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#991b1b" }}>⚠ {s.subject}</span>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 800, 
                      padding: "2px 8px", 
                      borderRadius: 8, 
                      background: s.risk === "Critical" ? "#ef4444" : "#f59e0b", 
                      color: "white" 
                    }}>
                      {s.risk} ({s.probability}%)
                    </span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7f1d1d", textTransform: "uppercase" }}>Reason:</div>
                    <ul style={{ margin: "4px 0", paddingLeft: 16, fontSize: 12, color: "#b91c1c" }}>
                      {Array.isArray(s.reason) ? s.reason.map((r, i) => <li key={i}>{r}</li>) : <li>{s.reason}</li>}
                    </ul>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7f1d1d", textTransform: "uppercase" }}>Recommendation:</div>
                    <p style={{ margin: "4px 0", fontSize: 12, color: "#b91c1c", fontWeight: 500 }}>
                      {Array.isArray(s.recommendation) ? s.recommendation[0] : s.recommendation}
                    </p>
                  </div>
                </div>
              ))}
              {weakSubjects.length === 0 && <p style={{ fontSize: 13, color: "#64748b" }}>Doing great! No major weak areas detected.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance Cards */}
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0 -8px" }}>Subject Deep Dive</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {subjects.map((sub, idx) => (
          <div key={idx} style={{ 
            background: "white", 
            borderRadius: 20, 
            padding: 24, 
            border: "1px solid #e2e8f0", 
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{sub.subject}</h4>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 800, 
                padding: "2px 8px", 
                borderRadius: 8, 
                background: sub.trend === "Declining" ? "#fee2e2" : "#dcfce7", 
                color: sub.trend === "Declining" ? "#dc2626" : "#16a34a" 
              }}>
                {sub.trend}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetricRow label="Confidence" value={`${sub.confidence}%`} />
              <MetricRow label="Attendance" value={`${sub.attendance}%`} />
              <MetricRow label="Assignments" value={sub.assignmentAverage} />
              <MetricRow label="AI Practice" value={sub.practiceAverage} />
              <MetricRow label="Latest Exam" value={sub.examAverage} />
            </div>

            <div style={{ mt: 16, pt: 16, borderTop: "1px solid #f1f5f9" }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>AI RECOMMENDATION:</div>
               <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "#334155" }}>
                  {Array.isArray(sub.recommendation) ? sub.recommendation[0] : sub.recommendation}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{value}</span>
  </div>
);

export default PerformanceOverview;
