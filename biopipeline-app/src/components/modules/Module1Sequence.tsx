import React, { useState, useMemo } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { translateAllFrames } from '../../lib/algorithms/dnaParser';
import { DnaHelixAnimation } from '../viewers/DnaHelixAnimation';
import { ContextHelp } from '../common/ContextHelp';
import { Tooltip } from '../common/Tooltip';
import {
  ArrowRight, Code, Upload, ChevronDown, ChevronUp,
  Clipboard, CheckCircle2, AlertCircle, Activity,
  GitBranch, Binary, Microscope, Sparkles, Play, Check
} from 'lucide-react';

/* ─── Project DNA (seq.fasta — stripped of ambiguity chars) ─── */
const RAW_PROJECT_DNA = 'GACACCTCAGTACTAGGATGTATCAGCCTGAACTAGCAGGCCTGGTTCCAAATTTTTTTATCAACACTCGTAGGGGGATTATCCTAGAGGGGGTCTGGGATTTCTTTGACATCAGAGTATTTTTGCCTTGCTCCTTCACAATTTGGGAACAAATAATTTAGTGGTTATTAACCCTGGCTACGCACTGGAAACTTTAAAAATAATGCTGGTATGAAATTTACACAGAGTATCGTGAAAATTTTCACTGAGTACCATGTGGTTATACATTGGATAAGGCTCCAGGAAGCAGCTACTGGAAGACAGCCATGCCAAGAGTGGTTAGTGGTTGGAATTTTGGCAAGTCAGTTTTAGTCTGCCTTATCAAATACATGGGCATACAGATAAATCCTTAGATGGCTCTCCTACTTACTGAAACATTTTCTATCTATCTATCTATCTATCTATCTATTTGGGAAGCTATCTATCTATCTATCATTTATTTAAGGTAGTCTCTATCTGCCTCTGTCTCTGTCTGTCTCTGTGTCTCTGTGTCTGTCTGCTCTCTCTCTCTCTCTGTGGGAATCTCTCTCTGTGTGTGTGTGTGTATGTGTGTGTGTGTGTGTGGTGTGCATGAACATGAGTAAAATCCATAAGGAAACTTTCAGAGTTGGTCCTCTCCTTATATCAAATGGATCCAGGAATTAAACTCAGGTTCAATTCTTGGTGCCTTTACTAGTTGAGCCATCTCACTGGCTCTTCATCATCTTTAGAATAAACTCACTTTATTACACACACACACACACACAACCTGGGAGTACACACACACACACAACCAAAGCCCCAACGGAAAACTACAATATTATAATGAATACACAGGTTCTCAACATAGTCTCTGCCACGCTTGCAGACAAAGATGAGTAGAAGTAGAAAGAACCAGGGAAACGTGGAGCAAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAGTAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGACAGCACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGAAATAGCAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAAAGGAGCAGTCAGAAGGAGTAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGGAATAGCAGTCAGAAGGAGTAACAGTCAGAGCAAACACAGAGATGACAAAGGCAATGGGGTCAGAGACTTCACCACTCTCCAAGA';

const SAMPLE_SEQUENCES = [
  { name: 'Project Assignment DNA (1084660)', gene: 'RUNX1_TGIF1_IKZF1', sequence: RAW_PROJECT_DNA },
  {
    name: 'RUNX1 Target Gene (Oncology)', gene: 'RUNX1',
    sequence: 'ATGAAGTGGGTAACCTTTATTTCCCTTCTTTTTCTCTTTAGCTCGGCTTATTCCAGGGGTGTGTTTCGTCGAGATACACACAAGAGTGAGATCGCTCATCGGTTCAAGGACTTAGGGGAAGAACATTTCAAAGGCCTGGTCCTGATCGCCTTCTCCCAGTATCTCCAGCAGTGTCCATTTGACGAGCATGTAAAATTAGTCAATGAACTGACTGAATTTGCAAAAACATGTGTTTAA'
  },
  {
    name: 'EGFR Kinase Domain (Lung Cancer)', gene: 'EGFR',
    sequence: 'ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACCTATGTGCAGAGGAATTATGATCTTCCTTTCCTTAAATAA'
  },
  {
    name: 'SARS-CoV-2 Spike S1 Domain', gene: 'S-SPIKE',
    sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATTACCCCCTGCATACACTAATTCTTTCACACGTGGTGTTTATTACCCTGACAAAGTTTTCAGATCCTCAGTTTTACATTCAACTCAGGACTTGTTCTTACCTTTCTTTTCCAATGTTACTTGGTTCCATGCTATACATGTCTCTGGG'
  },
];

