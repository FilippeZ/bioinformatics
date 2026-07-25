import React, { useEffect, useRef } from 'react';

interface DnaHelixAnimationProps {
  height?: string;
  speed?: number;
  className?: string;
}

export const DnaHelixAnimation: React.FC<DnaHelixAnimationProps> = ({
  height = '180px',
  speed = 0.02,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || parseInt(height, 10) || 180;
    };
    resize();
    window.addEventListener('resize', resize);

    const numNodes = 28;
    const baseColors = ['#00FF7F', '#00E0FF', '#F59E0B', '#EC4899'];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      angle += speed;

      const centerY = h / 2;
      const amplitude = Math.min(h * 0.35, 45);
      const startX = 40;
      const endX = w - 40;
      const stepX = (endX - startX) / numNodes;

      for (let i = 0; i < numNodes; i++) {
        const x = startX + i * stepX;
        const phase = angle + i * 0.35;

        const y1 = centerY + Math.sin(phase) * amplitude;
        const y2 = centerY - Math.sin(phase) * amplitude;

        const z1 = Math.cos(phase);
        const z2 = -Math.cos(phase);

        const r1 = 3 + (z1 + 1) * 2.5;
        const r2 = 3 + (z2 + 1) * 2.5;

        const alpha1 = 0.3 + (z1 + 1) * 0.35;
        const alpha2 = 0.3 + (z2 + 1) * 0.35;

        // Base pair connecting line
        const colorIdx = i % baseColors.length;
        const baseColor = baseColors[colorIdx];

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = baseColor;
        ctx.globalAlpha = 0.25 + (Math.sin(phase) + 1) * 0.2;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = baseColor;
        ctx.stroke();

        // Node 1 (Strand A)
        ctx.beginPath();
        ctx.arc(x, y1, r1, 0, Math.PI * 2);
        ctx.fillStyle = '#00FF7F';
        ctx.globalAlpha = alpha1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00FF7F';
        ctx.fill();

        // Node 2 (Strand B)
        ctx.beginPath();
        ctx.arc(x, y2, r2, 0, Math.PI * 2);
        ctx.fillStyle = '#00E0FF';
        ctx.globalAlpha = alpha2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00E0FF';
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [height, speed]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-surface-base/80 border border-border-subtle ${className}`} style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-surface-base via-transparent to-surface-base opacity-40" />
    </div>
  );
};
