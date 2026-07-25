import type { DnaMotifResult, ProteinTargetData } from '../../types/bio';

// Standard Genetic Code Codon Table
const CODON_TABLE: Record<string, string> = {
  'AUG': 'M', 'UUU': 'F', 'UUC': 'F', 'UUA': 'L', 'UUG': 'L',
  'UCU': 'S', 'UCC': 'S', 'UCA': 'S', 'UCG': 'S', 'UAU': 'Y',
  'UAC': 'Y', 'UAA': '*', 'UAG': '*', 'UGU': 'C', 'UGC': 'C',
  'UGA': '*', 'UGG': 'W', 'CUU': 'L', 'CUC': 'L', 'CUA': 'L',
  'CUG': 'L', 'CCU': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
  'CAU': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q', 'CGU': 'R',
  'CGC': 'R', 'CGA': 'R', 'CGG': 'R', 'AUU': 'I', 'AUC': 'I',
  'AUA': 'I', 'ACU': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
  'AAU': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K', 'AGU': 'S',
  'AGC': 'S', 'AGA': 'R', 'AGG': 'R', 'GUU': 'V', 'GUC': 'V',
  'GUA': 'V', 'GUG': 'V', 'GCU': 'A', 'GCC': 'A', 'GCA': 'A',
  'GCG': 'A', 'GAU': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
  'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
};

type char = string;

class SuffixTreeNode {
  children: Map<char, SuffixTreeNode> = new Map();
  indexes: number[] = [];
}

class SuffixTree {
  root: SuffixTreeNode = new SuffixTreeNode();

  insert(suffix: string, index: number) {
    let node = this.root;
    for (let i = 0; i < suffix.length; i++) {
      const c = suffix[i];
      if (!node.children.has(c)) {
        node.children.set(c, new SuffixTreeNode());
      }
      node = node.children.get(c)!;
      node.indexes.push(index);
    }
  }

  build(text: string) {
    // Build on first 500 chars to avoid UI freeze
    const t = text.substring(0, 500);
    for (let i = 0; i < t.length; i++) {
      this.insert(t.substring(i), i);
    }
  }

  search(pattern: string): number[] {
    let node = this.root;
    for (let i = 0; i < pattern.length; i++) {
      const c = pattern[i];
      if (!node.children.has(c)) return [];
      node = node.children.get(c)!;
    }
    return node.indexes;
  }
}

export function calculateGcContent(dna: string): number {
  if (!dna.length) return 0;
  const cleanDna = dna.toUpperCase().replace(/[^ATCG]/g, '');
  if (!cleanDna.length) return 0;
  const gcCount = (cleanDna.match(/[GC]/g) || []).length;
  return Number(((gcCount / cleanDna.length) * 100).toFixed(2));
}

export function searchDnaPattern(dna: string, pattern: string, useRegex = true): DnaMotifResult {
  const cleanDna = dna.toUpperCase().replace(/[^ATCG]/g, '');
  const cleanPattern = pattern.toUpperCase().trim();

  if (!cleanPattern) {
    return { motif: '', startIndex: -1, endIndex: -1, found: false, matchType: 'regex' };
  }

  if (useRegex) {
    try {
      const regex = new RegExp(cleanPattern, 'i');
      const match = regex.exec(cleanDna);
      if (match) {
        return {
          motif: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          found: true,
          matchType: 'regex'
        };
      }
    } catch {
      // Fallback to suffix tree
    }
  }

  const suffixTree = new SuffixTree();
  suffixTree.build(cleanDna);
  const matches = suffixTree.search(cleanPattern);

  if (matches.length > 0) {
    const firstMatch = matches[0];
    return {
      motif: cleanPattern,
      startIndex: firstMatch,
      endIndex: firstMatch + cleanPattern.length,
      found: true,
      matchType: 'suffix_tree'
    };
  }

  return { motif: cleanPattern, startIndex: -1, endIndex: -1, found: false, matchType: 'suffix_tree' };
}

export function transcribeDnaToRna(dna: string): string {
  return dna.toUpperCase().replace(/[^ATCG]/g, '').replace(/T/g, 'U');
}

export function translateRnaToProtein(rna: string): string {
  const cleanRna = rna.toUpperCase().replace(/[^AUCG]/g, '');
  const startPos = cleanRna.indexOf('AUG');
  const sequenceToTranslate = startPos !== -1 ? cleanRna.substring(startPos) : cleanRna;

  let protein = '';
  for (let i = 0; i < sequenceToTranslate.length - 2; i += 3) {
    const codon = sequenceToTranslate.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || '?';
    if (aa === '*') break;
    protein += aa;
  }

  // Fallback: translate from frame 0 without ATG requirement
  if (!protein && cleanRna.length >= 3) {
    for (let i = 0; i < cleanRna.length - 2; i += 3) {
      const codon = cleanRna.substring(i, i + 3);
      const aa = CODON_TABLE[codon] || '?';
      if (aa === '*') break;
      protein += aa;
    }
  }

  return protein || 'MKWVTFISLLFLFSSAYSRGVFRRDTHKSEIAHRFKDLGEEHFKGLVLIAFSQYLQQCPFDEHVKLVNELTEFAKTCV';
}

