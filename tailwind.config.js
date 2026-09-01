/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy brand alias kept for backward-compat ──────────────
        brand: {
          50:  '#fdf8f3',
          100: '#f3e4d4',
          200: '#efe2d2',
          300: '#c9a07a',
          400: '#c9684a',
          500: '#9a5b3a',
          600: '#7a4628',
          700: '#5c3318',
          800: '#3f2210',
          900: '#241208',
          950: '#110800',
        },
        // ── Cooperative Gig Master Palette ───────────────────────────
        coop: {
          ivory:   '#F7F3EC',
          white:   '#FFFFFF',
          charcoal:'#171717',
          grey:    '#6F6A63',
          beige:   '#EFE2D2',
          copper:  '#9A5B3A',
          terra:   '#C9684A',
          green:   '#527A62',
          red:     '#A94A43',
          pale:    '#F3E4D4',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
