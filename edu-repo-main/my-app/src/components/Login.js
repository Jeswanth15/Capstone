import React, { useState, useEffect, useRef } from "react";
import { loginUser } from "../utils/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import GamificationService from "../services/GamificationService";
import NicknameService from "../services/NicknameService";
import EduHero3D from "./EduHero3D";

/* ── Fallback Background Particles ── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.o})`;
        ctx.fill();
      });
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147,197,253,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [hovered3DObject, setHovered3DObject] = useState(null);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const emailInputRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginUser({ email, password });
      const token = response.data;
      localStorage.setItem("token", token);

      // Gamification: Award Daily Login XP
      try {
        const decoded = jwtDecode(token);
        const userId = decoded?.userId || decoded?.id;
        if (userId) {
          const today = new Date().toISOString().split("T")[0];
          await GamificationService.awardReward(userId, `Daily Login - ${today}`);
          await NicknameService.checkAndUnlock(userId);
        }
      } catch (gamErr) {
        console.log("Gamification award skipped:", gamErr.message);
      }

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  return (
    <div style={S.page}>
      {/* Background Gradients */}
      <div style={S.bgGrad} />
      <div style={S.bgBlob1} />
      <div style={S.bgBlob2} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <ParticleCanvas />
      </div>

      {/* Main Split Grid Container */}
      <div style={S.container}>
        
        {/* LEFT / HERO SECTION */}
        <div style={S.heroSection}>
          <div style={S.badgeWrap}>
            <span style={S.badgeDot} />
            <span style={S.badgeText}>EDU LMS OPERATING SYSTEM</span>
          </div>

          <h1 style={S.heroTitle}>
            Intelligent Learning. <br />
            <span style={S.heroGradientText}>Smarter School Management.</span>
          </h1>

          <p style={S.heroDescription}>
            A next-generation AI-powered learning operating system unifying student gamification, adaptive AI question generation, attendance analytics, and real-time school operations.
          </p>

          <div style={S.ctaRow}>
            <button onClick={handleGetStarted} style={S.primaryCtaBtn}>
              Get Started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={() => setShowExploreModal(true)} style={S.secondaryCtaBtn}>
              Explore Platform
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* 3D Interactive Hero Scene */}
          <div style={S.threeDWrapper}>
            <EduHero3D onObjectHover={(name) => setHovered3DObject(name)} />
            {hovered3DObject && (
              <div style={S.hoverTag} className="animate-fade-in">
                ✨ {hovered3DObject}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / LOGIN CARD SECTION */}
        <div style={S.cardSection}>
          <div style={S.card} className="animate-scale-in">
            <div style={S.cardShine} />

            {/* Logo */}
            <div style={S.logoWrap}>
              <div style={S.logoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div>
                <span style={S.logoText}>Edu LMS</span>
                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.8)", fontWeight: 600 }}>Command Gateway</div>
              </div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={S.heading}>{t("welcome_back")}</h2>
              <p style={S.subheading}>{t("login_to_account")}</p>
            </div>

            {/* Error */}
            {error && (
              <div style={S.errorBox} className="animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Email */}
              <div style={S.inputGroup}>
                <label style={S.label}>Email address</label>
                <div style={{ position: "relative" }}>
                  <div style={S.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email_placeholder")}
                    required
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    style={{ ...S.input, ...(focused === "email" ? S.inputFocus : {}) }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={S.inputGroup}>
                <label style={S.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <div style={S.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("password_placeholder")}
                    required
                    onFocus={() => setFocused("pass")}
                    onBlur={() => setFocused("")}
                    style={{ ...S.input, ...(focused === "pass" ? S.inputFocus : {}), paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} style={S.submitBtn} className={loading ? "btn-loading" : ""}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In to OS
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div style={S.divider}>
              <span style={S.dividerText}>Don't have an account?</span>
            </div>

            <Link to="/register" style={S.registerLink}>
              Create your account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <div style={S.trustRow}>
              {["🔒 End-to-end Encrypted", "🏫 Multi-School OS", "⚡ Real-time Analytics"].map((item) => (
                <span key={item} style={S.trustBadge}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Explore Platform Feature Modal */}
      {showExploreModal && (
        <div style={S.modalOverlay} className="animate-fade-in">
          <div style={S.exploreModalCard} className="animate-scale-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🚀</span>
                <h3 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800 }}>Edu LMS Capabilities</h3>
              </div>
              <button onClick={() => setShowExploreModal(false)} style={S.closeModalBtn}>✕</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { title: "🧠 AI Question Pipeline", desc: "Study Material → FastAPI → ChromaDB → Gemini generated adaptive quizzes.", icon: "✨" },
                { title: "🏆 RPG Gamification", desc: "XP progression, level-up celebrations, streak flame badges, and achievement leaderboards.", icon: "🎮" },
                { title: "📊 Student Analytics", desc: "Predictive performance tracking and weak-subject alerts.", icon: "📈" },
                { title: "🚌 Bus Tracking PWA", desc: "Real-time geolocation tracking for school transport.", icon: "📍" },
              ].map((feat, i) => (
                <div key={i} style={S.featureCard}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{feat.icon}</div>
                  <h4 style={{ margin: "0 0 4px", color: "#93c5fd", fontSize: 15, fontWeight: 700 }}>{feat.title}</h4>
                  <p style={{ margin: 0, color: "rgba(226,232,240,0.8)", fontSize: 12, lineHeight: 1.4 }}>{feat.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={() => { setShowExploreModal(false); handleGetStarted(); }} style={{ ...S.submitBtn, marginTop: 24 }}>
              Start Learning Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    background: "#080f1e",
    position: "relative",
    overflowX: "hidden",
    color: "white",
    fontFamily: "'Inter', sans-serif",
  },
  bgGrad: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 25% 20%, rgba(37,99,235,0.2) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(124,58,237,0.18) 0%, transparent 55%)",
    pointerEvents: "none",
  },
  bgBlob1: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "40px 24px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 48,
    alignItems: "center",
    minHeight: "100vh",
    position: "relative",
    zIndex: 2,
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  badgeWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(99, 130, 255, 0.3)",
    padding: "6px 14px",
    borderRadius: 99,
    width: "fit-content",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 10px #34d399",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 800,
    color: "#93c5fd",
    letterSpacing: "0.08em",
  },
  heroTitle: {
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 900,
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1.15,
    margin: 0,
    letterSpacing: "-0.03em",
  },
  heroGradientText: {
    background: "linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDescription: {
    fontSize: 16,
    color: "rgba(226,232,240,0.85)",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 540,
  },
  ctaRow: {
    display: "flex",
    gap: 14,
    marginTop: 8,
    flexWrap: "wrap",
  },
  primaryCtaBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
    transition: "all 0.2s ease",
  },
  secondaryCtaBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 24px",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
  },
  threeDWrapper: {
    position: "relative",
    width: "100%",
    height: 460,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 10,
  },
  hoverTag: {
    position: "absolute",
    bottom: 16,
    left: 16,
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(99, 197, 253, 0.4)",
    color: "#93c5fd",
    padding: "6px 14px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  },
  cardSection: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    position: "relative",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 28,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "60%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
    transform: "skewX(-15deg)",
    pointerEvents: "none",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "linear-gradient(135deg, #2563eb, #10b981)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
  },
  logoText: {
    fontSize: 20,
    fontWeight: 900,
    color: "white",
    fontFamily: "'Outfit', sans-serif",
  },
  heading: {
    fontSize: 24,
    fontWeight: 800,
    color: "white",
    margin: "0 0 4px",
    fontFamily: "'Outfit', sans-serif",
  },
  subheading: {
    fontSize: 13,
    color: "rgba(148,163,184,0.9)",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(244,63,94,0.15)",
    border: "1px solid rgba(244,63,94,0.35)",
    color: "#fda4af",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.9)" },
  inputIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(148,163,184,0.6)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    fontSize: 14,
    color: "white",
    outline: "none",
    transition: "all 0.2s ease",
  },
  inputFocus: {
    borderColor: "rgba(99,130,255,0.6)",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.18)",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "rgba(148,163,184,0.7)",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  submitBtn: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "13px 20px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(37,99,235,0.45)",
    transition: "all 0.2s ease",
  },
  divider: {
    margin: "24px 0 16px",
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: 16,
  },
  dividerText: {
    fontSize: 13,
    color: "rgba(148,163,184,0.7)",
  },
  registerLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "11px 20px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#bfdbfe",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
  },
  trustRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  trustBadge: {
    fontSize: 11,
    padding: "4px 10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 99,
    color: "rgba(148,163,184,0.7)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(16px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  exploreModalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 32,
    maxWidth: 580,
    width: "100%",
    boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
  },
  closeModalBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: 18,
    cursor: "pointer",
  },
  featureCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
  },
};

export default Login;
