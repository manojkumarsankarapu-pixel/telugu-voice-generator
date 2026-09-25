import React, { useEffect, useRef } from 'react';

interface Props {
  isPlaying: boolean;
  audioRef?: HTMLAudioElement | null;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<Props> = ({ isPlaying, accentColor = '#f59e0b' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const numBars = 48;
    const barHeights = new Array(numBars).fill(4);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        let targetHeight = 4;
        if (isPlaying) {
          // Dynamic procedural waveform wave
          const time = Date.now() * 0.007;
          const wave1 = Math.sin(time + i * 0.25);
          const wave2 = Math.cos(time * 1.3 + i * 0.15);
          const bellCurve = Math.sin((i / numBars) * Math.PI); // Highest in center
          targetHeight = Math.max(4, Math.abs(wave1 * wave2) * (height * 0.85) * bellCurve + 6);
        }

        // Smooth damping
        barHeights[i] += (targetHeight - barHeights[i]) * 0.25;

        const x = i * (barWidth + 2);
        const y = (height - barHeights[i]) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeights[i]);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeights[i], 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="w-full flex items-center justify-center py-2 px-1">
      <canvas
        ref={canvasRef}
        width={420}
        height={50}
        className="w-full h-12 rounded-lg bg-black/30 backdrop-blur-sm border border-white/5 shadow-inner"
      />
    </div>
  );
};
