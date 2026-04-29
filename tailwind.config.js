/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — toplija, kozmetička
        brand: {
          50:  '#fdf6f0',
          100: '#faeade',
          200: '#f4d0b5',
          300: '#ecae84',
          400: '#e38a56',
          500: '#d9703a',
          600: '#c45a2c',
          700: '#a34526',
        },
        blush: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f8cdd5',
          300: '#f2a3b3',
          400: '#e97090',
          500: '#dd4672',
          600: '#c42d5c',
          700: '#a3234c',
        },
        sand: {
          50:  '#faf8f5',
          100: '#f3ede4',
          200: '#e8dccb',
          300: '#d9c5a8',
          400: '#c8a87e',
          500: '#b88e5a',
          600: '#9e7544',
          700: '#7f5c35',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #fdf6f0 0%, #fdf2f4 50%, #faf8f5 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #fdf6f0 100%)',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg':'0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        'inset-brand': 'inset 0 0 0 2px #e97090',
      },
    },
  },
  plugins: [],
}
