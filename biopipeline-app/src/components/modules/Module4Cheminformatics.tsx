import React, { useState } from 'react';
import { usePipeline } from '../../context/PipelineContext';
import type { LipinskiFilterSettings, MoleculeData } from '../../types/bio';
import { ContextHelp } from '../common/ContextHelp';
import { Tooltip } from '../common/Tooltip';
import { Sliders, Upload, ArrowRight, AlertTriangle, CheckCircle2, XCircle, FlaskConical, Download, Sparkles } from 'lucide-react';

function MwBadge({ mw, max }: { mw: number; max: number }) {
  const ok = mw <= max;
  return <span className={`font-bold ${ok ? 'text-emerald-400' : 'text-red-400'}`}>{mw.toFixed(0)}</span>;
}

function LogPBadge({ logP, max }: { logP: number; max: number }) {
  const ok = logP <= max;
  return <span className={`font-bold ${ok ? 'text-sky-400' : 'text-red-400'}`}>{logP.toFixed(2)}</span>;
}

export const Module4Cheminformatics: React.FC = () => {
  const { state, updateModule4Filters, uploadModule4Csv, runModule5 } = usePipeline();
  const mod4Data = state.module4Data;

  const [filters, setFilters] = useState<LipinskiFilterSettings>(mod4Data?.filters || {
    maxMw: 550, maxLogP: 5.0, maxHbd: 5, maxHba: 10, maxTpsa: 140
  });
  const [uploadMsg, setUploadMsg] = useState('');

  const handleSlider = (key: keyof LipinskiFilterSettings, val: number) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    updateModule4Filters(next);
  };

  const handleCsvUpload = (content: string) => {
    uploadModule4Csv(content);
    setUploadMsg('✓ Custom SMILES dataset uploaded and screened!');
    setTimeout(() => setUploadMsg(''), 3500);
  };

  const noResults = mod4Data && mod4Data.filteredMolecules.length === 0;
  const total = mod4Data?.rawMolecules.length ?? 0;
  const filtered = mod4Data?.filteredMolecules.length ?? 0;
  const reduction = total > 0 ? ((1 - filtered / total) * 100).toFixed(1) : '0';

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
    if (!mol.passesLipinski) return 'bg-red-500/5';
    const violations = [mol.mw > filters.maxMw, mol.logP > filters.maxLogP, mol.hbd > filters.maxHbd, mol.hba > filters.maxHba, mol.tpsa > filters.maxTpsa].filter(Boolean).length;
    if (violations === 0) return 'hover:bg-emerald-500/10';
    return 'hover:bg-white/5';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Contextual Help Banner ── */}
      <ContextHelp
        headline="🧪 Step 4: Screening Molecules for Safety & Absorption"
        narrative="Before testing a drug on target proteins, we filter candidates using Lipinski's Rule of 5 — a set of chemical rules that predict if a compound can be safely absorbed as an oral pill (like a tablet)."
        whyItMatters="Most drug candidates fail in clinical trials because they can't cross cell membranes or are toxic. Filtering molecules early saves time by focusing only on candidates that can actually work as medicine."
        facts={[
          { emoji: '💊', label: 'Lipinski Rule = Oral pill compatibility' },
          { emoji: '🧬', label: '1,000 FDA-approved molecules screened' },
          { emoji: '🎚️', label: 'Sliders adjust safety cutoffs in real time' },
        ]}
        accent="amber"
      />

      {/* ── Stage Header Banner ── */}
      <div className="relative bg-gradient-to-r from-amber-950/60 via-orange-900/30 to-surface-container border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl group-hover:bg-amber-500/20 transition-all duration-700 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-sans font-medium">
              <span className="text-base">🧪</span>
              <span>Step 4 of 5 · Molecule Safety Filtering</span>
            </div>
            <span className="text-xs font-sans text-amber-300/80 bg-amber-950/80 border border-amber-500/30 px-3.5 py-1 rounded-full shadow-inner">
              Lipinski Rule of 5 Filtering
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2 flex items-center gap-2">
            Screen &amp; Filter Small Molecule Candidates
          </h2>

          <p className="text-sm font-sans text-slate-300 max-w-3xl leading-relaxed">
            We evaluate thousands of FDA-approved small molecule drugs against pharmaceutical safety rules (molecular weight, solubility, membrane permeability). Adjust the interactive sliders below to filter out non-viable molecules.
          </p>
        </div>
      </div>

      {/* ── Dataset Controls Card ── */}
      <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-sans text-slate-400">Active Compound Library</div>
            <div className="text-sm font-display font-bold text-white flex items-center gap-2">
              {mod4Data ? `✓ ${total.toLocaleString()} FDA-Approved & Synthetic Compounds Loaded` : 'No Dataset Loaded'}
              {uploadMsg && <span className="text-xs font-sans text-emerald-400 animate-pulse">{uploadMsg}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadSampleCsv}
            className="cursor-pointer text-xs font-sans bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-slate-300 flex items-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download Sample CSV
          </button>
          <label className="cursor-pointer text-xs font-sans bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-4 py-2.5 rounded-xl text-amber-300 font-bold flex items-center gap-2 transition-all hover:scale-[1.01]">
            <Upload className="w-4 h-4" />
            Upload Custom SMILES CSV
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Sliders */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-5 shadow-xl">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Interactive Pharmacokinetic Sliders
            </h3>

            {[
              { key: 'maxMw' as const, label: 'Max Molecule Size (MW)', unit: ' Da', min: 100, max: 700, step: 10, lim: 500, desc: 'Oral pill absorption limit', tt: 'Molecular Weight (MW): Smaller molecules (≤ 500 Da) pass through cell walls much easier than large ones.' },
              { key: 'maxLogP' as const, label: 'Max Lipophilicity (LogP)', unit: '', min: -2, max: 7.0, step: 0.1, lim: 5.0, desc: 'Water vs oil solubility ratio', tt: 'LogP: Measures how easily a drug dissolves in fat vs water. LogP ≤ 5 ensures the drug can cross cell membranes without getting trapped in body fat.' },
              { key: 'maxHbd' as const, label: 'Max H-Bond Donors', unit: '', min: 0, max: 8, step: 1, lim: 5, desc: 'Hydrogen donors (OH / NH)', tt: 'H-Bond Donors: High numbers of hydrogen donors make a molecule too water-loving to pass into cells.' },
              { key: 'maxHba' as const, label: 'Max H-Bond Acceptors', unit: '', min: 0, max: 15, step: 1, lim: 10, desc: 'Hydrogen acceptors (N / O)', tt: 'H-Bond Acceptors: Too many nitrogen or oxygen atoms hinder cell membrane penetration.' },
              { key: 'maxTpsa' as const, label: 'Max Polar Surface Area (TPSA)', unit: ' Å²', min: 10, max: 200, step: 5, lim: 140, desc: 'Cell membrane transport limit', tt: 'TPSA: Measures the surface area of polar atoms. TPSA ≤ 140 Å² ensures good human gut absorption.' },
            ].map(s => {
              const val = filters[s.key];
              const overLimit = val > s.lim;
              return (
                <div key={s.key} className="space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <Tooltip term={s.label} definition={s.tt} />
                      <span className="text-[11px] text-slate-400 block">({s.desc})</span>
                    </div>
                    <span className={`font-bold font-mono ${overLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                      {val}{s.unit} {overLimit && <span className="text-[10px] text-amber-400">⚠ Beyond Standard Rule</span>}
                    </span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={val}
                    onChange={e => handleSlider(s.key, Number(e.target.value))}
                    className="w-full h-2 rounded-lg cursor-pointer accent-emerald-400 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{s.min}{s.unit}</span>
                    <span className="text-emerald-400/80">Standard Rule: {s.lim}{s.unit}</span>
                    <span>{s.max}{s.unit}</span>
                  </div>
                </div>
              );
            })}

            <button
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-sans font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.01]"
              onClick={() => updateModule4Filters(filters)}
            >
              🧹 Re-Apply Safety Filter Sliders
            </button>

            {/* Rules Check Legend */}
            <div className="bg-surface-base/80 border border-white/10 rounded-2xl p-4 space-y-2 font-sans text-xs">
              <div className="text-white font-bold mb-1">Lipinski &amp; Veber Safety Rules Status:</div>
              {[
                { rule: 'Molecular Weight ≤ 500 Da', ok: filters.maxMw <= 500 },
                { rule: 'LogP Lipophilicity ≤ 5.0', ok: filters.maxLogP <= 5.0 },
                { rule: 'H-Bond Donors ≤ 5', ok: filters.maxHbd <= 5 },
                { rule: 'H-Bond Acceptors ≤ 10', ok: filters.maxHba <= 10 },
                { rule: 'TPSA Polar Surface Area ≤ 140 Å²', ok: filters.maxTpsa <= 140 },
              ].map(r => (
                <div key={r.rule} className="flex items-center gap-2">
                  {r.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className={r.ok ? 'text-emerald-300' : 'text-red-300'}>{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats & Table */}
        <div className="xl:col-span-7 space-y-4">
          {mod4Data && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center shadow-xl">
                  <div className="text-xs font-sans text-slate-400">Total Raw Library</div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-white mt-1">{total.toLocaleString()}</div>
                  <div className="text-[11px] font-sans text-slate-400">Molecules</div>
                </div>

                <div className="bg-surface-container/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-center shadow-xl">
                  <div className="text-xs font-sans text-slate-400">Passed Candidates</div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-1">{filtered}</div>
                  <div className="text-[11px] font-sans text-slate-400">Top Candidates</div>
                </div>

                <div className="bg-surface-container/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 text-center shadow-xl">
                  <div className="text-xs font-sans text-slate-400">Filtered Out</div>
                  <div className="text-2xl sm:text-3xl font-display font-black text-amber-300 mt-1">{reduction}%</div>
                  <div className="text-[11px] font-sans text-slate-400">Reduction</div>
                </div>
              </div>

              {noResults && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 font-sans text-xs text-red-300">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                  No molecules passed with current strict limits. Expand the sliders to allow candidate molecules through.
                </div>
              )}

              {/* Candidates Table */}
              <div className="bg-surface-container/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                  <span className="font-sans text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Passing Candidate Molecules ({filtered} Selected)
                  </span>
                  <span className="text-xs font-sans text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Filter Active
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs font-sans text-left">
                    <thead className="bg-surface-base/90 border-b border-white/10 sticky top-0 z-10 text-slate-400">
                      <tr>
                        <th className="p-3 font-bold">ID</th>
                        <th className="p-3 font-bold">Compound Name</th>
                        <th className="p-3 font-bold">MW (Da)</th>
                        <th className="p-3 font-bold">LogP</th>
                        <th className="p-3 font-bold">HBD / HBA</th>
                        <th className="p-3 font-bold">TPSA (Å²)</th>
                        <th className="p-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {mod4Data.filteredMolecules.slice(0, 50).map(mol => (
                        <tr key={mol.id} className={`transition-colors ${getRowColor(mol)}`}>
                          <td className="p-3 text-sky-400 font-bold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-300 shrink-0 font-sans">
                              💊
                            </span>
                            {mol.id}
                          </td>
                          <td className="p-3 text-white max-w-[170px] truncate font-sans font-medium" title={mol.name}>{mol.name}</td>
                          <td className="p-3"><MwBadge mw={mol.mw} max={filters.maxMw} /></td>
                          <td className="p-3"><LogPBadge logP={mol.logP} max={filters.maxLogP} /></td>
                          <td className="p-3 text-slate-300">{mol.hbd} / {mol.hba}</td>
                          <td className="p-3 text-slate-300">{mol.tpsa.toFixed(0)}</td>
                          <td className="p-3">
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                              ✓ PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Next Step Button */}
              <button
                onClick={runModule5}
                disabled={noResults || filtered === 0}
                className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:from-emerald-300 hover:to-sky-300 font-display font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                Next Step: Rank Candidate Drug Efficacy <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}

          {!mod4Data && (
            <div className="bg-surface-container/40 border border-dashed border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-3">
              <FlaskConical className="w-12 h-12 text-slate-500 animate-pulse" />
              <p className="text-sm font-sans text-slate-300">Complete Step 3 Target Confirmation to load the drug candidate library.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
