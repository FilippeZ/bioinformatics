---
name: Synthetic Intelligence Matrix
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cbb8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849584'
  outline-variant: '#3b4b3c'
  surface-tint: '#00e471'
  primary: '#f0ffed'
  on-primary: '#003917'
  primary-container: '#00ff7f'
  on-primary-container: '#007134'
  inverse-primary: '#006d33'
  secondary: '#b9f1ff'
  on-secondary: '#00363f'
  secondary-container: '#00e0ff'
  on-secondary-container: '#005f6d'
  tertiary: '#fffafb'
  on-tertiary: '#480081'
  tertiary-container: '#edd6ff'
  on-tertiary-container: '#8828e0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#63ff93'
  primary-fixed-dim: '#00e471'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005224'
  secondary-fixed: '#a5eeff'
  secondary-fixed-dim: '#00daf8'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#efdbff'
  tertiary-fixed-dim: '#dcb8ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6700b5'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-base: '#0A0A0A'
  surface-raised: '#141414'
  border-subtle: '#222222'
  text-muted: '#888888'
  neon-green: '#00FF7F'
  neon-blue: '#00E0FF'
  data-error: '#FF3B30'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes environment of bioinformatics MLOps. It targets a sophisticated audience of data scientists and bioengineers who require clarity across massive datasets. 

The design style is **Minimalist-Technical**. It leverages the "Graft" aesthetic—a high-end, dark-mode execution that prioritizes content over container. By utilizing deep charcoal surfaces and high-precision typography, the interface recedes into the background, allowing complex genomic sequences and model training visualizations to take center stage. Visual interest is maintained through extreme precision, razor-thin borders, and purposeful "Neon" data-status accents that simulate a high-performance laboratory instrument.

## Colors

This design system utilizes a "Void" palette. The background is a near-pure black (`#0A0A0A`) to maximize the perceived contrast of data points and reduce eye strain during long-form analysis.

- **Primary:** A vibrant Neon Green used sparingly for primary actions and "active" status indicators in the pipeline.
- **Secondary:** A Technical Cyan for informational accents and secondary data links.
- **Neutral:** A range of deep charcoals. Borders and separators use low-light grays to maintain structure without creating visual noise.
- **Accents:** Neon hues are strictly reserved for functional status (e.g., success, running, error) and should never be used for large surface areas.

## Typography

The typography system balances modern sans-serifs with technical monospaced fonts to reinforce the Bioinformatics MLOps context.

- **Hanken Grotesk** is used for headlines, providing a sharp, contemporary feel that distinguishes sections clearly.
- **Inter** handles the bulk of the UI and body copy, chosen for its exceptional legibility in data-dense layouts.
- **JetBrains Mono** is the critical "Data Layer" font. It is used for code snippets, genomic sequences, tensor shapes, and any metric where character alignment is paramount.

To maintain the minimalist aesthetic, type hierarchy is primarily established through weight and color (e.g., White vs. Muted Gray) rather than aggressive size changes.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for dashboard views and a **Fluid Content** model for documentation/report views. 

- **Grid:** A 12-column grid is used for desktop layouts. To maintain the "Data-Dense" requirement, gutters are kept tight at 16px.
- **Rhythm:** Spacing follows a strict 4px base unit. 
- **Density:** Elements are packed more tightly than in standard consumer SaaS to allow more information to be visible above the fold. 
- **Reflow:** On tablet and mobile, the 12-column grid collapses into a 4-column stack. Sidebars are converted into hidden drawers to maximize the workspace for data visualizations.

## Elevation & Depth

In a deep-charcoal environment, traditional shadows are ineffective. Instead, this design system uses **Tonal Layering** and **Micro-Borders**.

- **Surfaces:** Depth is achieved by lightening the background hex. The further "forward" an element is (like a modal or dropdown), the lighter its charcoal hex becomes (`#1A1A1A`).
- **Outlines:** Use 1px solid borders (`#222222`) to define card boundaries and input fields.
- **Inner Glow:** For active primary elements (like a running pipeline card), a subtle 1px inner stroke of the primary neon color can be used to simulate an illuminated hardware edge.
- **Backdrop Blur:** Modals and overlays should use a high-density backdrop blur (20px+) to maintain context while ensuring legibility of the foreground element.

## Shapes

The shape language is **Soft-Technical**. We avoid the extreme roundness of consumer apps to maintain a professional, instrument-like feel. 

- **Base Radius:** 4px (Soft) is the standard for buttons, inputs, and cards.
- **Interactive Elements:** Small components like checkboxes and radio buttons maintain this 4px radius or remain sharp if they are purely data-driven.
- **Large Containers:** Modals or large dashboard panels may use up to 8px to subtly distinguish them from the background grid, but never enough to feel "bubbly."

## Components

- **Buttons:** Primary buttons are solid Charcoal with White text and a high-contrast Neon hover state. Secondary buttons are ghost-style with 1px borders. 
- **Status Chips:** Small, monospaced labels with a leading "indicator dot" using the Neon color palette (Green for 'Success', Amber for 'Processing', Red for 'Failed').
- **Input Fields:** Dark background (`#050505`), 1px subtle border, and JetBrains Mono text for input values to match the technical nature of bioinformatics parameters.
- **Data Cards:** No shadows. Defined by 1px borders and a slightly lighter surface color than the main background. Titles should be in `label-mono`.
- **Progress Bars:** Ultra-thin (2px - 4px) neon lines. For MLOps training, use a "pulsing" animation for active states.
- **Lists:** Data tables and lists should use zebra-striping with very low-contrast charcoal variations instead of visible lines to reduce visual clutter.