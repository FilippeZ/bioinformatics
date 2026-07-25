import React from 'react';
import { Dna, RefreshCw, Menu, Activity, ShieldCheck } from 'lucide-react';
import { usePipeline } from '../../context/PipelineContext';

const STAGE_LABELS: Record<number, string> = {
  1: 'Ingestion & Parsing',
  2: 'ESMFold 3D Active',
  3: 'Validation Gate',
  4: 'Cheminformatics Filter',
  5: 'QSAR Predictive Engine',
};

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { state, resetPipeline } = usePipeline();
  const isComplete = !!state.module5Data;

  return (
    <header className="h-14 bg-surface-container border-b border-border-subtle flex items-center justify-between px-4 z-50 shrink-0">
      {/* Left: Menu + Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-surface-container-high text-text-muted hover:text-text-bright transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-surface-base border border-neon-green/40 flex items-center justify-center">
            <Dna className="w-4 h-4 text-neon-green animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-text-bright tracking-tight">BioHelix MLOps Platform</span>
            <span className="ml-2 text-[10px] font-mono text-neon-green border border-neon-green/30 bg-neon-green/10 px-1.5 py-0.5 rounded">v1.4.2-RF</span>
          </div>
        </div>
      </div>

      {/* Center: Dynamic Stage Status Badge */}
      <div className="hidden md:flex items-center space-x-2 font-mono text-xs bg-surface-base border border-border-subtle px-4 py-1.5 rounded-full">
        <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-neon-green' : 'bg-neon-blue animate-pulse'}`} />
        <span className="text-text-muted">Global Status:</span>
        <span className={`font-bold ${isComplete ? 'text-neon-green' : 'text-neon-blue'}`}>
          {isComplete ? '✓ Pipeline Complete' : `Stage ${state.currentStep}: ${STAGE_LABELS[state.currentStep]}`}
        </span>
      </div>

      {/* Right: Active Target + Reset */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-text-muted bg-surface-base border border-border-subtle px-3 py-1.5 rounded">
          <ShieldCheck className="w-3.5 h-3.5 text-neon-green" />
          <span>TRG-8942-PX</span>
        </div>
        <button
          onClick={resetPipeline}
          className="flex items-center space-x-1.5 text-xs font-mono text-text-muted hover:text-text-bright bg-surface-container-high hover:bg-surface-container-highest border border-border-subtle px-3 py-1.5 rounded transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Session</span>
        </button>
      </div>
    </header>
  );
};
