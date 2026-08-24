import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AIQuestionProcessingScreen - Multi-stage Intelligent Processing Screen
 * Renders a 3D Abstract Geometric Neural Core and animates through 5 AI processing states:
 * 1. 📄 Reading Material
 * 2. 🧠 Understanding
 * 3. 🔍 Finding Relevant Content
 * 4. ✨ Generating Questions
 * 5. 🎯 Ready
 */
const PROCESSING_STAGES = [
  {
    stage: 1,
    title: "Reading Learning Material",
    icon: "📄",
    description: "Ingesting module syllabus concepts & FastAPI RAG vectors...",
  },
  {
    stage: 2,
    title: "Understanding Topic Nuances",
    icon: "🧠",
    description: "Connecting cognitive knowledge nodes & analyzing domain difficulty...",
  },
  {
    stage: 3,
    title: "Finding Relevant Concepts",
    icon: "🔍",
    description: "Filtering ChromaDB embeddings for high-frequency weak topics...",
  },
  {
    stage: 4,
    title: "Generating Personalized Questions",
    icon: "✨",
    description: "Synthesizing custom Gemini questions with detailed solution keys...",
  },
  {
    stage: 5,
    title: "Your Challenge is Ready",
    icon: "🎯",
    description: "Synthesized 10 targeted MCQs tailored to your skill trajectory.",
  },
];

// Canvas-based 3D Neural Core Visualization
const NeuralCore3DCanvas = ({ currentStage }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const width = (canvas.width = 320);
    const height = (canvas.height = 320);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create Neural Vertices (3D Ring Nodes)
    const nodeCount = 20;
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 90 + (i % 3) * 12;
      return {
        baseX: Math.cos(angle) * radius,
        baseY: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 60,
        angle,
        radius,
        speed: 0.015 + (i % 4) * 0.005,
      };
    });

    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Inner Glowing AI Nucleus
      const corePulse = Math.sin(time * 2) * 8 + 35;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, corePulse + 25);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.5)");
      gradient.addColorStop(1, "rgba(15, 23, 42, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, corePulse + 25, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 2. Draw Orbital Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.3);

      ctx.beginPath();
      ctx.ellipse(0, 0, 105, 45, time * 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, 45, 105, -time * 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 3. Draw Connecting Neural Synapse Lines
      nodes.forEach((n1, i) => {
        const currentAngle = n1.angle + time * n1.speed;
        const x1 = centerX + Math.cos(currentAngle) * n1.radius;
        const y1 = centerY + Math.sin(currentAngle) * (n1.radius * 0.6);

        nodes.slice(i + 1).forEach((n2) => {
          const currentAngle2 = n2.angle + time * n2.speed;
          const x2 = centerX + Math.cos(currentAngle2) * n2.radius;
          const y2 = centerY + Math.sin(currentAngle2) * (n2.radius * 0.6);

          const dist = Math.hypot(x1 - x2, y1 - y2);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.4 * (1 - dist / 85)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Node Vertices
        ctx.beginPath();
        ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "#60a5fa" : "#34d399";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentStage]);

  return <canvas ref={canvasRef} style={{ width: 320, height: 320, display: "block", margin: "0 auto" }} />;
};

const AIQuestionProcessingScreen = ({ isComplete = false, onReady }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    // Step through stages 1 to 4 automatically over 4 seconds if API is processing
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  // When API returns data, transition to Stage 5 (Ready)
  useEffect(() => {
    if (isComplete) {
      setCurrentStageIdx(4);
      const timer = setTimeout(() => {
        if (onReady) onReady();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onReady]);

  const activeStage = PROCESSING_STAGES[currentStageIdx];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 28,
        padding: "48px 36px",
        textAlign: "center",
        color: "white",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        position: "relative",
        overflow: "hidden",
        maxWidth: 580,
        margin: "0 auto",
      }}
    >
      {/* 3D AI Core Canvas Visualizer */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <NeuralCore3DCanvas currentStage={activeStage.stage} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 48,
            pointerEvents: "none",
            filter: "drop-shadow(0 0 16px rgba(59, 130, 246, 0.8))",
          }}
        >
          {activeStage.icon}
        </div>
      </div>

      {/* Stage Headline & Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.stage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "#60a5fa", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
            Phase {activeStage.stage} of 5 • AI Pipeline
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
            {activeStage.title}
          </h2>

          <p style={{ fontSize: 14, color: "rgba(226, 232, 240, 0.8)", margin: "0 0 28px", lineHeight: 1.5 }}>
            {activeStage.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Stage Tracker Pills */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
        {PROCESSING_STAGES.map((s, idx) => {
          const isActive = idx === currentStageIdx;
          const isDone = idx < currentStageIdx;
          return (
            <div
              key={s.stage}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 99,
                background: isDone
                  ? "#34d399"
                  : isActive
                  ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                  : "rgba(255, 255, 255, 0.12)",
                transition: "all 0.4s ease",
                boxShadow: isActive ? "0 0 10px rgba(99, 102, 241, 0.6)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AIQuestionProcessingScreen;
