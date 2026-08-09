import React, { useEffect, useState } from "react";
import { getUserById } from "../utils/api";
import { getDecodedToken } from "../utils/authHelper";
import { useTranslation } from "react-i18next";
import AvatarService from "../services/AvatarService";
import GamificationService from "../services/GamificationService";
import AvatarDisplay from "./AvatarDisplay";
import AvatarDialog from "./AvatarDialog";
import NicknameDialog from "./NicknameDialog";

const ROLE_META = {
  ADMIN:       { color: "#f472b6", bg: "rgba(244,114,182,0.12)", glow: "rgba(244,114,182,0.3)", icon: "🛡️", label: "System Administrator" },
  SCHOOLADMIN: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  glow: "rgba(96,165,250,0.3)",  icon: "🏫", label: "School Administrator" },
  TEACHER:     { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", glow: "rgba(167,139,250,0.3)", icon: "📚", label: "Teacher" },
  STUDENT:     { color: "#34d399", bg: "rgba(52,211,153,0.12)",  glow: "rgba(52,211,153,0.3)",  icon: "🎓", label: "Student" },
  DRIVER:      { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  glow: "rgba(251,146,60,0.3)",  icon: "🚌", label: "Driver" },
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 0",
    borderBottom: "1px solid var(--border-subtle)",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
    }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarData, setAvatarData] = useState(null);
  const [gamStatus, setGamStatus] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);

  const decoded = getDecodedToken();
  const userId = decoded?.userId;
  const isStudent = (userData?.role || decoded?.role) === "STUDENT";

  const changeLang = (lng) => { i18n.changeLanguage(lng); localStorage.setItem("lang", lng); };

  const fetchAvatar = async () => {
    if (!userId) return;
    try {
      const res = await AvatarService.getCurrent(userId);
      setAvatarData(res.data);
    } catch (err) {
      console.error("Error fetching avatar in Profile:", err);
    }
  };

  const loadProfileData = () => {
    if (!userId) return;
    Promise.all([
      getUserById(userId),
      AvatarService.getCurrent(userId),
      isStudent ? GamificationService.getStatus(userId) : Promise.resolve({ data: null })
    ]).then(([uRes, aRes, gRes]) => {
      setUserData(uRes.data);
      setAvatarData(aRes.data);
      if (gRes?.data) setGamStatus(gRes.data);
    }).catch(console.error)
      .finally(() => setTimeout(() => setLoading(false), 400));
  };

  useEffect(() => {
    loadProfileData();
  }, [userId, isStudent]);

  const getInitials = (name) => (name || "U").split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();

  const role = userData?.role || decoded?.role || "USER";
  const meta = ROLE_META[role] || ROLE_META.STUDENT;

  if (loading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:16 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, animation:"float 2s ease-in-out infinite" }}>👤</div>
        <div className="spinner spinner-lg" />
        <p style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500 }}>Loading your profile…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }} className="fade-in">

      {/* ── Profile Hero ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0c1428 0%, #0f2152 55%, #0c1428 100%)",
        borderRadius: 24, marginBottom: 28,
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
      }}>
        {/* Orb decorations */}
        <div style={{ position:"absolute", top:-50, right:60, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`, filter:"blur(30px)", pointerEvents:"none" }} />

        <div style={{ padding: "36px 40px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <AvatarDisplay
                config={avatarData}
                size={96}
                border={`3px solid ${meta.color}`}
                shadow={`0 8px 32px ${meta.glow}, 0 0 0 4px rgba(255,255,255,0.08)`}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  onClick={() => setDialogOpen(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                >
                  ✏️ Avatar
                </button>

                {isStudent && (
                  <button
                    onClick={() => setNicknameOpen(true)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      border: "none",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    🏅 My Nicknames
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:10.5, fontWeight:700, color:`${meta.color}aa`, letterSpacing:"0.1em", textTransform:"uppercase" }}>{meta.icon} {meta.label}</span>
              </div>
              <h1 style={{ fontSize:28, fontWeight:900, color:"white", margin:0, letterSpacing:"-0.03em", fontFamily:"'Outfit', sans-serif" }}>
                {userData?.name || "User"}
              </h1>

              {/* Equipped Nickname Badge */}
              {userData?.equippedNickname && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 6, padding: "4px 12px", borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(234,88,12,0.25))",
                  border: "1px solid rgba(245,158,11,0.5)", color: "#fef08a",
                  fontSize: 13, fontWeight: 800, boxShadow: "0 2px 10px rgba(245,158,11,0.2)"
                }}>
                  {userData.equippedNickname}
                </div>
              )}

              <p style={{ color:"rgba(148,163,184,0.75)", fontSize:13.5, margin:"6px 0 0" }}>{userData?.email}</p>
              {isStudent && gamStatus && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(124,58,237,0.2)", color: "#a78bfa", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(167,139,250,0.3)" }}>
                    🏆 Level {gamStatus.currentLevel} ({gamStatus.levelName})
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.2)", color: "#fbbf24", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.3)" }}>
                    ⭐ {gamStatus.totalXp} XP
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(234,88,12,0.2)", color: "#fb923c", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(251,146,60,0.3)" }}>
                    🪙 {gamStatus.coins} Coins
                  </span>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div style={{
              display:"flex", alignItems:"center", gap:8, flexShrink:0,
              padding:"10px 18px", borderRadius:14,
              background: userData?.approvalStatus === "APPROVED" ? "rgba(52,211,153,0.12)" : "rgba(245,158,11,0.12)",
              border: `1px solid ${userData?.approvalStatus === "APPROVED" ? "rgba(52,211,153,0.25)" : "rgba(245,158,11,0.25)"}`,
            }}>
              <div style={{
                width:8, height:8, borderRadius:"50%",
                background: userData?.approvalStatus === "APPROVED" ? "#10b981" : "#f59e0b",
                animation:"pulse-glow 2s ease-in-out infinite",
              }} />
              <div>
                <div style={{ fontSize:10, color:"rgba(148,163,184,0.6)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Account Status</div>
                <div style={{ fontSize:13, fontWeight:800, color: userData?.approvalStatus === "APPROVED" ? "#34d399" : "#fbbf24" }}>
                  {userData?.approvalStatus || "Active"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid ── */}
      <div className="grid-2-col-responsive" style={{ marginBottom: 22 }}>

        {/* Personal Info */}
        <div style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"rgba(96,165,250,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>👤</div>
            <h2 style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", margin:0 }}>{t("personal_info")}</h2>
          </div>
          <div style={{ padding:"4px 22px 18px" }}>
            <InfoRow icon="✉️" label={t("email_placeholder")} value={userData?.email} />
            <InfoRow icon="🏷️" label="User ID" value={`#${userData?.userId}`} />
            <InfoRow icon="🎭" label="Role" value={meta.label} />
            {userData?.equippedNickname && <InfoRow icon="🏅" label="Equipped Nickname" value={userData.equippedNickname} />}
          </div>
        </div>

        {/* Academic */}
        <div style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
          <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"rgba(52,211,153,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🏫</div>
            <h2 style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", margin:0 }}>{t("academic_affiliation")}</h2>
          </div>
          <div style={{ padding:"4px 22px 18px" }}>
            <InfoRow icon="🏫" label="School ID" value={userData?.schoolId ? `#${userData.schoolId}` : "Global Admin"} />
            {userData?.classroomId && <InfoRow icon="🏛️" label="Classroom" value={`#${userData.classroomId}`} />}
            <InfoRow icon="📅" label="Member Since" value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString([], { year:"numeric", month:"long" }) : "—"} />
          </div>
        </div>
      </div>

      {/* ── Settings Card ── */}
      <div style={{ background:"var(--surface-1)", borderRadius:20, border:"1px solid var(--border-light)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(167,139,250,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>⚙️</div>
          <h2 style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)", margin:0 }}>{t("account_settings")}</h2>
        </div>
        <div style={{ padding:"22px 24px" }}>

          {/* Language */}
          <div style={{ marginBottom:28 }}>
            <label style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)", display:"block", marginBottom:12, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              🌐 {t("language")}
            </label>
            <div style={{ display:"flex", gap:10 }}>
              {[["en","🇬🇧 English"], ["ta","🇮🇳 Tamil"]].map(([code, label]) => (
                <button key={code} onClick={() => changeLang(code)} style={{
                  flex:1, padding:"10px 16px", borderRadius:10, cursor:"pointer",
                  fontFamily:"var(--font-sans)", fontSize:13.5, fontWeight:700,
                  background: i18n.language === code ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "var(--surface-2)",
                  color: i18n.language === code ? "white" : "var(--text-secondary)",
                  border: i18n.language === code ? "1px solid transparent" : "1px solid var(--border-light)",
                  boxShadow: i18n.language === code ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
                  transition:"all 0.2s ease",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <p style={{ fontSize:13.5, color:"var(--text-secondary)", marginBottom:20, lineHeight:1.6, padding:"12px 16px", background:"var(--surface-2)", borderRadius:10, border:"1px solid var(--border-subtle)" }}>
            ℹ️ Profile editing is managed by your school administrator. Contact them for any updates to your account details.
          </p>

          <div style={{ display:"flex", gap:10 }}>
            <button style={{
              padding:"10px 18px", borderRadius:10, cursor:"pointer",
              background:"var(--surface-2)", border:"1px solid var(--border-light)",
              color:"var(--text-secondary)", fontSize:13.5, fontWeight:600,
              fontFamily:"var(--font-sans)", transition:"all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--surface-3)"; e.currentTarget.style.color="var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="var(--surface-2)"; e.currentTarget.style.color="var(--text-secondary)"; }}
            >🔑 {t("change_password")}</button>
            <button style={{
              padding:"10px 18px", borderRadius:10, cursor:"pointer",
              background:"var(--surface-2)", border:"1px solid var(--border-light)",
              color:"var(--text-secondary)", fontSize:13.5, fontWeight:600,
              fontFamily:"var(--font-sans)", transition:"all 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--surface-3)"; e.currentTarget.style.color="var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="var(--surface-2)"; e.currentTarget.style.color="var(--text-secondary)"; }}
            >📝 {t("request_update")}</button>
          </div>
        </div>
      </div>

      {/* Avatar Dialog */}
      <AvatarDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        currentConfig={avatarData}
        onAvatarSaved={(savedConfig) => {
          fetchAvatar();
          window.dispatchEvent(new Event('avatar-changed'));
        }}
      />

      {/* Nickname Dialog */}
      <NicknameDialog
        open={nicknameOpen}
        onClose={() => setNicknameOpen(false)}
        userId={userId}
        onEquipSuccess={() => {
          loadProfileData();
        }}
      />
    </div>
  );
};

export default ProfilePage;
