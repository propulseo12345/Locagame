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
    },
  },
  plugins: [],
};
