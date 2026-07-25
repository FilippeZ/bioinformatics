import React, { createContext, useContext, useState } from 'react';
import type {
  PipelineState,
  MoleculeData,
  LipinskiFilterSettings
} from '../types/bio';
import { processModule1DnaInput } from '../lib/algorithms/dnaParser';
import { predictProtein3DStructure } from '../lib/algorithms/esmFoldApi';
import { evaluateTargetValidity } from '../lib/algorithms/alignment';
import { generate1000MoleculeDataset, filterMoleculesByLipinski, calculateLipinskiDescriptors } from '../lib/algorithms/lipinskiFilter';
import { predictQsarActivity } from '../lib/algorithms/qsarModel';

interface PipelineContextType {
  state: PipelineState;
  setStep: (step: number) => void;
  runModule1: (dna: string, pattern?: string, geneName?: string) => void;
  runModule2: () => Promise<void>;
  runModule3: (matchScore?: number, mismatchPenalty?: number, gapPenalty?: number) => void;
  updateModule4Filters: (filters: LipinskiFilterSettings) => void;
  uploadModule4Csv: (csvContent: string) => void;
  runModule5: () => void;
  resetPipeline: () => void;
  isStepAccessible: (step: number) => boolean;
}

const DEFAULT_FILTERS: LipinskiFilterSettings = {
  maxMw: 500,
  maxLogP: 5.0,
  maxHbd: 5,
  maxHba: 10,
  maxTpsa: 140
};

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

const initialMod1 = processModule1DnaInput('');

const INITIAL_STATE: PipelineState = {
  currentStep: 1,
  module1Data: initialMod1,
  module2Data: null,
  module3Data: null,
  module4Data: null,
  module5Data: null,
  isLoading: false,
  loadingMessage: '',
  completedSteps: new Set<number>([1])
};

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const runModule1 = (dna: string, pattern?: string, geneName?: string) => {
    const mod1Data = processModule1DnaInput(dna, pattern, geneName);
    setState(prev => ({
      ...prev,
      module1Data: mod1Data,
      module2Data: null,
      module3Data: null,
      module4Data: null,
      module5Data: null,
      completedSteps: new Set([1])
    }));
  };

  const runModule2 = async () => {
    if (!state.module1Data) return;
    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingMessage: '⚡ Running Meta ESMFold AI Model — Predicting 3D Protein Structure...'
    }));

    try {
      const mod2Data = await predictProtein3DStructure(state.module1Data.proteinSequence);
      setState(prev => ({
        ...prev,
        module2Data: mod2Data,
        isLoading: false,
        currentStep: 2,
        completedSteps: new Set([...prev.completedSteps, 2])
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const runModule3 = (matchScore = 2, mismatchPenalty = -1, gapPenalty = -2) => {
    if (!state.module1Data) return;

    const mod3Data = evaluateTargetValidity(
      state.module1Data.proteinSequence,
      matchScore,
      mismatchPenalty,
      gapPenalty
    );

    const rawMolecules = generate1000MoleculeDataset();
    const filteredMolecules = filterMoleculesByLipinski(rawMolecules, DEFAULT_FILTERS);

    setState(prev => ({
      ...prev,
      module3Data: mod3Data,
      module4Data: {
        rawMolecules,
        filteredMolecules,
        filters: DEFAULT_FILTERS
      },
      currentStep: 3,
      completedSteps: new Set([...prev.completedSteps, 3])
    }));
  };

  const updateModule4Filters = (filters: LipinskiFilterSettings) => {
    if (!state.module4Data) return;
    const filteredMolecules = filterMoleculesByLipinski(state.module4Data.rawMolecules, filters);
    setState(prev => ({
      ...prev,
      module4Data: {
        ...prev.module4Data!,
        filters,
        filteredMolecules
      }
    }));
  };

  const uploadModule4Csv = (csvContent: string) => {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const customMols: MoleculeData[] = [];

    // Detect header
    const firstLine = lines[0]?.toLowerCase() || '';
    const hasHeader = firstLine.includes('smiles') || firstLine.includes('name') || firstLine.includes('mw');
    const startIdx = hasHeader ? 1 : 0;

    lines.slice(startIdx).forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 1) {
        const smiles = parts[0].trim();
        const name = parts[1]?.trim() || `CSV-Compound-${idx + 1}`;
        if (smiles && smiles.length > 3 && !smiles.toLowerCase().includes('smiles')) {
          const mol = calculateLipinskiDescriptors(smiles, name, `CSV-${idx + 1}`);
          customMols.push(mol);
        }
      }
    });

    if (customMols.length > 0) {
      const filtered = filterMoleculesByLipinski(customMols, DEFAULT_FILTERS);
      setState(prev => ({
        ...prev,
        module4Data: {
          rawMolecules: customMols,
          filteredMolecules: filtered,
          filters: DEFAULT_FILTERS
        }
      }));
    }
  };

  const runModule5 = () => {
    if (!state.module4Data || !state.module1Data) return;
    const candidatesToScore = state.module4Data.filteredMolecules;
    const { predictions, topCandidates } = predictQsarActivity(
      candidatesToScore,
      state.module1Data.proteinSequence
    );

    setState(prev => ({
      ...prev,
      module5Data: { predictions, topCandidates },
      currentStep: 5,
      completedSteps: new Set([...prev.completedSteps, 4, 5])
    }));
  };

  const resetPipeline = () => {
    setState({ ...INITIAL_STATE, completedSteps: new Set([1]) });
  };

  /**
   * Step accessibility gate:
   * - Step 1: always accessible
   * - Step 2: accessible when module1Data exists
   * - Step 3: accessible when module2Data exists OR module1Data exists (allow skipping 3D if desired)
   * - Step 4: accessible when module3Data exists AND isValidated
   * - Step 5: accessible when module4Data exists
   */
  const isStepAccessible = (step: number): boolean => {
    switch (step) {
      case 1: return true;
      case 2: return !!state.module1Data;
      case 3: return !!state.module1Data;
      case 4: return !!state.module3Data && state.module3Data.isValidated;
      case 5: return !!state.module4Data && state.module4Data.filteredMolecules.length > 0;
      default: return false;
    }
  };

  return (
    <PipelineContext.Provider
      value={{
        state,
        setStep,
        runModule1,
        runModule2,
        runModule3,
        updateModule4Filters,
        uploadModule4Csv,
        runModule5,
        resetPipeline,
        isStepAccessible
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
