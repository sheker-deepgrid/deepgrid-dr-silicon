'use client';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

// High-fidelity procedural 3D model of the DG32 QFN-64 package, silicon die, and bond wires.
// Conforms to physical package standards: 9 x 9 mm body, 0.5 mm lead pitch, exposed thermal paddle,
// authentic laser-etched markings, pin 1 orientation dimple, catenary gold wire loops, and SkyWater 130 nm die.
// Supports both DG32-LITE (2.9 x 4.5 mm die) and DG32-2DOM (3.4 x 4.5 mm die with 114 MHz attention engine).

type Region = {group: number; w: number; d: number; x: number; z: number; tone: string; name: string};

const REGIONS_LITE: Region[] = [
  // Group 0: Safety Core (MAIN + CHECKER + Lockstep Comparator)
  {group: 0, w: 0.78, d: 1.05, x: -0.92, z: -1.55, tone: '#6d6656', name: 'MAIN RV32IM Core'},
  {group: 0, w: 0.78, d: 1.05, x: -0.08, z: -1.55, tone: '#6d6656', name: 'CHECKER Core (2-cycle delay)'},
  {group: 0, w: 1.62, d: 0.16, x: -0.5, z: -0.92, tone: '#c4823f', name: 'Cycle-Accurate Comparator'},
  // Group 1: Memory & Boot (16 dual-port SRAM macros + 64 KB Boot ROM)
  {group: 1, w: 0.44, d: 0.6, x: 0.72, z: -1.8, tone: '#556066', name: '64 KB Mask ROM'},
  // Group 2: Motor Drive (3-Phase Complementary PWM, Brake & DShot)
  {group: 2, w: 1.25, d: 0.75, x: -0.72, z: 0.18, tone: '#7a6245', name: '3-Phase SVPWM Generator'},
  {group: 2, w: 0.55, d: 0.75, x: 0.22, z: 0.18, tone: '#6f573c', name: 'Hardware Dead-time & Brake'},
  // Group 3: Sensing & Math (SAR ADC + CORDIC)
  {group: 3, w: 0.82, d: 0.65, x: 0.86, z: 1.72, tone: '#44635d', name: '8-bit Diff SAR ADC'},
  {group: 3, w: 0.65, d: 0.6, x: -0.1, z: 1.0, tone: '#6b5c47', name: 'CORDIC Transform Engine'},
  {group: 3, w: 0.65, d: 0.6, x: -0.9, z: 1.0, tone: '#6b5c47', name: 'Encoder / Hall Decoder'},
  // Group 4: Connectivity (Dual UART, SPI, I2C, QSPI, GPIO)
  {group: 4, w: 0.46, d: 0.54, x: -1.02, z: 1.78, tone: '#586156', name: 'UART x2 & SPI Master'},
  {group: 4, w: 0.46, d: 0.54, x: -0.5, z: 1.78, tone: '#586156', name: 'I2C & QSPI Controller'},
  {group: 4, w: 0.46, d: 0.54, x: 0.02, z: 1.78, tone: '#586156', name: 'Atomic GPIO Port'},
  // Group 5: Bus & System (Crossbar, DMA, JTAG, Interrupts)
  {group: 5, w: 2.65, d: 0.24, x: 0, z: -0.52, tone: '#8a6e3c', name: 'Deterministic AXI Crossbar'},
  {group: 5, w: 0.52, d: 0.65, x: 0.98, z: 0.18, tone: '#635c4e', name: 'DMA & Interrupt Controller'},
  {group: 5, w: 0.65, d: 0.6, x: 0.72, z: 1.0, tone: '#635c4e', name: 'JTAG & Hardware Scan Chains'},
];

// DG32-2DOM adds the 114 MHz Attention Engine & CDC Isolation Bridge in the expanded die wing
const REGIONS_2DOM_EXTRA: Region[] = [
  {group: 6, w: 0.18, d: 3.4, x: 0.98, z: 0, tone: '#d4883b', name: 'CDC Dual-Clock Asynchronous Bridge (50 <-> 114 MHz)'},
  {group: 6, w: 0.76, d: 1.6, x: 1.48, z: -0.85, tone: '#446e7d', name: 'INT8 Matrix Multiplier Array (QK^T)'},
  {group: 6, w: 0.76, d: 1.2, x: 1.48, z: 0.75, tone: '#3a5f6e', name: 'Softmax Exponent LUT & Requantizer'},
  {group: 6, w: 0.76, d: 0.45, x: 1.48, z: 1.65, tone: '#4e7a8a', name: 'Key/Value Burst SRAM Buffers'},
];

