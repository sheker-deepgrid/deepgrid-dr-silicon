'use client';
import {useRef, useState, useEffect} from 'react';

export interface MotionImage3DProps {
  src: string;
  alt?: string;
  aspectRatio?: string;
  className?: string;
  badge?: string;
  caption?: string;
  glowColor?: string;
}

export default function MotionImage3D({
  src,
  alt = 'Interactive 3D visual plate',
  aspectRatio = '16/9',
  className = '',
  badge,
  caption,
  glowColor = '#38bdf8'
}: MotionImage3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({rx: 0, ry: 0, gx: 50, gy: 50});
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTilt({
        rx: -py * 14,
        ry: px * 18,
        gx: Math.round((px + 0.5) * 100),
        gy: Math.round((py + 0.5) * 100)
      });
    });
  };

  const onPointerEnter = () => {
    setIsHovered(true);
  };

  const onPointerLeave = () => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt({rx: 0, ry: 0, gx: 50, gy: 50});
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`motion-3d-stage ${className}`}
      style={{aspectRatio}}
      role="img"
      aria-label={alt}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={cardRef}
        className={`motion-3d-plate ${isHovered ? 'is-hovered' : ''}`}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          borderColor: isHovered ? glowColor : 'var(--rule)',
          boxShadow: isHovered
            ? `0 20px 40px -12px rgba(0,0,0,0.7), 0 0 25px -4px ${glowColor}40`
            : '0 8px 24px -8px rgba(0,0,0,0.5)'
        }}
      >
        <img
          src={src}
          alt={alt}
          width={1280}
          height={720}
          loading="lazy"
          className="motion-3d-img"
        />

        {/* Dynamic 3D Specular Glare Layer */}
        <div
          className="motion-3d-glare"
          style={{
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`,
            opacity: isHovered ? 1 : 0.35
          }}
        />

        {/* Floating 3D Holographic Wireframe Edge */}
        <div
          className="motion-3d-wireframe"
          style={{
            borderColor: isHovered ? glowColor : 'rgba(255,255,255,0.15)'
          }}
        />

        {badge && <span className="motion-3d-badge">{badge}</span>}
        {caption && <span className="motion-3d-caption">{caption}</span>}
        <span className="motion-3d-hint">3D MOTION · HOVER TO TILT</span>
      </div>
    </div>
  );
}
