import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, X } from 'lucide-react';

interface ContextHelpProps {
  /** Plain-English step headline */
  headline: string;
  /** Main narrative paragraph */
  narrative: string;
  /** Optional: "Why does this matter?" extra paragraph */
  whyItMatters?: string;
  /** Optional: Quick-fact chip items */
  facts?: Array<{ emoji: string; label: string }>;
  /** Accent colour key — maps to a Tailwind colour name */
  accent?: 'indigo' | 'emerald' | 'violet' | 'amber' | 'sky';
  /** Allow the user to dismiss the banner for the session */
  dismissible?: boolean;
}

const ACCENT_MAP = {
  indigo: {
    bg: 'bg-brand-indigo/8',
    border: 'border-brand-indigo/25',
    icon: 'text-brand-indigo',
    chip: 'bg-brand-indigo/12 text-brand-indigo border-brand-indigo/20',
    badge: 'bg-brand-indigo/15 border-brand-indigo/30 text-brand-indigo',
  },
  emerald: {
    bg: 'bg-bio-emerald/8',
    border: 'border-bio-emerald/25',
    icon: 'text-bio-emerald',
    chip: 'bg-bio-emerald/12 text-bio-emerald border-bio-emerald/20',
    badge: 'bg-bio-emerald/15 border-bio-emerald/30 text-bio-emerald',
  },
  violet: {
    bg: 'bg-brand-violet/8',
    border: 'border-brand-violet/25',
    icon: 'text-brand-violet',
    chip: 'bg-brand-violet/12 text-brand-violet border-brand-violet/20',
    badge: 'bg-brand-violet/15 border-brand-violet/30 text-brand-violet',
  },
  amber: {
    bg: 'bg-bio-amber/8',
    border: 'border-bio-amber/25',
    icon: 'text-bio-amber',
    chip: 'bg-bio-amber/12 text-bio-amber border-bio-amber/20',
    badge: 'bg-bio-amber/15 border-bio-amber/30 text-bio-amber',
  },
  sky: {
    bg: 'bg-bio-sky/8',
    border: 'border-bio-sky/25',
    icon: 'text-bio-sky',
    chip: 'bg-bio-sky/12 text-bio-sky border-bio-sky/20',
    badge: 'bg-bio-sky/15 border-bio-sky/30 text-bio-sky',
  },
};

/**
 * Step-aware contextual help banner.
 * Renders at the top of every module to narrate what's happening
 * in plain, accessible English — with an optional "See technical details" toggle.
 */
export const ContextHelp: React.FC<ContextHelpProps> = ({
  headline,
  narrative,
  whyItMatters,
  facts = [],
  accent = 'indigo',
  dismissible = true,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const c = ACCENT_MAP[accent];

  if (dismissed) return null;

  return (
    <div
      className={`
        relative rounded-2xl border p-4 sm:p-5 animate-slide-up
        ${c.bg} ${c.border}
      `}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${c.badge} mt-0.5`}>
          <Lightbulb className={`w-4 h-4 ${c.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-base text-text-bright leading-snug mb-1">
            {headline}
          </p>
          <p className="text-sm font-sans text-text-muted leading-relaxed">
            {narrative}
          </p>

          {/* Why it matters — expandable */}
          {whyItMatters && (
            <>
              {expanded && (
                <p className="mt-2 text-sm font-sans text-text-muted leading-relaxed border-t border-white/5 pt-2 animate-fade-in">
                  💡 <strong className="text-text-bright">Why this matters:</strong> {whyItMatters}
                </p>
              )}
              <button
                onClick={() => setExpanded(p => !p)}
                className={`mt-2 flex items-center gap-1 text-xs font-semibold ${c.icon} hover:opacity-80 transition-opacity focus:outline-none`}
              >
                {expanded ? (
                  <><ChevronUp className="w-3 h-3" /> Show less</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> Why does this matter?</>
                )}
              </button>
            </>
          )}

          {/* Quick-fact chips */}
          {facts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {facts.map((f, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${c.chip}`}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss help banner"
            className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-bright hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContextHelp;
