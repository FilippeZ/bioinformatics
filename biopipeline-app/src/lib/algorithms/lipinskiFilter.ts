import type { LipinskiFilterSettings, MoleculeData } from '../../types/bio';

const DRUG_LIBRARY: Array<{ name: string; smiles: string; mw: number; logP: number; hbd: number; hba: number; tpsa: number; rotatableBonds: number }> = [
  { name: 'Paxlovid (Nirmatrelvir)', smiles: 'CC1(C2C1C(N(C2)C(=O)C(C(C)(C)C)NC(=O)C(F)(F)F)C(=O)NC(CC3CCNC3=O)C#N)C', mw: 499.5, logP: 2.7, hbd: 3, hba: 7, tpsa: 107.1, rotatableBonds: 8 },
  { name: 'Imatinib (Gleevec)', smiles: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5', mw: 493.6, logP: 3.73, hbd: 2, hba: 7, tpsa: 86.3, rotatableBonds: 7 },
  { name: 'Remdesivir', smiles: 'CCC(CC)COC(=O)C(C)NP(=O)(OCC1C(C(C(O1)(C#N)C2=CC=C3N2N=CN=C3N)O)O)OC4=CC=CC=C4', mw: 602.6, logP: 1.05, hbd: 2, hba: 12, tpsa: 154.5, rotatableBonds: 13 },
  { name: 'Aspirin (Acetylsalicylic Acid)', smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O', mw: 180.2, logP: 1.19, hbd: 1, hba: 4, tpsa: 63.6, rotatableBonds: 3 },
  { name: 'Ibuprofen', smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O', mw: 206.3, logP: 3.97, hbd: 1, hba: 2, tpsa: 37.3, rotatableBonds: 4 },
  { name: 'Paracetamol (Acetaminophen)', smiles: 'CC(=O)NC1=CC=C(C=C1)O', mw: 151.2, logP: 0.46, hbd: 2, hba: 3, tpsa: 49.3, rotatableBonds: 2 },
  { name: 'Metformin', smiles: 'CN(C)C(=N)NC(=N)N', mw: 129.2, logP: -1.43, hbd: 3, hba: 3, tpsa: 91.0, rotatableBonds: 2 },
  { name: 'Ciprofloxacin', smiles: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O', mw: 331.4, logP: 0.28, hbd: 2, hba: 6, tpsa: 75.0, rotatableBonds: 4 },
  { name: 'Atorvastatin (Lipitor)', smiles: 'CC(C)C1=C(C(=C(N1CCC(CC(CC(=O)O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4', mw: 558.6, logP: 4.46, hbd: 4, hba: 7, tpsa: 111.9, rotatableBonds: 13 },
  { name: 'Penicillin G', smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C', mw: 334.4, logP: 1.83, hbd: 2, hba: 5, tpsa: 83.5, rotatableBonds: 4 },
  { name: 'Gefitinib (Iressa)', smiles: 'COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4', mw: 446.9, logP: 3.82, hbd: 1, hba: 8, tpsa: 68.7, rotatableBonds: 9 },
  { name: 'Oseltamivir (Tamiflu)', smiles: 'CCOC(=O)C1=C[C@@H](OC(CC)CC)[C@@H](NC(C)=O)[C@H](N)C1', mw: 312.4, logP: 0.36, hbd: 2, hba: 5, tpsa: 92.3, rotatableBonds: 7 },
  { name: 'Dexamethasone', smiles: 'CC1CC2C3CCC4=CC(=O)C=CC4(C3(FC2(C1(C(=O)CO)O)C)O)C', mw: 392.5, logP: 1.83, hbd: 3, hba: 5, tpsa: 94.8, rotatableBonds: 3 },
  { name: 'Favipiravir (Avigan)', smiles: 'C1=C(N=C(C(=O)N1)C(=O)N)F', mw: 157.1, logP: -0.64, hbd: 2, hba: 5, tpsa: 82.2, rotatableBonds: 1 },
  { name: 'Molnupiravir', smiles: 'CC(C)C(=O)OCC1C(C(C(O1)N2C=CC(=NC2=O)NO)O)O', mw: 352.3, logP: -0.7, hbd: 4, hba: 8, tpsa: 125.0, rotatableBonds: 7 },
  { name: 'Erlotinib (Tarceva)', smiles: 'C#CCOc1cc2ncnc(Nc3ccc(CCF)cc3)c2cc1OCCO', mw: 393.4, logP: 2.76, hbd: 1, hba: 7, tpsa: 74.9, rotatableBonds: 8 },
  { name: 'Lapatinib (Tykerb)', smiles: 'CS(=O)(=O)CCNCc1ccc(-c2ccc3ncnc(Nc4ccc(OCc5cccc(F)c5)c(Cl)c4)c3c2)o1', mw: 581.1, logP: 4.55, hbd: 2, hba: 8, tpsa: 107.4, rotatableBonds: 11 },
  { name: 'Venetoclax (Venclyxto)', smiles: 'CC1(CCC(=C1)c2ccc(cc2)N3CCN(CC3)c4ccc(cc4)C(=O)NS(=O)(=O)c5ccc(c(c5)C(F)(F)F)NS(=O)(=O)CC6CC6)C', mw: 868.1, logP: 6.88, hbd: 3, hba: 11, tpsa: 163.3, rotatableBonds: 11 },
  { name: 'Methotrexate', smiles: 'CN(Cc1cnc2nc(N)nc(N)c2n1)c3ccc(cc3)C(=O)NC(CCC(=O)O)C(=O)O', mw: 454.4, logP: -1.85, hbd: 5, hba: 12, tpsa: 210.3, rotatableBonds: 10 },
  { name: 'Doxorubicin', smiles: 'COc1cccc2C(=O)c3c(O)c4C[C@@](O)(C[C@H]4c3C(=O)c12)C(=O)CO.[C@@H]1([C@H]([C@@H]([C@H](CO1)O)O)N)O', mw: 543.5, logP: 1.27, hbd: 6, hba: 12, tpsa: 206.1, rotatableBonds: 6 },
  { name: 'Tamoxifen', smiles: 'CCC(=C(c1ccccc1)c2ccc(OCCN(C)C)cc2)c3ccccc3', mw: 371.5, logP: 6.3, hbd: 0, hba: 2, tpsa: 21.3, rotatableBonds: 7 },
  { name: 'Anastrozole (Arimidex)', smiles: 'CC(C)(C#N)c1ccc(cc1)Cc2cnnn2-c3ccc(cc3)CC(C)(C)C#N', mw: 293.4, logP: 3.09, hbd: 0, hba: 5, tpsa: 56.3, rotatableBonds: 4 },
  { name: 'Sunitinib (Sutent)', smiles: 'CCN(CC)CCNC(=O)c1c(C)[nH]c(\C=C2/C(=O)Nc3ccc(F)cc23)c1C', mw: 398.5, logP: 3.05, hbd: 3, hba: 5, tpsa: 77.2, rotatableBonds: 7 },
  { name: 'Sorafenib (Nexavar)', smiles: 'CNC(=O)c1cc(ccn1)Oc2ccc(cc2)NC(=O)Nc3ccc(c(c3)Cl)C(F)(F)F', mw: 464.8, logP: 3.76, hbd: 3, hba: 7, tpsa: 92.4, rotatableBonds: 7 },
  { name: 'Crizotinib (Xalkori)', smiles: 'Cl.CC(c1cnc(Nc2ccc(cc2F)Cl)nc1)Oc3cc(cnc3)N4CCHCC4F', mw: 450.3, logP: 3.17, hbd: 2, hba: 6, tpsa: 71.6, rotatableBonds: 6 },
];

export function calculateLipinskiDescriptors(smiles: string, name: string, id: string): MoleculeData {
  // Use known values if available
  const known = DRUG_LIBRARY.find(d => d.smiles === smiles || d.name === name);
  if (known) {
    const passesLipinski = known.mw <= 500 && known.logP <= 5 && known.hbd <= 5 && known.hba <= 10 && known.tpsa <= 140;
    return { id, name: known.name, smiles: known.smiles, mw: known.mw, logP: known.logP, hbd: known.hbd, hba: known.hba, tpsa: known.tpsa, rotatableBonds: known.rotatableBonds, passesLipinski };
  }

  const cleanSmiles = smiles.trim();
  const len = Math.max(cleanSmiles.length, 5);

  // More accurate atom counting from SMILES
  const carbonCount = (cleanSmiles.match(/(?<![A-Z])C(?![a-z]|l)/g) || []).length;
  const nitrogenCount = (cleanSmiles.match(/(?<![A-Z])N(?![a-z])/g) || []).length;
  const oxygenCount = (cleanSmiles.match(/(?<![A-Z])O(?![a-z])/g) || []).length;
  const fluorineCount = (cleanSmiles.match(/(?<![A-Z])F(?![a-z])/g) || []).length;
  const chlorineCount = (cleanSmiles.match(/Cl/g) || []).length;
  const sulfurCount = (cleanSmiles.match(/(?<![A-Z])S(?![a-z])/g) || []).length;
  const ringCount = (cleanSmiles.match(/[0-9]/g) || []).length / 2;

  const mw = Number((
    carbonCount * 12.011 +
    nitrogenCount * 14.007 +
    oxygenCount * 15.999 +
    fluorineCount * 18.998 +
    chlorineCount * 35.453 +
    sulfurCount * 32.06 +
    (len * 0.6) * 1.008 +
    ringCount * 4
  ).toFixed(1));

  const logP = Number((
    (carbonCount * 0.35) -
    (nitrogenCount * 0.5) -
    (oxygenCount * 0.6) +
    (fluorineCount * 0.25) +
    (chlorineCount * 0.6) +
    (sulfurCount * 0.45) -
    (ringCount * 0.2)
  ).toFixed(2));

  const hbd = Math.min(10, (cleanSmiles.match(/OH|NH|[nN]h/gi) || []).length || Math.floor((oxygenCount + nitrogenCount) * 0.35));
  const hba = Math.min(15, nitrogenCount + oxygenCount);
  const tpsa = Number(Math.max(12, nitrogenCount * 12.0 + oxygenCount * 20.2 + sulfurCount * 28.2).toFixed(1));
  const rotatableBonds = Math.max(0, Math.floor(len / 10) + (cleanSmiles.match(/-(?![0-9])/g) || []).length);
  const passesLipinski = mw <= 500 && logP <= 5 && hbd <= 5 && hba <= 10 && tpsa <= 140;

  return {
    id, name, smiles: cleanSmiles,
    mw: Math.max(90, Math.min(900, mw)),
    logP: Math.max(-5, Math.min(10, logP)),
    hbd: Math.min(10, hbd),
    hba: Math.min(15, hba),
    tpsa: Math.max(12, Math.min(300, tpsa)),
    rotatableBonds: Math.min(15, rotatableBonds),
    passesLipinski
  };
}

export function generate1000MoleculeDataset(): MoleculeData[] {
  const molecules: MoleculeData[] = [];

  for (let i = 0; i < 1000; i++) {
    const baseIdx = i % DRUG_LIBRARY.length;
    const base = DRUG_LIBRARY[baseIdx];
    const molId = `MOL-${(i + 1).toString().padStart(4, '0')}`;
    const isOriginal = i < DRUG_LIBRARY.length;

    if (isOriginal) {
      const passesLipinski = base.mw <= 500 && base.logP <= 5 && base.hbd <= 5 && base.hba <= 10 && base.tpsa <= 140;
      molecules.push({ id: molId, name: base.name, smiles: base.smiles, mw: base.mw, logP: base.logP, hbd: base.hbd, hba: base.hba, tpsa: base.tpsa, rotatableBonds: base.rotatableBonds, passesLipinski });
    } else {
      // Generate derivative with systematic variation
      const variantIdx = Math.floor(i / DRUG_LIBRARY.length);
      const mwMod = (variantIdx % 7) * 18 - 18; // -18 to +108 variation
      const logPMod = ((variantIdx % 5) - 2) * 0.4; // -0.8 to +0.8
      const hbdMod = (variantIdx % 3) - 1;
      const hbaMod = (variantIdx % 4) - 2;
      const tpsaMod = (variantIdx % 5) * 8 - 8;

      const mw = Math.max(90, Math.min(800, base.mw + mwMod));
      const logP = Math.max(-3, Math.min(8, base.logP + logPMod));
      const hbd = Math.max(0, Math.min(8, base.hbd + hbdMod));
      const hba = Math.max(0, Math.min(14, base.hba + hbaMod));
      const tpsa = Math.max(12, Math.min(250, base.tpsa + tpsaMod));
      const passesLipinski = mw <= 500 && logP <= 5 && hbd <= 5 && hba <= 10 && tpsa <= 140;

      molecules.push({
        id: molId,
        name: `${base.name} Deriv-${variantIdx}`,
        smiles: base.smiles,
        mw: Number(mw.toFixed(1)),
        logP: Number(logP.toFixed(2)),
        hbd,
        hba,
        tpsa: Number(tpsa.toFixed(1)),
        rotatableBonds: Math.max(0, base.rotatableBonds + (variantIdx % 3) - 1),
        passesLipinski
      });
    }
  }

  return molecules;
}

export function filterMoleculesByLipinski(
  molecules: MoleculeData[],
  filters: LipinskiFilterSettings
): MoleculeData[] {
  const filtered = molecules.filter(m =>
    m.mw <= filters.maxMw &&
    m.logP <= filters.maxLogP &&
    m.hbd <= filters.maxHbd &&
    m.hba <= filters.maxHba &&
    m.tpsa <= filters.maxTpsa
  );
  // Cap at 50 for Module 5
  return filtered.slice(0, 50);
}