const MOTIF_PRESETS = [
  { label: 'RUNX1 Binding Site', pattern: '[CGT][ACT]TGTGGT[CT][AT]' },
  { label: 'TGIF1 Binding Site', pattern: '[AT]GACAG[CGT]' },
  { label: 'IKZF1 Binding Site', pattern: '[CGT]TGGGA[AG][AGT]' },
  { label: 'Start Codon (ATG)', pattern: 'ATG' },
  { label: 'Generic ORF Finder', pattern: 'ATG[ATCG]{6,30}TGA' },
  { label: 'Kozak Consensus', pattern: 'GCCRCCATGG' },
];

function highlightSequence(
  seq: string,
  startIdx: number,
  endIdx: number,
  contextLen = 110,
): React.ReactNode {
  if (startIdx < 0 || !seq) {
    return <span className="text-emerald-300/80">{seq.substring(0, 200)}</span>;
  }
  const beforeStart = Math.max(0, startIdx - contextLen);
  const afterEnd    = Math.min(seq.length, endIdx + contextLen);
  const before = seq.substring(beforeStart, startIdx);
  const match  = seq.substring(startIdx, endIdx);
  const after  = seq.substring(endIdx, afterEnd);
  return (
    <>
      {beforeStart > 0 && <span className="text-slate-500">…</span>}
      <span className="text-emerald-300/70">{before}</span>
      <span className="text-amber-200 font-bold bg-amber-400/30 px-1.5 py-0.5 rounded-md border border-amber-400/80 shadow-md shadow-amber-400/20 animate-pulse"
            title={`Match at position ${startIdx + 1}–${endIdx}`}>
        {match}
      </span>
      <span className="text-emerald-300/70">{after}</span>
      {afterEnd < seq.length && <span className="text-slate-500">…</span>}
    </>
  );
}

