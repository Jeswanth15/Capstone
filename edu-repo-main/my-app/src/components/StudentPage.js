import React, { useEffect, useState } from "react";
import { getDecodedToken, getUserIdFromToken } from "../utils/authHelper";
import { getAllAnnouncements, getAllClassSubjects, getTimetableByClass, getClassroomById, getCalendarBySchool } from "../utils/api";
import { useNavigate } from "react-router-dom";
import LiveBusMap from "./LiveBusMap";
import PerformanceOverview from "./PerformanceOverview";
import { getPerformancePrediction } from "../utils/api";
import AvatarService from "../services/AvatarService";
import GamificationService from "../services/GamificationService";
import AvatarDisplay from "./AvatarDisplay";

const StudentPage = () => {
  const decoded = getDecodedToken();
  const role = decoded?.role;
  const schoolId = decoded?.schoolId;
  const classroomId = decoded?.classroomId;
  const userName = decoded?.sub || "Student";
  const navigate = useNavigate();

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ANNOUNCEMENTS
  const [announcements, setAnnouncements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("ALL");

  // PERFORMANCE
  const [performanceData, setPerformanceData] = useState(null);

  // AVATAR & GAMIFICATION
  const [avatarData, setAvatarData] = useState(null);
  const [gamStatus, setGamStatus] = useState(null);

  useEffect(() => {
    if (!schoolId) return;
    getAllAnnouncements().then(res => {
      let list = (res.data || []).filter(a => a.schoolId === schoolId && (a.classroomId === null || a.classroomId === classroomId));
      list.sort((a,b) => new Date(b.postedAt) - new Date(a.postedAt));
      setAnnouncements(list); setFiltered(list);
    }).catch(console.error).finally(()=>setTimeout(()=>setLoading(false),500));
    
    const uId = getUserIdFromToken();
    if(uId) {
        getPerformancePrediction(uId)
        .then(res => setPerformanceData(res.data))
        .catch(console.error);

        AvatarService.getCurrent(uId)
        .then(res => setAvatarData(res.data))
        .catch(console.error);

        GamificationService.getStatus(uId)
        .then(res => setGamStatus(res.data))
        .catch(console.error);
    }
  }, [schoolId, classroomId]);

  useEffect(() => {
    setFiltered(announcements.filter(a => filter==="ALL" || (filter==="SCHOOL" ? !a.classroomId : a.classroomId===classroomId)));
  }, [filter, announcements, classroomId]);

  // TIMETABLE
  const [timetable, setTimetable] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [myClass, setMyClass] = useState(null);

  const loadTimetable = async () => {
    try {
      const [cls, tt, cs] = await Promise.all([getClassroomById(classroomId), getTimetableByClass(classroomId), getAllClassSubjects()]);
      setMyClass(cls.data); setTimetable(tt.data||[]); setClassSubjects((cs.data||[]).filter(s=>s.classroomId===classroomId));
    } catch(e) { console.error(e); }
  };

  const openRightPanel = (type) => { setRightPanelContent(type); if(type==="TIMETABLE") loadTimetable(); setRightPanelOpen(true); };

  if (role !== "STUDENT") return <div style={{textAlign:"center", padding:100}}>Access Restricted.</div>;
  if (loading) return <div style={{textAlign:"center", padding:100}}>Fetching learning environment...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg, #1e40af, #3b82f6)", borderRadius:24, padding:32, color:"white", marginBottom:32, boxShadow:"0 12px 32px rgba(37,99,235,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            {avatarData && (
              <AvatarDisplay
                config={avatarData}
                size={72}
                border="3px solid rgba(255,255,255,0.3)"
                shadow="0 6px 20px rgba(0,0,0,0.25)"
                onClick={() => navigate('/profile')}
              />
            )}
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:"#93c5fd", textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Student Gateway</div>
              <h1 style={{ fontSize:28, fontWeight:900, margin:"0 0 6px", fontFamily:"'Outfit', sans-serif" }}>Welcome, {userName}!</h1>
              {gamStatus ? (
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, fontWeight:800, background:"rgba(255,255,255,0.2)", padding:"3px 10px", borderRadius:99 }}>
                    🏆 Level {gamStatus.currentLevel} • {gamStatus.levelName}
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#fbbf24" }}>
                    ⭐ {gamStatus.totalXp} XP
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#fed7aa" }}>
                    🪙 {gamStatus.coins} Coins
                  </span>
                  <span style={{ fontSize:12, fontWeight:800, background:"rgba(249,115,22,0.3)", padding:"3px 10px", borderRadius:99, color:"#ffedd5", border:"1px solid rgba(249,115,22,0.5)", display:"flex", alignItems:"center", gap:4 }}>
                    🔥 {gamStatus.currentStreak || 1}-Day Streak
                  </span>
                  <span style={{ fontSize:11, opacity:0.8 }}>
                    🎨 {avatarData?.selectedStyle || 'adventurer'}
                  </span>
                </div>
              ) : (
                <p style={{ margin:0, color:"#bfdbfe", fontSize:14 }}>Here's what's happening today in your class.</p>
              )}
            </div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={()=>openRightPanel("TIMETABLE")} style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.3)", padding:"12px 20px", borderRadius:16, color:"white", fontWeight:800, cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
              📅 Timetable
            </button>
          </div>
        </div>
      </div>

      {/* PWA App Status & Offline Mode Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        borderRadius: 20,
        padding: "16px 24px",
        marginBottom: 24,
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>EduAI PWA Status</h4>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: navigator.onLine ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", color: navigator.onLine ? "#34d399" : "#fca5a5", fontWeight: 800 }}>
                {navigator.onLine ? "🟢 Network Online" : "📡 Offline Mode"}
              </span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.8 }}>Install as mobile app & access saved study materials offline anytime.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/student/offline-materials")}
            style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
          >
            📂 Offline Materials
          </button>
          <button
            onClick={() => navigate("/student/notifications")}
            style={{ padding: "8px 14px", borderRadius: 10, background: "#3b82f6", color: "white", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
          >
            🔔 Push Settings
          </button>
        </div>
      </div>

      {/* Daily Challenge Promo Banner */}
      {performanceData?.weakSubjects && performanceData.weakSubjects.length > 0 && (
        <div style={{ 
          background: "linear-gradient(95deg, #fffbeb, #fff7ed)", 
          borderRadius: 20, 
          padding: "20px 24px", 
          marginBottom: 32, 
          border: "1px solid #fef3c7", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          boxShadow: "0 4px 15px rgba(245, 158, 11, 0.05)",
          animation: "pageEnter 0.5s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏆</div>
            <div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#b45309" }}>Daily AI Quest Available!</h4>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#d97706" }}>Boost your understanding in <b>{performanceData.weakSubjects[0].subject}</b> today.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/student/daily-challenge")}
            style={{ 
              padding: "10px 20px", 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: 12, 
              fontSize: 13, 
              fontWeight: 800, 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Start Quest
          </button>
        </div>
      )}

      <div className="responsive-grid-main">
        
        {/* Main */}
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
           
           <PerformanceOverview data={performanceData} />

           <div style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
              <div style={{ padding:"20px 24px", background:"var(--surface-2)", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:10 }}>
                 <div style={{ width:32, height:32, borderRadius:10, background:"rgba(16,185,129,0.1)", color:"#10b981", display:"flex", alignItems:"center", justifyContent:"center" }}>🚌</div>
                 <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"var(--text-primary)" }}>Live Bus Tracking</h3>
              </div>
              <div style={{ padding:24 }}><LiveBusMap userId={decoded?.userId} /></div>
           </div>

           <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                 <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"var(--text-primary)" }}>Broadcasts</h3>
                 <select value={filter} onChange={e=>setFilter(e.target.value)} className="form-input" style={{ width:150, borderRadius:20, padding:"6px 12px", fontSize:12, fontWeight:700 }}>
                    <option value="ALL">All Sources</option>
                    <option value="SCHOOL">School Wide</option>
                    <option value="CLASS">Class Filter</option>
                 </select>
              </div>
              
              {filtered.length === 0 ? <div style={{ background:"var(--surface-1)", borderRadius:20, padding:60, textAlign:"center", border:"1px solid var(--border-light)", color:"var(--text-tertiary)" }}>No announcements.</div> : (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {filtered.map((a, i) => (
                    <div key={a.announcementId} style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", padding:24, boxShadow:"var(--shadow-sm)", animation:`pageEnter 0.4s ease ${i*30}ms` }}>
                       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                          <h4 style={{ margin:0, fontSize:16, fontWeight:800 }}>{a.title}</h4>
                          <span style={{ fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:99, background:a.classroomId?"rgba(59,130,246,0.1)":"rgba(107,114,128,0.1)", color:a.classroomId?"#3b82f6":"#6b7280" }}>{a.classroomId ? "Class" : "School"}</span>
                       </div>
                       <p style={{ margin:"0 0 16px", fontSize:14, color:"var(--text-secondary)", lineHeight:1.6 }}>{a.message}</p>
                       <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:600 }}>🕐 {new Date(a.postedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
           </div>

        </div>

        {/* Side */}
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
           <div style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
             <h3 style={{ margin:0, fontSize:14, fontWeight:800, padding:"16px 20px", borderBottom:"1px solid var(--border-subtle)", color:"var(--text-primary)" }}>Quick Actions</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))", gap:1, background:"var(--border-subtle)" }}>
                {[
                  {l:"Coursework", i:"📚", r:"/student/assignments", c:"#3b82f6"},
                  {l:"My Grades", i:"💯", r:"/student/marks", c:"#10b981"},
                  {l:"Syllabus", i:"📄", r:"/student/syllabus", c:"#8b5cf6"},
                  {l:"Examinations", i:"🎯", r:"/student/exams", c:"#f59e0b"},
                  {l:"Daily Quest", i:"🏆", r:"/student/daily-challenge", c:"#ef4444"}
                ].map(btn => (
                  <div key={btn.l} onClick={()=>navigate(btn.r)} style={{ background:"var(--surface-1)", padding:"24px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"} onMouseLeave={e=>e.currentTarget.style.background="var(--surface-1)"}>
                     <div style={{ width:40, height:40, borderRadius:12, background:`${btn.c}15`, color:btn.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{btn.i}</div>
                     <span style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textAlign:"center" }}>{btn.l}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>

      {rightPanelOpen && (
        <>
          <div onClick={()=>setRightPanelOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.4)", backdropFilter:"blur(4px)", zIndex:1400 }} />
          <div style={{ position:"fixed", top:0, right:0, bottom:0, width:550, background:"var(--surface-1)", boxShadow:"-20px 0 60px rgba(0,0,0,0.15)", zIndex:1500, animation:"slideInRight 0.4s var(--ease-spring) both", padding:40, overflowY:"auto" }}>
             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
                <h3 style={{ margin:0, fontSize:24, fontWeight:900 }}>My Academic Schedule</h3>
                <button onClick={()=>setRightPanelOpen(false)} style={{ width:40, height:40, borderRadius:"50%", background:"var(--surface-2)", border:"none", cursor:"pointer", fontWeight:800 }}>✕</button>
             </div>
             
             {rightPanelContent === "TIMETABLE" && (
                <div style={{ background:"var(--surface-2)", padding:20, borderRadius:16, border:"1px solid var(--border-light)" }}>
                   <div style={{ fontSize:15, fontWeight:800, color:"var(--primary-color)", marginBottom:16 }}>Class {myClass?.className || "Loading..."} • Room {myClass?.roomNumber || "-"}</div>
                   <table style={{ width:"100%", borderSpacing:4 }}>
                      <thead><tr><th></th>{["MON","TUE","WED","THU","FRI","SAT"].map(d=><th key={d} style={{ fontSize:10, color:"var(--text-secondary)", paddingBottom:8 }}>{d}</th>)}</tr></thead>
                      <tbody>
                        {[1,2,3,4,5,6,7].map(p=>(
                          <tr key={p}>
                            <td style={{ fontSize:12, fontWeight:800, color:"var(--primary-color)", padding:8 }}>P{p}</td>
                            {["MON","TUE","WED","THU","FRI","SAT"].map(d=>{
                               const slot = timetable.find(t=>t.dayOfWeek.toUpperCase().startsWith(d) && Number(t.periodNumber)===p);
                               return <td key={d+p} style={{ background:"white", borderRadius:8, padding:8, textAlign:"center", fontSize:11, fontWeight:700, color:"var(--text-secondary)" }}>{slot ? (classSubjects.find(s=>s.subjectId===slot.subjectId)?.subjectName || "-") : "-"}</td>
                            })}
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentPage;
