import React, { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';

const burstColors = ['#D4AF37', '#F0D55A', '#EC4899', '#A855F7', '#38BDF8', '#34D399', '#FB7185', '#F0ABFC', '#FFFFFF'];
const fountainColors = ['#FFD700', '#FFC107', '#FFE082', '#FFFFFF', '#FFB300', '#FFECB3'];

const ROCKET_CYCLE = 4; // seconds — shared by each rocket and its peak explosion so they stay in sync

const FireworksAnimation = () => {
  const [bursts, setBursts] = useState([]);

  // Random aerial explosions, regenerated periodically
  useEffect(() => {
    const generateBursts = () => {
      const newBursts = [];
      const burstCount = 5;

      for (let b = 0; b < burstCount; b++) {
        const cx = 15 + Math.random() * 70;
        const cy = 10 + Math.random() * 55;
        const particleCount = 10 + Math.floor(Math.random() * 8);
        const baseDelay = b * 0.9 + Math.random() * 0.5;

        for (let p = 0; p < particleCount; p++) {
          const angle = (360 / particleCount) * p + Math.random() * 10;
          const distance = 30 + Math.random() * 60;
          const size = 3 + Math.random() * 4;
          const color = burstColors[Math.floor(Math.random() * burstColors.length)];

          newBursts.push({
            id: `${b}-${p}-${Date.now()}`,
            cx, cy, color, size,
            delay: baseDelay,
            duration: 1.0 + Math.random() * 0.5,
            dx: Math.cos(angle * Math.PI / 180) * distance,
            dy: Math.sin(angle * Math.PI / 180) * distance,
          });
        }
      }
      return newBursts;
    };

    setBursts(generateBursts());
    const interval = setInterval(() => setBursts(generateBursts()), 4500);
    return () => clearInterval(interval);
  }, []);

  // Decorative particles — computed once so they don't reset on each burst update
  const sparkles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    size: 2 + Math.random() * 3,
  })), []);

  // Flower pot fountains — sparks spraying up from ground points
  const fountainBases = [16, 50, 84];
  const fountainParticles = useMemo(() => {
    const out = [];
    fountainBases.forEach((x, fi) => {
      for (let p = 0; p < 20; p++) {
        const angle = -90 + (Math.random() * 70 - 35);   // mostly upward, fanning out
        const dist = 70 + Math.random() * 120;
        const size = 2 + Math.random() * 3;
        out.push({
          id: `f-${fi}-${p}`,
          x,
          color: fountainColors[Math.floor(Math.random() * fountainColors.length)],
          size,
          dx: Math.cos(angle * Math.PI / 180) * dist,
          dy: Math.sin(angle * Math.PI / 180) * dist,   // negative = up
          delay: fi * 0.5 + Math.random() * 2.6,
          duration: 1.5 + Math.random() * 0.9,
        });
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rockets — launch from the ground and explode at their peak
  const rockets = useMemo(() => {
    const defs = [
      { x: 28, peak: 300, delay: 0.4, color: '#EC4899' },
      { x: 62, peak: 400, delay: 1.8, color: '#38BDF8' },
      { x: 45, peak: 350, delay: 3.1, color: '#F0D55A' },
      { x: 78, peak: 320, delay: 2.4, color: '#A855F7' },
    ];
    return defs.map((r, ri) => ({
      ...r,
      id: `r-${ri}`,
      particles: Array.from({ length: 12 }, (_, p) => {
        const angle = (360 / 12) * p + Math.random() * 12;
        const dist = 40 + Math.random() * 40;
        return {
          id: `rb-${ri}-${p}`,
          dx: Math.cos(angle * Math.PI / 180) * dist,
          dy: Math.sin(angle * Math.PI / 180) * dist,
          size: 3 + Math.random() * 3,
        };
      }),
    }));
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Twinkling sparkles */}
      {sparkles.map((s) => (
        <Box
          key={`sparkle-${s.id}`}
          sx={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            backgroundColor: '#D4AF37',
            boxShadow: '0 0 8px rgba(212,175,55,0.6)',
            opacity: 0,
            animation: `twinkle 2.5s ease-in-out ${s.delay}s infinite`,
            '@keyframes twinkle': {
              '0%, 100%': { opacity: 0, transform: 'scale(0)' },
              '50%': { opacity: 0.7, transform: 'scale(1)' },
            },
          }}
        />
      ))}

      {/* Aerial firework bursts */}
      {bursts.map((p) => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            left: `${p.cx}%`,
            top: `${p.cy}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}80, 0 0 ${p.size * 6}px ${p.color}40`,
            opacity: 0,
            animation: `burstMove ${p.duration}s ease-out ${p.delay}s forwards`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '@keyframes burstMove': {
              '0%': { opacity: 0.9, transform: 'translate(0, 0) scale(1.5)' },
              '40%': { opacity: 0.7 },
              '100%': { opacity: 0, transform: 'translate(var(--dx), var(--dy)) scale(0)' },
            },
          }}
        />
      ))}

      {/* Flower pot fountains — glowing base */}
      {fountainBases.map((x, i) => (
        <Box
          key={`fbase-${i}`}
          sx={{
            position: 'absolute',
            left: `${x}%`,
            bottom: '3%',
            ml: '-7px',
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#FFD700',
            boxShadow: '0 0 14px 4px rgba(255,193,7,0.8)',
            opacity: 0,
            animation: `fountainBase 2s ease-in-out ${i * 0.5}s infinite`,
            '@keyframes fountainBase': {
              '0%, 100%': { opacity: 0.25, transform: 'scale(0.8)' },
              '50%': { opacity: 0.9, transform: 'scale(1.25)' },
            },
          }}
        />
      ))}

      {/* Flower pot fountains — spraying sparks */}
      {fountainParticles.map((f) => (
        <Box
          key={f.id}
          sx={{
            position: 'absolute',
            left: `${f.x}%`,
            bottom: '4%',
            width: f.size,
            height: f.size,
            borderRadius: '50%',
            backgroundColor: f.color,
            boxShadow: `0 0 ${f.size * 3}px ${f.color}`,
            opacity: 0,
            '--dx': `${f.dx}px`,
            '--peakY': `${f.dy}px`,
            animation: `fountainSpray ${f.duration}s ease-out ${f.delay}s infinite`,
            '@keyframes fountainSpray': {
              '0%': { opacity: 0, transform: 'translate(0, 0) scale(1)' },
              '12%': { opacity: 1 },
              '55%': { opacity: 1, transform: 'translate(calc(var(--dx) * 0.6), var(--peakY)) scale(1)' },
              '100%': { opacity: 0, transform: 'translate(var(--dx), calc(var(--peakY) + 70px)) scale(0.3)' },
            },
          }}
        />
      ))}

      {/* Rockets + peak explosions */}
      {rockets.map((r) => (
        <React.Fragment key={r.id}>
          {/* rising rocket with tail */}
          <Box
            sx={{
              position: 'absolute',
              left: `${r.x}%`,
              bottom: '3%',
              width: 3,
              height: 20,
              borderRadius: '3px',
              background: `linear-gradient(to top, transparent, ${r.color})`,
              boxShadow: `0 0 8px ${r.color}`,
              opacity: 0,
              '--peak': `-${r.peak}px`,
              animation: `rocketRise ${ROCKET_CYCLE}s ease-out ${r.delay}s infinite`,
              '@keyframes rocketRise': {
                '0%': { opacity: 0, transform: 'translateY(0) scaleY(1)' },
                '4%': { opacity: 1 },
                '34%': { opacity: 1, transform: 'translateY(var(--peak)) scaleY(1)' },
                '40%': { opacity: 0, transform: 'translateY(var(--peak)) scaleY(0.2)' },
                '100%': { opacity: 0, transform: 'translateY(var(--peak)) scaleY(0.2)' },
              },
            }}
          />
          {/* explosion at the rocket's peak */}
          {r.particles.map((pt) => (
            <Box
              key={pt.id}
              sx={{
                position: 'absolute',
                left: `${r.x}%`,
                bottom: `calc(3% + ${r.peak}px)`,
                width: pt.size,
                height: pt.size,
                borderRadius: '50%',
                backgroundColor: r.color,
                boxShadow: `0 0 ${pt.size * 3}px ${r.color}, 0 0 ${pt.size * 6}px ${r.color}80`,
                opacity: 0,
                '--dx': `${pt.dx}px`,
                '--dy': `${pt.dy}px`,
                animation: `rocketBurst ${ROCKET_CYCLE}s ease-out ${r.delay}s infinite`,
                '@keyframes rocketBurst': {
                  '0%, 36%': { opacity: 0, transform: 'translate(0, 0) scale(0.4)' },
                  '42%': { opacity: 1, transform: 'translate(0, 0) scale(1.3)' },
                  '60%': { opacity: 0.7 },
                  '80%': { opacity: 0, transform: 'translate(var(--dx), var(--dy)) scale(0.2)' },
                  '100%': { opacity: 0 },
                },
              }}
            />
          ))}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default FireworksAnimation;
