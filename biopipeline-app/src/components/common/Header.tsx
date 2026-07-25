import { RefreshCw, Menu } from 'lucide-react';
import { usePipeline } from '../../context/PipelineContext';

const STAGE_LABELS: Record<number, { emoji: string; plain: string }> = {
  1: { emoji: '🧬', plain: 'Reading your DNA sequence' },
  2: { emoji: '🤖', plain: 'Building the 3D protein model' },
  3: { emoji: '✅', plain: 'Confirming drug target suitability' },
  4: { emoji: '🧪', plain: 'Screening drug molecules for safety' },
  5: { emoji: '🏆', plain: 'Ranking the best drug candidates' },
};

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { state, resetPipeline } = usePipeline();
  const isComplete = !!state.module5Data;
  const stage = STAGE_LABELS[state.currentStep];

  const completedCount = state.completedSteps.size;
  const progressPct = Math.round((completedCount / 5) * 100);

  return (
    <header className="h-14 bg-surface-container/90 border-b border-border-subtle/60 flex items-center justify-between px-4 z-50 shrink-0 backdrop-blur-sm">

      {/* Left: Menu + Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-surface-container-high text-text-muted hover:text-text-bright transition-colors"
          title="Toggle Navigation Panel"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <img
            src="/biohelix_logo.png"
            alt="BioHelix Logo"
            className="h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-text-bright tracking-tight">BioHelix</span>
              <span className="text-[10px] font-sans text-brand-indigo border border-brand-indigo/30 bg-brand-indigo/10 px-1.5 py-0.5 rounded-md font-semibold">
                Drug Discovery AI
              </span>
            </div>
            <div className="text-[9px] font-sans text-text-muted hidden sm:block">
              From DNA to Drug Candidate — 5 Guided Steps
            </div>
          </div>
        </div>
      </div>

      {/* Center: Dynamic Stage Status */}
      <div className="hidden md:flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #10B981, #6366F1)'
                  : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-text-muted">{completedCount}/5</span>
        </div>

        {/* Active step badge */}
        <div className="flex items-center gap-2 font-sans text-xs bg-surface-base border border-border-subtle px-4 py-1.5 rounded-full shadow-inner">
          <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-bio-emerald' : 'bg-brand-indigo animate-ping'}`} />
          <span className="text-text-muted">Now:</span>
          <span className={`font-semibold ${isComplete ? 'text-bio-emerald' : 'text-text-bright'}`}>
            {isComplete
              ? '🎉 Complete — Your Top Drug Leads Are Ready!'
              : `Step ${state.currentStep}: ${stage.emoji} ${stage.plain}`}
          </span>
        </div>
      </div>

      {/* Right: Reset */}
      <div className="flex items-center space-x-2">
        <button
          onClick={resetPipeline}
          className="flex items-center space-x-1.5 text-xs font-sans text-text-muted hover:text-text-bright bg-surface-container-high hover:bg-surface-container-highest border border-border-subtle px-3 py-1.5 rounded-lg transition-all active:scale-95"
          title="Start a new analysis session"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Over</span>
        </button>
      </div>
    </header>
  );
};
