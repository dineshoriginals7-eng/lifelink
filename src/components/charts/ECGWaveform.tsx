import React, { useEffect, useRef } from 'react';

interface ECGWaveformProps {
  heartRate: number;
  isCritical?: boolean;
}

export const ECGWaveform: React.FC<ECGWaveformProps> = ({ heartRate = 75, isCritical = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Buffer array for historical y coordinates to draw a sweeping trail
    const points: number[] = new Array(width).fill(height / 2);
    let x = 0;

    // ECG Complex shape generator
    // Generates the relative deflection of P, Q, R, S, T waves
    const getECGDeflection = (t: number) => {
      // t ranges from 0 to 1 (representing a single heartbeat cycle)
      // Normal complex timing
      if (t > 0.1 && t < 0.15) {
        // P wave
        return -Math.sin(((t - 0.1) / 0.05) * Math.PI) * 8; 
      }
      if (t >= 0.18 && t < 0.20) {
        // Q wave
        return ((t - 0.18) / 0.02) * 5;
      }
      if (t >= 0.20 && t < 0.23) {
        // R wave (main spike)
        return -Math.sin(((t - 0.20) / 0.03) * Math.PI) * 45;
      }
      if (t >= 0.23 && t < 0.26) {
        // S wave (deep downward spike)
        return Math.sin(((t - 0.23) / 0.03) * Math.PI) * 15;
      }
      if (t >= 0.32 && t < 0.42) {
        // T wave
        return -Math.sin(((t - 0.32) / 0.10) * Math.PI) * 12;
      }
      return 0; // Baseline
    };

    // Calculate cycle length based on HR (60bpm = 1 cycle/sec = 60 frames/cycle at 60fps)
    // At higher heart rate, cycles are shorter
    const fps = 60;
    const getCycleFrames = () => {
      const bps = heartRate / 60;
      return fps / bps;
    };

    let frameCount = 0;

    const tick = () => {
      const cycleFrames = getCycleFrames();
      const progress = (frameCount % cycleFrames) / cycleFrames;
      
      const deflection = getECGDeflection(progress);
      const baseline = height / 2;
      const y = baseline + deflection;

      // Update points array at the sweep position
      points[x] = y;

      // Draw background grid
      ctx.fillStyle = '#0F172A'; // Midnight background
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)'; // Grid lines
      ctx.lineWidth = 1;
      
      // Draw grid squares
      for (let gridX = 0; gridX < width; gridX += 15) {
        ctx.beginPath();
        ctx.moveTo(gridX, 0);
        ctx.lineTo(gridX, height);
        ctx.stroke();
      }
      for (let gridY = 0; gridY < height; gridY += 15) {
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(width, gridY);
        ctx.stroke();
      }

      // Draw sweeping path
      ctx.strokeStyle = isCritical ? '#EF4444' : '#22C55E'; // Red if critical, Green if stable
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.shadowColor = isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        // Leave a gap at the sweep cursor to look like a sweeping laser
        const isCursorGap = Math.abs(i - x) < 8;
        if (isCursorGap) {
          ctx.stroke();
          ctx.beginPath();
          i += 8; // skip drawing
        } else {
          if (i === 0) {
            ctx.moveTo(i, points[i]);
          } else {
            ctx.lineTo(i, points[i]);
          }
        }
      }
      ctx.stroke();

      // Draw glowing lead dot at sweep index
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = isCritical ? '#EF4444' : '#22C55E';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, points[x], 4, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Increment x sweep index
      x = (x + 2) % width;
      frameCount++;
      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [heartRate, isCritical]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2 shadow-inner">
      <div className="absolute top-3 left-3 z-10 flex items-center justify-between right-3">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          LEAD II • ECG Live Telemetry
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {heartRate} BPM
        </span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={340} 
        height={100} 
        className="w-full h-24 block" 
      />
    </div>
  );
};