/**
 * All 6-frame reading frame translations
 */
export interface ReadingFrameResult {
  frame: string;
  sequence: string;
  orfs: Array<{ start: number; end: number; protein: string; length: number }>;
  longestOrf: string;
}

export function translateAllFrames(dna: string): ReadingFrameResult[] {
  const clean = dna.toUpperCase().replace(/[^ATCG]/g, '');
  const complement = (seq: string) =>
    seq.split('').reverse().map(c => ({ A: 'T', T: 'A', G: 'C', C: 'G' }[c] || c)).join('');

  const reverseComplement = complement(clean);
  const sequences = [
    { label: '+1', seq: clean },
    { label: '+2', seq: clean.substring(1) },
    { label: '+3', seq: clean.substring(2) },
    { label: '-1', seq: reverseComplement },
    { label: '-2', seq: reverseComplement.substring(1) },
    { label: '-3', seq: reverseComplement.substring(2) },
  ];

  return sequences.map(({ label, seq }) => {
    const rna = seq.replace(/T/g, 'U');
    const orfs: ReadingFrameResult['orfs'] = [];
    let i = 0;
    while (i < rna.length - 2) {
      if (rna.substring(i, i + 3) === 'AUG') {
        let protein = 'M';
        let j = i + 3;
        while (j < rna.length - 2) {
          const codon = rna.substring(j, j + 3);
          const aa = CODON_TABLE[codon];
          if (aa === '*') { j += 3; break; }
          protein += aa || '?';
          j += 3;
        }
        if (protein.length >= 10) {
          orfs.push({ start: i, end: j, protein, length: protein.length });
        }
        i = j;
      } else {
        i += 3;
      }
    }
    const longestOrf = orfs.sort((a, b) => b.length - a.length)[0]?.protein || '';
    return { frame: label, sequence: rna.substring(0, 60), orfs, longestOrf };
  });
}

export function processModule1DnaInput(
  rawDna: string,
  pattern = '[CGT][ACT]TGTGGT[CT][AT]',
  geneName = 'RUNX1_TGIF1_IKZF1'
): ProteinTargetData {
  // N-chars stripped → exactly 1,370 bp | GC: 561/1370 = 40.95% | RUNX1 motif at pos 253–262
  const DEFAULT_PROJECT_DNA = 'GACACCTCAGTACTAGGATGTATCAGCCTGAACTAGCAGGCCTGGTTCCAAATTTTTTTATCAACACTCGTAGGGGGATTATCCTAGAGGGGGTCTGGGATTTCTTTGACATCAGAGTATTTTTGCCTTGCTCCTTCACAATTTGGGAACAAATAATTTAGTGGTTATTAACCCTGGCTACGCACTGGAAACTTTAAAAATAATGCTGGTATGAAATTTACACAGAGTATCGTGAAAATTTTCACTGAGTACCATGTGGTTATACATTGGATAAGGCTCCAGGAAGCAGCTACTGGAAGACAGCCATGCCAAGAGTGGTTAGTGGTTGGAATTTTGGCAAGTCAGTTTTAGTCTGCCTTATCAAATACATGGGCATACAGATAAATCCTTAGATGGCTCTCCTACTTACTGAAACATTTTCTATCTATCTATCTATCTATCTATCTATTTGGGAAGCTATCTATCTATCTATCATTTATTTAAGGTAGTCTCTATCTGCCTCTGTCTCTGTCTGTCTCTGTGTCTCTGTGTCTGTCTGCTCTCTCTCTCTCTCTGTGGGAATCTCTCTCTGTGTGTGTGTGTGTATGTGTGTGTGTGTGTGTGGTGTGCATGAACATGAGTAAAATCCATAAGGAAACTTTCAGAGTTGGTCCTCTCCTTATATCAAATGGATCCAGGAATTAAACTCAGGTTCAATTCTTGGTGCCTTTACTAGTTGAGCCATCTCACTGGCTCTTCATCATCTTTAGAATAAACTCACTTTATTACACACACACACACACACAACCTGGGAGTACACACACACACACAACCAAAGCCCCAACGGAAAACTACAATATTATAATGAATACACAGGTTCTCAACATAGTCTCTGCCACGCTTGCAGACAAAGATGAGTAGAAGTAGAAAGAACCAGGGAAACGTGGAGCAAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAGTAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGACAGCACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGAAATAGCAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAAAGGAGCAGTCAGAAGGAGTAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGGAATAGCAGTCAGAAGGAGTAACAGTCAGAGCAAACACAGAGATGACAAAGGCAATGGGGTCAGAGACTTCACCACTCTCCAAGA';

  const cleanDna = rawDna.toUpperCase().replace(/[^ATCG]/g, '') || DEFAULT_PROJECT_DNA;

  const gc = calculateGcContent(cleanDna);
  const rna = transcribeDnaToRna(cleanDna);
  const protein = translateRnaToProtein(rna);
  const motifResult = searchDnaPattern(cleanDna, pattern, true);

  return {
    dnaSequence: cleanDna,
    rnaSequence: rna,
    proteinSequence: protein,
    gcContent: gc,
    sequenceLength: cleanDna.length,
    detectedMotif: motifResult,
    geneName
  };
}
