'use client';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

// High-fidelity procedural 3D model of the DG32 QFN-64 package, silicon die, and bond wires.
// Physical package standards: 9 x 9 mm body, 0.5 mm lead pitch, exposed thermal paddle,
// high-visibility self-illuminated laser markings, pin 1 orientation dimple, catenary gold wire loops,
// and labeled functional silicon blocks.
// Supports both DG32-LITE (2.9 x 4.5 mm die) and DG32-2DOM (3.4 x 4.5 mm die with 114 MHz attention engine).

type Region = {
  group: number;
  w: number;
  d: number;
  x: number;
  z: number;
  tone: string;
  name: string;
  shortLabel: string;
};

const REGIONS_LITE: Region[] = [
  // Group 0: Safety Core
  {group: 0, w: 0.78, d: 1.05, x: -0.92, z: -1.55, tone: '#3b3830', name: 'MAIN RV32IM Core', shortLabel: 'MAIN'},
  {group: 0, w: 0.78, d: 1.05, x: -0.08, z: -1.55, tone: '#3b3830', name: 'CHECKER Core (2-cycle delay)', shortLabel: 'CHECKER'},
  {group: 0, w: 1.62, d: 0.16, x: -0.5, z: -0.92, tone: '#b45309', name: 'Cycle-Accurate Comparator', shortLabel: 'CMP'},
  // Group 1: Memory & Boot
  {group: 1, w: 0.44, d: 0.6, x: 0.72, z: -1.8, tone: '#29353d', name: '64 KB Mask ROM', shortLabel: 'ROM'},
  // Group 2: Motor Drive
  {group: 2, w: 1.25, d: 0.75, x: -0.72, z: 0.18, tone: '#453523', name: '3-Phase SVPWM Generator', shortLabel: 'PWM'},
  {group: 2, w: 0.55, d: 0.75, x: 0.22, z: 0.18, tone: '#3d2e1c', name: 'Hardware Dead-time & Brake', shortLabel: 'BRAKE'},
  // Group 3: Sensing & Math
  {group: 3, w: 0.82, d: 0.65, x: 0.86, z: 1.72, tone: '#1e3833', name: '8-bit Diff SAR ADC', shortLabel: 'ADC'},
  {group: 3, w: 0.65, d: 0.6, x: -0.1, z: 1.0, tone: '#3a2f21', name: 'CORDIC Transform Engine', shortLabel: 'CORDIC'},
  {group: 3, w: 0.65, d: 0.6, x: -0.9, z: 1.0, tone: '#3a2f21', name: 'Encoder / Hall Decoder', shortLabel: 'ENC'},
  // Group 4: Connectivity
  {group: 4, w: 0.46, d: 0.54, x: -1.02, z: 1.78, tone: '#2d382b', name: 'UART x2 & SPI Master', shortLabel: 'COM1'},
  {group: 4, w: 0.46, d: 0.54, x: -0.5, z: 1.78, tone: '#2d382b', name: 'I2C & QSPI Controller', shortLabel: 'COM2'},
  {group: 4, w: 0.46, d: 0.54, x: 0.02, z: 1.78, tone: '#2d382b', name: 'Atomic GPIO Port', shortLabel: 'GPIO'},
  // Group 5: Bus & System
  {group: 5, w: 2.65, d: 0.24, x: 0, z: -0.52, tone: '#523f1e', name: 'Deterministic AXI Crossbar', shortLabel: 'AXI BUS'},
  {group: 5, w: 0.52, d: 0.65, x: 0.98, z: 0.18, tone: '#363026', name: 'DMA & Interrupt Controller', shortLabel: 'DMA'},
  {group: 5, w: 0.65, d: 0.6, x: 0.72, z: 1.0, tone: '#363026', name: 'JTAG & Hardware Scan Chains', shortLabel: 'JTAG'},
];

// DG32-2DOM adds the 114 MHz Attention Engine & CDC Isolation Bridge
const REGIONS_2DOM_EXTRA: Region[] = [
  {group: 6, w: 0.18, d: 3.4, x: 0.98, z: 0, tone: '#b45309', name: 'CDC Asynchronous Bridge (50 <-> 114 MHz)', shortLabel: 'CDC'},
  {group: 6, w: 0.76, d: 1.6, x: 1.48, z: -0.85, tone: '#164e63', name: 'INT8 Matrix Multiplier Array (QK^T)', shortLabel: 'QK^T'},
  {group: 6, w: 0.76, d: 1.2, x: 1.48, z: 0.75, tone: '#155e75', name: 'Softmax Exponent LUT & Requantizer', shortLabel: 'SOFTMAX'},
  {group: 6, w: 0.76, d: 0.45, x: 1.48, z: 1.65, tone: '#0e7490', name: 'Key/Value Burst SRAM Buffers', shortLabel: 'KV-SRAM'},
];

