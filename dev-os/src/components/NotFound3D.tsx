import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Zap, Home, Compass, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  onGoHome?: () => void;
  standalone?: boolean;
}

export const NotFound3D = ({ onGoHome, standalone = false }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [colorMode, setColorMode] = useState<'cyan' | 'magenta' | 'gold' | 'emerald'>('cyan');
  const [blastCount, setBlastCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const triggerBlastRef = useRef<(() => void) | null>(null);

  const colors = {
    cyan: { primary: 0x00f0ff, secondary: 0x7000ff, bg: '#080711' },
    magenta: { primary: 0xff007f, secondary: 0x7000ff, bg: '#120517' },
    gold: { primary: 0xffd700, secondary: 0xff4500, bg: '#120a00' },
    emerald: { primary: 0x10b981, secondary: 0x06b6d4, bg: '#021512' },
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const target = containerRef.current?.parentElement || document.documentElement;
      target.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 45);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // 3. Central Singularity Sphere
    const themeColor = colors[colorMode].primary;
    const coreGeo = new THREE.IcosahedronGeometry(6, 4);
    const coreMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Inner Core Glow Sphere
    const innerGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 4. Create 3D "404" Floating Voxel Cubes
    const voxelGroup = new THREE.Group();
    scene.add(voxelGroup);

    const createVoxel = (x: number, y: number, z: number) => {
      const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const mat = new THREE.MeshBasicMaterial({
        color: themeColor,
        wireframe: Math.random() > 0.4,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      voxelGroup.add(mesh);
    };

    // Build digit "4"
    const digit4 = [
      [-16, 6], [-16, 4], [-16, 2], [-16, 0], [-16, -2], [-16, -4],
      [-18, 2], [-20, 4], [-22, 2], [-22, 0], [-20, 0], [-18, 0], [-14, 0], [-12, 0]
    ];
    // Build digit "0"
    const digit0 = [
      [-4, 6], [-2, 6], [0, 6], [2, 6],
      [-4, -6], [-2, -6], [0, -6], [2, -6],
      [-4, 4], [-4, 2], [-4, 0], [-4, -2], [-4, -4],
      [2, 4], [2, 2], [2, 0], [2, -2], [2, -4],
    ];
    // Build digit "4" second
    const digit4_2 = [
      [16, 6], [16, 4], [16, 2], [16, 0], [16, -2], [16, -4],
      [14, 2], [12, 4], [10, 2], [10, 0], [12, 0], [14, 0], [18, 0], [20, 0]
    ];

    [...digit4, ...digit0, ...digit4_2].forEach(([x, y]) => {
      createVoxel(x, y, (Math.random() - 0.5) * 4);
    });

    // 5. 2,500 Swirling Particle Vortex
    const particleCount = 2500;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const initialPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 12 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = radius * Math.sin(phi);
      const z = radius * Math.sin(theta) * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPos[i * 3] = x;
      initialPos[i * 3 + 1] = y;
      initialPos[i * 3 + 2] = z;

      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: themeColor,
      size: 0.85,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Interactive Click Explosion Shockwave
    const triggerBlast = () => {
      setBlastCount((prev) => prev + 1);
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        velocities[idx] = (Math.random() - 0.5) * 4.5;
        velocities[idx + 1] = (Math.random() - 0.5) * 4.5;
        velocities[idx + 2] = (Math.random() - 0.5) * 4.5;
      }
      posAttr.needsUpdate = true;
    };
    triggerBlastRef.current = triggerBlast;

    // Mouse Tracking Physics
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x - width / 2) * 0.0012;
      mouseY = (y - height / 2) * 0.0012;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      triggerBlast();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleCanvasClick);

    // 7. 60FPS Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime() * speedMultiplier;

      // Rotate central core
      coreMesh.rotation.x += 0.005 * speedMultiplier;
      coreMesh.rotation.y += 0.01 * speedMultiplier;
      innerMesh.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.12);

      // Rotate 404 floating voxel digits
      voxelGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.35;
      voxelGroup.position.y = Math.sin(elapsed * 1.5) * 1.5;

      // Particle physics & gravity attraction
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        pArr[idx] += velocities[idx];
        pArr[idx + 1] += velocities[idx + 1];
        pArr[idx + 2] += velocities[idx + 2];

        velocities[idx] *= 0.94;
        velocities[idx + 1] *= 0.94;
        velocities[idx + 2] *= 0.94;

        pArr[idx] += (initialPos[idx] - pArr[idx]) * 0.02 * speedMultiplier;
        pArr[idx + 1] += (initialPos[idx + 1] - pArr[idx + 1]) * 0.02 * speedMultiplier;
        pArr[idx + 2] += (initialPos[idx + 2] - pArr[idx + 2]) * 0.02 * speedMultiplier;
      }
      particleSystem.rotation.y += 0.003 * speedMultiplier;
      posAttr.needsUpdate = true;

      // Camera mouse-smooth orbit tracking
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = Math.sin(targetX * 3) * 45;
      camera.position.y = -targetY * 25;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [colorMode, speedMultiplier]);

  return (
    <div
      className={`relative w-full h-full min-h-[500px] flex flex-col font-mono select-none overflow-hidden ${
        standalone || isFullscreen ? 'fixed inset-0 z-[99999] bg-[#080711]' : 'bg-[#080711] text-cyan-400'
      }`}
      style={{ backgroundColor: colors[colorMode].bg }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-crosshair w-full h-full" />

      {/* Foreground Overlay HUD */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none p-5 justify-between">
        {/* Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-500/30 shadow-xl">
            <AlertTriangle size={18} className="text-cyan-400 animate-pulse shrink-0" />
            <div>
              <h1 className="text-sm font-bold tracking-widest text-cyan-300 uppercase">
                404 Quantum Singularity Void
              </h1>
              <p className="text-[10px] text-cyan-500">Resource lost in 3D WebGL space</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Toggle Fullscreen 3D View"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D'}</span>
            </button>

            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Home size={14} />
                <span>Return Home</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Unexpected 3D Message */}
        <div className="text-center pointer-events-none space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md animate-pulse shadow-2xl">
            💥 Click anywhere to trigger Quantum Gravity Blast ({blastCount} blasts)
          </div>
        </div>

        {/* Bottom Interactive Control Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto bg-black/85 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <Compass size={15} className="text-cyan-400 shrink-0" />
            <span>Interactive Controls:</span>
            <button
              onClick={() => triggerBlastRef.current?.()}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Zap size={12} /> Blast Shockwave
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Sparkles size={14} className="text-cyan-400 shrink-0" />
            <span className="text-gray-400">Warp Speed:</span>
            {[0.5, 1, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  speedMultiplier === s
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f0ff]'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Color Mode Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['cyan', 'magenta', 'gold', 'emerald'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setColorMode(c)}
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  colorMode === c ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    c === 'cyan'
                      ? '#00f0ff'
                      : c === 'magenta'
                      ? '#ff007f'
                      : c === 'gold'
                      ? '#ffd700'
                      : '#10b981',
                }}
                title={`Switch glow color to ${c}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
