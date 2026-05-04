/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ethiopia': {
          'green': '#00843D',
          'yellow': '#FCDD09',
          'red': '#DA121A',
          'blue': '#078930'
        }
      },
      fontFamily: {
        'amharic': ['Noto Sans Ethiopic', 'sans-serif']
      }
    },
  },
  plugins: [],
}
