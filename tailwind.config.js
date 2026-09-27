/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Driven by the --cc-* custom properties written by src/lib/appearance.js,
        // so every one of these follows the organiser's saved appearance settings.
        cc: {
          board: 'var(--cc-board)',
          'board-ink': 'var(--cc-board-ink)',
          card: 'var(--cc-card)',
          'card-ink': 'var(--cc-card-ink)',
          accent: 'var(--cc-accent)',
          leader: 'var(--cc-leader)',
          positive: 'var(--cc-positive)',
          negative: 'var(--cc-negative)',
          overlay: 'var(--cc-overlay)'
        }
      },
      fontSize: {
        // Card score: scales with card width (cqw) and the organiser's score-scale slider.
        'cc-score': 'calc(clamp(2rem, 14cqw, 6rem) * var(--cc-score-scale))'
      }
    }
  },
  plugins: []
}
