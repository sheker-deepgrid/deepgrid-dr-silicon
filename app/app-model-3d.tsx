'use client';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

export type App3DType = 'truck' | 'defence' | 'robotics' | 'logistics';

export default function AppModel3D({
  type,
  label = 'Interactive 3D model. Drag to rotate.'
}: {
  type: App3DType;
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
        precision: 'mediump'
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x0a0c0d, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(5.5, 4.2, 5.8);
    camera.lookAt(0, 0.2, 0);

    // Studio Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x181e24, 2.4));
    const key = new THREE.DirectionalLight(0xffeedd, 3.2);
    key.position.set(6, 8, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rim.position.set(-6, 4, -4);
    scene.add(rim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Reusable Materials
    const mat = (color: string, metalness = 0.5, roughness = 0.4) =>
      new THREE.MeshStandardMaterial({color, metalness, roughness});

    const darkChassisMat = mat('#14181a', 0.8, 0.35);
    const bodyMat = mat('#1e293b', 0.6, 0.3);
    const accentMat = mat('#f59e0b', 0.7, 0.3);
    const cyanSensorMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.85,
      metalness: 0.2,
      roughness: 0.2
    });
    const rubberMat = mat('#0f1112', 0.1, 0.9);
    const wheelRimMat = mat('#94a3b8', 0.85, 0.25);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });

    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material,
      p: THREE.Object3D = rootGroup
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      p.add(mesh);
      return mesh;
    };

    const cyl = (
      rt: number,
      rb: number,
      h: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material,
      p: THREE.Object3D = rootGroup,
      seg = 16
    ) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
      mesh.position.set(x, y, z);
      p.add(mesh);
      return mesh;
    };

    const wheels: THREE.Mesh[] = [];

    // ==========================================
    // 1. TRUCK: Commercial EV Cab-Over
    // ==========================================
    if (type === 'truck') {
      // Chassis frame rails
      box(1.1, 0.14, 4.4, 0, 0.25, 0, darkChassisMat);
      box(0.12, 0.22, 4.4, -0.45, 0.25, 0, darkChassisMat);
      box(0.12, 0.22, 4.4, 0.45, 0.25, 0, darkChassisMat);

      // Cab body
      const cab = box(1.5, 1.4, 1.6, 0, 1.05, 1.15, bodyMat);
      // Windshield
      box(1.36, 0.58, 0.08, 0, 1.3, 1.96, glassMat);
      // Side windows
      box(0.08, 0.52, 0.9, -0.76, 1.3, 1.1, glassMat);
      box(0.08, 0.52, 0.9, 0.76, 1.3, 1.1, glassMat);
      // Front Grille & Aerodynamics
      box(1.3, 0.45, 0.06, 0, 0.65, 1.96, darkChassisMat);

      // Dual Smart Mirror Digital Cameras (AIS-162/188)
      for (const side of [-1, 1]) {
        // Arm
        box(0.24, 0.04, 0.06, side * 0.88, 1.25, 1.5, darkChassisMat);
        // Camera pod
        const camPod = box(0.08, 0.22, 0.12, side * 1.02, 1.25, 1.5, accentMat);
        // Optical lens
        box(0.04, 0.08, 0.08, side * 1.02, 1.25, 1.44, cyanSensorMat);
      }

      // Roof LiDAR / ADAS sensor bar
      box(0.9, 0.08, 0.16, 0, 1.82, 1.2, darkChassisMat);
      cyl(0.09, 0.09, 0.12, 0, 1.9, 1.2, cyanSensorMat);

      // Battery pack enclosure (Under chassis)
      box(1.3, 0.38, 2.0, 0, 0.3, -0.4, darkChassisMat);
      // DG32 Dual Traction Motor Inverters (Orange HV Callout)
      box(0.4, 0.22, 0.35, -0.3, 0.3, -1.6, accentMat);
      box(0.4, 0.22, 0.35, 0.3, 0.3, -1.6, accentMat);

      // 6 Wheels (Front single pair, Rear dual tandem)
      const wheelPos = [
        [0.82, 0.38, 1.2],
        [-0.82, 0.38, 1.2],
        [0.82, 0.38, -0.9],
        [-0.82, 0.38, -0.9],
        [0.82, 0.38, -1.7],
        [-0.82, 0.38, -1.7]
      ];
      for (const [wx, wy, wz] of wheelPos) {
        const wMesh = cyl(0.36, 0.36, 0.24, wx, wy, wz, rubberMat, rootGroup, 20);
        wMesh.rotation.z = Math.PI / 2;
        wheels.push(wMesh);
        // Rim
        const rimMesh = cyl(0.22, 0.22, 0.26, wx, wy, wz, wheelRimMat, rootGroup, 12);
        rimMesh.rotation.z = Math.PI / 2;
      }
    }

    // ==========================================
    // 2. DEFENCE: Sentinel Tactical UAV
    // ==========================================
    else if (type === 'defence') {
      camera.position.set(4.8, 3.8, 5.2);
      camera.lookAt(0, 0, 0);

      // Central avionics core (Carbon faceted enclosure)
      box(0.8, 0.32, 1.2, 0, 0.2, 0, darkChassisMat);
      // High-assurance Lockstep compute shield
      box(0.5, 0.08, 0.6, 0, 0.38, 0, accentMat);

      // Underslung multi-spectral optical gimbal
      const gimbal = cyl(0.18, 0.18, 0.22, 0, -0.05, 0.2, darkChassisMat, rootGroup, 16);
      cyl(0.1, 0.1, 0.12, 0, -0.1, 0.3, cyanSensorMat, rootGroup, 12);

      // 4 Carbon Booms & Brushless Motors
      const boomAngles = [
        Math.PI / 4,
        (3 * Math.PI) / 4,
        (5 * Math.PI) / 4,
        (7 * Math.PI) / 4
      ];
      for (const ang of boomAngles) {
        const bl = 1.9;
        const bx = Math.cos(ang) * (bl / 2);
        const bz = Math.sin(ang) * (bl / 2);
        const boom = box(0.08, 0.08, bl, bx, 0.2, bz, darkChassisMat);
        boom.rotation.y = -ang + Math.PI / 2;

        // Motor pod at arm tip
        const mx = Math.cos(ang) * bl;
        const mz = Math.sin(ang) * bl;
        cyl(0.14, 0.14, 0.22, mx, 0.28, mz, accentMat);
        // DG32 ESC Motor Controller Base
        box(0.18, 0.08, 0.18, mx, 0.12, mz, mat('#22c55e', 0.8, 0.3));

        // Propeller rotor blades (Spinning)
        const rotor = box(1.1, 0.02, 0.1, mx, 0.41, mz, glassMat);
        wheels.push(rotor);
      }

      // Landing skids
      box(0.06, 0.4, 0.06, -0.45, -0.05, -0.4, darkChassisMat);
      box(0.06, 0.4, 0.06, -0.45, -0.05, 0.4, darkChassisMat);
      box(0.06, 0.06, 1.4, -0.45, -0.25, 0, darkChassisMat);

      box(0.06, 0.4, 0.06, 0.45, -0.05, -0.4, darkChassisMat);
      box(0.06, 0.4, 0.06, 0.45, -0.05, 0.4, darkChassisMat);
      box(0.06, 0.06, 1.4, 0.45, -0.25, 0, darkChassisMat);
    }

    // ==========================================
    // 3. ROBOTICS: Autonomous Warehouse Forklift
    // ==========================================
    else if (type === 'robotics') {
      // Main Chassis & Rear Counterweight
      box(1.4, 0.85, 2.1, 0, 0.65, -0.3, bodyMat);
      box(1.36, 0.75, 0.6, 0, 0.68, -1.2, darkChassisMat);

      // Overhead Safety Guard Cage
      const pillarMat = darkChassisMat;
      box(0.08, 1.5, 0.08, -0.6, 1.45, -0.8, pillarMat);
      box(0.08, 1.5, 0.08, 0.6, 1.45, -0.8, pillarMat);
      box(0.08, 1.5, 0.08, -0.6, 1.45, 0.4, pillarMat);
      box(0.08, 1.5, 0.08, 0.6, 1.45, 0.4, pillarMat);
      // Roof grid
      box(1.3, 0.06, 1.3, 0, 2.2, -0.2, pillarMat);

      // Autonomous LiDAR & 360 Camera Top Mast
      cyl(0.12, 0.12, 0.18, 0, 2.32, -0.2, cyanSensorMat);

      // Vertical Fork Mast
      box(0.12, 2.2, 0.14, -0.48, 1.15, 0.88, darkChassisMat);
      box(0.12, 2.2, 0.14, 0.48, 1.15, 0.88, darkChassisMat);
      box(1.1, 0.14, 0.12, 0, 0.7, 0.88, darkChassisMat);
      box(1.1, 0.14, 0.12, 0, 1.7, 0.88, darkChassisMat);

      // Carriage & Heavy Steel Forks
      box(1.0, 0.38, 0.08, 0, 0.5, 0.98, accentMat);
      // Left & Right forks
      box(0.14, 0.06, 1.3, -0.32, 0.15, 1.55, mat('#64748b', 0.9, 0.2));
      box(0.14, 0.06, 1.3, 0.32, 0.15, 1.55, mat('#64748b', 0.9, 0.2));

      // 4 Solid Polyurethane Industrial Wheels
      const fWheelPos = [
        [0.68, 0.28, 0.75],
        [-0.68, 0.28, 0.75],
        [0.55, 0.24, -1.05],
        [-0.55, 0.24, -1.05]
      ];
      for (const [wx, wy, wz] of fWheelPos) {
        const w = cyl(0.28, 0.28, 0.2, wx, wy, wz, rubberMat, rootGroup, 18);
        w.rotation.z = Math.PI / 2;
        wheels.push(w);
      }
    }

    // ==========================================
    // 4. LOGISTICS: Seaport Container AGV
    // ==========================================
    else if (type === 'logistics') {
      camera.position.set(5.8, 3.8, 5.8);
      // Heavy Flatbed AGV Chassis
      box(1.9, 0.5, 4.6, 0, 0.55, 0, bodyMat);
      // Deck surface with friction ribs
      box(1.82, 0.06, 4.52, 0, 0.82, 0, darkChassisMat);

      // 4 Corner ISO Twistlock Blocks
      for (const cx of [-0.85, 0.85]) {
        for (const cz of [-2.15, 2.15]) {
          box(0.22, 0.18, 0.22, cx, 0.9, cz, accentMat);
        }
      }

      // Safety Corner Navigation Pillars (LiDAR + E-stop)
      for (const cx of [-0.95, 0.95]) {
        for (const cz of [-2.2, 2.2]) {
          cyl(0.08, 0.08, 0.38, cx, 0.88, cz, darkChassisMat);
          cyl(0.06, 0.06, 0.12, cx, 1.1, cz, cyanSensorMat);
        }
      }

      // High-capacity Battery & DG32 Multi-axis Inverter Bay (Center)
      box(1.7, 0.35, 1.6, 0, 0.25, 0, darkChassisMat);

      // 8 Heavy-Duty Steering Wheels (4 Dual Axles)
      const agvWheels = [
        [0.96, 0.32, 1.7],
        [-0.96, 0.32, 1.7],
        [0.96, 0.32, 0.7],
        [-0.96, 0.32, 0.7],
        [0.96, 0.32, -0.7],
        [-0.96, 0.32, -0.7],
        [0.96, 0.32, -1.7],
        [-0.96, 0.32, -1.7]
      ];
      for (const [wx, wy, wz] of agvWheels) {
        const w = cyl(0.32, 0.32, 0.22, wx, wy, wz, rubberMat, rootGroup, 20);
        w.rotation.z = Math.PI / 2;
        wheels.push(w);
      }
    }

    // Interaction handlers
    let frame = 0;
    let last = 0;
    let angleY = -0.6;
    let angleX = 0.25;
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
      angleY += dx * 0.009;
      angleX = Math.max(-0.2, Math.min(0.9, angleX + dy * 0.007));
      px = e.clientX;
      py = e.clientY;
    };

    const onPointerUp = () => {
      drag = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        angleY -= 0.15;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        angleY += 0.15;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        angleX = Math.max(-0.2, angleX - 0.1);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        angleX = Math.min(0.9, angleX + 0.1);
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
      if (!active.value || document.hidden || t - last < 30) return;
      last = t;

      if (!drag) {
        angleY += 0.005;
      }

      rootGroup.rotation.y = angleY;
      rootGroup.rotation.x = angleX;

      // Animate spinning rotors if drone
      if (type === 'defence') {
        wheels.forEach(r => {
          r.rotation.y += 0.25;
        });
      }

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

      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [type]);

  return (
    <div
      className="app-3d-canvas"
      ref={host}
      role="region"
      tabIndex={0}
      aria-label={`${label} Use Left and Right arrow keys to rotate, Up and Down to pitch.`}
    />
  );
}
