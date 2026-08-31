/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f3',
          100: '#d5ecdf',
          200: '#aad9c0',
          300: '#79c19d',
          400: '#4da57e',
          500: '#2f8a64',
          600: '#22704f',
          700: '#1c5a41',
          800: '#194835',
          900: '#153c2d',
        },
        clay: '#c9673f',
        sand: '#f6f2ea',
        ink: '#1f2a24',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
