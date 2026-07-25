import React, { useEffect, useRef, useState } from 'react';
import { Box, RotateCw, Download } from 'lucide-react';

interface Protein3DViewerProps {
  pdbContent: string;
  meanPlddt?: number;
  height?: string;
}

declare global {
  interface Window {
    $3Dmol: any;
  }
}

export const Protein3DViewer: React.FC<Protein3DViewerProps> = ({
  pdbContent,
  meanPlddt = 92.4,
  height = '480px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [styleMode, setStyleMode] = useState<'cartoon' | 'stick' | 'sphere'>('cartoon');
  const [colorMode] = useState<'spectrum' | 'chain' | 'secondary'>('spectrum');
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !pdbContent) return;

    const init3DViewer = () => {
      if (window.$3Dmol) {
        containerRef.current!.innerHTML = '';

        const config = { backgroundColor: '#0A0A0A' };
        const viewer = window.$3Dmol.createViewer(containerRef.current, config);
        viewerRef.current = viewer;

        viewer.addModel(pdbContent, 'pdb');
        applyStyles(viewer, styleMode, colorMode);

        viewer.zoomTo();
        viewer.render();
        viewer.spin('y', isRotating ? 0.8 : 0);
      }
    };

    init3DViewer();
  }, [pdbContent]);

  useEffect(() => {
    if (viewerRef.current) {
      applyStyles(viewerRef.current, styleMode, colorMode);
      viewerRef.current.render();
    }
  }, [styleMode, colorMode]);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.spin('y', isRotating ? 0.8 : 0);
    }
  }, [isRotating]);

  const applyStyles = (viewer: any, style: string, color: string) => {
    viewer.setStyle({}, {});

    if (style === 'cartoon') {
      viewer.setStyle({}, { cartoon: { color: color === 'spectrum' ? 'spectrum' : 'cyan' } });
    } else if (style === 'stick') {
      viewer.setStyle({}, { stick: { colorscheme: 'Jmol' } });
    } else if (style === 'sphere') {
      viewer.setStyle({}, { sphere: { scale: 0.35, color: 'spectrum' } });
    }
  };

  const downloadPdb = () => {
    const blob = new Blob([pdbContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ESMFold_Protein_Target.pdb';
    a.click();
  };

  return (
    <div className="bg-surface-container border border-border-subtle rounded-xl overflow-hidden glass-panel relative">
      {/* 3D Canvas Header Bar */}
      <div className="bg-surface-base px-4 py-2.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Box className="w-4 h-4 text-neon-green" />
          <span className="font-display font-semibold text-xs text-text-bright">
            3D Protein Structure Viewer (Meta ESMFold)
          </span>
          <span className="bg-neon-green/10 text-neon-green text-[10px] font-mono px-2 py-0.5 rounded border border-neon-green/30">
            pLDDT: {meanPlddt}%
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Style selector */}
          <div className="flex items-center bg-surface-container-high rounded p-0.5 border border-border-subtle">
            <button
              onClick={() => setStyleMode('cartoon')}
              className={`px-2 py-1 rounded ${styleMode === 'cartoon' ? 'bg-neon-green/20 text-neon-green font-semibold' : 'text-text-muted hover:text-text-bright'}`}
            >
              Ribbon
            </button>
            <button
              onClick={() => setStyleMode('stick')}
              className={`px-2 py-1 rounded ${styleMode === 'stick' ? 'bg-neon-green/20 text-neon-green font-semibold' : 'text-text-muted hover:text-text-bright'}`}
            >
              Sticks
            </button>
            <button
              onClick={() => setStyleMode('sphere')}
              className={`px-2 py-1 rounded ${styleMode === 'sphere' ? 'bg-neon-green/20 text-neon-green font-semibold' : 'text-text-muted hover:text-text-bright'}`}
            >
              CPK Spheres
            </button>
          </div>

          {/* Spin button */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded border transition-all ${isRotating ? 'bg-neon-green/20 border-neon-green/40 text-neon-green' : 'bg-surface-container-high border-border-subtle text-text-muted'}`}
            title="Toggle Auto Rotate"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          {/* Download button */}
          <button
            onClick={downloadPdb}
            className="flex items-center space-x-1 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-border-subtle rounded text-text-bright transition-all"
            title="Download PDB File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDB</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full bg-surface-base relative cursor-grab active:cursor-grabbing"
      />

      {/* Watermark overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none bg-surface-base/80 backdrop-blur-md px-2.5 py-1 rounded border border-border-subtle text-[10px] font-mono text-text-muted">
        3Dmol.js WebGL • Orbit: Drag • Zoom: Scroll • Pan: Shift+Drag
      </div>
    </div>
  );
};
