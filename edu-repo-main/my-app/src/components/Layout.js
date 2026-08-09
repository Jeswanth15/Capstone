import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { logout as authLogout, getDecodedToken, getUserIdFromToken } from "../utils/authHelper";
import GamificationService from "../services/GamificationService";
import AvatarService from "../services/AvatarService";
import AvatarDisplay from "./AvatarDisplay";
import CoinParticleFX from "./CoinParticleFX";
import HeaderNotificationCenter from "./HeaderNotificationCenter";
import OfflineBanner from "./OfflineBanner";
import InstallPromptBar from "./InstallPromptBar";
import DailyStreakModal from "./DailyStreakModal";

const NAV_LABELS = {
  "/": "Home",
  "/profile": "Profile",
  "/admin": "Admin Dashboard",
  "/schooladmin": "School Dashboard",
  "/schooladmin/pending-users": "User Approvals",
  "/schooladmin/classrooms": "Classrooms",
  "/schooladmin/subjects": "Subjects",
  "/schooladmin/assign-subject": "Teaching Assignments",
  "/schooladmin/enrollments": "Enrollments",
  "/schooladmin/timetables": "Master Timetable",
  "/schooladmin/substitutions": "Daily Substitutions",
  "/schooladmin/calendar": "School Calendar",
  "/schooladmin/syllabus": "Syllabus Hub",
  "/schooladmin/exams": "Exam Schedules",
  "/schooladmin/marks": "Marks Register",
  "/schooladmin/attendance": "Attendance",
  "/schooladmin/assignments": "Assignments",
  "/schooladmin/transport": "Transport Management",
  "/schooladmin/student-transport": "Student Transport",
  "/teacher": "Teacher Dashboard",
  "/teacher/attendance": "Attendance",
  "/teacher/assignments": "Assignments",
  "/teacher/syllabus": "Syllabus",
  "/teacher/teaching-logs": "Teaching Logs",
  "/teacher/exams": "Exams",
  "/teacher/marks": "Marks Entry",
  "/student": "Student Dashboard",
  "/student/timetable": "My Timetable",
  "/student/exams": "My Exams",
  "/student/marks": "My Marks",
  "/student/assignments": "Assignments",
  "/student/attendance": "Attendance",
  "/student/syllabus": "Syllabus",
  "/student/substitutions": "Substitutions",
  "/student/practice": "Practice Zone",
  "/student/leaderboard": "Leaderboard",
  "/student/bus-tracking": "Bus Tracking",
  "/driver/portal": "Driver Portal",
};

const ROLE_CONFIGS = {
  SCHOOLADMIN: { color: "#60a5fa", label: "School Admin", emoji: "🏫" },
  TEACHER:     { color: "#a78bfa", label: "Teacher",      emoji: "📚" },
  STUDENT:     { color: "#34d399", label: "Student",      emoji: "🎓" },
  DRIVER:      { color: "#fb923c", label: "Driver",       emoji: "🚌" },
  ADMIN:       { color: "#f472b6", label: "Admin",        emoji: "🛡️" },
};

