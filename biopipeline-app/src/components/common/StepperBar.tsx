import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { Dna, Box, ShieldCheck, Beaker, Trophy, ChevronRight, Lock } from 'lucide-react';

const STEPS = [
  { id: 1, icon: Dna,         label: 'Ingestion & Target Parsing',   short: 'Ingestion',    color: 'neon-green' },
  { id: 2, icon: Box,         label: 'ESMFold 3D Structure',          short: 'ESMFold',      color: 'neon-blue' },
  { id: 3, icon: ShieldCheck, label: 'Target Validation Gate',        short: 'Validation',   color: 'neon-green' },
  { id: 4, icon: Beaker,      label: 'Cheminformatics Filter',        short: 'Cheminform.',  color: 'accent-amber' },
  { id: 5, icon: Trophy,      label: 'QSAR Predictive Engine',        short: 'QSAR',         color: 'neon-green' },
];

export const StepperBar: React.FC = () => {
  const { state, setStep, isStepAccessible } = usePipeline();

  const isStepDone = (id: number) => {
    if (id === 1) return !!state.module1Data;
    if (id === 2) return !!state.module2Data;
    if (id === 3) return !!state.module3Data;
    if (id === 4) return !!state.module4Data && !!state.module5Data;
    if (id === 5) return !!state.module5Data;
    return false;
  };

  return (
    <div className="bg-surface-container border-b border-border-subtle px-4 py-2.5 shrink-0">
      <div className="flex items-center space-x-1 overflow-x-auto min-w-0">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = state.currentStep === step.id;
          const isDone = isStepDone(step.id);
          const accessible = isStepAccessible(step.id);
          const locked = !accessible;

          return (
            <React.Fragment key={step.id}>
              <button
                disabled={locked}
                onClick={() => accessible && setStep(step.id)}
                title={locked ? `Complete Step ${step.id - 1} first` : step.label}
                className={`
                  relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold
                  whitespace-nowrap transition-all duration-200 shrink-0 border group
                  ${isCurrent
                    ? 'bg-neon-green/15 border-neon-green text-neon-green shadow-sm shadow-neon-green/20'
                    : isDone && accessible
                      ? 'bg-surface-base border-neon-green/40 text-text-bright hover:border-neon-green hover:bg-surface-container-high cursor-pointer'
                      : accessible
                        ? 'bg-surface-base border-border-subtle text-text-muted hover:text-text-bright hover:border-border-subtle cursor-pointer hover:bg-surface-container-high'
                        : 'bg-surface-base/50 border-border-subtle/30 text-text-muted/30 cursor-not-allowed opacity-40'
                  }
                `}
              >
                {/* Step number / check / lock badge */}
                <div className={`
                  w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 transition-all
                  ${isCurrent
                    ? 'bg-neon-green text-surface-base'
                    : isDone && accessible
                      ? 'bg-neon-green/20 text-neon-green'
                      : locked
                        ? 'bg-surface-container text-text-muted/30'
                        : 'bg-surface-container-high text-text-muted'
                  }
                `}>
                  {locked ? <Lock className="w-2.5 h-2.5" /> : isDone && !isCurrent ? '✓' : step.id}
                </div>

                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{step.short}</span>

                {/* Active pulse indicator */}
                {isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-green rounded-full animate-ping opacity-75" />
                )}
              </button>

              {idx < STEPS.length - 1 && (
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isDone && isStepAccessible(step.id + 1) ? 'text-neon-green/50' : 'text-border-subtle'}`} />
              )}
            </React.Fragment>
          );
        })}

        {/* Loading badge */}
        {state.isLoading && (
          <div className="ml-4 flex items-center gap-2 text-[10px] font-mono text-neon-blue animate-pulse shrink-0">
            <div className="w-2 h-2 rounded-full bg-neon-blue animate-ping" />
            {state.loadingMessage || 'Processing...'}
          </div>
        )}
      </div>
    </div>
  );
};
