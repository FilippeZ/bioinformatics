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
        "surface-base": "#0A0A0A",
        "surface-container": "#131313",
        "surface-container-high": "#1C1B1B",
        "surface-container-highest": "#262626",
        "neon-green": "#00FF7F",
        "neon-blue": "#00E0FF",
        "accent-amber": "#FFB000",
        "data-error": "#FF3B30",
        "border-subtle": "#222222",
        "text-muted": "#888888",
        "text-bright": "#E5E2E1"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Hanken Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