const LEVEL_ICONS = ['🌱', '📚', '🔭', '🎓', '⚡', '🏆', '👑'];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const decoded = getDecodedToken();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [gamification, setGamification] = useState(null);
  const [gamHovered, setGamHovered] = useState(false);
  const [avatarData, setAvatarData] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);

  const userRole = decoded?.role || "";
  const userId = getUserIdFromToken();
  const isStudent = userRole === "STUDENT";
  const config = ROLE_CONFIGS[userRole] || { color: "#60a5fa", label: userRole, emoji: "👤" };

  const pageLabel = NAV_LABELS[location.pathname] ||
    location.pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" › ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch gamification data for students
  useEffect(() => {
    if (!isStudent || !userId) return;
    const fetchGamification = async () => {
      try {
        const res = await GamificationService.getStatus(userId);
        setGamification(res.data);

        // Check if this is the user's first login today
        if (res.data && res.data.isFirstLoginToday) {
          const todayStr = new Date().toISOString().slice(0, 10);
          const key = `dailyStreakShown_${userId}_${todayStr}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "true");
            setShowStreakModal(true);
          }
        }
      } catch (err) {
        console.error("Error fetching gamification status for header:", err);
      }
    };
    fetchGamification();
    const interval = setInterval(fetchGamification, 30000);
    return () => clearInterval(interval);
  }, [isStudent, userId]);

  // Fetch avatar data for students
  useEffect(() => {
    if (!isStudent || !userId) return;
    const fetchAvatar = async () => {
      try {
        const res = await AvatarService.getCurrent(userId);
        setAvatarData(res.data);
      } catch (err) {
        console.error("Error fetching avatar for header:", err);
      }
    };
    fetchAvatar();
    // Listen for avatar changes
    const handleAvatarChange = () => fetchAvatar();
    window.addEventListener('avatar-changed', handleAvatarChange);
    return () => window.removeEventListener('avatar-changed', handleAvatarChange);
  }, [isStudent, userId]);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  // Gamification derived values
  const levelIcon = gamification ? LEVEL_ICONS[(gamification.currentLevel - 1) % LEVEL_ICONS.length] : '🌱';
  const xpProgress = gamification ? Math.min((gamification.totalXp / gamification.nextLevelXpThreshold) * 100, 100) : 0;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "var(--bg-primary)",
      fontFamily: "var(--font-sans)",
    }}>
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* ── Top Header Bar ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 300,
          minHeight: 60,
          display: "flex", alignItems: "center", flexWrap: "wrap",
          padding: isDesktop ? "0 28px" : "0 16px 0 64px",
          gap: isDesktop ? 16 : 10,
          background: scrolled
            ? "var(--glass-bg-heavy)"
            : "var(--surface-1)",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: "1px solid var(--border-subtle)",
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
          transition: "all 0.25s ease",
        }}>
          {/* No spacer needed — padding already offsets for hamburger on mobile */}

          {/* Breadcrumb / Page title */}
          <div style={{ minWidth: 0, flexShrink: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: config.color,
                boxShadow: `0 0 8px ${config.color}`,
                flexShrink: 0,
              }} />
              <h1 style={{
                fontSize: 15, fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0, letterSpacing: "-0.01em",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{pageLabel}</h1>
            </div>
          </div>

          {/* ── Gamification Stats (Students only) ── */}
          {isStudent && gamification && (
            <div
              onClick={() => navigate("/student/gamification")}
              onMouseEnter={() => setGamHovered(true)}
              onMouseLeave={() => setGamHovered(false)}
              style={{
                display: "flex", alignItems: "center", gap: isDesktop ? 6 : 4,
                padding: isDesktop ? "5px 10px" : "4px 6px",
                borderRadius: 10,
                background: gamHovered
                  ? "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(52,211,153,0.12))"
                  : "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(52,211,153,0.06))",
                border: gamHovered
                  ? "1px solid rgba(124,58,237,0.3)"
                  : "1px solid rgba(124,58,237,0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: gamHovered ? "translateY(-1px)" : "none",
                boxShadow: gamHovered ? "0 4px 12px rgba(124,58,237,0.15)" : "none",
                flexShrink: 0,
              }}
              title="View Rewards & Progress"
            >
              {/* Avatar in header */}
              {avatarData && (
                <AvatarDisplay
                  config={avatarData}
                  size={28}
                  border="2px solid rgba(124,58,237,0.3)"
                  shadow="0 2px 6px rgba(124,58,237,0.2)"
                  onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                />
              )}
              {/* Level Badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "2px 8px 2px 4px",
                borderRadius: 6,
                background: "rgba(124,58,237,0.12)",
              }}>
                <span style={{ fontSize: 14 }}>{levelIcon}</span>
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: "#7c3aed",
                  letterSpacing: "-0.02em",
                }}>Lv.{gamification.currentLevel}</span>
              </div>

              {/* XP */}
              <div id="header-xp-badge" style={{
                display: "flex", alignItems: "center", gap: 3,
                padding: "2px 7px",
                borderRadius: 6,
                background: "rgba(251,191,36,0.1)",
                transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 11 }}>⭐</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: "#d97706",
                }}>{gamification.totalXp}</span>
              </div>

              {/* Coins */}
              <div id="header-coins-badge" style={{
                display: "flex", alignItems: "center", gap: 3,
                padding: "2px 7px",
                borderRadius: 6,
                background: "rgba(253,160,133,0.1)",
                transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 11 }}>🪙</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: "#ea580c",
                }}>{gamification.coins}</span>
              </div>

              {/* Streak Badge */}
              <div id="header-streak-badge" style={{
                display: "flex", alignItems: "center", gap: 3,
                padding: "2px 7px",
                borderRadius: 6,
                background: "rgba(249, 115, 22, 0.12)",
                border: "1px solid rgba(249, 115, 22, 0.25)",
                transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 11 }}>🔥</span>
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: "#f97316",
                }}>{gamification.currentStreak || 1}d</span>
              </div>

              {/* Mini XP Progress Bar — desktop only */}
              {isDesktop && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 1, minWidth: 52,
                }}>
                  <div style={{
                    width: "100%", height: 4, borderRadius: 4,
                    background: "rgba(124,58,237,0.12)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${xpProgress}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: "linear-gradient(90deg, #7c3aed, #34d399)",
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                  <span style={{
                    fontSize: 8.5, fontWeight: 600,
                    color: "var(--text-tertiary)",
                    textAlign: "center",
                    lineHeight: 1,
                  }}>{gamification.totalXp}/{gamification.nextLevelXpThreshold}</span>
                </div>
              )}
            </div>
          )}

          {/* Flex spacer pushes right-side items */}
          <div style={{ flex: 1 }} />

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: isDesktop ? 12 : 8, flexShrink: 0 }}>

            {/* Notification Bell Dropdown Center */}
            <HeaderNotificationCenter />

            {/* Clock — hide on small screens */}
            {isDesktop && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "flex-end",
                padding: "5px 12px", borderRadius: 8,
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, fontFamily: "var(--font-mono)" }}>{timeStr}</span>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>{dateStr}</span>
              </div>
            )}

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px", borderRadius: 8,
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              {isDesktop && "Back"}
            </button>

            {/* Role badge — hide on mobile */}
            {isDesktop && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px 6px 8px", borderRadius: 8,
                background: `${config.color}12`,
                border: `1px solid ${config.color}25`,
              }}>
                <span style={{ fontSize: 14 }}>{config.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, lineHeight: 1 }}>Signed in as</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: config.color, lineHeight: 1.3 }}>{config.label}</div>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={authLogout}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.18)",
                color: "#fb7185", fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.14)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.08)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.18)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="fade-in"
          style={{
            flex: 1,
            padding: isDesktop ? "32px 28px" : "20px 16px",
            maxWidth: 1320,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          padding: "14px 28px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--surface-1)",
        }}>
          <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 500 }}>
            © 2026 EduvantaX Platform — All rights reserved
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse-glow 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 500 }}>System Operational</span>
          </div>
        </footer>
        <CoinParticleFX />
        {showStreakModal && gamification && (
          <DailyStreakModal
            streak={gamification.currentStreak || 1}
            xpEarned={gamification.dailyXpEarned || 50}
            coinsEarned={gamification.dailyCoinsEarned || 25}
            onClose={() => setShowStreakModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
