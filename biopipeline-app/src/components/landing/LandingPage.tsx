import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dna, ChevronDown, Zap, FlaskConical, BrainCircuit, Pill } from 'lucide-react';

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 36;
const FPS = 14;          // frame playback speed (frames per second)
const LOOP_DELAY_MS = 1200; // pause before loop restarts

// Pad frame number to 3 digits: 0 → "000"
const framePath = (i: number) =>
  `/frames/Video Project 3_${String(i).padStart(3, '0')}.jpg`;

// ─── FEATURE DATA ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Dna,         label: 'DNA Ingestion',      desc: 'Suffix tree parsing, GC% analysis & protein translation' },
  { icon: BrainCircuit, label: 'ESMFold AI',        desc: 'Meta ESMFold zero-shot 3D structure prediction' },
  { icon: Zap,         label: 'Target Validation',  desc: 'Needleman-Wunsch alignment + ML classification gate' },
  { icon: FlaskConical, label: 'Cheminformatics',   desc: "Lipinski's Rule of 5 compound screening engine" },
  { icon: Pill,        label: 'QSAR Engine',         desc: 'Random Forest pIC50 prediction & lead drug ranking' },
];

// ─── PIPELINE STEPS TICKER ────────────────────────────────────────────────
const STEPS = [
  'DNA Sequence Ingestion',
  'ESMFold 3D Modeling',
  'Target Validation Gate',
  'Lipinski Filter',
  'QSAR Drug Ranking',
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
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
  const frameRef = useRef(0);
  const dirRef = useRef(1);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const images = useRef<HTMLImageElement[]>([]);

  // Preload all frames
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

  // Animate frames in a ping-pong loop
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

  // Ticker for steps
  useEffect(() => {
    const id = setInterval(() => setTickStep(p => (p + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
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
      {/* ── BACKGROUND: Frame Animation ─────────────────────────────── */}
      <div className="absolute inset-0">
        {imagesReady ? (
          <img
            key={frame}
            src={framePath(frame)}
            alt=""
            className="w-full h-full object-cover"
            style={{ transition: `opacity 0.05s linear` }}
            draggable={false}
          />
        ) : (
          // Placeholder gradient while loading
          <div className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #040c16 0%, #0a1f3a 40%, #062840 70%, #061420 100%)' }} />
        )}

        {/* Overlay vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, rgba(4,12,22,0.55) 60%, rgba(4,12,22,0.92) 100%)'
        }} />

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,212,255,0.018) 0px, rgba(0,212,255,0.018) 1px, transparent 1px, transparent 4px)'
        }} />
      </div>

      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded border border-cyan-400/50 flex items-center justify-center bg-cyan-400/10">
            <Dna className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase">BioHelix MLOps</span>
        </div>
        <div className="font-mono text-[10px] text-cyan-400/50 tracking-widest uppercase hidden sm:block">
          End-to-End BioPipeline: DNA → Drug
        </div>
        <div className="font-mono text-[10px] text-cyan-400/60 border border-cyan-400/20 px-2.5 py-1 rounded">
          v1.4.2-RF
        </div>
      </div>

      {/* ── MAIN HERO CONTENT ───────────────────────────────────────── */}
      <div className={`relative z-10 flex flex-col items-center justify-center flex-1 px-8 text-center transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Loading bar */}
        {!imagesReady && (
          <div className="mb-8 w-64">
            <div className="font-mono text-[11px] text-cyan-400/60 mb-2">Initializing Sequence Renderer… {loadPct}%</div>
            <div className="w-full h-0.5 bg-cyan-400/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400/60 rounded-full transition-all" style={{ width: `${loadPct}%` }} />
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-cyan-400/10 border border-cyan-400/30 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px] text-cyan-400 tracking-widest uppercase">AI-Powered Drug Discovery Pipeline</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-white leading-none tracking-tight mb-4"
          style={{ textShadow: '0 0 60px rgba(0,212,255,0.35)' }}>
          FROM{' '}
          <span style={{
            background: 'linear-gradient(90deg, #00d4ff 0%, #00ff9d 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>DNA</span>
          <br />
          TO{' '}
          <span style={{
            background: 'linear-gradient(90deg, #00ff9d 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>DRUG</span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-200/70 text-base sm:text-lg max-w-2xl mb-3 leading-relaxed">
          A complete bioinformatics MLOps platform — from raw genomic sequences to ranked drug candidates, powered by ESMFold, QSAR, and Lipinski filtering.
        </p>

        {/* Animated step ticker */}
        <div className="h-7 flex items-center justify-center mb-10 overflow-hidden">
          <span className="font-mono text-[12px] text-cyan-400/70 mr-2">ACTIVE MODULE →</span>
          <span
            key={tickStep}
            className="font-mono text-[12px] text-cyan-300 font-bold transition-all"
            style={{ animation: 'fadeUp 0.4s ease' }}
          >
            Stage {tickStep + 1}: {STEPS[tickStep]}
          </span>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10 max-w-2xl">
          {FEATURES.map(({ icon: Icon, label }, i) => (
            <div key={i}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-cyan-400/10 border border-white/10 hover:border-cyan-400/40 rounded-full px-3.5 py-1.5 transition-all cursor-default"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] text-white/80">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleEnter}
          className="group relative flex items-center space-x-3 px-10 py-4 rounded-full font-bold text-base font-mono transition-all duration-300 active:scale-95"
          style={{
            background: 'linear-gradient(90deg, rgba(0,212,255,0.2) 0%, rgba(0,255,157,0.15) 100%)',
            border: '1px solid rgba(0,212,255,0.5)',
            boxShadow: '0 0 40px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05)',
            color: '#fff',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 60px rgba(0,212,255,0.45), inset 0 0 30px rgba(0,212,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.2), inset 0 0 20px rgba(0,212,255,0.05)')}
        >
          <Zap className="w-5 h-5 text-cyan-400 group-hover:animate-bounce" />
          <span>LAUNCH BIOPIPELINE</span>
          <div className="absolute inset-0 rounded-full animate-pulse opacity-30"
            style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, rgba(0,255,157,0.08) 100%)' }} />
        </button>

        {/* Scroll hint */}
        <div className="mt-8 flex flex-col items-center space-y-1.5 text-white/25 animate-bounce">
          <ChevronDown className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-widest uppercase">Scroll to learn more</span>
        </div>
      </div>

      {/* ── BOTTOM INFO STRIP ───────────────────────────────────────── */}
      <div className="relative z-10 border-t border-cyan-500/15 backdrop-blur-sm px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-white/30 tracking-widest">
        <div className="flex items-center gap-4">
          <span>5-STAGE PIPELINE</span>
          <span className="text-cyan-400/50">•</span>
          <span>Meta ESMFold API</span>
          <span className="text-cyan-400/50">•</span>
          <span>Lipinski Ro5</span>
          <span className="text-cyan-400/50">•</span>
          <span>Random Forest QSAR</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>FRAME</span>
          <span className="text-cyan-400/70 font-bold">{String(frame).padStart(3, '0')}</span>
          <span>/ {TOTAL_FRAMES - 1}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
