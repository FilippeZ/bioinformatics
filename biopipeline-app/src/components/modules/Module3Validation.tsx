import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import type { SingleAlignmentResult } from '../../types/bio';
import { ContextHelp } from '../common/ContextHelp';
import { Tooltip } from '../common/Tooltip';
import { ShieldAlert, ArrowRight, Activity, Cpu, TestTube, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Sliders } from 'lucide-react';

function AlignmentRow({ query, targetSeq }: { query: string; targetSeq: string }) {
  const matchSymbolLine = query.split('').map((c, i) => {
    if (c === targetSeq[i] && c !== '-') return '|';
    if (c === '-' || targetSeq[i] === '-') return ' ';
    return ':';
  }).join('');

  return (
    <div className="font-mono text-xs overflow-x-auto leading-relaxed p-3 bg-surface-base/90 rounded-2xl border border-white/10 shadow-inner">
      <div className="flex gap-2">
        <span className="text-slate-400 w-20 shrink-0 font-bold font-sans">QUERY:</span>
        <span className="text-emerald-400 whitespace-pre font-bold tracking-widest">{query}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-slate-400 w-20 shrink-0"></span>
        <span className="text-amber-300 whitespace-pre font-bold tracking-widest">{matchSymbolLine}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-slate-400 w-20 shrink-0 font-bold font-sans">TARGET:</span>
        <span className="text-sky-400 whitespace-pre font-bold tracking-widest">{targetSeq}</span>
      </div>
    </div>
  );
}

