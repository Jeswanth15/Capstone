import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "../utils/authHelper";
import {
  getAnnouncementsBySchool,
  getAllClassSubjects,
  createAnnouncement,
  getAllTimetables,
  getCalendarBySchool,
} from "../utils/api";

// Helper components
const LoadingScreen = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight: 400, gap: 16 }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(167,139,250,0.08))",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
      animation: "float 2s ease-in-out infinite",
    }}>👩‍🏫</div>
    <div className="spinner spinner-lg" style={{ borderTopColor: "#a78bfa" }} />
    <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>Preparing academic workspace…</p>
  </div>
);

const TeacherDashboard = () => {
  const decoded = getDecodedToken();
  const navigate = useNavigate();

  const teacherId = decoded?.userId;
  const schoolId = decoded?.schoolId;
  const schoolName = decoded?.schoolName || "Academic Portal";
  const userName = decoded?.name || decoded?.sub || "Educator";

  const [announcements, setAnnouncements] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [allClassSubjects, setAllClassSubjects] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "", classroomId: "" });
  
  const [calendar, setCalendar] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState(null); // "TIMETABLE" or "CALENDAR"

  // Internal Drawer States
  const [timetableMode, setTimetableMode] = useState("DAY"); // "DAY" or "GRID"
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const dMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = dMap[new Date().getDay()];
    return today === "SUN" ? "MON" : today;
  });
  const [selectedCalDate, setSelectedCalDate] = useState(null);

  useEffect(() => {
    if (!teacherId || !schoolId) return;
    Promise.all([
      getAnnouncementsBySchool(schoolId),
      getAllClassSubjects(),
      getAllTimetables(),
      getCalendarBySchool(schoolId),
    ]).then(([ann, cs, tt, cal]) => {
      setAnnouncements((ann.data || []).sort((a,b) => new Date(b.postedAt) - new Date(a.postedAt)));
      const csData = cs.data || [];
      setAllClassSubjects(csData);
      setMyClasses(csData.filter(c => Number(c.teacherId) === Number(teacherId)));
      setMyTimetable((tt.data || []).filter(t => Number(t.teacherId) === Number(teacherId)));
      setCalendar(cal.data || []);
    }).catch(console.error).finally(() => setTimeout(() => setLoading(false), 500));
  }, [teacherId, schoolId]);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) { alert("Title and message required."); return; }
    setPosting(true);
    try {
      await createAnnouncement({ ...newAnnouncement, userId: teacherId, schoolId, classroomId: newAnnouncement.classroomId || null });
      setNewAnnouncement({ title: "", message: "", classroomId: "" });
      const a = await getAnnouncementsBySchool(schoolId);
      setAnnouncements((a.data || []).sort((x,y) => new Date(y.postedAt) - new Date(x.postedAt)));
    } catch { alert("Failed to post."); }
    finally { setPosting(false); }
  };

  const loadCalendar = async () => {
    try {
      const res = await getCalendarBySchool(schoolId);
      setCalendar(res.data || []);
    } catch (e) { console.error(e); }
  };

  const openRightPanel = (c) => { 
    setRightPanelContent(c); 
    if(c === "CALENDAR") loadCalendar(); 
    setRightPanelOpen(true); 
  };
  const closeRightPanel = () => { setRightPanelOpen(false); };

  // Timetable constants & helpers
  const TIMETABLE_DAYS = [
    { key: "MON", label: "Monday", short: "Mon" },
    { key: "TUE", label: "Tuesday", short: "Tue" },
    { key: "WED", label: "Wednesday", short: "Wed" },
    { key: "THU", label: "Thursday", short: "Thu" },
    { key: "FRI", label: "Friday", short: "Fri" },
    { key: "SAT", label: "Saturday", short: "Sat" },
  ];

  const PERIOD_SLOTS = [
    { period: 1, time: "08:30 - 09:15" },
    { period: 2, time: "09:15 - 10:00" },
    { period: 3, time: "10:15 - 11:00" },
    { period: 4, time: "11:00 - 11:45" },
    { period: 5, time: "12:30 - 01:15" },
    { period: 6, time: "01:15 - 02:00" },
    { period: 7, time: "02:00 - 02:45" },
  ];

  const getSlotDetails = (dayKey, period) => {
    const slot = myTimetable.find(t => {
      const d = (t.dayOfWeek || "").toUpperCase();
      return (d === dayKey || d.startsWith(dayKey)) && Number(t.periodNumber) === Number(period);
    });
    if (!slot) return null;

    const match = allClassSubjects.find(c => 
      Number(c.classroomId) === Number(slot.classroomId) && 
      Number(c.subjectId) === Number(slot.subjectId)
    ) || myClasses.find(c => 
      Number(c.classroomId) === Number(slot.classroomId) && 
      Number(c.subjectId) === Number(slot.subjectId)
    );

    return {
      slot,
      classroomName: match?.classroomName ? `${match.classroomName}${match.classroomSection ? ` (${match.classroomSection})` : ''}` : `Classroom #${slot.classroomId}`,
      subjectName: match?.subjectName || `Subject #${slot.subjectId}`,
    };
  };

  // Calendar helpers
  const changeMonth = (offset) => {
    const nw = new Date(currentMonth);
    nw.setMonth(nw.getMonth() + offset);
    setCurrentMonth(nw);
    setSelectedCalDate(null);
  };

  const jumpToToday = () => {
    setCurrentMonth(new Date());
    setSelectedCalDate(null);
  };

  const getCalendarDays = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const leadPadding = (startOfMonth.getDay() + 6) % 7; // Monday-first index (0 = Mon, 6 = Sun)

    const days = [];
    for (let i = 0; i < leadPadding; i++) days.push(null);
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  };

  const formatLocalDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDayInfo = (date) => {
    if (!date) return { status: null, description: "", entry: null };
    const dtStr = formatLocalDate(date);
    const found = calendar.find(c => c.date === dtStr);
    if (found) {
      return { status: found.status, description: found.description || "", entry: found };
    }
    if (date.getDay() === 0) {
      return { status: "SUNDAY", description: "Sunday Weekend", entry: null };
    }
    return { status: "WORKING", description: "", entry: null };
  };

  if (loading) return <LoadingScreen />;

  // Quick stats
  const STATS = [
    { label: "My Classes", count: myClasses.length, icon: "📚", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    { label: "Weekly Periods", count: myTimetable.length, icon: "⏳", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
    { label: "School Broadcasts", count: announcements.filter(a => !a.classroomId).length, icon: "📣", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40, position: "relative" }}>
      
      {/* Hero Banner */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #2e1065 0%, #4c1d95 60%, #3b0764 100%)",
        borderRadius: 24, padding: "36px 40px", marginBottom: 32,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 48px rgba(76,29,149,0.25)",
      }}>
        <div style={{ position:"absolute", top:-60, right:40, width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)", filter:"blur(30px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:60, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)", filter:"blur(25px)", pointerEvents:"none" }} />

        <div style={{ position:"relative", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(167,139,250,0.1))",
            border: "1.5px solid rgba(167,139,250,0.4)",
            display: "flex", alignItems:"center", justifyContent:"center",
            fontSize: 32, boxShadow: "0 8px 24px rgba(167,139,250,0.3)",
          }}>🎓</div>
          <div style={{ flex: 1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#c4b5fd", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Educator Portal</div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"white", margin:0, letterSpacing:"-0.03em", fontFamily:"'Outfit', sans-serif" }}>
              Welcome, {userName}
            </h1>
            <p style={{ color:"#ddd6fe", fontSize:13.5, margin:"4px 0 0" }}><span style={{fontWeight:600}}>{schoolName}</span> Academic Term</p>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => openRightPanel("TIMETABLE")} style={{ padding:"10px 18px", borderRadius:12, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", backdropFilter:"blur(10px)", transition:"all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}>📅 Timetable</button>
            <button onClick={() => openRightPanel("CALENDAR")} style={{ padding:"10px 18px", borderRadius:12, background:"linear-gradient(135deg, #8b5cf6, #7c3aed)", border:"1px solid rgba(167,139,250,0.5)", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 16px rgba(124,58,237,0.4)", transition:"all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>🌍 Calendar</button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="responsive-grid-main">
        
        {/* Main Column */}
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
          
          {/* Post Announcement */}
          <div style={{ background:"var(--surface-1)", border:"1px solid var(--border-light)", borderRadius:20, boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"var(--surface-2)", border:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📣</div>
              <h2 style={{ fontSize:15, fontWeight:800, color:"var(--text-primary)", margin:0 }}>Share an Update</h2>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:16 }}>
                <input className="form-input" placeholder="Give your update a clear title…" value={newAnnouncement.title} onChange={e=>setNewAnnouncement(p=>({...p, title:e.target.value}))} style={{borderRadius:12}} />
                <textarea className="form-input" placeholder="Type your message here. Students will see this instantly on their dashboard." rows={3} value={newAnnouncement.message} onChange={e=>setNewAnnouncement(p=>({...p, message:e.target.value}))} style={{resize:"none", borderRadius:12, fontSize:13.5}} />
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <select className="form-input" value={newAnnouncement.classroomId} onChange={e=>setNewAnnouncement(p=>({...p, classroomId:e.target.value}))} style={{flex:1, borderRadius:12, fontSize:13}}>
                  <option value="">🌐 Broadcast to All School</option>
                  {myClasses.map(c => <option key={c.id} value={c.classroomId}>📚 {c.classroomName} — {c.subjectName}</option>)}
                </select>
                <button onClick={handleCreateAnnouncement} disabled={posting} style={{ padding:"0 24px", borderRadius:12, background:"linear-gradient(135deg, #10b981, #059669)", color:"white", border:"none", fontWeight:700, fontSize:13.5, cursor:"pointer", boxShadow:"0 4px 16px rgba(16,185,129,0.3)", opacity: posting?0.7:1 }}>
                  {posting ? "Posting…" : "Post"}
                </button>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div>
            <h3 style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>Activity Feed <span style={{fontSize:12, background:"var(--surface-2)", color:"var(--text-tertiary)", padding:"3px 8px", borderRadius:99, fontWeight:700}}>{announcements.length}</span></h3>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {announcements.length === 0 ? (
                <div style={{ background:"var(--surface-1)", border:"1px dashed var(--border-medium)", borderRadius:20, padding:"40px", textAlign:"center", color:"var(--text-tertiary)" }}>
                  <div style={{fontSize:32, marginBottom:10}}>📪</div><div style={{fontSize:14, fontWeight:500}}>No announcements active.</div>
                </div>
              ) : announcements.map((a, i) => (
                <div key={a.announcementId} style={{ background:"var(--surface-1)", border:"1px solid var(--border-light)", borderRadius:16, padding:"20px", boxShadow:"var(--shadow-sm)", animation:`pageEnter 0.4s var(--ease-out) ${i*50}ms both` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <h4 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--text-primary)", lineHeight:1.3 }}>{a.title}</h4>
                    <span style={{ fontSize:10.5, fontWeight:700, padding:"3px 10px", borderRadius:99, background: a.classroomId?"rgba(59,130,246,0.12)":"rgba(107,114,128,0.1)", color: a.classroomId?"var(--brand-600)":"var(--text-secondary)" }}>
                      {a.classroomId ? myClasses.find(c => c.classroomId === a.classroomId)?.classroomName || "Class Target" : "School Wide"}
                    </span>
                  </div>
                  <p style={{ margin:"0 0 16px", fontSize:13.5, color:"var(--text-secondary)", lineHeight:1.6 }}>{a.message}</p>
                  <div style={{ fontSize:11.5, color:"var(--text-tertiary)", fontWeight:500 }}>
                    🕐 {new Date(a.postedAt).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
          
          {/* Quick Stats Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background:"var(--surface-1)", border:"1px solid var(--border-light)", borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, boxShadow:"var(--shadow-sm)" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", lineHeight:1, fontFamily:"'Outfit', sans-serif" }}>{s.count}</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600, marginTop:4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ background:"var(--surface-1)", border:"1px solid var(--border-light)", borderRadius:20, boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
             <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border-subtle)" }}>
               <h3 style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", margin:0 }}>Educator Tools</h3>
             </div>
             <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:1, background:"var(--border-subtle)" }}>
               {[
                 {l:"Assignments", i:"📝", c:"#3b82f6", r:"/teacher/assignments"}, {l:"Marks Entry", i:"💯", c:"#10b981", r:"/teacher/marks"},
                 {l:"Attendance", i:"📋", c:"#f59e0b", r:"/teacher/attendance"}, {l:"Syllabus", i:"📚", c:"#8b5cf6", r:"/teacher/syllabus"}
               ].map(btn => (
                 <div key={btn.l} onClick={()=>navigate(btn.r)} style={{ background:"var(--surface-1)", padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"} onMouseLeave={e=>e.currentTarget.style.background="var(--surface-1)"}>
                   <div style={{ width:40, height:40, borderRadius:12, background:`${btn.c}15`, color:btn.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{btn.i}</div>
                   <span style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)" }}>{btn.l}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* My Classes */}
          <div style={{ background:"var(--surface-1)", border:"1px solid var(--border-light)", borderRadius:20, boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", margin:0 }}>My Active Classes</h3>
            </div>
            <div style={{ display:"flex", flexDirection:"column" }}>
              {myClasses.length===0?<div style={{padding:30, textAlign:"center", fontSize:13, color:"var(--text-tertiary)"}}>No classes assigned.</div>
              : myClasses.map(c => (
                <div key={c.id} onClick={()=>navigate(`/teacher/attendance/${c.classroomId}/${c.subjectId}`)} style={{ padding:"14px 20px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(96,165,250,0.12)", color:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800 }}>{c.subjectName ? c.subjectName.charAt(0) : "📚"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"var(--text-primary)" }}>{c.classroomName}</div>
                    <div style={{ fontSize:12, color:"var(--text-secondary)" }}>{c.subjectName}</div>
                  </div>
                  <div style={{ color:"var(--text-tertiary)" }}>→</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Right Drawer Modal */}
      {rightPanelOpen && (
        <>
          <div onClick={closeRightPanel} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.4)", backdropFilter:"blur(4px)", zIndex:1400, animation:"pageEnter 0.3s ease" }} />
          <div style={{ position:"fixed", top:0, right:0, bottom:0, width:540, maxWidth:"92vw", background:"var(--surface-1)", borderLeft:"1px solid var(--border-light)", boxShadow:"-20px 0 60px rgba(0,0,0,0.2)", zIndex:1500, display:"flex", flexDirection:"column", animation:"slideInRight 0.4s var(--ease-spring) both" }}>
            
            {/* Drawer Header */}
            <div style={{ padding:"20px 28px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--surface-2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:12, background: rightPanelContent === "TIMETABLE" ? "rgba(167,139,250,0.15)" : "rgba(59,130,246,0.15)", color: rightPanelContent === "TIMETABLE" ? "#8b5cf6" : "#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {rightPanelContent === "TIMETABLE" ? "📅" : "🌍"}
                </div>
                <div>
                  <h2 style={{ fontSize:17, fontWeight:800, margin:0, color:"var(--text-primary)" }}>
                    {rightPanelContent === "TIMETABLE" ? "Weekly Timetable" : "School Calendar"}
                  </h2>
                  <p style={{ margin:0, fontSize:12, color:"var(--text-secondary)", fontWeight:500 }}>
                    {rightPanelContent === "TIMETABLE" ? "Personalized teaching schedule & period breakdown" : "Academic term schedule, holidays & operational days"}
                  </p>
                </div>
              </div>
              <button onClick={closeRightPanel} style={{ width:34, height:34, borderRadius:"50%", background:"var(--surface-1)", border:"1px solid var(--border-subtle)", cursor:"pointer", color:"var(--text-primary)", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            
            {/* Drawer Body Content */}
            <div style={{ padding:"24px 28px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:24 }}>
               
               {/* ----------------- TIMETABLE PANEL ----------------- */}
               {rightPanelContent === "TIMETABLE" && (
                 <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    
                    {/* Top Stats Banner */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
                       <div style={{ background:"var(--surface-2)", borderRadius:14, padding:"12px 14px", border:"1px solid var(--border-subtle)", textAlign:"center" }}>
                          <div style={{ fontSize:18, fontWeight:900, color:"#8b5cf6", fontFamily:"'Outfit', sans-serif" }}>{myTimetable.length}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", marginTop:2 }}>Assigned Slots</div>
                       </div>
                       <div style={{ background:"var(--surface-2)", borderRadius:14, padding:"12px 14px", border:"1px solid var(--border-subtle)", textAlign:"center" }}>
                          <div style={{ fontSize:18, fontWeight:900, color:"#3b82f6", fontFamily:"'Outfit', sans-serif" }}>{new Set(myTimetable.map(t=>t.classroomId)).size}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", marginTop:2 }}>Unique Classes</div>
                       </div>
                       <div style={{ background:"var(--surface-2)", borderRadius:14, padding:"12px 14px", border:"1px solid var(--border-subtle)", textAlign:"center" }}>
                          <div style={{ fontSize:18, fontWeight:900, color:"#10b981", fontFamily:"'Outfit', sans-serif" }}>{new Set(myTimetable.map(t=>t.subjectId)).size}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", marginTop:2 }}>Subjects Taught</div>
                       </div>
                    </div>

                    {/* Mode Toggle & Day Tabs Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                       <div style={{ display:"flex", background:"var(--surface-2)", padding:3, borderRadius:12, border:"1px solid var(--border-subtle)" }}>
                          <button onClick={()=>setTimetableMode("DAY")} style={{ padding:"6px 14px", borderRadius:9, border:"none", background: timetableMode === "DAY" ? "var(--surface-1)" : "transparent", color: timetableMode === "DAY" ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight:700, fontSize:12, cursor:"pointer", boxShadow: timetableMode === "DAY" ? "var(--shadow-sm)" : "none", transition:"all 0.2s" }}>📅 Daily View</button>
                          <button onClick={()=>setTimetableMode("GRID")} style={{ padding:"6px 14px", borderRadius:9, border:"none", background: timetableMode === "GRID" ? "var(--surface-1)" : "transparent", color: timetableMode === "GRID" ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight:700, fontSize:12, cursor:"pointer", boxShadow: timetableMode === "GRID" ? "var(--shadow-sm)" : "none", transition:"all 0.2s" }}>📊 Week Grid</button>
                       </div>
                    </div>

                    {/* DAY VIEW */}
                    {timetableMode === "DAY" && (
                       <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                          
                          {/* Day Pills */}
                          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
                             {TIMETABLE_DAYS.map(d => {
                                const isSelected = selectedDayKey === d.key;
                                const countForDay = myTimetable.filter(t => (t.dayOfWeek||"").toUpperCase().startsWith(d.key)).length;
                                return (
                                   <button key={d.key} onClick={()=>setSelectedDayKey(d.key)} style={{
                                      flex:1, minWidth:60, padding:"8px 10px", borderRadius:12,
                                      background: isSelected ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "var(--surface-2)",
                                      border: isSelected ? "1px solid rgba(167,139,250,0.5)" : "1px solid var(--border-subtle)",
                                      color: isSelected ? "white" : "var(--text-secondary)",
                                      cursor: "pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                                      transition: "all 0.2s"
                                   }}>
                                      <span style={{ fontSize:12, fontWeight:800 }}>{d.short}</span>
                                      <span style={{ fontSize:9.5, opacity: isSelected?0.9:0.6, fontWeight:700 }}>{countForDay > 0 ? `${countForDay} pds` : "Off"}</span>
                                   </button>
                                );
                             })}
                          </div>

                          {/* Periods List */}
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                             {PERIOD_SLOTS.map(p => {
                                const details = getSlotDetails(selectedDayKey, p.period);
                                return (
                                   <div key={p.period} style={{
                                      display:"flex", alignItems:"stretch", gap:14,
                                      background: details ? "var(--surface-1)" : "var(--surface-2)",
                                      borderRadius: 16, padding: "14px 18px",
                                      border: details ? "1px solid rgba(139,92,246,0.3)" : "1px dashed var(--border-subtle)",
                                      boxShadow: details ? "0 4px 12px rgba(139,92,246,0.06)" : "none",
                                      position: "relative", overflow: "hidden"
                                   }}>
                                      {details && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:"linear-gradient(to bottom, #8b5cf6, #3b82f6)" }} />}
                                      
                                      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", minWidth:85, borderRight:"1px solid var(--border-subtle)", pr:12 }}>
                                         <span style={{ fontSize:13, fontWeight:800, color:"var(--text-primary)" }}>Period {p.period}</span>
                                         <span style={{ fontSize:10.5, color:"var(--text-tertiary)", fontWeight:600, marginTop:2 }}>{p.time}</span>
                                      </div>

                                      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-between", minWidth:0, paddingLeft:4 }}>
                                         {details ? (
                                            <div>
                                               <div style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", display:"flex", alignItems:"center", gap:8 }}>
                                                  <span>{details.subjectName}</span>
                                               </div>
                                               <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:600, marginTop:4, display:"flex", alignItems:"center", gap:6 }}>
                                                  <span style={{ background:"rgba(139,92,246,0.12)", color:"#8b5cf6", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>
                                                     🏫 {details.classroomName}
                                                  </span>
                                               </div>
                                            </div>
                                         ) : (
                                            <div style={{ color:"var(--text-tertiary)", fontSize:12.5, fontWeight:500, fontStyle:"italic", display:"flex", alignItems:"center", gap:6 }}>
                                               <span>☕</span> <span>Free Period</span>
                                            </div>
                                         )}
                                         
                                         {details && (
                                            <span style={{ fontSize:10.5, fontWeight:700, padding:"3px 9px", borderRadius:99, background:"rgba(16,185,129,0.12)", color:"#10b981" }}>
                                               Assigned
                                            </span>
                                         )}
                                      </div>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    )}

                    {/* GRID VIEW */}
                    {timetableMode === "GRID" && (
                       <div style={{ background:"var(--surface-1)", borderRadius:16, border:"1px solid var(--border-light)", overflow:"hidden" }}>
                          <div className="table-scroll-wrapper">
                             <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                                <thead>
                                   <tr style={{ background:"var(--surface-2)" }}>
                                      <th style={{ padding:10, borderBottom:"1px solid var(--border-subtle)", textAlign:"left", fontWeight:800, color:"var(--text-muted)", fontSize:11 }}>DAY</th>
                                      {[1,2,3,4,5,6,7].map(p=>(
                                         <th key={p} style={{ padding:10, borderBottom:"1px solid var(--border-subtle)", textAlign:"center", fontWeight:800, color:"var(--text-muted)", fontSize:11 }}>P{p}</th>
                                      ))}
                                   </tr>
                                </thead>
                                <tbody>
                                   {TIMETABLE_DAYS.map(d => (
                                      <tr key={d.key}>
                                         <td style={{ padding:"12px 10px", fontWeight:800, color:"var(--text-primary)", borderBottom:"1px solid var(--border-subtle)", background:"var(--surface-2)", fontSize:11.5 }}>
                                            {d.short}
                                         </td>
                                         {[1,2,3,4,5,6,7].map(p => {
                                            const details = getSlotDetails(d.key, p);
                                            return (
                                               <td key={p} style={{ padding:6, borderBottom:"1px solid var(--border-subtle)", textAlign:"center" }}>
                                                  {details ? (
                                                     <div style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:8, padding:"6px 4px" }}>
                                                        <div style={{ fontSize:10.5, fontWeight:800, color:"#8b5cf6", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{details.subjectName}</div>
                                                        <div style={{ fontSize:9.5, color:"var(--text-secondary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{details.classroomName}</div>
                                                     </div>
                                                  ) : (
                                                     <span style={{ color:"var(--text-tertiary)", fontSize:11 }}>--</span>
                                                  )}
                                               </td>
                                            );
                                         })}
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    )}

                 </div>
               )}

               {/* ----------------- CALENDAR PANEL ----------------- */}
               {rightPanelContent === "CALENDAR" && (
                 <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    
                    {/* Calendar Month Header & Nav */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--surface-2)", padding:"12px 16px", borderRadius:16, border:"1px solid var(--border-subtle)" }}>
                       <button onClick={()=>changeMonth(-1)} style={{ width:32, height:32, borderRadius:10, background:"var(--surface-1)", border:"1px solid var(--border-subtle)", cursor:"pointer", color:"var(--text-primary)", fontWeight:800 }}>←</button>
                       <div style={{ textAlign:"center" }}>
                          <h3 style={{ margin:0, fontSize:15, fontWeight:900, color:"var(--text-primary)", textTransform:"capitalize" }}>
                             {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </h3>
                       </div>
                       <div style={{ display:"flex", gap:6 }}>
                          <button onClick={jumpToToday} style={{ padding:"6px 12px", borderRadius:8, background:"var(--surface-1)", border:"1px solid var(--border-subtle)", cursor:"pointer", color:"var(--text-primary)", fontSize:11, fontWeight:700 }}>Today</button>
                          <button onClick={()=>changeMonth(1)} style={{ width:32, height:32, borderRadius:10, background:"var(--surface-1)", border:"1px solid var(--border-subtle)", cursor:"pointer", color:"var(--text-primary)", fontWeight:800 }}>→</button>
                       </div>
                    </div>

                    {/* Month Summary Counters */}
                    {(() => {
                       const days = getCalendarDays().filter(Boolean);
                       let workingCount = 0, holidayCount = 0, halfCount = 0;
                       days.forEach(d => {
                          const info = getDayInfo(d);
                          if (info.status === "HOLIDAY") holidayCount++;
                          else if (info.status === "HALF_DAY") halfCount++;
                          else if (info.status === "WORKING") workingCount++;
                       });
                       return (
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
                             <div style={{ background:"rgba(99,102,241,0.08)", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(99,102,241,0.2)", textAlign:"center" }}>
                                <div style={{ fontSize:16, fontWeight:900, color:"#6366f1" }}>{workingCount}</div>
                                <div style={{ fontSize:10.5, fontWeight:700, color:"#6366f1", marginTop:2 }}>Working Days</div>
                             </div>
                             <div style={{ background:"rgba(239,68,68,0.08)", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(239,68,68,0.2)", textAlign:"center" }}>
                                <div style={{ fontSize:16, fontWeight:900, color:"#ef4444" }}>{holidayCount}</div>
                                <div style={{ fontSize:10.5, fontWeight:700, color:"#ef4444", marginTop:2 }}>Holidays</div>
                             </div>
                             <div style={{ background:"rgba(245,158,11,0.08)", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(245,158,11,0.2)", textAlign:"center" }}>
                                <div style={{ fontSize:16, fontWeight:900, color:"#f59e0b" }}>{halfCount}</div>
                                <div style={{ fontSize:10.5, fontWeight:700, color:"#f59e0b", marginTop:2 }}>Half Days</div>
                             </div>
                          </div>
                       );
                    })()}

                    {/* Legend */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap", fontSize:11, fontWeight:600, color:"var(--text-secondary)" }}>
                       <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1" }} /> Working</span>
                       <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }} /> Holiday</span>
                       <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#f59e0b" }} /> Half Day</span>
                       <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#94a3b8" }} /> Sunday</span>
                    </div>

                    {/* Calendar Days Grid */}
                    <div style={{ background:"var(--surface-1)", borderRadius:16, padding:16, border:"1px solid var(--border-light)" }}>
                       
                       {/* Weekday headers */}
                       <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6, marginBottom:8, textAlign:"center" }}>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(w => (
                             <div key={w} style={{ fontSize:11, fontWeight:800, color:"var(--text-muted)", textTransform:"uppercase" }}>{w}</div>
                          ))}
                       </div>

                       {/* Month Grid */}
                       <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6 }}>
                          {getCalendarDays().map((date, idx) => {
                             if (!date) {
                                return <div key={`empty-${idx}`} style={{ aspectRatio:"1/1" }} />;
                             }

                             const info = getDayInfo(date);
                             const dtStr = formatLocalDate(date);
                             const isToday = formatLocalDate(new Date()) === dtStr;
                             const isSelected = selectedCalDate && selectedCalDate.dateStr === dtStr;

                             // Color mappings
                             let bg = "var(--surface-2)";
                             let borderColor = "var(--border-subtle)";
                             let textColor = "var(--text-primary)";
                             let badgeBg = "rgba(0,0,0,0.05)";

                             if (info.status === "HOLIDAY") {
                                bg = "rgba(239,68,68,0.1)";
                                borderColor = "rgba(239,68,68,0.3)";
                                textColor = "#dc2626";
                                badgeBg = "rgba(239,68,68,0.2)";
                             } else if (info.status === "HALF_DAY") {
                                bg = "rgba(245,158,11,0.1)";
                                borderColor = "rgba(245,158,11,0.3)";
                                textColor = "#d97706";
                                badgeBg = "rgba(245,158,11,0.2)";
                             } else if (info.status === "WORKING") {
                                bg = "rgba(99,102,241,0.08)";
                                borderColor = "rgba(99,102,241,0.25)";
                                textColor = "#4f46e5";
                                badgeBg = "rgba(99,102,241,0.18)";
                             } else if (info.status === "SUNDAY") {
                                bg = "rgba(148,163,184,0.08)";
                                borderColor = "rgba(148,163,184,0.2)";
                                textColor = "#64748b";
                                badgeBg = "rgba(148,163,184,0.15)";
                             }

                             return (
                                <div
                                   key={dtStr}
                                   onClick={() => setSelectedCalDate({ date, dateStr: dtStr, info })}
                                   style={{
                                      aspectRatio: "1/1",
                                      borderRadius: 12,
                                      background: bg,
                                      border: isSelected ? "2px solid #8b5cf6" : isToday ? "2px solid #3b82f6" : `1px solid ${borderColor}`,
                                      padding: "6px",
                                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                                      cursor: "pointer", transition: "transform 0.15s, boxShadow 0.15s",
                                      position: "relative"
                                   }}
                                   onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                                   onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                                >
                                   <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                      <span style={{ fontSize:12, fontWeight:800, color: textColor }}>{date.getDate()}</span>
                                      {isToday && <span style={{ width:5, height:5, borderRadius:"50%", background:"#3b82f6" }} />}
                                   </div>

                                   <div style={{ fontSize:8.5, fontWeight:800, color: textColor, textTransform:"uppercase", background: badgeBg, padding:"1px 4px", borderRadius:4, textAlign:"center", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                      {info.status === "WORKING" ? "Work" : info.status === "HOLIDAY" ? "Hol" : info.status === "HALF_DAY" ? "Half" : "Sun"}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>

                    {/* Selected Day Banner Detail */}
                    {selectedCalDate && (
                       <div style={{ background:"var(--surface-2)", borderRadius:16, padding:16, border:"1px solid var(--border-light)", animation:"pageEnter 0.3s ease" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                             <div>
                                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase" }}>Date Overview</div>
                                <div style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", marginTop:2 }}>
                                   {selectedCalDate.date.toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                                </div>
                             </div>
                             <span style={{
                                fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:99,
                                background: selectedCalDate.info.status === "HOLIDAY" ? "rgba(239,68,68,0.15)" : selectedCalDate.info.status === "HALF_DAY" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
                                color: selectedCalDate.info.status === "HOLIDAY" ? "#ef4444" : selectedCalDate.info.status === "HALF_DAY" ? "#f59e0b" : "#6366f1"
                             }}>
                                {selectedCalDate.info.status || "WORKING"}
                             </span>
                          </div>
                          {selectedCalDate.info.description ? (
                             <p style={{ margin:"6px 0 0", fontSize:12.5, color:"var(--text-secondary)" }}>
                                📌 {selectedCalDate.info.description}
                             </p>
                          ) : (
                             <p style={{ margin:"6px 0 0", fontSize:12, color:"var(--text-tertiary)", fontStyle:"italic" }}>
                                Regular scheduled academic day.
                             </p>
                          )}
                       </div>
                    )}

                 </div>
               )}

            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default TeacherDashboard;

