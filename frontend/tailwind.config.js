/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mission: {
          black: '#0a0a0a',
          dark: '#111111',
          panel: '#1a1a1a',
          border: '#2a2a2a',
          accent: '#00ff88',
          warning: '#ffaa00',
          danger: '#ff4444',
          info: '#00aaff',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
