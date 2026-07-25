import React, { useState, useMemo } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import { translateAllFrames } from '../../lib/algorithms/dnaParser';
import { Dna, Search, ArrowRight, Code, Upload, ChevronDown, ChevronUp, Clipboard, CheckCircle2, FlaskConical, Layers, FileText } from 'lucide-react';

const SAMPLE_SEQUENCES = [
  {
    name: 'Project Assignment DNA (1084660)',
    gene: 'RUNX1_TGIF1_IKZF1',
    sequence: 'GACACCTCAGTACTAGGATGNNNNNNTATCAGCCTGAACTAGCAGGCCTGGTTCCAAATTTTTTTATCAACACTCGTAGGGGGATTATCCTAGAGGGGGTCTGGGATTTCTTTGACATCAGAGTATTTTTGCCTTGCTCCTTCACAATTTGGGAACAAATAATTTAGTGGTTATTAACCCTGGCTACGCACTGGAAACTTTAAAAATAATGCTGGTATGAAATTTACACAGAGTATCGTGAAAATTTTCACTGAGTACCATGTGGTTATACATTGGATAAGGCTCCAGGAAGCAGCTACTGGAAGACAGCCATGCCAAGAGTGGTTAGTGGTTGGAATTTTGGCAAGTCAGTTTTAGTCTGCCTTATCAAATACATGGGCATACAGATAAATCCTTAGATGGCTCTCCTACTTACTGAAACATTTTCTATCTATCTATCTATCTATCTATCTATTTGGGAAGCTATCTATCTATCTATCATTTATTTAAGGTAGTCTCTATCTGCCTCTGTCTCTGTCTGTCTCTGTGTCTCTGTGTCTGTCTGCTCTCTCTCTCTCTCTGTGGGAATCTCTCTCTGTGTGTGTGTGTGTATGTGTGTGTGTGTGTGTGGTGTGCATGAACATGAGTAAAATCCATAAGGAAACTTTCAGAGTTGGTCCTCTCCTTATATCAAATGGATCCAGGAATTAAACTCAGGTTCAATTCTTGGTGCCTTTACTAGTTGAGCCATCTCACTGGCTCTTCATCATCTTTAGAATAAACTCACTTTATTACACACACACACACACACAACCTGGGAGTACACACACACACACAACCAAAGCCCCAACGGAAAACTACAATATTATAATGAATACACAGGTTCTCAACATAGTCTCTGCCACGCTTGCAGACAAAGATGAGTAGAAGTAGAAAGAACCAGGGAAACGTGGAGCAAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAGTAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGACAGCACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGAAATAGCAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAAAGGAGCAGTCAGAAGGAGTAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGGAATAGCAGTCAGAAGGAGTAACAGTCAGAGCAAACACAGAGATGACAAAGGCAATGGGGTCAGAGACTTCACCACTCTCCAAGA'
  },
  {
    name: 'RUNX1 Target Gene (Oncology)',
    gene: 'RUNX1',
    sequence: 'ATGAAGTGGGTAACCTTTATTTCCCTTCTTTTTCTCTTTAGCTCGGCTTATTCCAGGGGTGTGTTTCGTCGAGATACACACAAGAGTGAGATCGCTCATCGGTTCAAGGACTTAGGGGAAGAACATTTCAAAGGCCTGGTCCTGATCGCCTTCTCCCAGTATCTCCAGCAGTGTCCATTTGACGAGCATGTAAAATTAGTCAATGAACTGACTGAATTTGCAAAAACATGTGTTTAA'
  },
  {
    name: 'EGFR Kinase Domain (Lung Cancer)',
    gene: 'EGFR',
    sequence: 'ATGCGACCCTCCGGGACGGCCGGGGCAGCGCTCCTGGCGCTGCTGGCTGCGCTCTGCCCGGCGAGTCGGGCTCTGGAGGAAAAGAAAGTTTGCCAAGGCACGAGTAACAAGCTCACGCAGTTGGGCACTTTTGAAGATCATTTTCTCAGCCTCCAGAGGATGTTCAATAACTGTGAGGTGGTCCTTGGGAATTTGGAAATTACCTATGTGCAGAGGAATTATGATCTTCCTTTCCTTAAATAA'
  },
  {
    name: 'SARS-CoV-2 Spike S1 Domain',
    gene: 'S-SPIKE',
    sequence: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAATTACCCCCTGCATACACTAATTCTTTCACACGTGGTGTTTATTACCCTGACAAAGTTTTCAGATCCTCAGTTTTACATTCAACTCAGGACTTGTTCTTACCTTTCTTTTCCAATGTTACTTGGTTCCATGCTATACATGTCTCTGGG'
  },
];

