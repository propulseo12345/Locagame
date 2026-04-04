/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dream-blue': '#000033',
        'neon-green': '#33ffcc',
        'aqua': '#66cccc',
        'floyd-pink': '#fe1979',
        'sky': '#ccffff',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        friendly: ['Palmer Lake Print', 'cursive'],
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
