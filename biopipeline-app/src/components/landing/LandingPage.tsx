import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dna, ChevronDown, Zap, FlaskConical, BrainCircuit, Pill, ShieldCheck, ArrowRight, Heart, Sparkles } from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 36;
const FPS = 14;
const LOOP_DELAY_MS = 1200;
const framePath = (i: number) =>
  `/frames/Video Project 3_${String(i).padStart(3, '0')}.jpg`;

// ─── HUMAN-FRIENDLY FEATURE DATA ──────────────────────────────────────────
const FEATURES = [
  {
    id: 1,
    icon: Dna,
    emoji: '🧬',
    label: 'Read the DNA',
    desc: 'Upload a gene sequence and let the platform decode its building blocks automatically.',
    stage: 'Step 1',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  {
    id: 2,
    icon: BrainCircuit,
    emoji: '🤖',
    label: 'Predict 3D Shape',
    desc: 'AI (Meta ESMFold) builds a 3D model of the protein — no lab equipment needed.',
    stage: 'Step 2',
    color: 'from-sky-500/20 to-blue-500/10',
    border: 'border-sky-400/30',
    text: 'text-sky-400',
  },
  {
    id: 3,
    icon: ShieldCheck,
    emoji: '✅',
    label: 'Confirm the Target',
    desc: 'The system checks whether the protein is a good match for drug therapy.',
    stage: 'Step 3',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-400/30',
    text: 'text-violet-400',
  },
  {
    id: 4,
    icon: FlaskConical,
    emoji: '🧪',
    label: 'Screen Compounds',
    desc: 'Thousands of drug-like molecules are filtered down to the safest, most promising candidates.',
    stage: 'Step 4',
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
  },
  {
    id: 5,
    icon: Pill,
    emoji: '🏆',
    label: 'Find the Best Drug',
    desc: 'AI ranks every molecule and reveals the top leads most likely to work as a treatment.',
    stage: 'Step 5',
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-400/30',
    text: 'text-rose-400',
  },
];

// ─── TICKER ────────────────────────────────────────────────────────────────
const TICKS = [
  '🧬 Reading your DNA sequence…',
  '🤖 Building a 3D protein model…',
  '✅ Verifying the disease target…',
  '🧪 Filtering thousands of molecules…',
  '🏆 Ranking the best drug candidates…',
];

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [frame, setFrame] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [tickStep, setTickStep] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const frameRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    images.current = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => { loaded++; setLoadedCount(loaded); if (loaded === TOTAL_FRAMES) setImagesReady(true); };
      img.onerror = () => { loaded++; setLoadedCount(loaded); if (loaded === TOTAL_FRAMES) setImagesReady(true); };
      return img;
    });
    return () => { images.current = []; };
  }, []);

  // Ping-pong frame loop
  useEffect(() => {
    if (!imagesReady) return;
    setTimeout(() => setHeroVisible(true), 100);
    const tick = () => {
      frameRef.current += dirRef.current;
      if (frameRef.current >= TOTAL_FRAMES - 1) { dirRef.current = -1; frameRef.current = TOTAL_FRAMES - 1; }
      else if (frameRef.current <= 0) { dirRef.current = 1; frameRef.current = 0; }
      setFrame(frameRef.current);
      rafRef.current = setTimeout(tick, 1000 / FPS);
    };
    rafRef.current = setTimeout(tick, LOOP_DELAY_MS);
    return () => { if (rafRef.current) clearTimeout(rafRef.current); };
  }, [imagesReady]);

  // Ticker
  useEffect(() => {
    const id = setInterval(() => setTickStep(p => (p + 1) % TICKS.length), 2600);
    return () => clearInterval(id);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const handleResize = () => { if (!canvas) return; width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    const particles: Array<{ x: number; y: number; size: number; speedY: number; opacity: number; color: string }> = [];
    const colors = ['#34D399', '#38BDF8', '#A78BFA', '#F472B6'];
    for (let i = 0; i < 40; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2.5 + 0.5, speedY: Math.random() * 0.25 + 0.08, opacity: Math.random() * 0.35 + 0.1, color: colors[Math.floor(Math.random() * colors.length)] });
    }
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < 0) p.y = height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animId); };
  }, []);

  const handleEnter = useCallback(() => { setEntered(true); setTimeout(onEnter, 900); }, [onEnter]);
  const loadPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-900 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#070B14' }}
    >
      {/* Background frames */}
      <div className="absolute inset-0">
        {imagesReady ? (
          <img key={frame} src={framePath(frame)} alt="BioHelix"
            className="w-full h-full object-cover filter brightness-[0.9] contrast-[1.05]"
            style={{ transition: 'opacity 0.05s linear' }} draggable={false}
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, #0F172A 0%, #070B14 80%)' }} />
        )}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[2]" />
        <div className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(7,11,20,0.15) 0%, rgba(7,11,20,0.65) 100%)' }}
        />
      </div>

      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/8 backdrop-blur-md bg-black/30">
        <div className="flex items-center gap-3">
          <img
            src="/biohelix_logo.png"
            alt="BioHelix Logo"
            className="h-9 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]"
          />
          <div>
            <span className="font-display font-bold text-sm text-white tracking-tight">BioHelix</span>
            <span className="hidden md:inline-block ml-2 text-[11px] text-slate-400 font-sans"> — AI Drug Discovery Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <main className={`relative z-10 flex flex-col items-center justify-center flex-1 px-6 sm:px-12 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Loading bar */}
        {!imagesReady && (
          <div className="mb-8 w-72">
            <div className="text-[11px] font-sans text-slate-400 mb-2 flex justify-between">
              <span>Getting things ready…</span>
              <span>{loadPct}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full transition-all duration-200" style={{ width: `${loadPct}%` }} />
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-sans text-slate-300 tracking-wide font-medium">Powered by AI · No biology degree required</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white leading-[1.05] tracking-tight mb-5"
          style={{ textShadow: '0 0 60px rgba(52,211,153,0.25), 0 4px 24px rgba(0,0,0,0.8)' }}
        >
          From{' '}
          <span style={{ background: 'linear-gradient(90deg, #34D399 0%, #38BDF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DNA
          </span>
          {' '}to{' '}
          <span style={{ background: 'linear-gradient(90deg, #F472B6 0%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Life-Saving Drug
          </span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white/60">in 5 guided steps</span>
        </h1>

        {/* Subtitle — plain language */}
        <p className="text-slate-300 text-base sm:text-lg max-w-xl mb-5 leading-relaxed font-sans drop-shadow-md">
          Upload a DNA sequence and watch our AI pipeline automatically identify potential medicines — 
          the same process used by top pharmaceutical researchers, made simple for everyone.
        </p>

        {/* Live ticker */}
        <div className="h-9 flex items-center justify-center mb-8 px-5 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm shadow-inner min-w-[320px]">
          <span
            key={tickStep}
            className="text-[12px] font-sans text-emerald-400 font-semibold transition-all"
            style={{ animation: 'fadeUp 0.35s ease-out' }}
          >
            {TICKS[tickStep]}
          </span>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10 max-w-4xl w-full">
          {FEATURES.map(({ id, emoji, label, desc, stage, color, border, text }) => {
            const isHovered = hoveredFeature === id;
            return (
              <div
                key={id}
                onMouseEnter={() => setHoveredFeature(id)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-3.5 rounded-2xl border transition-all duration-300 text-left cursor-default backdrop-blur-sm flex flex-col gap-2 bg-gradient-to-br ${color} ${border} ${
                  isHovered ? 'scale-[1.04] shadow-xl' : 'border-opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-sans font-semibold uppercase tracking-wider ${text} opacity-80`}>{stage}</span>
                  <span className="text-base leading-none">{emoji}</span>
                </div>
                <div className={`font-display font-bold text-[11px] text-white leading-tight`}>{label}</div>
                <div className="text-[9.5px] text-slate-400 leading-relaxed font-sans">{desc}</div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleEnter}
          className="group relative flex items-center gap-3 px-10 py-4 rounded-full font-bold text-base font-sans transition-all duration-300 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.25) 0%, rgba(56,189,248,0.2) 100%)',
            border: '1.5px solid rgba(52,211,153,0.6)',
            boxShadow: '0 0 40px rgba(52,211,153,0.3), inset 0 0 20px rgba(52,211,153,0.08)',
            color: '#fff',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 70px rgba(52,211,153,0.5), inset 0 0 30px rgba(52,211,153,0.15)';
            e.currentTarget.style.borderColor = 'rgba(52,211,153,0.9)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(52,211,153,0.3), inset 0 0 20px rgba(52,211,153,0.08)';
            e.currentTarget.style.borderColor = 'rgba(52,211,153,0.6)';
          }}
        >
          <Zap className="w-5 h-5 text-emerald-400 group-hover:animate-bounce transition-colors" />
          <span className="tracking-wide">Start Discovering</span>
          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-3 text-[11px] font-sans text-slate-500">Free · No account needed · Results in seconds</p>

        {/* Scroll hint */}
        <div className="mt-5 flex flex-col items-center gap-1 text-slate-600 animate-bounce">
          <ChevronDown className="w-4 h-4" />
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
