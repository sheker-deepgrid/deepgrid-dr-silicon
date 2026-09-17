'use client';
import {useState, useRef, useEffect} from 'react';
import {Box, Eye} from 'lucide-react';
import AppModel3D, {App3DType} from './app-model-3d';

export type AppCardData = {
  type: App3DType;
  title: string;
  sub: string;
  desc: string;
  image: string;
  metric: string;
  alt: string;
  tag: string;
};

export default function AppCard({app}: {app: AppCardData}) {
  const [is3D, setIs3D] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({rx: 0, ry: 0});
  const rafRef = useRef<number | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (is3D) return; // In 3D mode, interaction goes to the Three.js model
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTilt({rx: -py * 8, ry: px * 10});
    });
  };

  const onPointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt({rx: 0, ry: 0});
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="dr-app-card"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
      }}
    >
      <div className="dr-app-media">
        <span className="dr-app-badge">{app.tag}</span>
        <button
          type="button"
          className={`dr-app-view-toggle ${is3D ? 'active' : ''}`}
          onClick={() => setIs3D(!is3D)}
          aria-label={`Toggle 3D model view for ${app.title}`}
        >
          {is3D ? (
            <>
              <Eye size={13} aria-hidden="true" />
              <span>2D Photo</span>
            </>
          ) : (
            <>
              <Box size={13} aria-hidden="true" />
              <span>3D Model</span>
            </>
          )}
        </button>

        {is3D ? (
          <>
            <AppModel3D type={app.type} label={`3D procedural model of ${app.title}`} />
            <span className="dr-app-3d-hint">DRAG TO ORBIT · ARROWS TO PITCH</span>
          </>
        ) : (
          <img
            src={app.image}
            alt={app.alt}
            width={640}
            height={360}
            loading="lazy"
          />
        )}
      </div>

      <div className="dr-app-body">
        <span className="mono">{app.sub}</span>
        <h3>{app.title}</h3>
        <p>{app.desc}</p>
        <div className="dr-app-meta">
          <span>{app.metric}</span>
        </div>
      </div>
    </div>
  );
}
