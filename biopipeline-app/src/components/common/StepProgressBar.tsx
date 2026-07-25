import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { Dna, Box, CheckCircle2, Sliders, Award } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Ενότητα 1', label: 'DNA & Target Motifs', icon: Dna },
  { id: 2, name: 'Ενότητα 2', label: 'ESMFold 3D Structure', icon: Box },
  { id: 3, name: 'Ενότητα 3', label: 'Alignment & Validation', icon: CheckCircle2 },
  { id: 4, name: 'Ενότητα 4', label: 'SMILES Lipinski Filter', icon: Sliders },
  { id: 5, name: 'Ενότητα 5', label: 'QSAR AI Drug Ranking', icon: Award },
];

export const StepProgressBar: React.FC = () => {
  const { state, setStep } = usePipeline();

  return (
    <div className="bg-surface-container border-b border-border-subtle py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = state.currentStep === step.id;
            const isCompleted =
              (step.id === 1 && !!state.module1Data) ||
              (step.id === 2 && !!state.module2Data) ||
              (step.id === 3 && !!state.module3Data) ||
              (step.id === 4 && !!state.module4Data) ||
              (step.id === 5 && !!state.module5Data);

            const isClickable =
              step.id === 1 ||
              (step.id === 2 && !!state.module1Data) ||
              (step.id === 3 && !!state.module2Data) ||
              (step.id === 4 && !!state.module3Data) ||
              (step.id === 5 && !!state.module4Data);

            return (
              <button
                key={step.id}
                disabled={!isClickable}
                onClick={() => setStep(step.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all text-left relative overflow-hidden ${
                  isCurrent
                    ? 'bg-surface-container-high border-neon-green text-neon-green shadow-lg shadow-neon-green/10'
                    : isCompleted
                    ? 'bg-surface-base border-neon-green/40 text-text-bright hover:border-neon-green'
                    : 'bg-surface-base/50 border-border-subtle text-text-muted opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Status Indicator Pill */}
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-neon-green text-surface-base'
                      : isCompleted
                      ? 'bg-neon-green/20 text-neon-green'
                      : 'bg-surface-container-highest text-text-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {step.name}
                  </div>
                  <div className="text-xs font-semibold truncate text-text-bright">
                    {step.label}
                  </div>
                </div>

                {isCurrent && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