// Generates high-contrast, self-illuminated laser markings for the package lid
function createLaserMarkTextures(variant: 'lite' | '2dom'): {
  diffuse: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const eCanvas = document.createElement('canvas');
  eCanvas.width = 1024;
  eCanvas.height = 1024;
  const eCtx = eCanvas.getContext('2d')!;

  // 1. Dark matte epoxy mold compound base
  ctx.fillStyle = '#141617';
  ctx.fillRect(0, 0, 1024, 1024);

  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, 1024, 1024);

  // Mold compound fine grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let i = 0; i < 15000; i++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 1024;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 2. Pin 1 orientation index dimple (top-left corner)
  const p1X = 145;
  const p1Y = 145;

  ctx.beginPath();
  ctx.arc(p1X, p1Y, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0c0d';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  eCtx.beginPath();
  eCtx.arc(p1X, p1Y, 46, 0, Math.PI * 2);
  eCtx.lineWidth = 6;
  eCtx.strokeStyle = '#0284c7';
  eCtx.stroke();

  // Helper to render crisp, high-visibility dual-pass text
  const writeMarking = (
    text: string,
    y: number,
    font: string,
    diffuseColor: string,
    emissiveColor: string
  ) => {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = diffuseColor;
    ctx.fillText(text, 512, y);

    eCtx.font = font;
    eCtx.textAlign = 'center';
    eCtx.textBaseline = 'middle';
    eCtx.fillStyle = emissiveColor;
    eCtx.fillText(text, 512, y);
  };

  // Line 1: Vendor Logo Mark
  writeMarking(
    'DEEPGRID',
    330,
    'bold 76px monospace, -apple-system, sans-serif',
    '#ffffff',
    '#e2e8f0'
  );

  // Line 2: Silicon Model ID (Ultra-bright high-contrast title)
  const chipName = variant === '2dom' ? 'DG32-2DOM' : 'DG32-LITE';
  const chipColor = variant === '2dom' ? '#38bdf8' : '#f59e0b';
  writeMarking(
    chipName,
    440,
    'bold 92px monospace, -apple-system, sans-serif',
    '#ffffff',
    chipColor
  );

  // Line 3: Tape-in Shuttle & Fab Node
  const shuttle = variant === '2dom' ? 'CI2612 · SKY130A' : 'CI2609 · SKY130A';
  writeMarking(
    shuttle,
    545,
    'bold 56px monospace, -apple-system, sans-serif',
    '#f8fafc',
    '#94a3b8'
  );

  // Line 4: Frequency & Safety Architecture
  const archTag =
    variant === '2dom' ? '114MHz DUAL-DOM · REV B' : '50MHz LOCKSTEP · REV A';
  writeMarking(
    archTag,
    630,
    'bold 44px monospace, -apple-system, sans-serif',
    '#cbd5e1',
    '#64748b'
  );

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.anisotropy = 4;

  const emissive = new THREE.CanvasTexture(eCanvas);
  emissive.anisotropy = 4;

  return {diffuse, emissive};
}