const MOTIF_PRESETS = [
  { label: 'RUNX1 ([CGT][ACT]TGTGGT[CT][AT])', pattern: '[CGT][ACT]TGTGGT[CT][AT]' },
  { label: 'TGIF1 ([AT]GACAG[CGT])', pattern: '[AT]GACAG[CGT]' },
  { label: 'IKZF1 ([CGT]TGGGA[AG][AGT])', pattern: '[CGT]TGGGA[AG][AGT]' },
  { label: 'Start Codon ATG', pattern: 'ATG' },
  { label: 'Generic ORF Finder', pattern: 'ATG[ATCG]{6,30}TGA' },
  { label: 'Kozak Consensus', pattern: 'GCCRCCATGG' },
];

function highlightSequence(seq: string, startIdx: number, endIdx: number, maxLen = 120): React.ReactNode {
  if (startIdx < 0 || !seq) return <span className="text-neon-green">{seq.substring(0, maxLen)}</span>;
  const before = seq.substring(0, Math.min(startIdx, maxLen));
  const match = seq.substring(startIdx, Math.min(endIdx, maxLen));
  const after = seq.substring(Math.min(endIdx, maxLen), maxLen);
  return (
    <>
      <span className="text-neon-green/60">{before}</span>
      <span className="text-yellow-400 font-bold bg-yellow-400/20 px-1 py-0.5 rounded border border-yellow-400/50 animate-pulse">{match}</span>
      <span className="text-neon-green/60">{after}</span>
    </>
  );
}

