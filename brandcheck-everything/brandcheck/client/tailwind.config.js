/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        surface: '#111720',
        'surface-2': '#171F2B',
        border: '#243041',
        text: '#E6EDF3',
        muted: '#8B98A9',
        primary: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          subtle: 'rgba(34, 211, 238, 0.1)',
        },
        error: {
          DEFAULT: '#F87171',
          subtle: 'rgba(248, 113, 113, 0.1)',
        },
        warning: {
          DEFAULT: '#FBBF24',
          subtle: 'rgba(251, 191, 36, 0.1)',
        },
        suggestion: {
          DEFAULT: '#60A5FA',
          subtle: 'rgba(96, 165, 250, 0.1)',
        },
        success: {
          DEFAULT: '#34D399',
          subtle: 'rgba(52, 211, 153, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(34, 211, 238, 0.25)',
        'inner-active': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
