'use client';
import {useEffect, useRef, useState, useCallback} from 'react';

interface WaveformProps {
  khz?: number;
}

const CLOCK_HZ = 50_000_000;

export default function ControlWaveform({khz = 100}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalCycles = Math.round(CLOCK_HZ / (khz * 1000));
  const periodUs = (1000 / khz).toFixed(1).replace(/\.0$/, '');

  const [progress, setProgress] = useState(0.28);
  const [isHovered, setIsHovered] = useState(false);

  const cycle = Math.max(1, Math.min(totalCycles, Math.round(progress * totalCycles)));
  const phaseDeg = Math.round((progress * 360) % 360);

  const draw = useCallback((p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) return;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Background grid lines
    ctx.strokeStyle = '#1d2220';
    ctx.lineWidth = 1;
    const gridSteps = 8;
    for (let i = 0; i <= gridSteps; i++) {
      const x = (w / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w, h * 0.45);
    ctx.stroke();

    const scrubX = p * w;
    const localPhase = p * 2 * Math.PI;

    // 3-Phase Sinusoids (Ia, Ib, Ic)
    const phases = [
      {color: '#d4a36e', label: 'Ia (Phase U)', offset: 0},
      {color: '#528574', label: 'Ib (Phase V)', offset: (2 * Math.PI) / 3},
      {color: '#7e8b83', label: 'Ic (Phase W)', offset: (4 * Math.PI) / 3},
    ];

    const amp = h * 0.3;
    const midY = h * 0.42;

    phases.forEach(({color, offset}) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const t = (x / w) * 2 * Math.PI + offset;
        const y = midY + Math.sin(t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // PWM Gate Signal track at bottom
    const pwmY = h * 0.82;
    const pwmH = h * 0.12;
    ctx.fillStyle = '#111514';
    ctx.fillRect(8, pwmY - 3, w - 16, pwmH + 6);
    ctx.strokeStyle = '#27312d';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, pwmY - 3, w - 16, pwmH + 6);

    // PWM Pulses
    ctx.strokeStyle = '#d4a36e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const periods = 12;
    const pw = (w - 16) / periods;
    for (let k = 0; k < periods; k++) {
      const px = 8 + k * pw;
      const duty = 0.3 + 0.4 * Math.sin(localPhase + k * 0.4);
      const onW = pw * Math.max(0.1, Math.min(0.9, duty));
      ctx.moveTo(px, pwmY + pwmH);
      ctx.lineTo(px, pwmY);
      ctx.lineTo(px + onW, pwmY);
      ctx.lineTo(px + onW, pwmY + pwmH);
      ctx.lineTo(px + pw, pwmY + pwmH);
    }
    ctx.stroke();

    // Scrubber Cursor Line
    ctx.strokeStyle = '#f3e8d2';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(scrubX, 0);
    ctx.lineTo(scrubX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glow dot on Phase A (Ia)
    const dotY = midY + Math.sin((scrubX / w) * 2 * Math.PI) * amp;
    ctx.fillStyle = '#d4a36e';
    ctx.shadowColor = 'rgba(212, 163, 110, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(scrubX, dotY, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }, []);

  useEffect(() => {
    draw(progress);
  }, [progress, draw]);

  // Scroll scrub listener when not hovering
  useEffect(() => {
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setProgress(0.5);
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (isHovered || !containerRef.current || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        if (r.bottom > 0 && r.top < viewH) {
          const p = Math.max(0, Math.min(1, (viewH - r.top) / (viewH + r.height)));
          setProgress(p);
        }
      });
    };
    const onResize = () => draw(progress);

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onResize);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isHovered, progress, draw]);

  const handlePointer = (clientX: number) => {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setProgress(p);
  };

  const stageName =
    cycle < totalCycles * 0.1
      ? '01 · ADC PHASE CURRENT SAMPLE'
      : cycle < totalCycles * 0.35
      ? '02 · CORDIC CLARKE & PARK TRANSFORM'
      : cycle < totalCycles * 0.75
      ? '03 · PI CURRENT REGULATOR (CPU)'
      : '04 · HARDWARE SVPWM GATE RELOAD';

  return (
    <div ref={containerRef} className="dr-waveform-card" aria-label={`${khz} kHz Control Loop Waveform Scrubber`}>
      <div className="dr-waveform-header">
        <div>
          <span className="mono dr-waveform-tag">{khz} KHZ ELECTRICAL CYCLE · {periodUs} µS PERIOD</span>
          <h4 className="dr-waveform-title">Hardware Coordinate Rotation & PWM Waveform</h4>
        </div>
        <div className="dr-waveform-readout">
          <span className="mono dr-stage-pill">{stageName}</span>
          <span className="mono dr-cycle-val">CYCLE {String(cycle).padStart(4, '0')} / {totalCycles}</span>
          <span className="mono dr-angle-val">θ = {phaseDeg}°</span>
        </div>
      </div>

      <div className="dr-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="dr-waveform-canvas"
          style={{width: '100%', height: '170px'}}
          onPointerDown={e => {
            setIsHovered(true);
            handlePointer(e.clientX);
          }}
          onPointerMove={e => {
            if (e.buttons > 0 || isHovered) handlePointer(e.clientX);
          }}
          onPointerEnter={e => {
            setIsHovered(true);
            handlePointer(e.clientX);
          }}
          onPointerLeave={() => setIsHovered(false)}
        />
        <div className="dr-waveform-legend">
          <span><i style={{background: '#d4a36e'}} />Ia (Phase U)</span>
          <span><i style={{background: '#528574'}} />Ib (Phase V)</span>
          <span><i style={{background: '#7e8b83'}} />Ic (Phase W)</span>
          <span><i style={{background: '#d4a36e', border: '1px dashed #f3e8d2'}} />SVPWM Gate Train</span>
        </div>
      </div>
      <p className="disclaimer">Scrub by scrolling or dragging across the canvas. At 50 MHz, {totalCycles} clock cycles equal exactly one {periodUs} µs loop tick.</p>
    </div>
  );
}