export const Module1Sequence: React.FC = () => {
  const { state, runModule1, runModule2 } = usePipeline();
  const data = state.module1Data;

  const [dnaInput, setDnaInput] = useState(SAMPLE_SEQUENCES[0].sequence);
  const [patternInput, setPatternInput] = useState(MOTIF_PRESETS[0].pattern);
  const [geneNameInput, setGeneNameInput] = useState(SAMPLE_SEQUENCES[0].gene);
  const [configOpen, setConfigOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'translation' | 'frames'>('stats');
  const [copied, setCopied] = useState(false);
  const [showFrames, setShowFrames] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleProcess = () => runModule1(dnaInput, patternInput, geneNameInput);

  const readingFrames = useMemo(() => {
    if (!data || !showFrames) return [];
    return translateAllFrames(data.dnaSequence);
  }, [data, showFrames]);

  const gcBar = data ? Math.round(data.gcContent) : 0;
  const atBar = 100 - gcBar;

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Stage Banner */}
      <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel">
        <div className="flex items-center space-x-2 text-xs font-mono text-neon-green uppercase tracking-wider mb-1">
          <Dna className="w-4 h-4" />
          <span>📥 Stage 1: Data Ingestion & Deterministic Parsing (Project 1084660)</span>
        </div>
        <h2 className="text-lg font-display font-bold text-text-bright">DNA Ingestion, Suffix Tree Parsing & Protein Translation</h2>
        <p className="text-xs text-text-muted mt-0.5 max-w-3xl">
          Loaded with your project assignment DNA sequence (`seq.fasta`). The engine computes %GC statistics, runs a <strong className="text-neon-green">Suffix Tree + Regex</strong> motif search for transcription factor binding sites (<strong className="text-neon-blue">RUNX1, TGIF1, IKZF1</strong>), transcribes to mRNA, and translates into protein for ESMFold.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* LEFT: Input Section */}
        <div className="space-y-3">
          {/* DNA Input */}
          <div className="bg-surface-container border border-border-subtle rounded-xl p-4 space-y-3 glass-panel">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-neon-green flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                DNA Sequence Input (FASTA / Plain Text)
              </label>
              <span className="text-[10px] font-mono text-text-muted">{dnaInput.replace(/[^ATCG]/gi, '').length} bp</span>
            </div>

            {/* Quick-load preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_SEQUENCES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDnaInput(s.sequence);
                    setGeneNameInput(s.gene);
                    setPatternInput(MOTIF_PRESETS[Math.min(i, MOTIF_PRESETS.length - 1)].pattern);
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${dnaInput === s.sequence ? 'bg-neon-green/20 border-neon-green text-neon-green font-bold' : 'bg-surface-base border-border-subtle text-text-bright hover:bg-surface-container-high'}`}
                >
                  {i === 0 ? '⭐ ' : '📋 '}{s.name}
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={dnaInput}
              onChange={e => setDnaInput(e.target.value.toUpperCase())}
              placeholder="GACACCTCAGTACTAGGATG..."
              spellCheck={false}
              className="w-full bg-surface-base border border-border-subtle rounded-lg p-3 text-xs font-mono text-neon-green focus:outline-none focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/20 resize-none"
            />

            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer text-xs font-mono bg-surface-base hover:bg-surface-container-high border border-border-subtle rounded-lg px-3 py-2 text-text-muted flex items-center gap-1.5 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>📁 Upload FASTA File</span>
                <input type="file" accept=".fasta,.txt,.fa" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => {
                      const text = (ev.target?.result as string || '').toUpperCase();
                      const dna = text.split('\n').filter(l => !l.startsWith('>')).join('');
                      setDnaInput(dna);
                    };
                    r.readAsText(f);
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Config Accordion */}
          <div className="bg-surface-container border border-border-subtle rounded-xl glass-panel overflow-hidden">
            <button
              onClick={() => setConfigOpen(p => !p)}
              className="w-full flex items-center justify-between p-4 text-xs font-mono text-text-muted hover:text-text-bright"
            >
              <span className="font-semibold">⚙️ Configuration Panel — Transcription Factor Motifs (Project 1084660)</span>
              {configOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {configOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                <div className="flex gap-2 items-center">
                  <label className="text-[11px] font-mono text-text-muted whitespace-nowrap">Gene Target Name:</label>
                  <input
                    type="text"
                    value={geneNameInput}
                    onChange={e => setGeneNameInput(e.target.value)}
                    className="flex-1 bg-surface-base border border-border-subtle rounded px-3 py-1.5 text-xs font-mono text-text-bright focus:outline-none focus:border-neon-green"
                    placeholder="e.g. RUNX1_TGIF1_IKZF1"
                  />
                </div>

                <div className="text-[10px] font-mono text-text-muted">Select Transcription Factor Binding Pattern:</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {MOTIF_PRESETS.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setPatternInput(m.pattern)}
                      className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${patternInput === m.pattern ? 'bg-neon-blue/20 border-neon-blue text-neon-blue font-bold' : 'bg-surface-base border-border-subtle text-text-muted hover:text-text-bright'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-[11px] font-mono text-text-muted whitespace-nowrap">Regex Pattern:</label>
                  <input
                    type="text"
                    value={patternInput}
                    onChange={e => setPatternInput(e.target.value)}
                    className="flex-1 bg-surface-base border border-border-subtle rounded px-3 py-1.5 text-xs font-mono text-neon-blue focus:outline-none focus:border-neon-blue"
                    placeholder="[CGT][ACT]TGTGGT[CT][AT]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Execute Button */}
          <button
            onClick={handleProcess}
            className="w-full bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/60 text-neon-blue font-mono font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-neon-blue/10 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            🔍 EXECUTE SUFFIX TREE PARSING & TRANSCRIPTION
          </button>
        </div>

        {/* RIGHT: Results */}
        {data && (
          <div className="space-y-3">
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container border border-border-subtle rounded-xl p-3 text-center glass-panel">
                <div className="text-[10px] font-mono text-text-muted uppercase">DNA Length</div>
                <div className="text-2xl font-display font-bold text-text-bright mt-0.5">{data.sequenceLength.toLocaleString()}</div>
                <div className="text-[10px] text-text-muted">base pairs</div>
              </div>
              <div className="bg-surface-container border border-neon-green/30 rounded-xl p-3 text-center glass-panel">
                <div className="text-[10px] font-mono text-text-muted uppercase">%GC Content</div>
                <div className="text-2xl font-display font-bold text-neon-green mt-0.5">{data.gcContent}%</div>
                <div className="w-full mt-1.5 h-1.5 bg-surface-base rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full" style={{ width: `${gcBar}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-text-muted mt-0.5">
                  <span>GC {gcBar}%</span><span>AT {atBar}%</span>
                </div>
              </div>
              <div className="bg-surface-container border border-neon-blue/30 rounded-xl p-3 text-center glass-panel">
                <div className="text-[10px] font-mono text-text-muted uppercase">Protein AA</div>
                <div className="text-2xl font-display font-bold text-neon-blue mt-0.5">{data.proteinSequence.length}</div>
                <div className="text-[10px] text-text-muted">residues</div>
              </div>
            </div>

            {/* Motif Detection Banner */}
            <div className={`p-3 rounded-xl border font-mono text-xs flex items-start gap-2 ${data.detectedMotif?.found ? 'bg-neon-green/10 border-neon-green/40 text-neon-green' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
              <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {data.detectedMotif?.found
                  ? <>
                      <span className="font-bold">🟢 TF BINDING REGION DETECTED</span>{' '}
                      <span className="text-text-bright">"{data.detectedMotif.motif}"</span>{' '}
                      <span className="text-text-muted">at pos {data.detectedMotif.startIndex + 1}–{data.detectedMotif.endIndex} [{data.detectedMotif.matchType.toUpperCase()}]</span>
                    </>
                  : <>
                      <span className="font-bold">🔴 MOTIF NOT FOUND</span>{' '}
                      <span className="text-text-muted">Pattern "{patternInput}" not located. Select a different preset above.</span>
                    </>
                }
              </div>
            </div>

            {/* Highlighted sequence preview */}
            {data.detectedMotif?.found && (
              <div className="bg-surface-base border border-border-subtle rounded-lg p-2.5 font-mono text-[10px] overflow-hidden">
                <div className="text-text-muted text-[9px] mb-1">DNA Binding Location Preview (motif highlighted):</div>
                <div className="break-all leading-relaxed">
                  {highlightSequence(data.dnaSequence, data.detectedMotif.startIndex, data.detectedMotif.endIndex, 140)}
                </div>
              </div>
            )}

            {/* Tab: Stats / mRNA+Protein / 6-Frames */}
            <div className="bg-surface-container border border-border-subtle rounded-xl glass-panel overflow-hidden">
              <div className="flex border-b border-border-subtle text-xs font-mono">
                {(['stats', 'translation', 'frames'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'frames') setShowFrames(true);
                    }}
                    className={`flex-1 py-2.5 font-semibold transition-all ${activeTab === tab ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5' : 'text-text-muted hover:text-text-bright'}`}
                  >
                    {tab === 'stats' ? '📊 Stats & Motifs' : tab === 'translation' ? '🧬 mRNA & Protein' : <><Layers className="w-3 h-3 inline mr-1" />6-Frame Translation</>}
                  </button>
                ))}
              </div>

              <div className="p-4 space-y-3">
                {activeTab === 'stats' && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-text-muted border-b border-border-subtle/50 pb-1">
                      <span>Gene Name / Target:</span><span className="text-text-bright font-bold">{data.geneName}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Motif Engine:</span><span className="text-neon-blue font-bold">{data.detectedMotif?.matchType === 'regex' ? 'Regex Regular Expressions' : 'Generalized Suffix Tree'}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Transcribed mRNA Length:</span><span className="text-text-bright">{data.rnaSequence.length} nt</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Translated Protein Length:</span><span className="text-neon-blue font-bold">{data.proteinSequence.length} AA</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Est. Protein MW:</span><span className="text-text-bright">{(data.proteinSequence.length * 110 / 1000).toFixed(1)} kDa</span>
                    </div>
                  </div>
                )}

                {activeTab === 'translation' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase">Transcribed mRNA (5'→3'):</span>
                        <button onClick={() => handleCopy(data.rnaSequence)} className="text-[10px] font-mono text-neon-blue hover:text-text-bright flex items-center gap-1 transition-colors">
                          {copied ? <CheckCircle2 className="w-3 h-3 text-neon-green" /> : <Clipboard className="w-3 h-3" />} Copy
                        </button>
                      </div>
                      <div className="bg-surface-base p-2 rounded border border-border-subtle text-xs font-mono text-neon-blue break-all max-h-20 overflow-y-auto">
                        {data.rnaSequence.substring(0, 300)}{data.rnaSequence.length > 300 ? '...' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase">Translated Protein (Amino Acid Chain):</span>
                        <button onClick={() => handleCopy(data.proteinSequence)} className="text-[10px] font-mono text-neon-green hover:text-text-bright flex items-center gap-1 transition-colors">
                          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />} Copy
                        </button>
                      </div>
                      <div className="bg-surface-base p-2 rounded border border-neon-green/30 text-xs font-mono text-neon-green font-bold break-all max-h-28 overflow-y-auto">
                        {data.proteinSequence}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'frames' && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-text-muted mb-2">
                      6-Frame translation (3 forward + 3 reverse complement). ORFs ≥ 10 AA highlighted.
                    </div>
                    {readingFrames.length === 0 ? (
                      <div className="text-[10px] font-mono text-text-muted">Computing reading frames...</div>
                    ) : (
                      readingFrames.map(frame => (
                        <div key={frame.frame} className="bg-surface-base border border-border-subtle rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-mono font-bold ${frame.frame.startsWith('+') ? 'text-neon-green' : 'text-neon-blue'}`}>
                              Frame {frame.frame}
                            </span>
                            <span className="text-[9px] font-mono text-text-muted">{frame.orfs.length} ORF(s) found</span>
                          </div>
                          {frame.longestOrf ? (
                            <div className="text-[10px] font-mono text-text-bright break-all leading-relaxed">
                              <span className="text-text-muted">Longest ORF ({frame.longestOrf.length} AA): </span>
                              <span className={frame.frame.startsWith('+') ? 'text-neon-green' : 'text-neon-blue'}>
                                {frame.longestOrf.substring(0, 50)}{frame.longestOrf.length > 50 ? '...' : ''}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-text-muted/50">No ORF ≥ 10 AA in this frame</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Handoff Button */}
            <button
              onClick={runModule2}
              disabled={state.isLoading}
              className="w-full bg-neon-green text-surface-base hover:bg-neon-green/90 font-mono font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20 transition-all disabled:opacity-60 active:scale-[0.98]"
            >
              {state.isLoading
                ? '⚡ Running ESMFold Inference...'
                : <>🚀 PASS PROTEIN TO ESMFOLD 3D MODELING <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
