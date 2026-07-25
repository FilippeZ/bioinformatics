import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  term: string;
  definition: string;
  /** Optional: show the full term text inline, or just the ⓘ icon */
  inline?: boolean;
  className?: string;
}

/**
 * Accessible, hoverable tooltip for scientific jargon terms.
 *
 * Usage:
 *   <Tooltip term="GC Content" definition="The percentage of G and C bases in DNA..." />
 *   <Tooltip term="pIC50" definition="A measure of drug potency..." inline />
 */
export const Tooltip: React.FC<TooltipProps> = ({ term, definition, inline = true, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center gap-1 ${className}`}
    >
      {inline && (
        <span className="glossary-term text-inherit font-medium">{term}</span>
      )}
      <button
        type="button"
        aria-label={`Learn more about ${term}`}
        onClick={() => setOpen(p => !p)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-text-muted hover:text-brand-indigo transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo rounded-sm"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Floating definition panel */}
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 animate-fade-in pointer-events-none"
        >
          <span className="block bg-surface-container-highest border border-card-border rounded-xl px-4 py-3 shadow-2xl shadow-black/50 text-left">
            <span className="block text-xs font-bold text-brand-indigo mb-1">{term}</span>
            <span className="block text-xs font-sans text-text-bright leading-relaxed">{definition}</span>
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-card-border" />
          </span>
        </span>
      )}
    </span>
  );
};

export default Tooltip;
