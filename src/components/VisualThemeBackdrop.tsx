import React, { useEffect, useRef } from 'react';

export type BackdropTheme = 'monsoon' | 'golden' | 'midnight' | 'starry';

interface Props {
  theme: BackdropTheme;
  isPlaying: boolean;
}

export const VisualThemeBackdrop: React.FC<Props> = ({ theme, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle types
    interface Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      opacity: number;
      vx?: number;
    }

    const count = theme === 'monsoon' ? 120 : theme === 'starry' ? 90 : 45;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: theme === 'monsoon' ? 8 + Math.random() * 12 : 0.3 + Math.random() * 1.2,
      size: theme === 'monsoon' ? 1.5 : Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.2,
      vx: theme === 'monsoon' ? -1.5 : (Math.random() - 0.5) * 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'monsoon') {
        grad.addColorStop(0, '#070b14');
        grad.addColorStop(0.5, '#0d1527');
        grad.addColorStop(1, '#080d18');
      } else if (theme === 'golden') {
        grad.addColorStop(0, '#130d08');
        grad.addColorStop(0.5, '#1e130c');
        grad.addColorStop(1, '#0d0806');
      } else if (theme === 'starry') {
        grad.addColorStop(0, '#04060f');
        grad.addColorStop(0.5, '#0b0f24');
        grad.addColorStop(1, '#03050c');
      } else {
        // midnight
        grad.addColorStop(0, '#0a0d14');
        grad.addColorStop(0.5, '#111722');
        grad.addColorStop(1, '#07090f');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ambient glowing orbs
      const time = Date.now() * 0.0006;
      const orb1X = width * 0.3 + Math.sin(time) * 120;
      const orb1Y = height * 0.35 + Math.cos(time * 0.8) * 80;
      const orbGrad = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 400);

      const boost = isPlaying ? 1.3 : 1.0;

      if (theme === 'monsoon') {
        orbGrad.addColorStop(0, `rgba(56, 189, 248, ${0.12 * boost})`);
        orbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (theme === 'golden') {
        orbGrad.addColorStop(0, `rgba(245, 158, 11, ${0.14 * boost})`);
        orbGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else if (theme === 'starry') {
        orbGrad.addColorStop(0, `rgba(168, 85, 247, ${0.12 * boost})`);
        orbGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      } else {
        orbGrad.addColorStop(0, `rgba(20, 184, 166, ${0.11 * boost})`);
        orbGrad.addColorStop(1, 'rgba(20, 184, 166, 0)');
      }

      ctx.fillStyle = orbGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw particles
      particles.forEach((p) => {
        p.y += p.speed * (isPlaying ? 1.4 : 1.0);
        if (p.vx) p.x += p.vx;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        if (theme === 'monsoon') {
          // Rain drops streak
          ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity * (isPlaying ? 0.8 : 0.45)})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + 14);
          ctx.stroke();
        } else if (theme === 'golden') {
          // Warm floating motes
          ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity * (isPlaying ? 0.7 : 0.4)})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (theme === 'starry') {
          // Twinkling stars
          const twinkle = Math.sin(Date.now() * 0.003 + p.x) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(224, 231, 255, ${p.opacity * twinkle})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Midnight city dust
          ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity * 0.35})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isPlaying]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-1000" />;
};