export const Module1Sequence: React.FC = () => {
  const { state, runModule1, runModule2 } = usePipeline();
  const data = state.module1Data;

  const [dnaInput, setDnaInput]       = useState(SAMPLE_SEQUENCES[0].sequence);
  const [patternInput, setPatternInput] = useState(MOTIF_PRESETS[0].pattern);
  const [geneNameInput, setGeneNameInput] = useState(SAMPLE_SEQUENCES[0].gene);
  const [configOpen, setConfigOpen]   = useState(true);
  const [activeTab, setActiveTab]     = useState<'stats' | 'translation' | 'frames'>('stats');
  const [copied, setCopied]           = useState<'rna' | 'protein' | null>(null);
  const [showFrames, setShowFrames]   = useState(false);

  const handleCopy = (text: string, key: 'rna' | 'protein') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  };

  const handleProcess = () => runModule1(dnaInput, patternInput, geneNameInput);

  const readingFrames = useMemo(() => {
    if (!data || !showFrames) return [];
    return translateAllFrames(data.dnaSequence);
  }, [data, showFrames]);

  const gcBar = data ? Math.round(data.gcContent) : 0;
  const atBar = 100 - gcBar;
  const mwKda = data ? (data.proteinSequence.length * 110 / 1000).toFixed(1) : '—';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Contextual Help Banner ── */}
      <ContextHelp
        headline="🧬 Step 1: Reading & Decoding Your DNA"
        narrative="Think of DNA as a recipe book written in a 4-letter alphabet (A, T, C, G). Here we load your gene's 'recipe', check its quality, find important control switches, and translate it into the protein it builds."
        whyItMatters="Before we can find a drug, we need to know what protein the gene makes. The protein is the actual target our drug needs to 'lock on to'. This step extracts and prepares that protein sequence."
        facts={[
          { emoji: '🔤', label: '4-letter alphabet (A, T, C, G)' },
          { emoji: '📐', label: 'GC% = structural stability score' },
          { emoji: '🔑', label: 'Motifs = gene control switches' },
        ]}
        accent="emerald"
      />

      {/* ── Friendly Stage Header Banner with 3D DNA Animation ── */}
      <div className="relative bg-gradient-to-r from-emerald-950/60 via-teal-900/30 to-surface-container border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-sans font-medium">
                <span className="text-base">🧬</span>
                <span>Step 1 of 5 · DNA Analysis</span>
              </div>
              <span className="text-xs font-mono text-emerald-300/80 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full shadow-inner">
                Target: {geneNameInput || 'RUNX1_TGIF1_IKZF1'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2 flex items-center gap-2">
              Read &amp; Decode Your DNA Sequence
            </h2>

            <p className="text-sm font-sans text-slate-300 max-w-3xl leading-relaxed">
              Welcome! Here we load your genetic code, check its GC stability, search for gene regulatory patterns (binding sites), and translate the sequence into an amino acid chain ready for 3D protein folding.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-emerald-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> Suffix Tree Search
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-sky-300 flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-sky-400" /> Pattern Matcher
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-purple-300 flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-purple-400" /> 6-Frame Translation
              </span>
            </div>
          </div>

          {/* Interactive 3D Spinning DNA Helix Widget */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <DnaHelixAnimation height="140px" speed={0.025} className="shadow-2xl border-emerald-500/30" />
            <div className="text-[11px] font-sans text-emerald-400/80 mt-2 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              Real-time Double Helix Simulation
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ══ LEFT: Input Controls ══ */}
        <div className="space-y-5">

          {/* DNA Input Panel */}
          <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <label className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                Input DNA Sequence
              </label>
              <span className="text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-0.5">
                {dnaInput.replace(/[^ATCGN]/gi, '').length.toLocaleString()} base pairs
              </span>
            </div>

            {/* Presets */}
            <div>
              <div className="text-xs font-sans text-slate-400 mb-2">Choose a sample gene sequence:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_SEQUENCES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDnaInput(s.sequence);
                      setGeneNameInput(s.gene);
                      setPatternInput(MOTIF_PRESETS[Math.min(i, MOTIF_PRESETS.length - 1)].pattern);
                    }}
                    className={`text-left p-2.5 rounded-2xl border transition-all text-xs font-sans flex flex-col gap-0.5 ${
                      dnaInput === s.sequence
                        ? 'bg-emerald-500/15 border-emerald-500/80 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-surface-base/80 border-white/5 text-slate-300 hover:border-white/20 hover:bg-surface-base'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {s.gene} {dnaInput === s.sequence && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                value={dnaInput}
                onChange={e => setDnaInput(e.target.value.toUpperCase())}
                placeholder="Paste DNA sequence (A, T, C, G)..."
                spellCheck={false}
                className="w-full bg-surface-base/90 border border-white/10 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="cursor-pointer text-xs font-sans bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-slate-300 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload FASTA / Text File
                <input type="file" accept=".fasta,.txt,.fa" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => {
                      const text = (ev.target?.result as string || '').toUpperCase();
                      const dna  = text.split('\n').filter(l => !l.startsWith('>')).join('');
                      setDnaInput(dna);
                    };
                    r.readAsText(f);
                  }
                }} />
              </label>

              <button
                onClick={() => setDnaInput(RAW_PROJECT_DNA)}
                className="text-xs font-sans text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Reset to Default Gene
              </button>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <button
              onClick={() => setConfigOpen(p => !p)}
              className="w-full flex items-center justify-between p-4 text-xs font-sans font-semibold text-slate-200 hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Motif Search Configuration &amp; Gene Target
              </span>
              {configOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {configOpen && (
              <div className="p-4 space-y-4 border-t border-white/5 bg-surface-base/40">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <label className="text-xs font-sans text-slate-400 w-36">Gene Target Label:</label>
                  <input
                    type="text"
                    value={geneNameInput}
                    onChange={e => setGeneNameInput(e.target.value)}
                    className="flex-1 bg-surface-base border border-white/10 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-sky-400"
                    placeholder="e.g. RUNX1_TGIF1_IKZF1"
                  />
                </div>

                <div>
                  <div className="text-xs font-sans text-slate-400 mb-2">Preset Binding Sites:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOTIF_PRESETS.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setPatternInput(m.pattern)}
                        className={`text-xs font-sans px-3 py-1.5 rounded-xl border transition-all ${
                          patternInput === m.pattern
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-medium shadow-md shadow-sky-500/10'
                            : 'bg-surface-base/70 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <label className="text-xs font-sans text-slate-400 w-36">Custom Pattern (Regex):</label>
                  <input
                    type="text"
                    value={patternInput}
                    onChange={e => setPatternInput(e.target.value)}
                    className="flex-1 bg-surface-base border border-sky-500/30 rounded-xl px-3.5 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-400"
                    placeholder="[CGT][ACT]TGTGGT[CT][AT]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleProcess}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-display font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            Analyze &amp; Decode DNA Sequence
          </button>
        </div>

        {/* ══ RIGHT: Analysis Results ══ */}
        {data ? (
          <div className="space-y-5">

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 gap-3">
              {/* Length */}
              <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-xs font-sans text-slate-400 mb-1">Sequence Length</div>
                <div className="text-3xl font-display font-black text-white">{data.sequenceLength.toLocaleString()}</div>
                <div className="text-[11px] font-sans text-slate-400">base pairs</div>
              </div>

            {/* GC Content */}
              <div className="bg-surface-container/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-center">
                <div className="text-xs font-sans text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Tooltip term="GC Stability" definition="GC Content is the percentage of G and C bases in the DNA. G-C pairs form 3 hydrogen bonds (vs 2 for A-T), making the DNA more thermally stable. Ideal range for human genes: 40–60%." />
                </div>
                <div className="text-3xl font-display font-black text-emerald-400">{data.gcContent}%</div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-1000" style={{ width: `${gcBar}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-sans text-slate-400 mt-1">
                  <span>GC {gcBar}%</span>
                  <span>AT {atBar}%</span>
                </div>
                <div className={`mt-2 text-[10px] font-sans font-semibold ${gcBar >= 40 && gcBar <= 60 ? 'text-emerald-400' : gcBar < 30 || gcBar > 70 ? 'text-bio-rose' : 'text-bio-amber'}`}>
                  {gcBar >= 40 && gcBar <= 60 ? '✓ Ideal stability range' : gcBar < 30 ? '⚠ Low — AT-rich, less stable' : gcBar > 70 ? '⚠ High — GC-rich, very stable' : '~ Slightly outside ideal'}
                </div>
              </div>

              {/* Protein AA */}
              <div className="bg-surface-container/80 backdrop-blur-md border border-sky-500/30 rounded-2xl p-4 text-center">
                <div className="text-xs font-sans text-slate-400 mb-1">Protein Length</div>
                <div className="text-3xl font-display font-black text-sky-400">{data.proteinSequence.length}</div>
                <div className="text-[11px] font-sans text-slate-400">amino acids</div>
              </div>

              {/* Est. Weight */}
              <div className="bg-surface-container/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 text-center">
                <div className="text-xs font-sans text-slate-400 mb-1">Est. Molecular Mass</div>
                <div className="text-3xl font-display font-black text-purple-400">{mwKda}</div>
                <div className="text-[11px] font-sans text-slate-400">kiloDaltons (kDa)</div>
              </div>
            </div>

            {/* Motif Detection Banner */}
            <div className={`p-5 rounded-3xl border font-sans text-xs flex items-start gap-3 shadow-xl backdrop-blur-md ${
              data.detectedMotif?.found
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}>
              {data.detectedMotif?.found
                ? <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400 animate-bounce" />
                : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              }
              <div className="space-y-1">
                {data.detectedMotif?.found ? (
                  <>
                    <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                      ✅ Gene Control Switch Found!
                    </div>
                    <div className="text-slate-300 text-xs">
                      <Tooltip term="Binding motif" definition="A binding motif is a short, specific DNA sequence where a regulatory protein 'docks' to turn a gene on or off — like an ignition key for a gene." /> pattern{' '}
                      <code className="text-amber-300 font-mono font-bold">{data.detectedMotif.motif}</code> matched at position <strong className="text-white">{data.detectedMotif.startIndex + 1}–{data.detectedMotif.endIndex}</strong>.
                    </div>
                    <div className="text-xs text-emerald-400 font-medium mt-1">
                      🎯 The gene's 'on switch' was found — ready for 3D protein modeling!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-sm text-red-300">Control Switch Not Found</div>
                    <div className="text-xs text-slate-300">No match for "{patternInput}". Try a different motif preset on the left, or use the default project sequence.</div>
                  </>
                )}
              </div>
            </div>

            {/* Sequence Preview Box */}
            {data.detectedMotif?.found && (
              <div className="bg-surface-base/90 border border-white/10 rounded-2xl p-4 font-mono overflow-hidden shadow-inner">
                <div className="text-xs font-sans text-slate-400 mb-2 font-medium">DNA Binding Location Preview (Highlighted in context):</div>
                <div className="text-xs break-all leading-relaxed">
                  {highlightSequence(data.dnaSequence, data.detectedMotif.startIndex, data.detectedMotif.endIndex, 160)}
                </div>
              </div>
            )}

            {/* Tabs & Output */}
            <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="flex border-b border-white/10 font-sans text-xs font-medium">
                {(['stats', 'translation', 'frames'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); if (tab === 'frames') setShowFrames(true); }}
                    className={`flex-1 py-3.5 transition-all text-center ${
                      activeTab === tab
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'stats' ? '📊 Gene Overview'
                      : tab === 'translation' ? '🧬 Protein Sequence'
                      : '🔬 6-Frame Reading'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'stats' && (
                  <div className="space-y-3 font-sans text-xs">
                    {[
                      { label: 'Gene Target:', value: data.geneName, color: 'text-white font-bold' },
                      { label: 'Motif Search Engine:', value: data.detectedMotif?.matchType === 'regex' ? 'Regex Pattern Engine' : 'Suffix Tree Engine', color: 'text-sky-400 font-medium' },
                      { label: 'mRNA Chain Length:', value: `${data.rnaSequence.length} nucleotides`, color: 'text-slate-200' },
                      { label: 'Protein Length:', value: `${data.proteinSequence.length} amino acids`, color: 'text-emerald-400 font-bold' },
                      { label: 'Est. Protein Mass:', value: `${mwKda} kDa`, color: 'text-slate-200' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-slate-400">{label}</span>
                        <span className={color}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'translation' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-sans text-slate-400">Transcribed mRNA Sequence (5' → 3'):</span>
                        <button
                          onClick={() => handleCopy(data.rnaSequence, 'rna')}
                          className="text-xs font-sans text-sky-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {copied === 'rna' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          {copied === 'rna' ? 'Copied!' : 'Copy mRNA'}
                        </button>
                      </div>
                      <div className="bg-surface-base p-3 rounded-2xl border border-white/10 text-xs font-mono text-sky-300 break-all max-h-24 overflow-y-auto leading-relaxed shadow-inner">
                        {data.rnaSequence.substring(0, 300)}{data.rnaSequence.length > 300 ? '…' : ''}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-sans text-slate-400">Translated Protein Sequence (Amino Acids):</span>
                        <button
                          onClick={() => handleCopy(data.proteinSequence, 'protein')}
                          className="text-xs font-sans text-emerald-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {copied === 'protein' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          {copied === 'protein' ? 'Copied!' : 'Copy Protein'}
                        </button>
                      </div>
                      <div className="bg-surface-base p-3 rounded-2xl border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold break-all max-h-28 overflow-y-auto leading-relaxed shadow-inner">
                        {data.proteinSequence}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'frames' && (
                  <div className="space-y-2">
                    <div className="text-xs font-sans text-slate-400 mb-2">
                      6-Frame translation (3 forward + 3 reverse complement). ORFs ≥ 10 AA highlighted.
                    </div>
                    {readingFrames.length === 0 ? (
                      <div className="text-xs font-sans text-slate-400 animate-pulse">Computing reading frames…</div>
                    ) : readingFrames.map(frame => (
                      <div key={frame.frame} className="bg-surface-base/80 border border-white/5 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-mono font-bold ${frame.frame.startsWith('+') ? 'text-emerald-400' : 'text-sky-400'}`}>
                            Frame {frame.frame}
                          </span>
                          <span className="text-[11px] font-sans text-slate-400">{frame.orfs.length} ORF(s) found</span>
                        </div>
                        {frame.longestOrf ? (
                          <div className="text-xs font-mono text-slate-200 break-all">
                            <span className="text-slate-400 font-sans">Longest ORF ({frame.longestOrf.length} AA): </span>
                            <span className={frame.frame.startsWith('+') ? 'text-emerald-300' : 'text-sky-300'}>
                              {frame.longestOrf.substring(0, 60)}{frame.longestOrf.length > 60 ? '…' : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs font-sans text-slate-500">No ORF ≥ 10 AA in this frame</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next Step Button */}
            <button
              onClick={runModule2}
              disabled={state.isLoading}
              className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300 font-display font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {state.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  Building 3D Model…
                </>
              ) : (
                <>Next Step: Predict 3D Protein Shape <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] bg-surface-container/40 border border-dashed border-white/10 rounded-3xl text-center p-8 space-y-4 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl animate-pulse">
              🧬
            </div>
            <div className="text-white font-display font-bold text-lg">
              Ready to Decode Your DNA
            </div>
            <p className="text-xs font-sans text-slate-400 max-w-sm leading-relaxed">
              Click <strong className="text-emerald-400">Analyze &amp; Decode DNA Sequence</strong> on the left to calculate GC stability, locate target binding motifs, and translate your sequence!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
