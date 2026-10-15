import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Sparkles, Terminal, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TOKENS = [
  // Binary & Hex Tokens
  '0101', '1100', '0x1F', '0001', '1010', '0xFF', '0110', '1111',
  '0100', '1001', '0x88', '0xAA', '0011', '1101', '0x42', '0x99',
  // UUID Snippets
  'a0ee-bc99', 'f47a-c10b', '550e-8400', '9c0b-4ef8', 'd866-793a', '3b1a-e40e',
  // Developer Credentials & Tech Stack
  'Rajlaxmi', 'DevOS', 'React', 'Redux', 'TypeScript', 'Node.js', 'WebGL', 'Three.js',
  'Vite', 'Express', 'JWT', 'REST API', 'Codekaze',
  // Programming Keywords
  'async', 'await', 'import', 'export', 'const', 'return', 'function', 'Promise',
  'state', 'store', 'dispatch', 'action', 'effect', 'slice', 'props', 'render',
];

function createTextTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 64);
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export const Secret3DEasterEgg = ({ isOpen, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rainSpeed, setRainSpeed] = useState(1);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    camera.position.set(0, 0, 45);

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setClearColor(0x000000, 0); // Transparent canvas background
    container.appendChild(renderer.domElement);

    // 3. Create 3D Text Sprites (Clean individual text strings without quads or blocks)
    const sprites: { sprite: THREE.Sprite; speed: number; resetX: number }[] = [];
    const spriteGroup = new THREE.Group();
    scene.add(spriteGroup);

    const spriteCount = 140;

    for (let i = 0; i < spriteCount; i++) {
      const token = TOKENS[i % TOKENS.length];
      const color =
        token.startsWith('0') || token.startsWith('1')
          ? '#38bdf8' // Cyan binary
          : ['Rajlaxmi', 'DevOS', 'React', 'Three.js'].includes(token)
          ? '#86efac' // Bright Neon Green
          : '#4ade80'; // Emerald Green

      const texture = createTextTexture(token, color);
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const sprite = new THREE.Sprite(mat);

      const x = (Math.random() - 0.5) * 130;
      const y = (Math.random() - 0.5) * 110;
      const z = (Math.random() - 0.5) * 75;

      sprite.position.set(x, y, z);
      sprite.scale.set(10, 2.5, 1); // 4:1 aspect ratio matching 256x64 canvas

      spriteGroup.add(sprite);
      sprites.push({ sprite, speed: 10 + Math.random() * 22, resetX: x });
    }

    // 4. Mouse Orbit Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Global Click Matrix Shockwave
    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.pointer-events-auto')) return;

      sprites.forEach(({ sprite }) => {
        sprite.position.y += 12 + Math.random() * 20;
      });
    };

    window.addEventListener('click', handleGlobalClick);

    // 6. 60FPS Rain Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta() * rainSpeed;

      sprites.forEach(({ sprite, speed }) => {
        sprite.position.y -= speed * delta;
        if (sprite.position.y < -55) {
          sprite.position.y = 55;
          sprite.position.x = (Math.random() - 0.5) * 130;
        }
      });

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = Math.sin(targetX * 2.5) * 45;
      camera.position.y = -targetY * 20;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);

      renderer.dispose();
      sprites.forEach(({ sprite }) => {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, rainSpeed, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-transparent pointer-events-none flex flex-col font-mono select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md border-b border-emerald-500/30 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse">
            <Terminal size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-emerald-400 tracking-widest uppercase">
                DevOS 3D Text & Code Rain Overlay
              </h2>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                CLEAN TEXT STRINGS
              </span>
            </div>
            <p className="text-[10px] text-emerald-600">Pure text strings (0101, UUIDs, JS keywords) falling in 3D space</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-red-500/20 hover:border-red-500/40 border border-emerald-500/30 text-emerald-300 hover:text-red-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <X size={15} />
          <span>Close Matrix (Esc)</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full pointer-events-none" />

      {/* Floating Telemetry HUD */}
      <div className="absolute bottom-6 left-6 z-20 max-w-xs p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-emerald-500/30 shadow-2xl text-xs space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
          <Cpu size={14} />
          <span>Code Stream Telemetry</span>
        </div>
        <div className="space-y-0.5 text-[11px] text-emerald-300">
          <div>Developer: <span className="text-white font-bold">Rajlaxmi</span></div>
          <div>Binary: <span className="text-cyan-400">0101 · 0x1F · 0x88 · 0xFF</span></div>
          <div>UUIDs: <span className="text-indigo-300">a0ee-bc99 · f47a-c10b</span></div>
          <div>Keywords: <span className="text-green-300">async · await · React · Redux</span></div>
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-emerald-500/30 pointer-events-auto">
        <div className="flex items-center gap-2 text-xs text-emerald-300">
          <Sparkles size={14} className="text-emerald-400" />
          <span>Stream Speed:</span>
          <button
            onClick={() => setRainSpeed(0.5)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${rainSpeed === 0.5 ? 'bg-emerald-600 text-black' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'}`}
          >
            0.5x
          </button>
          <button
            onClick={() => setRainSpeed(1)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${rainSpeed === 1 ? 'bg-emerald-600 text-black' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'}`}
          >
            1.0x
          </button>
          <button
            onClick={() => setRainSpeed(2.5)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${rainSpeed === 2.5 ? 'bg-emerald-600 text-black' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'}`}
          >
            2.5x Warp
          </button>
        </div>
      </div>

      {/* Center Hint */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] shadow-lg animate-bounce">
          <ShieldAlert size={13} />
          <span>Pure text strings (0101, UUIDs, JS keywords) falling in 3D space · Move mouse to tilt</span>
        </div>
      </div>
    </div>
  );
};
