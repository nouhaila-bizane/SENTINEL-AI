/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: '#0B1120',
          bg2: '#0F172A',
          card: '#111C2F',
          border: '#24344D',
          cyan: '#22D3EE',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};