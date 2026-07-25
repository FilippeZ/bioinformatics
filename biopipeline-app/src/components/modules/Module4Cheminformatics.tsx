import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import type { LipinskiFilterSettings, MoleculeData } from '../../types/bio';
import { Sliders, Filter, Upload, ArrowRight, AlertTriangle, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';

function MwBadge({ mw, max }: { mw: number; max: number }) {
  const ok = mw <= max;
  return <span className={`font-bold ${ok ? 'text-neon-green' : 'text-data-error'}`}>{mw.toFixed(0)}</span>;
}

function LogPBadge({ logP, max }: { logP: number; max: number }) {
  const ok = logP <= max;
  return <span className={`font-bold ${ok ? 'text-neon-blue' : 'text-data-error'}`}>{logP.toFixed(2)}</span>;
}

export const Module4Cheminformatics: React.FC = () => {
  const { state, updateModule4Filters, uploadModule4Csv, runModule5 } = usePipeline();
  const mod4Data = state.module4Data;

  const [filters, setFilters] = useState<LipinskiFilterSettings>(mod4Data?.filters || {
    maxMw: 500, maxLogP: 5.0, maxHbd: 5, maxHba: 10, maxTpsa: 140
  });
  const [uploadMsg, setUploadMsg] = useState('');

  const handleSlider = (key: keyof LipinskiFilterSettings, val: number) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    updateModule4Filters(next);
  };

  const handleCsvUpload = (content: string) => {
    uploadModule4Csv(content);
    setUploadMsg('✓ CSV uploaded and processed');
    setTimeout(() => setUploadMsg(''), 3000);
  };

  const noResults = mod4Data && mod4Data.filteredMolecules.length === 0;
  const total = mod4Data?.rawMolecules.length ?? 0;
  const filtered = mod4Data?.filteredMolecules.length ?? 0;
  const reduction = total > 0 ? ((1 - filtered / total) * 100).toFixed(1) : '0';

  // Sample CSV for download
  const downloadSampleCsv = () => {
    const csv = [
      'smiles,name',
      'CC(=O)OC1=CC=CC=C1C(=O)O,Aspirin',
      'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O,Ibuprofen',
      'CC(=O)NC1=CC=C(C=C1)O,Paracetamol',
      'CN(C)C(=N)NC(=N)N,Metformin',
      'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O,Ciprofloxacin',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample_compounds.csv';
    a.click();
  };

  const getRowColor = (mol: MoleculeData) => {
    if (!mol.passesLipinski) return 'bg-data-error/5';
    const violations = [mol.mw > filters.maxMw, mol.logP > filters.maxLogP, mol.hbd > filters.maxHbd, mol.hba > filters.maxHba, mol.tpsa > filters.maxTpsa].filter(Boolean).length;
    if (violations === 0) return 'hover:bg-neon-green/5';
    return 'hover:bg-surface-container-high';
  };

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Stage Banner */}
      <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel">
        <div className="flex items-center space-x-2 text-xs font-mono text-neon-green uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>🧪 Stage 4: Cheminformatics & Rule-Based Compound Filtering</span>
        </div>
        <h2 className="text-lg font-display font-bold text-text-bright">Lipinski Rule of 5 — SMILES Dataset Filter Engine</h2>
        <p className="text-xs text-text-muted mt-0.5 max-w-3xl">
          Load the built-in FDA-approved library (1,000 molecules) or upload your own SMILES CSV. Adjust Lipinski's ADME pharmacokinetic sliders to filter candidates. The top <strong className="text-neon-green">≤50 molecules</strong> pass to the QSAR engine.
        </p>
      </div>

      {/* Data Source Row */}
      <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel flex flex-wrap items-center gap-3">
        <FlaskConical className="w-4 h-4 text-neon-green shrink-0" />
        <span className="text-xs font-mono text-text-muted">Dataset:</span>
        <span className="text-xs font-mono font-bold text-neon-green">
          {mod4Data ? `✓ ${total.toLocaleString()} Molecules Loaded` : '— No Dataset'}
        </span>

        {uploadMsg && (
          <span className="text-[10px] font-mono text-neon-green animate-pulse">{uploadMsg}</span>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={downloadSampleCsv}
            className="cursor-pointer text-xs font-mono bg-surface-base hover:bg-surface-container-high border border-border-subtle px-3 py-1.5 rounded text-text-muted flex items-center gap-1.5 transition-all"
          >
            📥 Download Sample CSV
          </button>
          <label className="cursor-pointer text-xs font-mono bg-surface-base hover:bg-surface-container-high border border-neon-blue/50 px-3 py-1.5 rounded text-neon-blue flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" />
            📁 Upload SMILES CSV
            <input type="file" accept=".csv,.txt" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                const r = new FileReader();
                r.onload = ev => handleCsvUpload(ev.target?.result as string || '');
                r.readAsText(f);
              }
            }} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Sliders */}
        <div className="xl:col-span-5 space-y-3">
          <div className="bg-surface-container border border-border-subtle rounded-xl p-4 glass-panel space-y-4">
            <h3 className="font-display font-semibold text-sm text-text-bright flex items-center gap-2">
              <Filter className="w-4 h-4 text-neon-green" />
              Lipinski ADME Parameter Sliders
            </h3>

            {[
              { key: 'maxMw' as const, label: 'Max Mol. Weight', unit: 'Da', min: 100, max: 700, step: 10, lim: 500, desc: 'Oral bioavailability limit' },
              { key: 'maxLogP' as const, label: 'Max LogP', unit: '', min: -2, max: 7.0, step: 0.1, lim: 5.0, desc: 'Lipophilicity (oral absorption)' },
              { key: 'maxHbd' as const, label: 'Max H-Bond Donors', unit: '', min: 0, max: 8, step: 1, lim: 5, desc: 'OH + NH groups' },
              { key: 'maxHba' as const, label: 'Max H-Bond Acceptors', unit: '', min: 0, max: 15, step: 1, lim: 10, desc: 'N + O atoms' },
              { key: 'maxTpsa' as const, label: 'Max TPSA', unit: 'Å²', min: 10, max: 200, step: 5, lim: 140, desc: 'Cell permeability proxy' },
            ].map(s => {
              const val = filters[s.key];
              const overLimit = val > s.lim;
              return (
                <div key={s.key} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-text-muted">{s.label}: </span>
                      <span className="text-[10px] text-text-muted/60">{s.desc}</span>
                    </div>
                    <span className={`font-bold ${overLimit ? 'text-data-error' : 'text-neon-green'}`}>
                      {val}{s.unit} {overLimit && <span className="text-[9px]">⚠ OVER LIMIT</span>}
                    </span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={val}
                    onChange={e => handleSlider(s.key, Number(e.target.value))}
                    className="w-full h-1.5 rounded cursor-pointer accent-neon-green"
                  />
                  <div className="flex justify-between text-[9px] text-text-muted">
                    <span>{s.min}{s.unit}</span>
                    <span className="text-neon-green/60">Rule of 5 limit: {s.lim}{s.unit}</span>
                    <span>{s.max}{s.unit}</span>
                  </div>
                </div>
              );
            })}

            <button
              className="w-full bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/60 text-neon-blue font-mono font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              onClick={() => updateModule4Filters(filters)}
            >
              🧹 APPLY LIPINSKI RULE OF 5 FILTER
            </button>

            {/* Rule of 5 legend */}
            <div className="bg-surface-base border border-border-subtle rounded-lg p-3 space-y-1 font-mono text-[10px] text-text-muted">
              <div className="text-text-bright font-bold mb-1">Lipinski's Rule of Five:</div>
              {[
                { rule: 'MW ≤ 500 Da', ok: filters.maxMw <= 500 },
                { rule: 'LogP ≤ 5.0', ok: filters.maxLogP <= 5.0 },
                { rule: 'HBD ≤ 5', ok: filters.maxHbd <= 5 },
                { rule: 'HBA ≤ 10', ok: filters.maxHba <= 10 },
                { rule: 'TPSA ≤ 140 Å²', ok: filters.maxTpsa <= 140 },
              ].map(r => (
                <div key={r.rule} className="flex items-center gap-1.5">
                  {r.ok ? <CheckCircle2 className="w-3 h-3 text-neon-green shrink-0" /> : <XCircle className="w-3 h-3 text-data-error shrink-0" />}
                  <span className={r.ok ? 'text-neon-green/80' : 'text-data-error/80'}>{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats + Table */}
        <div className="xl:col-span-7 space-y-3">
          {mod4Data && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container border border-border-subtle rounded-xl p-3 text-center glass-panel">
                  <div className="text-[10px] font-mono text-text-muted">Raw Candidates</div>
                  <div className="text-2xl font-display font-bold text-text-bright">{total.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted">Molecules</div>
                </div>
                <div className="bg-surface-container border border-neon-green/30 rounded-xl p-3 text-center glass-panel">
                  <div className="text-[10px] font-mono text-text-muted">Filtered ≤50</div>
                  <div className="text-2xl font-display font-bold text-neon-green">{filtered}</div>
                  <div className="text-[10px] text-text-muted">Candidates</div>
                </div>
                <div className="bg-surface-container border border-neon-blue/30 rounded-xl p-3 text-center glass-panel">
                  <div className="text-[10px] font-mono text-text-muted">Noise Removed</div>
                  <div className="text-2xl font-display font-bold text-neon-blue">{reduction}%</div>
                  <div className="text-[10px] text-text-muted">Reduction</div>
                </div>
              </div>

              {/* Zero result warning */}
              {noResults && (
                <div className="bg-data-error/10 border border-data-error/30 rounded-xl p-3 flex items-center gap-2 font-mono text-xs text-data-error">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  No molecules passed the current filters. Relax the Lipinski sliders to allow more candidates through.
                </div>
              )}

              {/* Molecule Table */}
              <div className="bg-surface-container border border-border-subtle rounded-xl glass-panel overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border-subtle flex justify-between items-center">
                  <span className="font-mono text-xs font-semibold text-text-bright">
                    Filtered Compound Grid ({filtered} candidates — passing to QSAR)
                  </span>
                  <span className="text-[10px] font-mono text-neon-green animate-pulse">● Live filtering</span>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-surface-base border-b border-border-subtle sticky top-0 z-10">
                      <tr className="text-text-muted text-[10px]">
                        <th className="p-2">ID</th>
                        <th className="p-2">Compound Name</th>
                        <th className="p-2">MW (Da)</th>
                        <th className="p-2">LogP</th>
                        <th className="p-2">HBD/HBA</th>
                        <th className="p-2">TPSA (Å²)</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {mod4Data.filteredMolecules.slice(0, 50).map(mol => (
                        <tr key={mol.id} className={`transition-colors ${getRowColor(mol)}`}>
                          <td className="p-2 text-neon-blue font-bold text-[10px]">{mol.id}</td>
                          <td className="p-2 text-text-bright max-w-[160px] truncate" title={mol.name}>{mol.name}</td>
                          <td className="p-2"><MwBadge mw={mol.mw} max={filters.maxMw} /></td>
                          <td className="p-2"><LogPBadge logP={mol.logP} max={filters.maxLogP} /></td>
                          <td className="p-2 text-text-muted">{mol.hbd}/{mol.hba}</td>
                          <td className="p-2 text-text-muted">{mol.tpsa.toFixed(0)}</td>
                          <td className="p-2">
                            <span className="bg-neon-green/10 text-neon-green text-[9px] px-1.5 py-0.5 rounded border border-neon-green/30 font-bold">✓ PASS</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Handoff */}
              <button
                onClick={runModule5}
                disabled={noResults || filtered === 0}
                className="w-full bg-neon-green text-surface-base hover:bg-neon-green/90 font-mono font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20 transition-all disabled:opacity-40 active:scale-[0.98]"
              >
                ⚡ RUN QSAR PREDICTIVE INFERENCE ON {filtered} MOLECULES
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {!mod4Data && (
            <div className="bg-surface-container border border-border-subtle rounded-xl p-8 glass-panel flex flex-col items-center justify-center text-center gap-3">
              <FlaskConical className="w-10 h-10 text-text-muted/30" />
              <p className="text-sm font-mono text-text-muted">Complete Stage 3 validation to load the compound library.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