function createLaserMarkTexture(variant: 'lite' | '2dom'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Matte epoxy mold compound background
  ctx.fillStyle = '#151718';
  ctx.fillRect(0, 0, 1024, 1024);

  // Mold compound subtle grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 18000; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 1024;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // Pin 1 orientation index dimple (top-left corner)
  const grad = ctx.createRadialGradient(140, 140, 5, 140, 140, 48);
  grad.addColorStop(0, '#0c0d0e');
  grad.addColorStop(0.7, '#111314');
  grad.addColorStop(1, '#24282b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(140, 140, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2b3035';
  ctx.stroke();

  // Laser-ablated engraving typography
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Vendor branding
  ctx.fillStyle = '#838e96';
  ctx.font = 'bold 54px monospace, -apple-system, sans-serif';
  ctx.fillText('DEEPGRID', 512, 340);

  // Primary chip SKU
  ctx.fillStyle = '#9cb0bd';
  ctx.font = '600 70px monospace, -apple-system, sans-serif';
  ctx.fillText(variant === '2dom' ? 'DG32-2DOM' : 'DG32-LITE', 512, 440);

  // Package & fab process
  ctx.fillStyle = '#727e85';
  ctx.font = '42px monospace, -apple-system, sans-serif';
  ctx.fillText(variant === '2dom' ? 'CI2612 · SKY130A' : 'CI2609 · SKY130A', 512, 530);

  // Lot tracking & silicon tier
  ctx.fillStyle = '#59646b';
  ctx.font = '36px monospace, -apple-system, sans-serif';
  ctx.fillText(variant === '2dom' ? '2641 · DUAL-DOM · REV B' : '2638 · LOCKSTEP · REV A', 512, 605);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function createDieWaferTexture(variant: 'lite' | '2dom'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Polished silicon substrate
  ctx.fillStyle = '#161c22';
  ctx.fillRect(0, 0, 1024, 1024);

  // Seal ring / guard ring perimeter
  ctx.strokeStyle = '#b89255';
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, 952, 952);
  ctx.strokeStyle = '#4a5966';
  ctx.lineWidth = 6;
  ctx.strokeRect(56, 56, 912, 912);

  // Sub-micron metallization routing grid (Metal 1 - Metal 5 simulation)
  ctx.strokeStyle = 'rgba(140, 175, 205, 0.12)';
  ctx.lineWidth = 1.5;
  for (let y = 70; y < 950; y += 22) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(964, y);
    ctx.stroke();
  }
  for (let x = 70; x < 950; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, 964);
    ctx.stroke();
  }

  // Peripheral gold wirebond pads along all 4 edges (16 pads per edge)
  ctx.fillStyle = '#d4af37';
  for (let i = 0; i < 16; i++) {
    const pos = 88 + i * 53;
    // Top and Bottom pad rows
    ctx.fillRect(pos, 40, 32, 24);
    ctx.fillRect(pos, 960, 32, 24);
    // Left and Right pad columns
    ctx.fillRect(40, pos, 24, 32);
    ctx.fillRect(960, pos, 24, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export default function Silicon({
  selected = -1,
  exploded = false,
  reduced = false,
  variant = 'lite',
  label = 'Interactive 3D model of the DG32 package and die. Drag to rotate.'
}: {
  selected?: number;
  exploded?: boolean;
  reduced?: boolean;
  variant?: 'lite' | '2dom';
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({selected, exploded, reduced, variant});
  state.current = {selected, exploded, reduced, variant};

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
        precision: 'mediump',
        preserveDrawingBuffer: false
      });
    } catch {
      el.classList.add('silicon-fallback');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x101212, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(7.5, 9.5, 10.5);
    camera.lookAt(0, 0, 0);

    // Studio semiconductor lighting
    scene.add(new THREE.HemisphereLight(0xe4ecf0, 0x221a14, 2.2));
    const key = new THREE.DirectionalLight(0xffdfa8, 3.8);
    key.position.set(4, 9, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xaad0f0, 2.0);
    rim.position.set(-6, 4, -4);
    scene.add(rim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const matStandard = (color: string, metalness = 0.6, roughness = 0.4) =>
      new THREE.MeshStandardMaterial({color, metalness, roughness});

    const copperLeadMat = matStandard('#b87333', 0.88, 0.28);
    const tinLeadMat = matStandard('#9eaab2', 0.82, 0.35);
    const goldWireMat = new THREE.LineBasicMaterial({color: '#e6ba4a', transparent: true, opacity: 0.65});

    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material,
      parent: THREE.Object3D = rootGroup
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // 1. Package Leadframe Base & Exposed Ground Paddle (E-PAD)
    const leadframeGroup = new THREE.Group();
    rootGroup.add(leadframeGroup);

    // Thermal exposed pad underneath (E-PAD: 4.6 x 4.6 mm drawn at 3.6 units)
    box(3.6, 0.08, 3.6, 0, -0.34, 0, tinLeadMat, leadframeGroup);

    // 64 Dual-Tone QFN Leads (16 per side, 0.5 mm pitch)
    for (let i = 0; i < 16; i++) {
      const v = (i - 7.5) * 0.36;
      // North & South edges
      box(0.18, 0.08, 0.36, v, -0.34, 3.32, tinLeadMat, leadframeGroup);
      box(0.14, 0.07, 0.24, v, -0.31, 3.08, copperLeadMat, leadframeGroup);
      box(0.18, 0.08, 0.36, v, -0.34, -3.32, tinLeadMat, leadframeGroup);
      box(0.14, 0.07, 0.24, v, -0.31, -3.08, copperLeadMat, leadframeGroup);
      // East & West edges
      box(0.36, 0.08, 0.18, 3.32, -0.34, v, tinLeadMat, leadframeGroup);
      box(0.24, 0.07, 0.14, 3.08, -0.31, v, copperLeadMat, leadframeGroup);
      box(0.36, 0.08, 0.18, -3.32, -0.34, v, tinLeadMat, leadframeGroup);
      box(0.24, 0.07, 0.14, -3.08, -0.31, v, copperLeadMat, leadframeGroup);
    }

    // Four 45-degree corner tie-bars
    for (const [cx, cz] of [[2.9, 2.9], [2.9, -2.9], [-2.9, 2.9], [-2.9, -2.9]]) {
      const tie = box(0.32, 0.08, 0.32, cx, -0.34, cz, copperLeadMat, leadframeGroup);
      tie.rotation.y = Math.PI / 4;
    }

    // 2. Silicon Die Assembly
    const dieGroup = new THREE.Group();
    rootGroup.add(dieGroup);

    const dieTexture = createDieWaferTexture(variant);
    const dieMat = new THREE.MeshStandardMaterial({
      color: '#1a2026',
      metalness: 0.9,
      roughness: 0.2,
      map: dieTexture
    });

    const is2Dom = variant === '2dom';
    const dieWidth = is2Dom ? 3.4 : 2.9;
    const dieXOffset = is2Dom ? 0.25 : 0;
    const dieMesh = box(dieWidth, 0.12, 4.5, dieXOffset, 0.03, 0, dieMat, dieGroup);

    // 3. Catenary Arched Gold Bond Wires (Parabolic Bézier Arcs)
    const wirePositions: number[] = [];
    for (let i = 0; i < 16; i++) {
      const v = (i - 7.5) * 0.36;
      const dz = THREE.MathUtils.clamp(v * 1.3, -2.1, 2.1);
      const dx = THREE.MathUtils.clamp(v * 0.8, -1.35, 1.35);

      const addWire = (p0: THREE.Vector3, p1: THREE.Vector3) => {
        const pc = new THREE.Vector3(
          (p0.x + p1.x) * 0.5,
          0.65, // Wire loop apex over cavity
          (p0.z + p1.z) * 0.5
        );
        const curve = new THREE.QuadraticBezierCurve3(p0, pc, p1);
        const pts = curve.getPoints(8);
        for (let j = 0; j < pts.length - 1; j++) {
          wirePositions.push(pts[j].x, pts[j].y, pts[j].z);
          wirePositions.push(pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
        }
      };

      // Connect peripheral die bond pads to leadfingers
      addWire(new THREE.Vector3(dieXOffset + 1.4, 0.12, dz), new THREE.Vector3(3.05, -0.28, v));
      addWire(new THREE.Vector3(dieXOffset - 1.4, 0.12, dz), new THREE.Vector3(-3.05, -0.28, v));
      addWire(new THREE.Vector3(dieXOffset + dx, 0.12, 2.2), new THREE.Vector3(v, -0.28, 3.05));
      addWire(new THREE.Vector3(dieXOffset + dx, 0.12, -2.2), new THREE.Vector3(v, -0.28, -3.05));
    }

    const wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(wirePositions, 3));
    const wireLines = new THREE.LineSegments(wireGeo, goldWireMat);
    dieGroup.add(wireLines);

    // 4. Functional Block Regions
    const allRegions = is2Dom ? [...REGIONS_LITE, ...REGIONS_2DOM_EXTRA] : REGIONS_LITE;
    const regionEntries = allRegions.map(r => {
      const m = new THREE.MeshStandardMaterial({
        color: r.tone,
        metalness: 0.62,
        roughness: 0.35,
        emissive: r.group === 6 ? '#22d3ee' : '#d97706',
        emissiveIntensity: 0
      });
      const mesh = box(r.w, 0.08, r.d, r.x, 0.13, r.z, m, dieGroup);

      // Micro-tiling inside CPU and SRAM
      if (r.group === 0 && r.w < 1) {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
            box(0.12, 0.02, 0.12, (col - 1.5) * 0.17, 0.05, (row - 2) * 0.19, (row + col) % 3 ? matStandard('#94a3b8') : copperLeadMat, mesh);
          }
        }
      }
      return {mesh, m, r};
    });

    // 16 dual-port SRAM macros
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const m = new THREE.MeshStandardMaterial({
          color: '#64748b',
          metalness: 0.72,
          roughness: 0.28,
          emissive: '#d97706',
          emissiveIntensity: 0
        });
        regionEntries.push({
          mesh: box(0.2, 0.08, 0.24, 0.62 + col * 0.22 - 0.05, 0.13, -1.3 - row * 0.28 + 0.2, m, dieGroup),
          m,
          r: {group: 1, w: 0.2, d: 0.24, x: 0, z: 0, tone: '', name: 'SRAM Macro'}
        });
      }
    }

    // 5. Package Top Molding (Epoxy Encapsulant Lid with Laser Markings)
    const moldTexture = createLaserMarkTexture(variant);
    const moldMat = new THREE.MeshStandardMaterial({
      color: '#151718',
      metalness: 0.15,
      roughness: 0.85,
      map: moldTexture
    });

    const moldLid = box(6.6, 0.22, 6.6, 0, 0.24, 0, moldMat, rootGroup);

    // Beveled package chamfers on 4 top edges
    const bevelMat = matStandard('#181b1c', 0.1, 0.9);
    box(6.6, 0.06, 0.12, 0, 0.36, 3.26, bevelMat, moldLid);
    box(6.6, 0.06, 0.12, 0, 0.36, -3.26, bevelMat, moldLid);
    box(0.12, 0.06, 6.6, 3.26, 0.36, 0, bevelMat, moldLid);
    box(0.12, 0.06, 6.6, -3.26, 0.36, 0, bevelMat, moldLid);

    // Interaction & Animation Loop
    let frame = 0;
    let last = 0;
    let angleY = -0.5;
    let angleX = 0.3;
    let drag = false;
    let px = 0;
    let py = 0;

    const onPointerDown = (e: PointerEvent) => {
      drag = true;
      px = e.clientX;
      py = e.clientY;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      angleY += dx * 0.008;
      angleX = Math.max(-0.2, Math.min(1.1, angleX + dy * 0.006));
      px = e.clientX;
      py = e.clientY;
    };

    const onPointerUp = () => {
      drag = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        angleY -= 0.12;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        angleY += 0.12;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        angleX = Math.max(-0.2, angleX - 0.08);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        angleX = Math.min(1.1, angleX + 0.08);
        e.preventDefault();
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('keydown', onKeyDown);

    let lw = 0;
    let lh = 0;
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h || (w === lw && h === lh)) return;
      lw = w;
      lh = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    const active = {value: true};
    const visibility = new IntersectionObserver(([entry]) => {
      active.value = entry.isIntersecting;
    });
    visibility.observe(el);

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (!active.value || document.hidden || t - last < 32) return;
      last = t;

      const s = state.current;
      const k = s.reduced ? 1 : 0.14;

      if (!s.reduced && !drag) {
        angleY += 0.0014;
      }

      rootGroup.rotation.y = angleY;
      rootGroup.rotation.x = angleX;

      // In exploded view:
      // - Mold lid lifts up +1.8 units to reveal package interior
      // - Die and bond wires lift up +0.7 units above leadframe paddle
      const targetLidY = s.exploded ? 1.85 : 0.24;
      const targetDieY = s.exploded ? 0.72 : 0;
      const wireOpacity = s.exploded ? 0.85 : 0.45;

      moldLid.position.y = THREE.MathUtils.lerp(moldLid.position.y, targetLidY, k);
      dieGroup.position.y = THREE.MathUtils.lerp(dieGroup.position.y, targetDieY, k);
      wireLines.material.opacity = THREE.MathUtils.lerp(wireLines.material.opacity, wireOpacity, k);

      // Block elevation and glowing emission
      regionEntries.forEach(({mesh, m, r}) => {
        const isSelected = r.group === s.selected;
        const targetElevation = s.exploded ? 0.28 + r.group * 0.08 : 0.13;
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, targetElevation, k);
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, isSelected ? 0.85 : 0, k);
      });

      renderer.render(scene, camera);
    };
    tick(0);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('keydown', onKeyDown);

      moldTexture.dispose();
      dieTexture.dispose();

      scene.traverse(o => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return (
    <div
      className="silicon-canvas"
      ref={host}
      role="region"
      tabIndex={0}
      aria-label={`${label} Use Left and Right arrow keys to rotate, Up and Down to pitch the 3D model.`}
    />
  );
}
