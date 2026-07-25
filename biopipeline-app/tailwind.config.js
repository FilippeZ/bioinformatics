/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Legacy tokens (preserved — used throughout existing components) ── */
        "surface-base": "#050B1A",
        "surface-container": "#0D1526",
        "surface-container-high": "#162035",
        "surface-container-highest": "#1E2D47",
        "neon-green": "#00FF7F",
        "neon-blue": "#00E0FF",
        "accent-amber": "#FFB000",
        "data-error": "#FF3B30",
        "border-subtle": "#1E3050",
        "text-muted": "#6B8CAD",
        "text-bright": "#E2EBF5",

        /* ── New design system tokens ── */
        "brand-indigo": "#6366F1",
        "brand-violet": "#8B5CF6",
        "brand-cyan": "#22D3EE",
        "bio-emerald": "#10B981",
        "bio-amber": "#F59E0B",
        "bio-rose": "#F43F5E",
        "bio-sky": "#38BDF8",
        "card-bg": "#0A1628",
        "card-border": "#1E3050",
        "card-hover": "#112040",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Hanken Grotesk', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'celebrate': 'celebrate 0.6s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        celebrate: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
