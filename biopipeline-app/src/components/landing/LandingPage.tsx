import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dna, ChevronDown, Zap, FlaskConical, BrainCircuit, Pill, ShieldCheck } from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 36;
const FPS = 14;          // frame playback speed (frames per second)
const LOOP_DELAY_MS = 1200; // pause before loop restarts

// Pad frame number to 3 digits: 0 → "000"
const framePath = (i: number) =>
  `/frames/Video Project 3_${String(i).padStart(3, '0')}.jpg`;

// ─── FEATURE DATA ──────────────────────────────────────────────────────────
const FEATURES = [
  { id: 1, icon: Dna,          label: 'DNA Ingestion',      desc: 'Suffix tree parsing, GC% analysis & protein translation', stage: 'Stage 1' },
  { id: 2, icon: BrainCircuit, label: 'ESMFold AI',        desc: 'Meta ESMFold zero-shot 3D structure prediction',          stage: 'Stage 2' },
  { id: 3, icon: ShieldCheck,  label: 'Target Validation',  desc: 'Needleman-Wunsch alignment + ML classification gate',     stage: 'Stage 3' },
  { id: 4, icon: FlaskConical, label: 'Cheminformatics',   desc: "Lipinski's Rule of 5 compound screening engine",          stage: 'Stage 4' },
  { id: 5, icon: Pill,         label: 'QSAR Engine',         desc: 'Random Forest pIC50 prediction & lead drug ranking',       stage: 'Stage 5' },
];