// Generates high-contrast top-face textures with readable micro labels for silicon die blocks
function createBlockLabelTexture(
  label: string,
  bgTone: string,
  isSpecial = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgTone;
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = isSpecial ? '#38bdf8' : '#d97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 122);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
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
    renderer.toneMappingExposure = 1.35;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    // Adjusted camera position for direct, high-contrast visibility
    camera.position.set(6.8, 8.8, 9.8);
    camera.lookAt(0, 0, 0);

    // Studio semiconductor lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1f2937, 2.6));
    const key = new THREE.DirectionalLight(0xfff1d6, 3.6);
    key.position.set(5, 10, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xa5f3fc, 2.4);
    rim.position.set(-6, 5, -5);
    scene.add(rim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials
    const matStandard = (color: string, metalness = 0.6, roughness = 0.4) =>
      new THREE.MeshStandardMaterial({color, metalness, roughness});

    const copperLeadMat = matStandard('#b87333', 0.88, 0.28);
    const tinLeadMat = matStandard('#cbd5e1', 0.82, 0.35);
    const goldWireMat = new THREE.LineBasicMaterial({
      color: '#facc15',
      transparent: true,
      opacity: 0.75
    });

    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material | THREE.Material[],
      parent: THREE.Object3D = rootGroup
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // 1. Leadframe Base & Exposed Ground Paddle (E-PAD)
    const leadframeGroup = new THREE.Group();
    rootGroup.add(leadframeGroup);

    box(3.6, 0.08, 3.6, 0, -0.34, 0, tinLeadMat, leadframeGroup);

    // 64 Dual-Tone QFN Leads (16 per side, 0.5 mm pitch)
    for (let i = 0; i < 16; i++) {
      const v = (i - 7.5) * 0.36;
      box(0.18, 0.08, 0.36, v, -0.34, 3.32, tinLeadMat, leadframeGroup);
      box(0.14, 0.07, 0.24, v, -0.31, 3.08, copperLeadMat, leadframeGroup);
      box(0.18, 0.08, 0.36, v, -0.34, -3.32, tinLeadMat, leadframeGroup);
      box(0.14, 0.07, 0.24, v, -0.31, -3.08, copperLeadMat, leadframeGroup);
      box(0.36, 0.08, 0.18, 3.32, -0.34, v, tinLeadMat, leadframeGroup);
      box(0.24, 0.07, 0.14, 3.08, -0.31, v, copperLeadMat, leadframeGroup);
      box(0.36, 0.08, 0.18, -3.32, -0.34, v, tinLeadMat, leadframeGroup);
      box(0.24, 0.07, 0.14, -3.08, -0.31, v, copperLeadMat, leadframeGroup);
    }

    // Four corner 45-degree tie-bars
    for (const [cx, cz] of [
      [2.9, 2.9],
      [2.9, -2.9],
      [-2.9, 2.9],
      [-2.9, -2.9]
    ]) {
      const tie = box(
        0.32,
        0.08,
        0.32,
        cx,
        -0.34,
        cz,
        copperLeadMat,
        leadframeGroup
      );
      tie.rotation.y = Math.PI / 4;
    }

    // 2. Silicon Die Substrate
    const dieGroup = new THREE.Group();
    rootGroup.add(dieGroup);

    const is2Dom = variant === '2dom';
    const dieWidth = is2Dom ? 3.4 : 2.9;
    const dieXOffset = is2Dom ? 0.25 : 0;

    const dieMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.92,
      roughness: 0.18
    });
    box(dieWidth, 0.12, 4.5, dieXOffset, 0.03, 0, dieMat, dieGroup);

    // Guard ring perimeter
    const ringMat = matStandard('#b45309', 0.85, 0.25);
    box(dieWidth - 0.08, 0.02, 0.06, dieXOffset, 0.09, 2.18, ringMat, dieGroup);
    box(
      dieWidth - 0.08,
      0.02,
      0.06,
      dieXOffset,
      0.09,
      -2.18,
      ringMat,
      dieGroup
    );
    box(
      0.06,
      0.02,
      4.36,
      dieXOffset + dieWidth / 2 - 0.06,
      0.09,
      0,
      ringMat,
      dieGroup
    );
    box(
      0.06,
      0.02,
      4.36,
      dieXOffset - dieWidth / 2 + 0.06,
      0.09,
      0,
      ringMat,
      dieGroup
    );

    // 3. Catenary Arched Gold Bond Wires (Parabolic Bézier Arcs)
    const wirePositions: number[] = [];
    for (let i = 0; i < 16; i++) {
      const v = (i - 7.5) * 0.36;
      const dz = THREE.MathUtils.clamp(v * 1.3, -2.1, 2.1);
      const dx = THREE.MathUtils.clamp(v * 0.8, -1.35, 1.35);

      const addWire = (p0: THREE.Vector3, p1: THREE.Vector3) => {
        const pc = new THREE.Vector3(
          (p0.x + p1.x) * 0.5,
          0.65,
          (p0.z + p1.z) * 0.5
        );
        const curve = new THREE.QuadraticBezierCurve3(p0, pc, p1);
        const pts = curve.getPoints(8);
        for (let j = 0; j < pts.length - 1; j++) {
          wirePositions.push(pts[j].x, pts[j].y, pts[j].z);
          wirePositions.push(pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
        }
      };

      addWire(
        new THREE.Vector3(dieXOffset + 1.4, 0.12, dz),
        new THREE.Vector3(3.05, -0.28, v)
      );
      addWire(
        new THREE.Vector3(dieXOffset - 1.4, 0.12, dz),
        new THREE.Vector3(-3.05, -0.28, v)
      );
      addWire(
        new THREE.Vector3(dieXOffset + dx, 0.12, 2.2),
        new THREE.Vector3(v, -0.28, 3.05)
      );
      addWire(
        new THREE.Vector3(dieXOffset + dx, 0.12, -2.2),
        new THREE.Vector3(v, -0.28, -3.05)
      );
    }

    const wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(wirePositions, 3)
    );
    const wireLines = new THREE.LineSegments(wireGeo, goldWireMat);
    dieGroup.add(wireLines);

    // 4. Functional Block Regions with Readable Top-Face Micro Labels
    const allRegions = is2Dom
      ? [...REGIONS_LITE, ...REGIONS_2DOM_EXTRA]
      : REGIONS_LITE;
    const blockTextures: THREE.CanvasTexture[] = [];

    const regionEntries = allRegions.map(r => {
      const isAttn = r.group === 6;
      const topTex = createBlockLabelTexture(r.shortLabel, r.tone, isAttn);
      blockTextures.push(topTex);

      const sideMat = matStandard(r.tone, 0.6, 0.35);
      const topMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.3,
        metalness: 0.5,
        map: topTex,
        emissive: isAttn ? '#0891b2' : '#d97706',
        emissiveIntensity: 0
      });

      // Box materials: [+x, -x, +y (top), -y, +z, -z]
      const boxMaterials = [
        sideMat,
        sideMat,
        topMat,
        sideMat,
        sideMat,
        sideMat
      ];
      const mesh = box(r.w, 0.08, r.d, r.x, 0.13, r.z, boxMaterials, dieGroup);

      return {mesh, topMat, r};
    });

    // 16 dual-port SRAM macros
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const m = new THREE.MeshStandardMaterial({
          color: '#475569',
          metalness: 0.72,
          roughness: 0.28,
          emissive: '#d97706',
          emissiveIntensity: 0
        });
        const mesh = box(
          0.2,
          0.08,
          0.24,
          0.62 + col * 0.22 - 0.05,
          0.13,
          -1.3 - row * 0.28 + 0.2,
          m,
          dieGroup
        );
        regionEntries.push({
          mesh,
          topMat: m,
          r: {
            group: 1,
            w: 0.2,
            d: 0.24,
            x: 0,
            z: 0,
            tone: '',
            name: 'SRAM Macro',
            shortLabel: 'SRAM'
          }
        });
      }
    }

    // 5. Package Top Molding with High-Visibility Self-Illuminated Laser Markings
    const {diffuse: moldDiffuse, emissive: moldEmissive} =
      createLaserMarkTextures(variant);

    const moldSideMat = matStandard('#161819', 0.1, 0.85);
    const moldTopMat = new THREE.MeshStandardMaterial({
      color: '#ffffff', // Clean white diffuse - preserves 100% texture brightness!
      roughness: 0.75,
      metalness: 0.12,
      map: moldDiffuse,
      emissive: '#ffffff',
      emissiveMap: moldEmissive,
      emissiveIntensity: 0.85 // High-contrast, self-illuminated laser engraving!
    });

    // Box materials array: face 2 is the TOP face
    const moldBoxMats = [
      moldSideMat,
      moldSideMat,
      moldTopMat,
      moldSideMat,
      moldSideMat,
      moldSideMat
    ];
    const moldLid = box(6.6, 0.22, 6.6, 0, 0.24, 0, moldBoxMats, rootGroup);

    // Beveled package chamfers on 4 top edges
    const bevelMat = matStandard('#1c2022', 0.1, 0.9);
    box(6.6, 0.06, 0.12, 0, 0.36, 3.26, bevelMat, moldLid);
    box(6.6, 0.06, 0.12, 0, 0.36, -3.26, bevelMat, moldLid);
    box(0.12, 0.06, 6.6, 3.26, 0.36, 0, bevelMat, moldLid);
    box(0.12, 0.06, 6.6, -3.26, 0.36, 0, bevelMat, moldLid);

    // Interaction & Animation Loop
    let frame = 0;
    let last = 0;
    // Initial angle set for optimal top marking readability
    let angleY = -0.45;
    let angleX = 0.38;
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
      angleX = Math.max(-0.2, Math.min(1.15, angleX + dy * 0.006));
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
        angleX = Math.min(1.15, angleX + 0.08);
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
        angleY += 0.0012;
      }

      rootGroup.rotation.y = angleY;
      rootGroup.rotation.x = angleX;

      const targetLidY = s.exploded ? 1.85 : 0.24;
      const targetDieY = s.exploded ? 0.72 : 0;
      const wireOpacity = s.exploded ? 0.85 : 0.45;

      moldLid.position.y = THREE.MathUtils.lerp(
        moldLid.position.y,
        targetLidY,
        k
      );
      dieGroup.position.y = THREE.MathUtils.lerp(
        dieGroup.position.y,
        targetDieY,
        k
      );
      wireLines.material.opacity = THREE.MathUtils.lerp(
        wireLines.material.opacity,
        wireOpacity,
        k
      );

      regionEntries.forEach(({mesh, topMat, r}) => {
        const isSelected = r.group === s.selected;
        const targetElevation = s.exploded ? 0.28 + r.group * 0.08 : 0.13;
        mesh.position.y = THREE.MathUtils.lerp(
          mesh.position.y,
          targetElevation,
          k
        );
        topMat.emissiveIntensity = THREE.MathUtils.lerp(
          topMat.emissiveIntensity,
          isSelected ? 0.9 : 0,
          k
        );
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

      moldDiffuse.dispose();
      moldEmissive.dispose();
      blockTextures.forEach(t => t.dispose());

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
