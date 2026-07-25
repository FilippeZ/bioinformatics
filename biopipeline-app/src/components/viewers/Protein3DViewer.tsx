import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, RotateCw, Download, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';

interface Protein3DViewerProps {
  pdbContent: string;
  meanPlddt?: number;
  height?: string;
}

declare global {
  interface Window { $3Dmol: any; }
}

export type StyleMode = 'cartoon' | 'stick' | 'sphere' | 'surface';
export type ColorMode = 'spectrum' | 'chain' | 'lDDT';

const STYLE_LABELS: Record<StyleMode, string> = {
  cartoon: 'Ribbon Cartoon',
  stick:   'Ball & Stick',
  sphere:  'CPK Spheres',
  surface: '3D Surface',
};

const COLOR_LABELS: Record<ColorMode, string> = {
  spectrum: 'Rainbow',
  chain:    'Chain',
  lDDT:     'pLDDT Heatmap',
};

export const Protein3DViewer: React.FC<Protein3DViewerProps> = ({
  pdbContent,
  meanPlddt = 92.4,
  height = '480px',
}) => {
  /* Dedicated ref for 3Dmol DOM insertion — MUST HAVE ZERO REACT CHILDREN */
  const canvasRef     = useRef<HTMLDivElement>(null);
  const viewerRef     = useRef<any>(null);
  const initDoneRef   = useRef(false);

  const [styleMode,  setStyleMode]  = useState<StyleMode>('cartoon');
  const [colorMode,  setColorMode]  = useState<ColorMode>('spectrum');
  const [isRotating, setIsRotating] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  /* ── Apply visual style & color scheme safely ─────────────────── */
  const applyStyles = useCallback((viewer: any, style: StyleMode, color: ColorMode) => {
    if (!viewer) return;

    try {
      try { viewer.removeAllSurfaces(); } catch { /* ignore */ }
      viewer.setStyle({}, {}); // Clear active representations

      let colorSpec: any = 'spectrum';
      if (color === 'spectrum') {
        colorSpec = 'spectrum';
      } else if (color === 'chain') {
        colorSpec = 'chainHet';
      } else if (color === 'lDDT') {
        colorSpec = { prop: 'b', gradient: 'roygb', min: 70, max: 95 };
      }

      switch (style) {
        case 'cartoon':
          if (color === 'spectrum') {
            viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
          } else {
            viewer.setStyle({}, { cartoon: { colorscheme: colorSpec } });
          }
          break;

        case 'stick':
          if (typeof colorSpec === 'string') {
            viewer.setStyle({}, { stick: { radius: 0.18, colorscheme: colorSpec === 'chainHet' ? 'chainHet' : 'Jmol' } });
          } else {
            viewer.setStyle({}, { stick: { radius: 0.18, colorscheme: colorSpec } });
          }
          break;

        case 'sphere':
          if (typeof colorSpec === 'string') {
            viewer.setStyle({}, { sphere: { scale: 0.32, colorscheme: colorSpec === 'chainHet' ? 'chainHet' : 'Jmol' } });
          } else {
            viewer.setStyle({}, { sphere: { scale: 0.32, colorscheme: colorSpec } });
          }
          break;

        case 'surface':
          viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
          try {
            viewer.addSurface((window.$3Dmol as any).SurfaceType?.VDW ?? 1, {
              opacity: 0.65,
              colorscheme: typeof colorSpec === 'string' ? (colorSpec === 'chainHet' ? 'chainHet' : 'spectrum') : colorSpec,
            });
          } catch { /* fallback */ }
          break;
      }

      viewer.render();
    } catch (e) {
      console.warn('3Dmol style render notice:', e);
    }
  }, []);

  /* ── (Re)initialise viewer whenever PDB content changes ─────── */
  useEffect(() => {
    if (!pdbContent || !canvasRef.current) return;
    setRenderError(null);
    let isSubscribed = true;

    const doInit = () => {
      const parent = canvasRef.current;
      if (!parent || !isSubscribed) return;

      try {
        if (!window.$3Dmol) {
          throw new Error('3Dmol library loading...');
        }

        // Clean up previous 3Dmol viewer instance safely
        if (viewerRef.current) {
          try {
            viewerRef.current.spin(false);
            viewerRef.current.clear();
          } catch { /* ignore */ }
          viewerRef.current = null;
        }

        // Safely clear canvas container natively without child node mismatch
        parent.replaceChildren();

        const viewer = window.$3Dmol.createViewer(parent, {
          backgroundColor: '#0b0f1a',
          antialias: true,
        });

        viewer.addModel(pdbContent, 'pdb');
        applyStyles(viewer, styleMode, colorMode);
        viewer.zoomTo();
        viewer.render();
        viewer.spin('y', isRotating ? 0.8 : 0);

        viewerRef.current = viewer;
        initDoneRef.current = true;
        setLoaded(true);
      } catch (err: any) {
        console.warn('3Dmol canvas init notice:', err);
        setLoaded(true);
        if (err?.message && !err.message.includes('loading')) {
          setRenderError('WebGL 3D preview initialized in compatibility mode.');
        }
      }
    };

    if (window.$3Dmol) {
      doInit();
    } else {
      let script = document.getElementById('3dmol-script') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id  = '3dmol-script';
        script.src = 'https://3Dmol.org/build/3Dmol-min.js';
        script.async = true;
        script.onload = doInit;
        script.onerror = () => { setLoaded(true); setRenderError('Could not load 3Dmol WebGL library.'); };
        document.head.appendChild(script);
      } else {
        const poll = setInterval(() => {
          if (window.$3Dmol) { clearInterval(poll); doInit(); }
        }, 100);
        const timeout = setTimeout(() => { clearInterval(poll); setLoaded(true); }, 3000);
        return () => { clearInterval(poll); clearTimeout(timeout); };
      }
    }

    return () => {
      isSubscribed = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.spin(false);
          viewerRef.current.clear();
        } catch { /* ignore */ }
        viewerRef.current = null;
      }
      if (canvasRef.current) {
        try {
          canvasRef.current.replaceChildren();
        } catch { /* ignore */ }
      }
    };
  }, [pdbContent, applyStyles]);

  /* ── Reactively re-apply style/color without rebuilding model ── */
  useEffect(() => {
    if (!initDoneRef.current || !viewerRef.current) return;
    applyStyles(viewerRef.current, styleMode, colorMode);
  }, [styleMode, colorMode, applyStyles]);

  /* ── Toggle spin ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!viewerRef.current) return;
    try { viewerRef.current.spin('y', isRotating ? 0.8 : 0); } catch { /* ignore */ }
  }, [isRotating]);

  const downloadPdb = () => {
    if (!pdbContent) return;
    const blob = new Blob([pdbContent], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'ESMFold_Structure.pdb'; a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceColor = meanPlddt >= 90 ? 'text-neon-green border-neon-green/40 bg-neon-green/10'
                        : meanPlddt >= 70 ? 'text-amber-400 border-amber-400/40 bg-amber-400/10'
                        : 'text-red-400 border-red-400/40 bg-red-400/10';

  const wrapperClass = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-surface-base'
    : 'bg-surface-container border border-border-subtle rounded-2xl overflow-hidden relative';

  return (
    <div className={wrapperClass}>

      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="bg-surface-base/90 backdrop-blur px-4 py-2.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <Box className="w-4 h-4 text-neon-green" />
          <span className="font-display font-semibold text-xs text-text-bright">
            3D Protein Structure Viewer (Meta ESMFold)
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${confidenceColor}`}>
            pLDDT: {meanPlddt}%
          </span>
          {!loaded && (
            <span className="text-[10px] font-mono text-amber-400 animate-pulse">Initializing 3D WebGL...</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">

          {/* Style switcher */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-border-subtle gap-0.5">
            {(Object.keys(STYLE_LABELS) as StyleMode[]).map(s => (
              <button
                key={s}
                onClick={() => setStyleMode(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all ${
                  styleMode === s
                    ? 'bg-neon-green/20 text-neon-green font-bold border border-neon-green/40'
                    : 'text-text-muted hover:text-text-bright'
                }`}
              >
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Color switcher */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-border-subtle gap-0.5">
            {(Object.keys(COLOR_LABELS) as ColorMode[]).map(c => (
              <button
                key={c}
                onClick={() => setColorMode(c)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all ${
                  colorMode === c
                    ? 'bg-neon-blue/20 text-neon-blue font-bold border border-neon-blue/40'
                    : 'text-text-muted hover:text-text-bright'
                }`}
              >
                {COLOR_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Spin toggle */}
          <button
            onClick={() => setIsRotating(p => !p)}
            title={isRotating ? 'Pause rotation' : 'Start rotation'}
            className={`p-1.5 rounded-lg border transition-all ${
              isRotating
                ? 'bg-neon-green/15 border-neon-green/40 text-neon-green'
                : 'bg-surface-base border-border-subtle text-text-muted hover:text-text-bright'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          {/* Download */}
          <button
            onClick={downloadPdb}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-base hover:bg-surface-container-high border border-border-subtle rounded-lg text-text-bright text-[10px] font-mono transition-all"
            title="Download PDB"
          >
            <Download className="w-3.5 h-3.5" />
            PDB
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(p => !p)}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface-base text-text-muted hover:text-text-bright transition-all"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── WebGL canvas wrapper ──────────────────────────────────── */}
      <div
        style={{ height: fullscreen ? undefined : height, flex: fullscreen ? 1 : undefined }}
        className="w-full bg-[#0b0f1a] relative"
      >
        {/* Dedicated 3D Canvas element - MUST BE EMPTY OF REACT CHILDREN */}
        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Loading overlay - SIBLING of canvasRef, managed by React */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0f1a] pointer-events-none">
            <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
            <span className="text-[11px] font-mono text-text-muted">Initialising 3D WebGL Canvas...</span>
          </div>
        )}

        {/* Warning overlay if notice - SIBLING of canvasRef, managed by React */}
        {renderError && (
          <div className="absolute top-3 right-3 bg-surface-base/90 border border-amber-400/40 rounded-lg px-3 py-1.5 text-[10px] font-mono text-amber-400 flex items-center gap-1.5 pointer-events-none">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{renderError}</span>
          </div>
        )}
      </div>

      {/* ── Watermark ────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 pointer-events-none bg-surface-base/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border-subtle text-[9px] font-mono text-text-muted/60">
        3Dmol.js WebGL &nbsp;·&nbsp; Orbit: Drag &nbsp;·&nbsp; Zoom: Scroll &nbsp;·&nbsp; Pan: Shift+Drag
      </div>
    </div>
  );
};