// ─── PIPELINE STEPS TICKER ────────────────────────────────────────────────
const STEPS = [
  'DNA Ingestion & Suffix Tree Parsing',
  'ESMFold AI 3D Structure Prediction',
  'Needleman-Wunsch Target Validation Gate',
  'Cheminformatics Lipinski Rule of 5 Filter',
  'QSAR Drug Ranking & Predictive Inference',
];

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [frame, setFrame] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [tickStep, setTickStep] = useState(4); // Default to Stage 5: QSAR Drug Ranking
  const [heroVisible, setHeroVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const frameRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preload all background video frames
  useEffect(() => {
    let loaded = 0;
    images.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) setImagesReady(true);
      };
      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) setImagesReady(true);
      };
      return img;
    });
    return () => { images.current = []; };
  }, []);

  // Ping-pong loop for background video frames
  useEffect(() => {
    if (!imagesReady) return;
    setTimeout(() => setHeroVisible(true), 100);

    const tick = () => {
      frameRef.current += dirRef.current;
      if (frameRef.current >= TOTAL_FRAMES - 1) {
        dirRef.current = -1;
        frameRef.current = TOTAL_FRAMES - 1;
      } else if (frameRef.current <= 0) {
        dirRef.current = 1;
        frameRef.current = 0;
      }
      setFrame(frameRef.current);
      rafRef.current = setTimeout(tick, 1000 / FPS);
    };

    rafRef.current = setTimeout(tick, LOOP_DELAY_MS);
    return () => { if (rafRef.current) clearTimeout(rafRef.current); };
  }, [imagesReady]);

  // Active module ticker animation
  useEffect(() => {
    const id = setInterval(() => setTickStep(p => (p + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, []);

  // Bioluminescent DNA Particle Helix Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; size: number; speedY: number; opacity: number; color: string }> = [];
    const colors = ['#00d4ff', '#00ff9d', '#a78bfa', '#00e0ff'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speedY: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.015;

      // Floating bio particles
      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < 0) p.y = height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Enter handler with fade-out
  const handleEnter = useCallback(() => {
    setEntered(true);
    setTimeout(onEnter, 900);
  }, [onEnter]);

  const loadPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-900 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#040c16' }}
    >
      {/* ── CRISP CLEAR BACKGROUND: Frame Video Animation ──────────────── */}
      <div className="absolute inset-0">
        {imagesReady ? (
          <img
            key={frame}
            src={framePath(frame)}
            alt="BioHelix Sequence Render"
            className="w-full h-full object-cover scale-100 filter contrast-[1.08] brightness-[1.05]"
            style={{ transition: `opacity 0.05s linear` }}
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'radial-gradient(ellipse at center, #0a1f3a 0%, #040c16 70%)' }}
          />
        )}

        {/* Bioluminescent canvas layer */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[2]" />

        {/* Crisp subtle overlay - no heavy blur */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(4,12,22,0.15) 0%, rgba(4,12,22,0.45) 100%)'
          }}
        />
      </div>

      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-cyan-500/20 backdrop-blur-sm bg-[#040c16]/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg border border-cyan-400/50 flex items-center justify-center bg-cyan-400/10 shadow-lg shadow-cyan-400/20">
            <Dna className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-sm font-bold text-white tracking-[0.2em] uppercase">BioHelix MLOps</span>
            <span className="hidden md:inline-block ml-3 font-mono text-[10px] text-cyan-400/70 border-l border-cyan-500/30 pl-3">
              End-to-End BioPipeline: DNA → Drug
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LAB SERVER ONLINE</span>
          </div>
          <div className="font-mono text-[10px] text-cyan-400/90 border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 rounded-md shadow-sm">
            v1.4.2-RF
          </div>
        </div>
      </header>

      {/* ── MAIN HERO CONTENT ───────────────────────────────────────── */}
      <main className={`relative z-10 flex flex-col items-center justify-center flex-1 px-6 sm:px-12 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Loading Progress Bar */}
        {!imagesReady && (
          <div className="mb-8 w-72">
            <div className="font-mono text-[11px] text-cyan-400/80 mb-2 flex justify-between">
              <span>Initializing Sequence Renderer…</span>
              <span>{loadPct}%</span>
            </div>
            <div className="w-full h-1 bg-cyan-400/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-200" style={{ width: `${loadPct}%` }} />
            </div>
          </div>
        )}

        {/* Hero Tagline Badge */}
        <div className="inline-flex items-center space-x-2.5 bg-cyan-400/10 border border-cyan-400/40 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm shadow-lg shadow-cyan-400/10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px] text-cyan-300 tracking-[0.25em] uppercase font-semibold">AI-Powered Drug Discovery Pipeline</span>
        </div>

        {/* Giant Main Title */}
        <h1
          className="font-display font-black text-5xl sm:text-7xl md:text-8xl text-white leading-none tracking-tight mb-4"
          style={{ textShadow: '0 0 50px rgba(0,212,255,0.5), 0 0 20px rgba(0,0,0,0.8)' }}
        >
          FROM{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #00d4ff 0%, #00ff9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            DNA
          </span>
          <br />
          TO{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #00ff9d 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            DRUG
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-100/90 text-base sm:text-lg md:text-xl max-w-2xl mb-4 leading-relaxed font-sans drop-shadow-md">
          A complete bioinformatics MLOps platform — from raw genomic sequences to ranked drug candidates, powered by ESMFold, QSAR, and Lipinski filtering.
        </p>

        {/* Active Module Live Ticker */}
        <div className="h-8 flex items-center justify-center mb-8 px-4 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-400/40 backdrop-blur-sm shadow-md">
          <span className="font-mono text-[11px] text-cyan-400/80 mr-2 tracking-widest uppercase">ACTIVE MODULE →</span>
          <span
            key={tickStep}
            className="font-mono text-xs text-emerald-400 font-bold transition-all flex items-center gap-1.5"
            style={{ animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Stage {tickStep + 1}: {STEPS[tickStep]}
          </span>
        </div>

        {/* 5-Stage Interactive Feature Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-10 max-w-4xl w-full">
          {FEATURES.map(({ id, icon: Icon, label, desc, stage }) => {
            const isHovered = hoveredFeature === id;
            return (
              <div
                key={id}
                onMouseEnter={() => setHoveredFeature(id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-3 rounded-xl border transition-all duration-300 text-left cursor-default backdrop-blur-sm flex flex-col justify-between ${
                  isHovered
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                    : 'bg-black/30 border-white/15 hover:border-cyan-400/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-cyan-400/90 font-bold uppercase">{stage}</span>
                    <Icon className={`w-4 h-4 transition-colors ${isHovered ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  </div>
                  <div className="font-mono text-xs font-bold text-white mb-0.5">{label}</div>
                </div>
                <div className="text-[10px] text-blue-100/70 leading-tight mt-1 line-clamp-2">{desc}</div>
              </div>
            );
          })}
        </div>

        {/* Primary LAUNCH BIOPIPELINE Button */}
        <button
          onClick={handleEnter}
          className="group relative flex items-center space-x-3 px-12 py-4 rounded-full font-bold text-base font-mono transition-all duration-300 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, rgba(0,212,255,0.3) 0%, rgba(0,255,157,0.25) 100%)',
            border: '1px solid rgba(0,212,255,0.7)',
            boxShadow: '0 0 50px rgba(0,212,255,0.4), inset 0 0 25px rgba(0,212,255,0.15)',
            color: '#fff',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 75px rgba(0,212,255,0.7), inset 0 0 35px rgba(0,212,255,0.25)';
            e.currentTarget.style.borderColor = 'rgba(0,255,157,0.9)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 50px rgba(0,212,255,0.4), inset 0 0 25px rgba(0,212,255,0.15)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.7)';
          }}
        >
          <Zap className="w-5 h-5 text-cyan-400 group-hover:animate-bounce group-hover:text-emerald-400 transition-colors" />
          <span className="tracking-wider">LAUNCH BIOPIPELINE</span>
          <div
            className="absolute inset-0 rounded-full animate-pulse opacity-30"
            style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.2) 0%, rgba(0,255,157,0.15) 100%)' }}
          />
        </button>

        {/* Scroll hint */}
        <div className="mt-6 flex flex-col items-center space-y-1 text-white/40 animate-bounce">
          <ChevronDown className="w-4 h-4" />
          <span className="font-mono text-[9px] tracking-widest uppercase">Scroll to learn more</span>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
