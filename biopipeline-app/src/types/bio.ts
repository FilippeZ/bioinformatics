export interface DnaMotifResult {
  motif: string;
  startIndex: number;
  endIndex: number;
  found: boolean;
  matchType: 'regex' | 'suffix_tree';
}

export interface ProteinTargetData {
  dnaSequence: string;
  rnaSequence: string;
  proteinSequence: string;
  gcContent: number;
  sequenceLength: number;
  detectedMotif?: DnaMotifResult;
  geneName: string;
}

export interface EsmFoldStructureData {
  proteinSequence: string;
  pdbContent: string;
  meanPlddt: number;
  numResidues: number;
  source: 'ESMFold_API' | 'Local_PDB_Cache';
}

export interface AlignmentResultData {
  alignedQuery: string;
  alignedRef: string;
  score: number;
  identityPercent: number;
  similarityPercent: number;
  matchedDiseaseTarget: string;
}

export interface SingleAlignmentResult {
  id: string;
  name: string;
  alignment: AlignmentResultData & { matchedDiseaseTarget: string };
  description: string;
}

export interface TargetValidationData {
  alignment: AlignmentResultData;
  validityScore: number; // 0 to 100%
  isValidated: boolean;
  druggabilityCategory: 'High Druggability' | 'Moderate Druggability' | 'Low Druggability';
  features: {
    hydrophobicity: number;
    charge: number;
    molecularWeight: number;
  };
  allAlignments?: SingleAlignmentResult[];
}

export interface MoleculeData {
  id: string;
  name: string;
  smiles: string;
  mw: number;        // Molecular Weight (≤ 500)
  logP: number;      // Octanol-Water Partition (≤ 5)
  hbd: number;       // H-Bond Donors (≤ 5)
  hba: number;       // H-Bond Acceptors (≤ 10)
  tpsa: number;      // Topological Polar Surface Area (≤ 140)
  rotatableBonds: number;
  passesLipinski: boolean;
}

export interface LipinskiFilterSettings {
  maxMw: number;
  maxLogP: number;
  maxHbd: number;
  maxHba: number;
  maxTpsa: number;
}

export interface QsarPredictionResult {
  molecule: MoleculeData;
  bindingAffinityKi: number; // in nM
  pIC50: number;            // -log10(IC50)
  dockingScore: number;      // kcal/mol (negative is stronger)
  drugLikenessScore: number; // 0 - 1.0
  rank: number;
}

export interface PipelineState {
  currentStep: number;
  module1Data: ProteinTargetData | null;
  module2Data: EsmFoldStructureData | null;
  module3Data: TargetValidationData | null;
  module4Data: {
    rawMolecules: MoleculeData[];
    filteredMolecules: MoleculeData[];
    filters: LipinskiFilterSettings;
  } | null;
  module5Data: {
    predictions: QsarPredictionResult[];
    topCandidates: QsarPredictionResult[];
  } | null;
  isLoading: boolean;
  loadingMessage: string;
  completedSteps: Set<number>;
}
