import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

// Web Audio API Arcade Sound Effect Generator
const playArcadeSound = (type = 'coin') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'coin') {
      // Classic 2-tone arcade coin chime (Hill Climb Racing style)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Star / XP chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Ignore audio context errors if browser blocks autoplay
  }
};

export const triggerRewardAnimation = (detail = {}) => {
  window.dispatchEvent(new CustomEvent('arcade-collect-reward', { detail }));
};

const CoinParticleFX = () => {
  const [particles, setParticles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);

  useEffect(() => {
    const handleEvent = (e) => {
      const {
        coins = 20,
        xp = 50,
        sourceX = window.innerWidth / 2,
        sourceY = window.innerHeight / 2,
      } = e.detail || {};

      // Play initial arcade sound
      playArcadeSound('coin');

      // Target position (header coins badge or top-right area)
      const targetEl = document.getElementById('header-coins-badge') || document.getElementById('header-xp-badge');
      let targetX = window.innerWidth - 120;
      let targetY = 30;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      // Generate particles (Coins + Stars)
      const newParticles = [];
      const totalCoins = Math.min(Math.max(Math.floor(coins / 5), 8), 25);
      const totalStars = Math.min(Math.max(Math.floor(xp / 10), 6), 15);

      // Coins 🪙
      for (let i = 0; i < totalCoins; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * 220;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 60; // Upward initial blast

        newParticles.push({
          id: `coin-${Date.now()}-${i}-${Math.random()}`,
          symbol: '🪙',
          x: sourceX,
          y: sourceY,
          vx,
          vy,
          targetX,
          targetY,
          scale: 0.8 + Math.random() * 0.6,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 720,
          delay: i * 35, // Staggered magnet launch
          type: 'coin',
        });
      }

      // Stars ⭐
      for (let i = 0; i < totalStars; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 200;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 80;

        newParticles.push({
          id: `star-${Date.now()}-${i}-${Math.random()}`,
          symbol: '⭐',
          x: sourceX,
          y: sourceY,
          vx,
          vy,
          targetX: targetX - 50,
          targetY,
          scale: 0.8 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 540,
          delay: i * 40 + 100,
          type: 'star',
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);

      // Spawn floating pop-up text (+50 XP  +20 Coins)
      const textId = `txt-${Date.now()}`;
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: textId,
          x: sourceX,
          y: sourceY - 40,
          coins,
          xp,
        },
      ]);

      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== textId));
      }, 2000);
    };

    window.addEventListener('arcade-collect-reward', handleEvent);
    return () => window.removeEventListener('arcade-collect-reward', handleEvent);
  }, []);

  // Animation Loop for magnetic particle physics
  const requestRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    if (particles.length === 0) return;

    let lastTime = performance.now();

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      setParticles((prevParticles) => {
        const updated = [];
        for (const p of prevParticles) {
          if (!p.startTime) p.startTime = time;
          const elapsed = time - p.startTime;

          if (elapsed < p.delay) {
            updated.push(p);
            continue;
          }

          let { x, y, vx, vy, targetX, targetY, delay, rotation, rotSpeed, type } = p;

          // Magnet phase: pull towards header target
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 30) {
            // Hit header target! Trigger header impact bounce & sound
            playArcadeSound(type);
            const targetEl = document.getElementById(type === 'coin' ? 'header-coins-badge' : 'header-xp-badge');
            if (targetEl) {
              targetEl.classList.add('arcade-impact-bounce');
              setTimeout(() => targetEl.classList.remove('arcade-impact-bounce'), 250);
            }
            continue; // Remove particle
          }

          // Acceleration physics: initial blast -> magnetic home-in
          const pullStrength = 1800 + (100000 / (dist + 50));
          const ax = (dx / dist) * pullStrength;
          const ay = (dy / dist) * pullStrength;

          vx += ax * dt;
          vy += ay * dt;

          // Drag
          vx *= 0.92;
          vy *= 0.92;

          x += vx * dt;
          y += vy * dt;
          rotation += rotSpeed * dt;

          updated.push({ ...p, x, y, vx, vy, rotation });
        }
        return updated;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [particles.length]);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* CSS Animations & Impact Keyframes */}
      <style>{`
        .arcade-impact-bounce {
          animation: impactBounce 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        @keyframes impactBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.45) rotate(4deg); filter: brightness(1.4); }
          100% { transform: scale(1); }
        }
        @keyframes arcadeFloatUp {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -25px) scale(1.2); }
          80% { opacity: 1; transform: translate(-50%, -60px) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -90px) scale(0.8); }
        }
      `}</style>

      {/* Floating Score Text (+100 XP +30 Coins!) */}
      {floatingTexts.map((txt) => (
        <Box
          key={txt.id}
          sx={{
            position: 'absolute',
            left: txt.x,
            top: txt.y,
            transform: 'translate(-50%, 0)',
            animation: 'arcadeFloatUp 1.8s ease-out forwards',
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            px: 2,
            py: 0.8,
            borderRadius: 4,
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4), 0 0 20px rgba(255, 255, 255, 0.6)',
          }}
        >
          {txt.xp > 0 && (
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 18,
                color: '#a78bfa',
                textShadow: '0 0 10px rgba(167, 139, 250, 0.8)',
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              +{txt.xp} XP ⭐
            </Typography>
          )}
          {txt.coins > 0 && (
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 18,
                color: '#fbbf24',
                textShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              +{txt.coins} 🪙
            </Typography>
          )}
        </Box>
      ))}

      {/* Flying Burst Particles */}
      {particles.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
            fontSize: p.type === 'coin' ? 28 : 24,
            filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.9))',
            userSelect: 'none',
            willChange: 'transform, left, top',
          }}
        >
          {p.symbol}
        </Box>
      ))}
    </Box>
  );
};

export default CoinParticleFX;
