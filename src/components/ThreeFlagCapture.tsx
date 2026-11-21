import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

interface ThreeFlagCaptureProps {
  flag: string;
  onAnimationComplete?: () => void;
  onSkip?: () => void;
}

export const ThreeFlagCapture: React.FC<ThreeFlagCaptureProps> = ({
  flag,
  onAnimationComplete,
  onSkip
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneStage, setSceneStage] = useState<number>(1);
  const [stageText, setStageText] = useState<string>('AUTHENTICATION VERIFIED');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [webGLError, setWebGLError] = useState<boolean>(false);

  // Animation controller ref so replay/skip works cleanly
  const animStateRef = useRef<{
    startTime: number;
    skipped: boolean;
    reqId: number | null;
  }>({
    startTime: 0,
    skipped: false,
    reqId: null
  });

  const runAnimation = () => {
    if (!mountRef.current) return;

    // Reset state
    animStateRef.current.startTime = performance.now();
    animStateRef.current.skipped = false;
    setIsCompleted(false);
    setSceneStage(1);
    setStageText('AUTHENTICATION VERIFIED');

    const container = mountRef.current;
    // Clear any previous canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL init failed, fallback active:', e);
      setWebGLError(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    // --- Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f2fe, 3.5);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00c853, 2.5);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const flashLight = new THREE.PointLight(0xffffff, 0, 15);
    flashLight.position.set(1.2, 0.2, 2.8);
    scene.add(flashLight);

    // --- Scene 1: Floating Digital Particles & Cyber Grid Floor ---
    const gridHelper = new THREE.GridHelper(20, 40, 0x00c853, 0x0a2228);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    // Constellation Particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00f2fe);
    const c2 = new THREE.Color(0x00c853);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 16;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const mixed = Math.random() > 0.5 ? c1 : c2;
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Holographic Portal Rings
    const portalRingGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 64);
    const portalRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.4
    });
    const portalRing = new THREE.Mesh(portalRingGeo, portalRingMat);
    portalRing.position.set(-1.5, 0.5, -1);
    scene.add(portalRing);

    // --- Scene 2: 3D Metallic Capture Token / Flag Artifact ---
    const tokenGroup = new THREE.Group();

    // Octagonal / Faceted Shield Medallion
    const tokenBodyGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.14, 8);
    const tokenBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0x021d30,
      emissiveIntensity: 0.4
    });
    const tokenBody = new THREE.Mesh(tokenBodyGeo, tokenBodyMat);
    tokenBody.rotation.x = Math.PI / 2;
    tokenGroup.add(tokenBody);

    // Inner glowing ring
    const innerRingGeo = new THREE.TorusGeometry(0.55, 0.035, 16, 32);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.0,
      metalness: 0.8,
      roughness: 0.1
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    tokenGroup.add(innerRing);

    // Glowing Cyber Crest Emblem in center
    const crestGeo = new THREE.ConeGeometry(0.3, 0.45, 4);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0x00c853,
      emissive: 0x00c853,
      emissiveIntensity: 2.2,
      metalness: 0.7,
      roughness: 0.2
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.rotation.z = Math.PI;
    tokenGroup.add(crest);

    // Surrounding energy halo
    const haloGeo = new THREE.RingGeometry(0.85, 0.92, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    tokenGroup.add(halo);

    // Initial position of token
    tokenGroup.position.set(-1.5, 0.5, -1);
    tokenGroup.scale.set(0.01, 0.01, 0.01); // starts materialized from fragments
    scene.add(tokenGroup);

    // --- Scene 3: Procedural 3D Articulated Cybernetic Hand ---
    const cyberHand = new THREE.Group();

    // 1. Arm / Gauntlet Forearm Plate
    const forearmGeo = new THREE.BoxGeometry(1.0, 1.2, 0.5);
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0b132b,
      metalness: 0.88,
      roughness: 0.28
    });
    const circuitMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 1.5,
      roughness: 0.3
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x00c853,
      emissive: 0x00c853,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.2
    });

    const forearm = new THREE.Mesh(forearmGeo, armorMat);
    forearm.position.set(0, -0.9, 0);
    cyberHand.add(forearm);

    // Glowing forearm strip
    const stripGeo = new THREE.BoxGeometry(0.1, 1.0, 0.52);
    const strip = new THREE.Mesh(stripGeo, circuitMat);
    strip.position.set(0, -0.9, 0);
    cyberHand.add(strip);

    // 2. Wrist Joint
    const wristGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 16);
    const wrist = new THREE.Mesh(wristGeo, jointMat);
    wrist.position.set(0, -0.22, 0);
    cyberHand.add(wrist);

    // 3. Palm Plate
    const palmGeo = new THREE.BoxGeometry(0.9, 0.8, 0.3);
    const palm = new THREE.Mesh(palmGeo, armorMat);
    palm.position.set(0, 0.3, 0);
    cyberHand.add(palm);

    // Palm power core
    const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 16);
    const core = new THREE.Mesh(coreGeo, circuitMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.3, 0);
    cyberHand.add(core);

    // 4. Fingers Array (Thumb + 4 articulated fingers)
    interface FingerAssembly {
      root: THREE.Group;
      proximal: THREE.Mesh;
      middleGroup: THREE.Group;
      middle: THREE.Mesh;
    }
    const fingerAssemblies: FingerAssembly[] = [];

    const fingerConfigs = [
      { x: -0.32, y: 0.72, z: 0, length: 0.38, isThumb: false },
      { x: -0.11, y: 0.75, z: 0, length: 0.44, isThumb: false },
      { x: 0.11, y: 0.73, z: 0, length: 0.42, isThumb: false },
      { x: 0.31, y: 0.68, z: 0, length: 0.34, isThumb: false },
      { x: -0.45, y: 0.15, z: 0.1, length: 0.32, isThumb: true } // thumb
    ];

    fingerConfigs.forEach((cfg) => {
      const rootGroup = new THREE.Group();
      rootGroup.position.set(cfg.x, cfg.y, cfg.z);

      // Knuckle joint
      const knuckleGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const knuckle = new THREE.Mesh(knuckleGeo, jointMat);
      rootGroup.add(knuckle);

      // Proximal phalanx
      const proxGeo = new THREE.BoxGeometry(0.14, cfg.length, 0.16);
      const prox = new THREE.Mesh(proxGeo, armorMat);
      prox.position.set(0, cfg.length / 2, 0);
      rootGroup.add(prox);

      // Distal/Middle Joint & phalanx
      const middleGroup = new THREE.Group();
      middleGroup.position.set(0, cfg.length, 0);

      const midKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), jointMat);
      middleGroup.add(midKnuckle);

      const midGeo = new THREE.BoxGeometry(0.12, cfg.length * 0.85, 0.14);
      const mid = new THREE.Mesh(midGeo, armorMat);
      mid.position.set(0, (cfg.length * 0.85) / 2, 0);
      middleGroup.add(mid);

      rootGroup.add(middleGroup);
      cyberHand.add(rootGroup);

      fingerAssemblies.push({
        root: rootGroup,
        proximal: prox,
        middleGroup,
        middle: mid
      });
    });

    // Initial hand position (emerges from bottom right)
    cyberHand.position.set(2.4, -2.8, 3.2);
    cyberHand.rotation.set(-0.35, -0.5, 0.2);
    scene.add(cyberHand);

    // Circular Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.3, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.position.set(1.2, 0.35, 2.7);
    scene.add(shockwave);

    // --- Animation Loop ---
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      animStateRef.current.reqId = frameId;

      const elapsed = (performance.now() - animStateRef.current.startTime) / 1000;

      // Handle Skip
      if (animStateRef.current.skipped) {
        // Place everything at completion pose
        tokenGroup.scale.set(1.1, 1.1, 1.1);
        tokenGroup.position.set(1.15, 0.35, 2.7);
        tokenGroup.rotation.set(0.15, 0.3, 0.2);

        cyberHand.position.set(1.2, -0.4, 2.6);
        cyberHand.rotation.set(0.2, -0.2, 0.05);

        // Clench fingers around token
        fingerAssemblies.forEach((fa, idx) => {
          if (idx === 4) {
            // thumb
            fa.root.rotation.set(0.6, 0.4, 0.4);
            fa.middleGroup.rotation.set(0.8, 0.2, 0);
          } else {
            fa.root.rotation.set(1.1, 0, 0);
            fa.middleGroup.rotation.set(1.2, 0, 0);
          }
        });

        flashLight.intensity = 0.5;
        shockwave.scale.set(12, 12, 1);
        shockwaveMat.opacity = 0;
        portalRingMat.opacity = 0.1;

        setSceneStage(6);
        setStageText('FINAL ROUND CLEARED');
        setIsCompleted(true);
        renderer.render(scene, camera);
        return;
      }

      // Rotate background particles
      particles.rotation.y = elapsed * 0.05;
      portalRing.rotation.z = elapsed * 0.4;

      // === STAGE 1: SYSTEM VERIFICATION (0s - 1.2s) ===
      if (elapsed < 1.2) {
        setSceneStage(1);
        setStageText('AUTHENTICATION VERIFIED');
        portalRingMat.opacity = Math.min(0.9, elapsed * 0.8);
        camera.position.x = Math.sin(elapsed) * 0.3;
      }
      // === STAGE 2: FLAG MATERIALIZATION (1.2s - 2.8s) ===
      else if (elapsed < 2.8) {
        setSceneStage(2);
        setStageText('MATERIALIZING AUTHORITATIVE FLAG ARTIFACT');
        const progress = (elapsed - 1.2) / 1.6;
        const scale = Math.min(1.0, progress * 1.05);
        tokenGroup.scale.set(scale, scale, scale);
        tokenGroup.rotation.y = elapsed * 3.5;
        tokenGroup.rotation.x = Math.sin(elapsed * 2) * 0.2;
      }
      // === STAGE 3 & 4: CYBER HAND EMERGENCE & FLAG FLIGHT (2.8s - 5.0s) ===
      else if (elapsed < 5.0) {
        setSceneStage(3);
        setStageText('CYBERNETIC EXTRACTION COUPLING');

        const flightProg = (elapsed - 2.8) / 2.2; // 0 to 1

        // Hand emerges smoothly into position
        cyberHand.position.x = 2.4 - flightProg * 1.2;
        cyberHand.position.y = -2.8 + flightProg * 2.4;
        cyberHand.position.z = 3.2 - flightProg * 0.6;
        cyberHand.rotation.x = -0.35 + flightProg * 0.55;

        // Open hand pose awaiting flag
        fingerAssemblies.forEach((fa, idx) => {
          if (idx === 4) {
            fa.root.rotation.set(-0.2, 0.3, 0);
          } else {
            fa.root.rotation.set(-0.25, 0, 0);
          }
        });

        // Token smooth Bezier-like trajectory toward palm:
        // Start: (-1.5, 0.5, -1) -> End: (1.15, 0.35, 2.7)
        const t = flightProg;
        const startX = -1.5, startY = 0.5, startZ = -1.0;
        const midX = 0.2, midY = 1.4, midZ = 1.2;
        const endX = 1.15, endY = 0.35, endZ = 2.7;

        // Quadratic curve
        tokenGroup.position.x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
        tokenGroup.position.y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
        tokenGroup.position.z = (1 - t) * (1 - t) * startZ + 2 * (1 - t) * t * midZ + t * t * endZ;

        tokenGroup.rotation.y = elapsed * 4.0;
        tokenGroup.rotation.z = Math.sin(elapsed * 3) * 0.4;
      }
      // === STAGE 5: PHYSICAL CAPTURE & SHOCKWAVE (5.0s - 6.8s) ===
      else if (elapsed < 6.8) {
        setSceneStage(5);
        setStageText('FLAG SECURED IN CYBER GAUNTLET');

        const captureProg = (elapsed - 5.0) / 1.8;

        // Grip token in palm
        tokenGroup.position.set(1.15, 0.35, 2.7);
        tokenGroup.rotation.y = 0.3;
        tokenGroup.rotation.x = 0.15;

        // Fingers close / curl firmly around token
        const gripAmount = Math.min(1.0, captureProg * 2.5);
        fingerAssemblies.forEach((fa, idx) => {
          if (idx === 4) {
            fa.root.rotation.set(0.6 * gripAmount, 0.4 * gripAmount, 0.4 * gripAmount);
            fa.middleGroup.rotation.set(0.8 * gripAmount, 0.2 * gripAmount, 0);
          } else {
            fa.root.rotation.set(1.1 * gripAmount, 0, 0);
            fa.middleGroup.rotation.set(1.2 * gripAmount, 0, 0);
          }
        });

        // Flash of light at impact point
        if (captureProg < 0.3) {
          flashLight.intensity = (1.0 - captureProg / 0.3) * 8.0;
        } else {
          flashLight.intensity = 0.8;
        }

        // Expanding circular shockwave
        const shockRadius = captureProg * 8.0;
        shockwave.scale.set(shockRadius, shockRadius, 1);
        shockwaveMat.opacity = Math.max(0, 0.9 - captureProg * 1.1);

        // Illuminate glove circuits
        circuitMat.emissiveIntensity = 2.0 + Math.sin(elapsed * 8) * 0.8;
      }
      // === STAGE 6: VICTORY REVEAL (6.8s+) ===
      else {
        setSceneStage(6);
        setStageText('FINAL ROUND CLEARED');
        setIsCompleted(true);

        // Keep steady held posture with subtle idle breathing
        tokenGroup.position.set(1.15, 0.35 + Math.sin(elapsed * 1.5) * 0.02, 2.7);
        cyberHand.position.y = -0.4 + Math.sin(elapsed * 1.5) * 0.02;

        if (onAnimationComplete && !isCompleted) {
          onAnimationComplete();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      particleGeo.dispose();
      particleMat.dispose();
      tokenBodyGeo.dispose();
      tokenBodyMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      crestGeo.dispose();
      crestMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      forearmGeo.dispose();
      armorMat.dispose();
      circuitMat.dispose();
      jointMat.dispose();
      wristGeo.dispose();
      palmGeo.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
    };
  };

  useEffect(() => {
    const cleanup = runAnimation();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleSkip = () => {
    animStateRef.current.skipped = true;
    if (onSkip) onSkip();
  };

  const handleReplay = () => {
    runAnimation();
  };

  return (
    <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden glass-panel border border-cyan-400/50 shadow-2xl bg-slate-950 aspect-[16/9] min-h-[360px] select-none flex flex-col justify-between">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Fallback container if WebGL unavailable */}
      {webGLError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
          <h4 className="font-bold text-white font-mono text-sm">3D ACCELERATION FALLBACK ACTIVE</h4>
          <p className="text-xs text-slate-400 font-mono">Flag Capture Confirmed by Server: {flag}</p>
        </div>
      )}

      {/* HUD Header Bar Overlay */}
      <div className="relative z-20 p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
            {stageText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <button
              onClick={handleSkip}
              className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" /> Skip Animation
            </button>
          )}

          {isCompleted && (
            <button
              onClick={handleReplay}
              className="px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Replay 3D Sequence
            </button>
          )}
        </div>
      </div>

      {/* Stage 6: Cinematic Victory Banner Overlay */}
      {sceneStage >= 5 && (
        <div className="relative z-20 m-auto text-center pointer-events-none space-y-2 p-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 text-[11px] font-mono tracking-widest uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CYBER EXTRACTION COMPLETE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight drop-shadow-[0_0_25px_rgba(0,242,254,0.6)]">
            FLAG CAPTURED
          </h2>

          <div className="text-xs font-mono text-slate-300 tracking-widest uppercase">
            MISSION ACCOMPLISHED · OPERATION SHADOW HUNT
          </div>

          {/* Actual Personalized Assigned Flag */}
          <div className="inline-block mt-2 px-5 py-2 rounded-xl bg-slate-950/90 border border-cyan-400 text-base sm:text-lg font-mono font-black text-cyan-300 tracking-wider shadow-2xl select-all">
            {flag}
          </div>
        </div>
      )}

      {/* Bottom Stage Progress Indicator */}
      <div className="relative z-20 p-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div>STAGE 0{sceneStage} / 06</div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((stg) => (
            <div
              key={stg}
              className={`w-6 h-1 rounded-full transition-colors ${
                sceneStage >= stg ? 'bg-cyan-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
