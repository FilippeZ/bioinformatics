import type { MoleculeData, QsarPredictionResult } from '../../types/bio';

/**
 * Simulates Morgan Fingerprint feature extraction from SMILES
 * Returns a feature vector representing molecular substructures
 */
function computeMorganFeatures(smiles: string): number[] {
  const s = smiles.toLowerCase();
  return [
    (s.match(/c1ccccc1/g) || []).length * 1.2,       // benzene rings
    (s.match(/n/g) || []).length * 0.8,               // nitrogen atoms
    (s.match(/o/g) || []).length * 0.6,               // oxygen atoms
    (s.match(/f/g) || []).length * 0.5,               // fluorine (bioisostere)
    (s.match(/cl/g) || []).length * 0.7,              // chlorine
    (s.match(/c#n/g) || []).length * 1.1,             // nitrile groups
    (s.match(/c\(=o\)/g) || []).length * 0.9,         // carbonyl groups
    (s.match(/nc\(=o\)/g) || []).length * 1.3,        // amide bonds
    (s.match(/cc=o/g) || []).length * 0.4,            // ketones
    s.length * 0.01,                                   // size contribution
  ];
}

/**
 * Protein target binding site fingerprint from sequence
 */
function computeTargetFingerprint(targetSeq: string): number[] {
  const s = targetSeq.toUpperCase();
  const len = Math.max(s.length, 1);
  return [
    (s.match(/[FWY]/g) || []).length / len,   // aromatic residues (binding pocket)
    (s.match(/[HKR]/g) || []).length / len,   // positively charged (salt bridges)
    (s.match(/[DE]/g) || []).length / len,    // negatively charged
    (s.match(/[AILMV]/g) || []).length / len, // hydrophobic core
    (s.match(/C/g) || []).length / len,       // cysteine (disulfide bonds)
    (s.match(/[GP]/g) || []).length / len,    // flexibility residues
    len / 200.0,                               // size factor
    (s.match(/[ST]/g) || []).length / len,    // hydroxyl residues
  ];
}

/**
 * Random Forest QSAR Prediction Engine
 * Simulates a pre-trained RF model using tree ensemble logic
 */
export function predictQsarActivity(
  molecules: MoleculeData[],
  targetProteinSeq: string
): { predictions: QsarPredictionResult[]; topCandidates: QsarPredictionResult[] } {
  const targetFP = computeTargetFingerprint(targetProteinSeq);
  const targetLength = Math.max(targetProteinSeq.length, 50);

  // Protein type modifiers based on amino acid composition
  const hasAromaticBias = targetFP[0] > 0.05;
  const hasChargedBias = (targetFP[1] + targetFP[2]) > 0.15;
  const hydrophobicBias = targetFP[3] > 0.35;

  const predictions: QsarPredictionResult[] = molecules.map(mol => {
    const molFP = computeMorganFeatures(mol.smiles);
    const mwNorm = Math.max(0, 1.0 - Math.abs(mol.mw - 380) / 400);
    const logPNorm = Math.max(0, 1.0 - Math.abs(mol.logP - 2.5) / 5.0);
    const tpsaNorm = Math.max(0, 1.0 - Math.abs(mol.tpsa - 75) / 140);
    const hbRatio = (mol.hbd + 1) / Math.max(mol.hba + 1, 1);

    // Decision Tree 1: MW + LogP interaction
    const tree1 = mwNorm * 3.2 + logPNorm * 2.9 + (mol.passesLipinski ? 1.5 : 0);

    // Decision Tree 2: TPSA + H-bond complementarity to target
    const tree2 = tpsaNorm * 3.8 +
      (hasChargedBias ? (mol.hba > 5 ? 1.2 : 0) : 0) +
      (hydrophobicBias ? logPNorm * 1.5 : 0);

    // Decision Tree 3: Molecular fingerprint × target fingerprint dot product
    const fpInteraction = molFP.slice(0, targetFP.length).reduce((sum, f, i) =>
      sum + f * (targetFP[i] || 0), 0);
    const tree3 = Math.min(3.5, fpInteraction * 0.8 + (targetLength % 17) * 0.05);

    // Decision Tree 4: Aromatic/halogen complementarity
    const tree4 = (hasAromaticBias ? molFP[0] * 0.8 : 0) +
      (molFP[3] * 0.5) + // fluorine bonus
      hbRatio * 0.4;

    // Ensemble average with random variance seeded by molecule ID
    const seed = mol.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const noise = ((seed % 23) - 11) * 0.04;

    const rawScore = (tree1 + tree2 + tree3 + tree4) / 1.4 + noise;
    const pIC50 = Number(Math.min(9.8, Math.max(4.2, rawScore)).toFixed(2));
    const bindingAffinityKi = Number(Math.pow(10, 9 - pIC50).toFixed(1));
    const dockingScore = Number((-1.36 * pIC50).toFixed(2));
    const drugLikenessScore = Number(Math.min(0.99, (pIC50 / 10) * 1.05).toFixed(2));

    return {
      molecule: mol,
      bindingAffinityKi,
      pIC50,
      dockingScore,
      drugLikenessScore,
      rank: 0
    };
  });

  predictions.sort((a, b) => b.pIC50 - a.pIC50);
  predictions.forEach((pred, index) => { pred.rank = index + 1; });

  const topCandidates = predictions.slice(0, 3);
  return { predictions, topCandidates };
}
