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
        gold: {
          50: '#FDFCF7',
          100: '#FAF6E6',
          200: '#F3E9C2',
          300: '#EBD998',
          400: '#E2C56B',
          500: '#D4AF37', // Master Gold
          600: '#BF9827',
          700: '#9B7819',
          800: '#755811',
          900: '#523C0B',
        },
        obsidian: {
          950: '#07090E',
          900: '#0C1017',
          850: '#111622',
          800: '#171E2E',
          700: '#232D42',
          600: '#33415C',
        },
        cream: {
          50: '#FDFDFC',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EBE3DA',
          400: '#DDD2C4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'gold-subtle': '0 4px 20px -2px rgba(212, 175, 55, 0.15)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'card-light': '0 10px 30px -10px rgba(0, 0, 0, 0.08)'
      },
      backgroundImage: {
        'passport-gradient': 'linear-gradient(135deg, #0D1117 0%, #161B26 50%, #090C12 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.25) 50%, transparent 100%)',
      }
    },
  },
  plugins: [],
}