export const Module3Validation: React.FC = () => {
  const { state, runModule3, setStep } = usePipeline();
  const mod3Data = state.module3Data;

  const [matchScore, setMatchScore] = useState(1);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [gapPenalty, setGapPenalty] = useState(-1);
  const [activeTarget, setActiveTarget] = useState(0);
  const [showAllTargets, setShowAllTargets] = useState(false);

  const confidenceThreshold = 65;
  const passes = mod3Data ? mod3Data.validityScore >= confidenceThreshold : false;

  const allAlignments = (mod3Data as any)?.allAlignments as SingleAlignmentResult[] | undefined;
  const currentAlignment = allAlignments ? allAlignments[activeTarget] : null;

  const featureBars = mod3Data ? [
    { label: 'Hydrophobicity (%)', value: mod3Data.features.hydrophobicity, color: 'bg-emerald-400', maxVal: 100 },
    { label: 'Net Charge Ratio (%)', value: mod3Data.features.charge, color: 'bg-sky-400', maxVal: 50 },
    { label: 'MW (kDa)', value: Math.min(60, mod3Data.features.molecularWeight), color: 'bg-purple-400', maxVal: 60 },
    { label: 'Identity %', value: mod3Data.alignment.identityPercent, color: 'bg-emerald-400/80', maxVal: 100 },
    { label: 'Similarity %', value: mod3Data.alignment.similarityPercent, color: 'bg-sky-400/80', maxVal: 100 },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Contextual Help Banner ── */}
      <ContextHelp
        headline="✅ Step 3: Is This a Good Drug Target?"
        narrative="Not every protein makes a good drug target. Here, our AI compares your protein to known disease proteins using sequence alignment — like checking how similar two fingerprints are. A score above 65% means we found a strong match and can proceed to drug screening."
        whyItMatters="Targeting the wrong protein wastes time and money. This step acts as a 'quality gate' to ensure we only proceed with proteins that are scientifically validated as drug targets."
        facts={[
          { emoji: '🔒', label: 'Need ≥65% score to unlock Step 4' },
          { emoji: '🧬', label: 'Compares to 4 known disease proteins' },
          { emoji: '🤖', label: 'AI-powered classification' },
        ]}
        accent="violet"
      />

      {/* ── Stage Header Banner ── */}
      <div className="relative bg-gradient-to-r from-emerald-950/60 via-purple-900/30 to-surface-container border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-sans font-medium">
              <span className="text-base">✅</span>
              <span>Step 3 of 5 · Drug Target Confirmation</span>
            </div>
            <span className="text-xs font-sans text-emerald-300/80 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1 rounded-full shadow-inner">
              Required Threshold: ≥ {confidenceThreshold}%
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            Confirm Drug Target &amp; Evaluate Match Score
          </h2>

          <p className="text-sm font-sans text-slate-300 max-w-3xl leading-relaxed">
            Before searching for drug molecules, our machine learning model compares your 3D protein against known disease targets (using Needleman-Wunsch global alignment) to ensure it is safe and suitable for drug therapy.
          </p>
        </div>
      </div>

      {/* ── Alignment Scoring Settings Card ── */}
      <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-xs font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <Tooltip
              term="Sequence Comparison Rules"
              definition="Needleman-Wunsch is an algorithm that slides two protein sequences alongside each other, awarding points for matches and deducting for mismatches or gaps — similar to a 'diff' for genetic code."
            />
          </div>
          <span className="text-[11px] font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded-full font-medium">
            Standard: Match +1, Mismatch -1, Gap -1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-base/80 border border-white/10">
            <span className="text-slate-300">Match Score:</span>
            <input
              type="number" value={matchScore}
              onChange={e => setMatchScore(Number(e.target.value))}
              className="w-16 bg-surface-base border border-emerald-500/50 rounded-xl px-2.5 py-1 text-emerald-400 text-center font-bold text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-base/80 border border-white/10">
            <span className="text-slate-300">Mismatch Penalty:</span>
            <input
              type="number" value={mismatchScore}
              onChange={e => setMismatchScore(Number(e.target.value))}
              className="w-16 bg-surface-base border border-red-500/50 rounded-xl px-2.5 py-1 text-red-400 text-center font-bold text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-base/80 border border-white/10">
            <span className="text-slate-300">Gap Penalty:</span>
            <input
              type="number" value={gapPenalty}
              onChange={e => setGapPenalty(Number(e.target.value))}
              className="w-16 bg-surface-base border border-amber-500/50 rounded-xl px-2.5 py-1 text-amber-300 text-center font-bold text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ── Action Button ── */}
      <button
        onClick={() => runModule3(matchScore, mismatchScore, gapPenalty)}
        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-display font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <TestTube className="w-5 h-5 fill-slate-950" />
        Run Drug Target Suitability Check
      </button>

      {/* ── Results Display ── */}
      {mod3Data && (
        <div className="space-y-6">

          {/* All Target Alignments Accordion */}
          {allAlignments && allAlignments.length > 0 && (
            <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <button
                onClick={() => setShowAllTargets(p => !p)}
                className="w-full flex items-center justify-between p-5 text-sm font-display font-bold text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  View Alignment Across All 4 Reference Targets (Best Match: <span className="text-emerald-400">{allAlignments[0]?.name}</span>)
                </div>
                {showAllTargets ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showAllTargets && (
                <div className="border-t border-white/10 p-5 space-y-4">
                  {/* Tabs */}
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {allAlignments.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTarget(i)}
                        className={`px-4 py-2 text-xs font-sans rounded-xl font-semibold shrink-0 transition-all cursor-pointer ${
                          activeTarget === i
                            ? 'bg-sky-500/20 border border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                            : 'bg-surface-base/80 border border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {i === 0 && '🥇 '}{t.id} ({t.alignment.identityPercent}% ID)
                      </button>
                    ))}
                  </div>

                  {currentAlignment && (
                    <div className="space-y-4 bg-surface-base/50 rounded-2xl p-4 border border-white/5">
                      <div className="grid grid-cols-3 gap-3 font-sans text-xs">
                        <div className="bg-surface-base p-3 rounded-2xl border border-white/10 text-center">
                          <div className="text-slate-400 text-[11px] mb-1">Identity %</div>
                          <div className="text-2xl font-display font-bold text-emerald-400">{currentAlignment.alignment.identityPercent}%</div>
                        </div>
                        <div className="bg-surface-base p-3 rounded-2xl border border-white/10 text-center">
                          <div className="text-slate-400 text-[11px] mb-1">Similarity %</div>
                          <div className="text-2xl font-display font-bold text-sky-400">{currentAlignment.alignment.similarityPercent}%</div>
                        </div>
                        <div className="bg-surface-base p-3 rounded-2xl border border-white/10 text-center">
                          <div className="text-slate-400 text-[11px] mb-1">NW Alignment Score</div>
                          <div className="text-2xl font-display font-bold text-white">{currentAlignment.alignment.score}</div>
                        </div>
                      </div>
                      <div className="text-xs font-sans text-slate-300">{currentAlignment.description}</div>
                      <AlignmentRow
                        query={currentAlignment.alignment.alignedQuery}
                        targetSeq={currentAlignment.alignment.alignedRef}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Diagnostics Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Left: Best Alignment */}
            <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Best Disease Target Alignment Match
              </h3>

              <div className="grid grid-cols-3 gap-3 font-sans text-xs">
                <div className="bg-surface-base/90 p-3 rounded-2xl border border-white/10 text-center">
                  <div className="text-slate-400 text-[11px] mb-1">Identity %</div>
                  <div className="text-2xl font-display font-bold text-emerald-400">{mod3Data.alignment.identityPercent}%</div>
                </div>
                <div className="bg-surface-base/90 p-3 rounded-2xl border border-white/10 text-center">
                  <div className="text-slate-400 text-[11px] mb-1">Similarity %</div>
                  <div className="text-2xl font-display font-bold text-sky-400">{mod3Data.alignment.similarityPercent}%</div>
                </div>
                <div className="bg-surface-base/90 p-3 rounded-2xl border border-white/10 text-center">
                  <div className="text-slate-400 text-[11px] mb-1">Score</div>
                  <div className="text-2xl font-display font-bold text-white">{mod3Data.alignment.score}</div>
                </div>
              </div>

              <div className="bg-surface-base/90 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs font-sans text-slate-300">
                  Best match disease target: <strong className="text-sky-400 font-bold">{mod3Data.alignment.matchedDiseaseTarget}</strong>
                </div>
                <AlignmentRow
                  query={mod3Data.alignment.alignedQuery}
                  targetSeq={mod3Data.alignment.alignedRef}
                />
              </div>
            </div>

            {/* Right: ML Classification */}
            <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Target Suitability Machine Learning Score
              </h3>

              {/* Score Card */}
              <div className={`p-5 rounded-2xl border ${passes ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-red-500/10 border-red-500/40'}`}>
                <div className={`text-xs font-sans font-bold flex items-center gap-1.5 ${passes ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passes ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {passes ? '✓ Strong Drug Target — Proceeding to Molecule Screening' : 'Below Required Threshold'}
                </div>
                <div className={`text-5xl font-display font-black mt-2 ${passes ? 'text-emerald-400' : 'text-red-400'}`}>
                  {mod3Data.validityScore}%
                </div>
                <div className="text-xs font-sans text-text-bright font-semibold mt-1">
                  {mod3Data.validityScore >= 90
                    ? 'Excellent! This protein is a prime drug target.'
                    : mod3Data.validityScore >= 65
                      ? 'Good match — this protein is suitable for drug therapy.'
                      : `Not enough evidence yet. Try adjusting the scoring rules above (need ≥${confidenceThreshold}%).`}
                </div>
                <div className="text-[10px] font-sans text-slate-400 mt-0.5">
                  <Tooltip term="Drug Target Score" definition="This AI-calculated score (0–100%) reflects how well the protein's physical and chemical properties match known druggable proteins. Above 65% = proceed. Below 65% = not recommended." />
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${passes ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${mod3Data.validityScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-sans text-slate-400 mt-1">
                  <span>0%</span><span className="text-emerald-400 font-bold">Required: {confidenceThreshold}%</span><span>100%</span>
                </div>
              </div>

              {/* Feature Descriptors */}
              <div className="space-y-3 bg-surface-base/90 rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-sans font-bold text-slate-300 flex items-center gap-1">
                  Protein Properties Evaluated
                  <Tooltip term="What are these properties?" definition="These are physical and chemical properties of the protein. The AI uses them as 'features' to predict how druggable the protein is — similar to a medical checkup for the molecule." />
                </div>
                {[
                  { ...featureBars[0], label: 'Water Repellency (Hydrophobicity)', friendly: 'How well a drug can bind to this protein' },
                  { ...featureBars[1], label: 'Electrical Charge Ratio', friendly: 'Affects how drug molecules interact with the protein' },
                  { ...featureBars[2], label: 'Protein Size (Molecular Weight)', friendly: 'Larger proteins have more potential binding sites' },
                  { ...featureBars[3], label: 'Sequence Identity Match', friendly: 'How similar to known disease targets' },
                  { ...featureBars[4], label: 'Sequence Similarity Score', friendly: 'Broader similarity including related amino acids' },
                ].map(f => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between font-sans text-xs">
                      <span className="text-slate-300 font-medium">{f.label}</span>
                      <span className="text-white font-bold">{f.value.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, (f.value / f.maxVal) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-sans text-xs pt-2 border-t border-white/5">
                  <span className="text-slate-400">Druggability Category:</span>
                  <span className={`font-bold ${mod3Data.druggabilityCategory === 'High Druggability' ? 'text-emerald-400' : mod3Data.druggabilityCategory === 'Moderate Druggability' ? 'text-amber-400' : 'text-red-400'}`}>
                    {mod3Data.druggabilityCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Handoff Button */}
          {passes ? (
            <button
              onClick={() => setStep(4)}
              className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300 font-display font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              🎉 Target Confirmed! Proceed to Screen Drug Molecules <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-3xl text-center font-sans text-sm text-red-300 flex items-center justify-center gap-2 backdrop-blur-md">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
              Score of {mod3Data.validityScore}% is below the required {confidenceThreshold}%. Try adjusting the Match/Mismatch scores above and run again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
