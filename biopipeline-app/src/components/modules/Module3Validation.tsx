import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import type { SingleAlignmentResult } from '../../types/bio';
import { ShieldCheck, ShieldAlert, ArrowRight, Activity, Cpu, TestTube, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function AlignmentRow({ row, query, ref: refSeq }: { row: string; query: string; ref: string }) {
  return (
    <div className="font-mono text-[10px] overflow-x-auto">
      <div className="flex gap-1">
        <span className="text-text-muted w-14 shrink-0">QUERY:</span>
        <span className="text-neon-green whitespace-nowrap">{query.substring(0, 70)}</span>
      </div>
      <div className="flex gap-1">
        <span className="text-text-muted w-14 shrink-0"></span>
        <span className="text-text-muted/50 whitespace-nowrap">
          {query.substring(0, 70).split('').map((c, i) => c === refSeq[i] ? '|' : c === '-' || refSeq[i] === '-' ? ' ' : ':').join('')}
        </span>
      </div>
      <div className="flex gap-1">
        <span className="text-text-muted w-14 shrink-0">TARGET:</span>
        <span className="text-neon-blue whitespace-nowrap">{refSeq.substring(0, 70)}</span>
      </div>
    </div>
  );
}

export const Module3Validation: React.FC = () => {
  const { state, runModule3, setStep } = usePipeline();
  const mod3Data = state.module3Data;

  const [matchScore, setMatchScore] = useState(2);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [gapPenalty, setGapPenalty] = useState(-2);
  const [activeTarget, setActiveTarget] = useState(0);
  const [showAllTargets, setShowAllTargets] = useState(false);

  const confidenceThreshold = 65;
  const passes = mod3Data ? mod3Data.validityScore >= confidenceThreshold : false;

  const allAlignments = (mod3Data as any)?.allAlignments as SingleAlignmentResult[] | undefined;
  const currentAlignment = allAlignments ? allAlignments[activeTarget] : null;

  // Feature bars for One-Hot encoding visualization
  const featureBars = mod3Data ? [
    { label: 'Hydrophobicity', value: mod3Data.features.hydrophobicity, color: 'bg-neon-green', maxVal: 60 },
    { label: 'Net Charge Ratio', value: mod3Data.features.charge, color: 'bg-neon-blue', maxVal: 50 },
    { label: 'MW (kDa)', value: Math.min(60, mod3Data.features.molecularWeight), color: 'bg-accent-amber', maxVal: 60 },
    { label: 'Identity %', value: mod3Data.alignment.identityPercent, color: 'bg-neon-green/70', maxVal: 100 },
    { label: 'Similarity %', value: mod3Data.alignment.similarityPercent, color: 'bg-neon-blue/70', maxVal: 100 },
  ] : [];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Stage Banner */}
      <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel">
        <div className="flex items-center space-x-2 text-xs font-mono text-neon-green uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>🛡️ Stage 3: Automated Feature Engineering & Target Validation Gate</span>
        </div>
        <h2 className="text-lg font-display font-bold text-text-bright">Needleman-Wunsch Alignment + One-Hot ML Classification</h2>
        <p className="text-xs text-text-muted mt-0.5 max-w-3xl">
          Dual validation: Dynamic Programming global alignment against <strong className="text-neon-blue">4 known disease targets</strong> + Logistic Regression One-Hot ML classifier. Confidence threshold: ≥{confidenceThreshold}% to unlock drug screening.
        </p>
      </div>

      {/* DP Parameters Config */}
      <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel">
        <div className="text-xs font-mono text-text-muted font-semibold mb-3">⚙️ Needleman-Wunsch DP Scoring Parameters</div>
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Match Score:</span>
            <input
              type="number" value={matchScore}
              onChange={e => setMatchScore(Number(e.target.value))}
              className="w-16 bg-surface-base border border-neon-green/40 rounded px-2 py-1 text-neon-green text-center focus:outline-none focus:border-neon-green"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Mismatch Penalty:</span>
            <input
              type="number" value={mismatchScore}
              onChange={e => setMismatchScore(Number(e.target.value))}
              className="w-16 bg-surface-base border border-data-error/40 rounded px-2 py-1 text-data-error text-center focus:outline-none focus:border-data-error"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Gap Penalty:</span>
            <input
              type="number" value={gapPenalty}
              onChange={e => setGapPenalty(Number(e.target.value))}
              className="w-16 bg-surface-base border border-border-subtle rounded px-2 py-1 text-text-muted text-center focus:outline-none"
            />
          </div>
          <div className="text-text-muted text-[10px] ml-auto">Algorithm: Needleman-Wunsch (Global) → Logistic Regression</div>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={() => runModule3(matchScore, mismatchScore, gapPenalty)}
        className="w-full bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/60 text-neon-blue font-mono font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all max-w-6xl shadow-sm shadow-neon-blue/10 active:scale-[0.98]"
      >
        <TestTube className="w-5 h-5" />
        🧪 EVALUATE TARGET VALIDITY & ALIGNMENT (All 4 Disease Targets)
      </button>

      {mod3Data && (
        <div className="space-y-4">
          {/* Multi-target alignment tabs */}
          {allAlignments && allAlignments.length > 0 && (
            <div className="bg-surface-container border border-border-subtle rounded-xl glass-panel overflow-hidden">
              <button
                onClick={() => setShowAllTargets(p => !p)}
                className="w-full flex items-center justify-between p-4 text-sm font-display font-semibold text-text-bright"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neon-blue" />
                  Multi-Target NW Alignment Results (Best Match: {allAlignments[0]?.name})
                </div>
                {showAllTargets ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>

              {showAllTargets && (
                <div className="border-t border-border-subtle">
                  {/* Target selector tabs */}
                  <div className="flex overflow-x-auto border-b border-border-subtle">
                    {allAlignments.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTarget(i)}
                        className={`px-3 py-2 text-[10px] font-mono font-semibold whitespace-nowrap shrink-0 transition-all border-b-2 ${activeTarget === i ? 'border-neon-blue text-neon-blue bg-neon-blue/5' : 'border-transparent text-text-muted hover:text-text-bright'}`}
                      >
                        {i === 0 && '🥇 '}{t.id} ({t.alignment.identityPercent}% ID)
                      </button>
                    ))}
                  </div>

                  {/* Alignment view for active target */}
                  {currentAlignment && (
                    <div className="p-4 space-y-3">
                      <div className="flex flex-wrap gap-3 font-mono text-xs">
                        <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center flex-1">
                          <div className="text-[10px] text-text-muted">Identity %</div>
                          <div className="text-xl font-bold text-neon-green">{currentAlignment.alignment.identityPercent}%</div>
                        </div>
                        <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center flex-1">
                          <div className="text-[10px] text-text-muted">Similarity %</div>
                          <div className="text-xl font-bold text-neon-blue">{currentAlignment.alignment.similarityPercent}%</div>
                        </div>
                        <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center flex-1">
                          <div className="text-[10px] text-text-muted">NW Score</div>
                          <div className="text-xl font-bold text-text-bright">{currentAlignment.alignment.score}</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-text-muted">{currentAlignment.description}</div>
                      <div className="bg-surface-base p-3 rounded-lg border border-border-subtle overflow-x-auto">
                        <div className="text-[9px] text-text-muted mb-2">Alignment traceback → {currentAlignment.name}:</div>
                        <AlignmentRow
                          row={currentAlignment.id}
                          query={currentAlignment.alignment.alignedQuery}
                          ref={currentAlignment.alignment.alignedRef}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main diagnostics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Left: Best NW alignment */}
            <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel space-y-3">
              <h3 className="font-display font-semibold text-sm text-text-bright flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-blue" />
                Best Match: Needleman-Wunsch Alignment
              </h3>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center">
                  <div className="text-[10px] text-text-muted">Identity %</div>
                  <div className="text-xl font-bold text-neon-green">{mod3Data.alignment.identityPercent}%</div>
                </div>
                <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center">
                  <div className="text-[10px] text-text-muted">Similarity %</div>
                  <div className="text-xl font-bold text-neon-blue">{mod3Data.alignment.similarityPercent}%</div>
                </div>
                <div className="bg-surface-base p-2.5 rounded border border-border-subtle text-center">
                  <div className="text-[10px] text-text-muted">NW Score</div>
                  <div className="text-xl font-bold text-text-bright">{mod3Data.alignment.score}</div>
                </div>
              </div>

              <div className="bg-surface-base p-3 rounded-lg border border-border-subtle">
                <div className="text-[9px] text-text-muted mb-2">Best match target: {mod3Data.alignment.matchedDiseaseTarget}</div>
                <AlignmentRow
                  row=""
                  query={mod3Data.alignment.alignedQuery}
                  ref={mod3Data.alignment.alignedRef}
                />
              </div>
            </div>

            {/* Right: One-Hot ML Classification */}
            <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel space-y-3">
              <h3 className="font-display font-semibold text-sm text-text-bright flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neon-green" />
                One-Hot ML Feature Classification
              </h3>

              {/* Big Score */}
              <div className={`p-4 rounded-xl border ${passes ? 'bg-neon-green/10 border-neon-green/40' : 'bg-data-error/10 border-data-error/30'}`}>
                <div className={`text-[11px] font-mono uppercase tracking-wider ${passes ? 'text-neon-green' : 'text-data-error'}`}>
                  Logistic Regression → {passes ? 'Valid Pharmaceutical Target ✓' : 'Low Confidence Target ✗'}
                </div>
                <div className={`text-4xl font-display font-bold mt-1 ${passes ? 'text-neon-green' : 'text-data-error'}`}>
                  {mod3Data.validityScore}%
                </div>
                <div className="text-[11px] font-mono text-text-muted mt-0.5">ML Confidence Score (σ-weighted logistic)</div>
                <div className="w-full bg-surface-base h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${passes ? 'bg-neon-green' : 'bg-data-error'}`}
                    style={{ width: `${mod3Data.validityScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-text-muted mt-1">
                  <span>0%</span><span className="text-neon-green">Threshold: {confidenceThreshold}%</span><span>100%</span>
                </div>
              </div>

              {/* One-Hot feature bars */}
              <div className="space-y-2">
                <div className="text-[10px] text-text-muted uppercase font-semibold font-mono">One-Hot Feature Vector (Biochemical):</div>
                {featureBars.map(f => (
                  <div key={f.label} className="space-y-0.5">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-text-muted">{f.label}</span>
                      <span className="text-text-bright font-bold">{f.value.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-base rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (f.value / f.maxVal) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-text-muted">Druggability:</span>
                  <span className={`font-bold ${mod3Data.druggabilityCategory === 'High Druggability' ? 'text-neon-green' : mod3Data.druggabilityCategory === 'Moderate Druggability' ? 'text-accent-amber' : 'text-data-error'}`}>
                    {mod3Data.druggabilityCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Gate Status */}
          {passes ? (
            <div className="bg-neon-green/10 border border-neon-green/40 rounded-xl p-4 flex items-center gap-3 font-mono text-sm text-neon-green">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <div className="font-bold">🟢 VALIDATION PASSED — Confidence {mod3Data.validityScore}% ≥ {confidenceThreshold}% Threshold</div>
                <div className="text-xs mt-0.5 text-neon-green/80">Target unlocked for Cheminformatics Compound Screening. Drug discovery pipeline may proceed.</div>
              </div>
            </div>
          ) : (
            <div className="bg-data-error/10 border border-data-error/30 rounded-xl p-4 flex items-center gap-3 font-mono text-sm text-data-error">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <div className="font-bold">⚠️ TARGET VALIDATION FAILED — Low confidence ({mod3Data.validityScore}% &lt; {confidenceThreshold}%)</div>
                <div className="text-xs mt-0.5">The pipeline has halted. Return to Stage 1 and provide a different DNA sequence or adjust the scoring parameters above.</div>
              </div>
            </div>
          )}

          {/* Gate-controlled handoff */}
          <button
            onClick={() => setStep(4)}
            disabled={!passes}
            className="w-full bg-neon-green text-surface-base hover:bg-neon-green/90 font-mono font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed max-w-6xl active:scale-[0.98]"
          >
            🧹 OPEN CHEMINFORMATICS COMPOUND FILTER
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
