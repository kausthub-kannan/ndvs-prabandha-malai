/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Legacy aliases (keep for backward compat) ──────────────────────
        'bg-dark': '#181A1F',
        'surface-dark': '#3E464E',
        'surface-card': '#242A30',
        'accent-gold': '#E8904B',

        // ── Semantic tokens – DARK theme (defaults) ─────────────────────────
        // Background layers
        'main': '#181A1F',   // deepest background
        'surface': '#1E2530',   // card / input background
        'surface-alt': '#3E464E',   // elevated surface / empty icon colour

        // Borders
        'border-color': '#2C3540',

        // Text
        'text-primary': '#ECEDEE',
        'text-muted': '#A3AAB1',

        // Brand accent
        'accent': '#E8904B',

        // ── Light-theme overrides (used via dark: variants later) ──────────
        // When you add light mode, define a parallel set here and swap via
        // NativeWind's dark: prefix or a CSS-variables strategy.
      },
    },
  },
  plugins: [],
}

