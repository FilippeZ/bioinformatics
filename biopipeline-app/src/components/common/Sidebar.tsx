import React, { useEffect, useRef, useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  Dna, Box, ShieldCheck, Beaker, Trophy, TerminalSquare, Info
} from 'lucide-react';

// ─── Seed log entries ───────────────────────────────────────────────────────
const BASE_TIME = new Date();
BASE_TIME.setHours(10, 49, 3, 0);
function fmtTime(offsetSeconds: number): string {
  const d = new Date(BASE_TIME.getTime() + offsetSeconds * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
const SEED_LOGS: Array<{ ts: string; msg: string; type: 'info' | 'success' | 'warn' | 'active' }> = [
  { ts: fmtTime(0),  msg: '🟢 BioHelix platform is ready',           type: 'info' },
  { ts: fmtTime(2),  msg: '🤖 AI model loaded (Random Forest QSAR)', type: 'success' },
  { ts: fmtTime(2),  msg: '🔐 Secure session started',               type: 'info' },
];

const useAuditLog = (state: ReturnType<typeof usePipeline>['state']) => {
  const [logs, setLogs] = useState(SEED_LOGS);
  const seen = useRef<Set<string>>(new Set(['init', 'model', 'session']));
  const lastStep = useRef(state.currentStep);
  const addLog = (key: string, entry: (typeof SEED_LOGS)[0]) => {
    if (seen.current.has(key)) return;
    seen.current.add(key);
    setLogs(prev => [...prev.slice(-22), entry]);
  };

  useEffect(() => {
    if (state.module1Data) {
      addLog('stage1-start', { ts: fmtTime(3),  msg: '🧬 DNA decoded! Searching for gene patterns…',          type: 'active' });
      addLog('stage1-gc',    { ts: fmtTime(3),  msg: `✅ GC Content: ${state.module1Data.gcContent}%`,         type: 'success' });
    }
    const step = state.currentStep;
    if (step !== lastStep.current) {
      lastStep.current = step;
      const map: Record<number, { key: string; ts: number; msg: string; type: 'active' }> = {
        2: { key: 'stage2', ts: 19, msg: '🤖 Building AI 3D protein model…',      type: 'active' },
        3: { key: 'stage3', ts: 41, msg: '🔍 Checking drug target suitability…',  type: 'active' },
        4: { key: 'stage4', ts: 45, msg: '🧪 Filtering 1,000 molecules…',         type: 'active' },
        5: { key: 'stage5', ts: 52, msg: '🏆 Ranking drug candidates with AI…',   type: 'active' },
      };
      if (map[step]) {
        const { key, ts, msg, type } = map[step];
        addLog(key, { ts: fmtTime(ts), msg, type });
      }
    }
    if (state.module2Data) {
      addLog('esmfold-ok', { ts: fmtTime(22), msg: `✨ 3D model ready! Quality: ${state.module2Data.meanPlddt}%`, type: 'success' });
    }
    if (state.module3Data) {
      const pass = state.module3Data.isValidated;
      addLog('val-result', {
        ts: fmtTime(42),
        msg: pass
          ? `✅ Drug target confirmed! Score: ${state.module3Data.validityScore}%`
          : `⚠️ Target not confirmed (Score: ${state.module3Data.validityScore}%)`,
        type: pass ? 'success' : 'warn',
      });
    }
    if (state.module5Data) {
      addLog('qsar-complete', {
        ts: fmtTime(59),
        msg: `🏆 Best drug: ${state.module5Data.topCandidates[0]?.molecule.name ?? 'Paxlovid'}!`,
        type: 'success',
      });
    }
  }, [state]);
  return logs;
};

// ─── Step summary items ──────────────────────────────────────────────────────
const STEP_ITEMS = [
  { id: 1, icon: Dna,        label: 'Read DNA',         emoji: '🧬', getData: (s: ReturnType<typeof usePipeline>['state']) => s.module1Data ? `${s.module1Data.sequenceLength.toLocaleString()} bp · GC ${s.module1Data.gcContent}%` : null },
  { id: 2, icon: Box,        label: 'Build 3D Model',   emoji: '🤖', getData: (s: ReturnType<typeof usePipeline>['state']) => s.module2Data ? `Quality: ${s.module2Data.meanPlddt}% · ${s.module2Data.numResidues} residues` : null },
  { id: 3, icon: ShieldCheck,label: 'Confirm Target',   emoji: '✅', getData: (s: ReturnType<typeof usePipeline>['state']) => s.module3Data ? `${s.module3Data.isValidated ? '✓ PASS' : '✗ FAIL'} — ${s.module3Data.validityScore}% drug target score` : null },
  { id: 4, icon: Beaker,     label: 'Screen Molecules', emoji: '🧪', getData: (s: ReturnType<typeof usePipeline>['state']) => s.module4Data ? `${s.module4Data.filteredMolecules.length} / ${s.module4Data.rawMolecules.length} passed` : null },
  { id: 5, icon: Trophy,     label: 'Find Best Drug',   emoji: '🏆', getData: (s: ReturnType<typeof usePipeline>['state']) => s.module5Data ? `#1: ${s.module5Data.topCandidates[0]?.molecule.name ?? '—'}` : null },
];

const logColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-bio-emerald';
    case 'active':  return 'text-brand-indigo';
    case 'warn':    return 'text-bio-amber';
    default:        return 'text-text-muted/50';
  }
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const { state } = usePipeline();
  const logs = useAuditLog(state);
  const logRef = useRef<HTMLDivElement>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [showSimple, setShowSimple] = useState(true);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const completedCount = [
    !!state.module1Data,
    !!state.module2Data,
    !!state.module3Data,
    !!state.module4Data,
    !!state.module5Data,
  ].filter(Boolean).length;

  return (
    <aside className="h-full bg-gradient-to-b from-surface-container to-surface-base/95 border-r border-border-subtle/60 flex flex-col overflow-hidden">

      {/* ── System Status Strip ── */}
      <div className="px-4 py-3 border-b border-border-subtle/30 bg-surface-base/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-bio-emerald animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-bio-emerald/40 animate-ping" />
            </div>
            <span className="text-[10px] font-sans font-semibold text-bio-emerald tracking-wide uppercase">
              System Ready
            </span>
          </div>
          {/* Simple / Expert toggle */}
          <div className="flex items-center gap-1 bg-surface-container-highest rounded-lg p-0.5">
            <button
              onClick={() => setShowSimple(true)}
              className={`text-[9px] font-sans px-2 py-0.5 rounded-md transition-all ${showSimple ? 'bg-brand-indigo text-white' : 'text-text-muted hover:text-text-bright'}`}
            >
              Simple
            </button>
            <button
              onClick={() => setShowSimple(false)}
              className={`text-[9px] font-sans px-2 py-0.5 rounded-md transition-all ${!showSimple ? 'bg-brand-indigo text-white' : 'text-text-muted hover:text-text-bright'}`}
            >
              Expert
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-subtle">

        {showSimple ? (
          /* ── SIMPLE VIEW: Your Journey ─────────────────────────────── */
          <div className="px-4 pt-4 pb-2">
            <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted/60 mb-3">
              Your Journey
            </div>

            <div className="space-y-2">
              {STEP_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isDone = item.getData(state) !== null;
                const isCurrent = state.currentStep === item.id;
                const isPast = state.currentStep > item.id;
                const summary = item.getData(state);

                return (
                  <div
                    key={item.id}
                    className={`
                      relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-300
                      ${isCurrent
                        ? 'bg-brand-indigo/10 border-brand-indigo/30'
                        : isDone
                          ? 'bg-bio-emerald/5 border-bio-emerald/15'
                          : 'bg-surface-base/40 border-border-subtle/30 opacity-50'
                      }
                    `}
                  >
                    {/* Status icon */}
                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5
                      ${isCurrent ? 'bg-brand-indigo/20 text-brand-indigo'
                        : isDone ? 'bg-bio-emerald/15 text-bio-emerald'
                        : 'bg-surface-container-high text-text-muted/30'
                      }`}
                    >
                      {isDone && !isCurrent
                        ? <CheckCircle2 className="w-4 h-4" />
                        : isCurrent
                          ? <Clock className="w-4 h-4 animate-pulse" />
                          : <Circle className="w-4 h-4" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold font-sans flex items-center gap-1.5
                        ${isCurrent ? 'text-text-bright' : isDone ? 'text-bio-emerald' : 'text-text-muted/50'}`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        {item.emoji} {item.label}
                        {isCurrent && <span className="text-[9px] font-normal text-brand-indigo bg-brand-indigo/15 px-1.5 py-0.5 rounded-full">In progress</span>}
                        {isDone && !isCurrent && <span className="text-[9px] font-normal text-bio-emerald">✓ Done</span>}
                      </div>
                      {summary && (
                        <div className="text-[10px] font-sans text-text-muted mt-0.5 leading-relaxed">
                          {summary}
                        </div>
                      )}
                    </div>

                    {/* Connecting line */}
                    {idx < STEP_ITEMS.length - 1 && (
                      <div className={`absolute left-[22px] top-[calc(100%+1px)] w-0.5 h-2 rounded-full
                        ${isPast || isDone ? 'bg-bio-emerald/30' : 'bg-border-subtle/30'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall progress */}
            <div className="mt-4 pt-3 border-t border-border-subtle/30">
              <div className="flex justify-between text-[10px] font-sans text-text-muted mb-1.5">
                <span>Overall Progress</span>
                <span className="text-text-bright font-semibold">{completedCount} / 5 steps</span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(completedCount / 5) * 100}%`,
                    background: 'linear-gradient(90deg, #6366F1, #10B981)',
                  }}
                />
              </div>
            </div>

            {/* Next action hint */}
            {completedCount < 5 && (
              <div className="mt-3 p-3 rounded-xl bg-brand-indigo/8 border border-brand-indigo/20">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-indigo shrink-0 mt-0.5" />
                  <div className="text-[10px] font-sans text-text-muted leading-relaxed">
                    <span className="text-text-bright font-semibold block mb-0.5">Next:</span>
                    {completedCount === 0 && 'Click "Analyze DNA Sequence" in Step 1 to begin.'}
                    {completedCount === 1 && 'Go to Step 2 and click "Predict 3D Structure" to build the protein model.'}
                    {completedCount === 2 && 'Go to Step 3 and click "Run Target Validation" to confirm suitability.'}
                    {completedCount === 3 && 'Step 4 is unlocked! Adjust filters then click "Continue to Drug Ranking".'}
                    {completedCount === 4 && 'Go to Step 5 and click "Run AI Drug Ranking" to see your top drug candidates!'}
                  </div>
                </div>
              </div>
            )}

            {/* Completion celebration */}
            {completedCount === 5 && (
              <div className="mt-3 p-3 rounded-xl bg-bio-emerald/10 border border-bio-emerald/30 animate-celebrate text-center">
                <div className="text-lg mb-1">🎉</div>
                <div className="text-xs font-bold text-bio-emerald">Pipeline Complete!</div>
                <div className="text-[10px] text-text-muted mt-0.5">Download your report in Step 5</div>
              </div>
            )}
          </div>

        ) : (
          /* ── EXPERT VIEW: Technical HUD ─────────────────────────────── */
          <div className="px-3 pt-3 pb-2 space-y-0">

            {/* Session Stats */}
            <div className="px-1 py-2 border-b border-border-subtle/20">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-text-muted/60 mb-2">Session State</div>
              <div className="bg-surface-base/70 rounded-xl border border-border-subtle/30 px-3 py-2 space-y-0 backdrop-blur-sm">
                {[
                  { label: 'Target ID:', value: 'TRG-8942-PX',           color: 'text-neon-green' },
                  { label: 'Stage:',     value: `${state.currentStep} / 5`, color: 'text-brand-indigo' },
                  { label: 'ESMFold:',   value: 'v1 (Meta AI)',           color: 'text-bio-sky' },
                  { label: 'QSAR Model:',value: 'Random Forest',          color: 'text-text-bright' },
                  { label: 'Val. Threshold:', value: '≥ 65%',             color: 'text-bio-amber' },
                  { label: 'GC Content:', value: state.module1Data ? `${state.module1Data.gcContent}%` : '—', color: 'text-neon-green' },
                  { label: 'Filtered:', value: state.module4Data ? `${state.module4Data.filteredMolecules.length} mols` : '—', color: 'text-bio-sky' },
                  { label: 'Target Valid:', value: state.module3Data ? `${state.module3Data.validityScore}% ${state.module3Data.isValidated ? '✓' : '✗'}` : '—', color: state.module3Data?.isValidated ? 'text-bio-emerald' : 'text-bio-rose' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-[4px] border-b border-white/5 last:border-0">
                    <span className="text-[9px] font-mono text-text-muted">{r.label}</span>
                    <span className={`text-[9.5px] font-mono font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Audit Log */}
            <div className="px-1 py-2.5">
              <button
                onClick={() => setLogsExpanded(p => !p)}
                className="w-full flex items-center justify-between mb-2 group"
              >
                <div className="flex items-center gap-1.5">
                  <TerminalSquare className="w-3 h-3 text-brand-indigo" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-text-muted/70">
                    Audit Log
                  </span>
                </div>
                {logsExpanded
                  ? <ChevronUp className="w-3 h-3 text-text-muted" />
                  : <ChevronDown className="w-3 h-3 text-text-muted" />
                }
              </button>

              {logsExpanded && (
                <div
                  ref={logRef}
                  className="bg-surface-base/80 border border-border-subtle/30 rounded-xl p-2 overflow-y-auto max-h-48 space-y-0.5"
                >
                  {logs.map((log, i) => {
                    const isLast = i === logs.length - 1;
                    return (
                      <div key={i} className="flex gap-1.5 px-1 py-0.5 rounded">
                        <span className="text-[8px] font-mono shrink-0 text-text-muted/30 mt-px">[{log.ts}]</span>
                        <span className={`text-[8.5px] font-mono break-all leading-relaxed ${isLast ? logColor(log.type) : 'text-text-muted/40'}`}>
                          {log.msg}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1.5 px-1 pt-0.5">
                    <span className="text-[8px] text-bio-emerald animate-pulse font-mono">█</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
