import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { Dna, Box, ShieldCheck, Beaker, Trophy, Lock, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: Dna,
    emoji: '🧬',
    label: 'Read the DNA',
    sublabel: 'Decode genetic code',
    accentClass: 'border-bio-emerald/60 text-bio-emerald bg-bio-emerald/10',
    activeClass: 'border-bio-emerald text-bio-emerald bg-bio-emerald/15 shadow-bio-emerald/20',
    dotClass: 'bg-bio-emerald',
    connectorActive: '#10B981',
  },
  {
    id: 2,
    icon: Box,
    emoji: '🤖',
    label: 'Build 3D Model',
    sublabel: 'AI protein folding',
    accentClass: 'border-bio-sky/60 text-bio-sky bg-bio-sky/10',
    activeClass: 'border-bio-sky text-bio-sky bg-bio-sky/15 shadow-bio-sky/20',
    dotClass: 'bg-bio-sky',
    connectorActive: '#38BDF8',
  },
  {
    id: 3,
    icon: ShieldCheck,
    emoji: '✅',
    label: 'Confirm Target',
    sublabel: 'Drug suitability check',
    accentClass: 'border-brand-violet/60 text-brand-violet bg-brand-violet/10',
    activeClass: 'border-brand-violet text-brand-violet bg-brand-violet/15 shadow-brand-violet/20',
    dotClass: 'bg-brand-violet',
    connectorActive: '#8B5CF6',
  },
  {
    id: 4,
    icon: Beaker,
    emoji: '🧪',
    label: 'Screen Molecules',
    sublabel: 'Filter 1,000 compounds',
    accentClass: 'border-bio-amber/60 text-bio-amber bg-bio-amber/10',
    activeClass: 'border-bio-amber text-bio-amber bg-bio-amber/15 shadow-bio-amber/20',
    dotClass: 'bg-bio-amber',
    connectorActive: '#F59E0B',
  },
  {
    id: 5,
    icon: Trophy,
    emoji: '🏆',
    label: 'Find Best Drug',
    sublabel: 'AI drug ranking',
    accentClass: 'border-brand-indigo/60 text-brand-indigo bg-brand-indigo/10',
    activeClass: 'border-brand-indigo text-brand-indigo bg-brand-indigo/15 shadow-brand-indigo/20',
    dotClass: 'bg-brand-indigo',
    connectorActive: '#6366F1',
  },
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
    <div className="bg-surface-container/80 border-b border-border-subtle/60 px-4 py-3 shrink-0 backdrop-blur-sm">
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = state.currentStep === step.id;
          const isDone = isStepDone(step.id);
          const accessible = isStepAccessible(step.id);
          const locked = !accessible;

          return (
            <React.Fragment key={step.id}>
              {/* Step button */}
              <button
                disabled={locked}
                onClick={() => accessible && setStep(step.id)}
                title={locked ? `Complete Step ${step.id - 1} first to unlock this step` : step.label}
                aria-current={isCurrent ? 'step' : undefined}
                className={`
                  relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-semibold
                  whitespace-nowrap transition-all duration-200 shrink-0 border group shadow-sm
                  ${isCurrent
                    ? `${step.activeClass} shadow-md`
                    : isDone && accessible
                      ? `${step.accentClass} hover:shadow-md cursor-pointer opacity-90 hover:opacity-100`
                      : accessible
                        ? 'bg-surface-base border-border-subtle text-text-muted hover:text-text-bright hover:border-border-subtle cursor-pointer hover:bg-surface-container-high'
                        : 'bg-surface-base/40 border-border-subtle/20 text-text-muted/30 cursor-not-allowed opacity-40'
                  }
                `}
              >
                {/* Step number / check / lock */}
                <div className={`
                  w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0
                  ${isCurrent
                    ? 'bg-current/20 text-current'
                    : isDone && accessible
                      ? 'bg-current/15 text-current'
                      : locked
                        ? 'bg-surface-container text-text-muted/30'
                        : 'bg-surface-container-high text-text-muted'
                  }
                `}>
                  {locked
                    ? <Lock className="w-2.5 h-2.5" />
                    : isDone && !isCurrent
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <span>{step.id}</span>
                  }
                </div>

                <Icon className="w-3.5 h-3.5 shrink-0" />

                <span className="hidden lg:block">
                  {step.label}
                  <span className="hidden xl:block text-[9px] font-normal opacity-70 ml-1">— {step.sublabel}</span>
                </span>
                <span className="lg:hidden text-[10px]">{step.emoji}</span>

                {/* Active pulse */}
                {isCurrent && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping opacity-60 ${step.dotClass}`} />
                )}
              </button>

              {/* Connector between steps */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-1 min-w-[12px]">
                  <div
                    className="h-0.5 rounded-full transition-all duration-700"
                    style={{
                      background: isDone && isStepAccessible(step.id + 1)
                        ? `linear-gradient(90deg, ${step.connectorActive}, ${STEPS[idx + 1].connectorActive})`
                        : '#1E3050',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Loading badge */}
        {state.isLoading && (
          <div className="ml-4 flex items-center gap-2 text-[10px] font-sans text-brand-indigo animate-pulse shrink-0 bg-brand-indigo/10 border border-brand-indigo/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-ping" />
            {state.loadingMessage || 'Processing…'}
          </div>
        )}
      </div>
    </div>
  );
};
