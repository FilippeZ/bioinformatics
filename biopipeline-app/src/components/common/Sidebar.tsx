import React, { useEffect, useRef, useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import {
  Database, Cpu, Activity, TerminalSquare, ChevronDown, ChevronUp,
  HardDrive, Shield, Clock
} from 'lucide-react';

// MLflow-style event log
const useAuditLog = (state: ReturnType<typeof usePipeline>['state']) => {
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] BioHelix MLOps Platform initialized`,
    `[${new Date().toLocaleTimeString()}] Model v1.4.2-RF loaded → Random Forest QSAR`,
    `[${new Date().toLocaleTimeString()}] Session TRG-8942-PX started`,
  ]);

  const lastStep = useRef(state.currentStep);

  useEffect(() => {
    const step = state.currentStep;
    if (step !== lastStep.current) {
      const ts = new Date().toLocaleTimeString();
      const msgs: Record<number, string> = {
        1: `[${ts}] Stage 1 Active | Data Ingestion & Parsing`,
        2: `[${ts}] Stage 2 Active | ESMFold API Orchestration`,
        3: `[${ts}] Stage 3 Active | Target Validation Gate`,
        4: `[${ts}] Stage 4 Active | Cheminformatics Filter`,
        5: `[${ts}] Stage 5 Active | QSAR Predictive Engine`,
      };
      if (msgs[step]) setLogs(prev => [...prev.slice(-14), msgs[step]]);
      lastStep.current = step;
    }
    if (state.module1Data && lastStep.current === 1) {
      const ts = new Date().toLocaleTimeString();
      setLogs(prev => {
        const msg = `[${ts}] Ingestion Complete | GC: ${state.module1Data?.gcContent}%`;
        if (prev[prev.length - 1] === msg) return prev;
        return [...prev.slice(-14), msg];
      });
    }
    if (state.module2Data) {
      const ts = new Date().toLocaleTimeString();
      setLogs(prev => {
        const msg = `[${ts}] ESMFold API 200 OK | pLDDT: ${state.module2Data?.meanPlddt}`;
        if (prev[prev.length - 1] === msg) return prev;
        return [...prev.slice(-14), msg];
      });
    }
    if (state.module3Data) {
      const ts = new Date().toLocaleTimeString();
      setLogs(prev => {
        const msg = `[${ts}] Validation: ${state.module3Data?.isValidated ? 'PASSED ✓' : 'FAILED ✗'} | Score: ${state.module3Data?.validityScore}%`;
        if (prev[prev.length - 1] === msg) return prev;
        return [...prev.slice(-14), msg];
      });
    }
    if (state.module5Data) {
      const ts = new Date().toLocaleTimeString();
      setLogs(prev => {
        const msg = `[${ts}] QSAR Inference Complete | Top Lead: ${state.module5Data?.topCandidates[0]?.molecule.name}`;
        if (prev[prev.length - 1] === msg) return prev;
        return [...prev.slice(-14), msg];
      });
    }
  }, [state]);

  return logs;
};

export const Sidebar: React.FC = () => {
  const { state } = usePipeline();
  const logs = useAuditLog(state);
  const logRef = useRef<HTMLDivElement>(null);
  const [logsExpanded, setLogsExpanded] = useState(true);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const memUsage = 142 + (state.currentStep * 18) + (state.module4Data ? 64 : 0);

  return (
    <aside className="h-full bg-surface-container border-r border-border-subtle flex flex-col overflow-y-auto">
      {/* Session Metadata Card */}
      <div className="p-4 border-b border-border-subtle space-y-3">
        <div className="flex items-center space-x-2 mb-1">
          <Database className="w-4 h-4 text-neon-blue" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">Session State HUD</span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="bg-surface-base p-2.5 rounded border border-border-subtle space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Active Target ID:</span>
              <span className="text-neon-green font-bold">TRG-8942-PX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Memory Usage:</span>
              <span className="text-text-bright">{memUsage} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Privacy Mode:</span>
              <span className="text-neon-blue flex items-center gap-1"><Shield className="w-3 h-3" /> On-Device</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Model Version:</span>
              <span className="text-text-bright">v1.4.2-RF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Current Stage:</span>
              <span className="text-neon-green font-bold">Stage {state.currentStep} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Model Config */}
      <div className="p-4 border-b border-border-subtle space-y-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-neon-blue" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">Global Model Config</span>
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="bg-surface-base p-2.5 rounded border border-border-subtle space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">ESMFold Version:</span>
              <span className="text-neon-blue">v1 (Meta AI)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">API Timeout:</span>
              <span className="text-text-bright">30s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">QSAR Model:</span>
              <span className="text-text-bright">Random Forest</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Feature Vector:</span>
              <span className="text-text-bright">Morgan FP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Validation Thresh:</span>
              <span className="text-neon-green font-bold">80%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Metrics */}
      <div className="p-4 border-b border-border-subtle space-y-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-neon-green" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">Dataset Metrics</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-surface-base p-2 rounded border border-border-subtle text-center">
            <div className="text-[10px] text-text-muted">DNA Length</div>
            <div className="font-bold text-neon-green">{state.module1Data?.sequenceLength ?? '—'} bp</div>
          </div>
          <div className="bg-surface-base p-2 rounded border border-border-subtle text-center">
            <div className="text-[10px] text-text-muted">GC Content</div>
            <div className="font-bold text-neon-blue">{state.module1Data?.gcContent ?? '—'}%</div>
          </div>
          <div className="bg-surface-base p-2 rounded border border-border-subtle text-center">
            <div className="text-[10px] text-text-muted">Raw Compounds</div>
            <div className="font-bold text-text-bright">{state.module4Data?.rawMolecules.length ?? '—'}</div>
          </div>
          <div className="bg-surface-base p-2 rounded border border-border-subtle text-center">
            <div className="text-[10px] text-text-muted">Filtered</div>
            <div className="font-bold text-neon-green">{state.module4Data?.filteredMolecules.length ?? '—'}</div>
          </div>
          <div className="bg-surface-base p-2 rounded border border-border-subtle text-center col-span-2">
            <div className="text-[10px] text-text-muted">Target Validity</div>
            <div className={`font-bold text-sm ${state.module3Data?.isValidated ? 'text-neon-green' : state.module3Data ? 'text-data-error' : 'text-text-muted'}`}>
              {state.module3Data ? (state.module3Data.isValidated ? `✓ ${state.module3Data.validityScore}% PASS` : `✗ ${state.module3Data.validityScore}% FAIL`) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* MLflow Audit Trail */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <button
          onClick={() => setLogsExpanded(p => !p)}
          className="flex items-center justify-between w-full mb-2"
        >
          <div className="flex items-center space-x-2">
            <TerminalSquare className="w-4 h-4 text-neon-blue" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-muted">MLflow Audit Trail</span>
          </div>
          {logsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
        </button>

        {logsExpanded && (
          <div
            ref={logRef}
            className="bg-surface-base border border-border-subtle rounded-lg p-3 flex-1 overflow-y-auto font-mono text-[10px] space-y-1 min-h-[120px] max-h-64"
          >
            {logs.map((log, i) => (
              <div key={i} className={`${i === logs.length - 1 ? 'text-neon-green' : 'text-text-muted'} leading-relaxed`}>
                {log}
              </div>
            ))}
            <div className="text-neon-green animate-pulse">█</div>
          </div>
        )}
      </div>
    </aside>
  );
};
