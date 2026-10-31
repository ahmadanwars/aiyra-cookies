/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cookie: {
          50: '#FDF8F3',
          100: '#F9EDE0',
          200: '#F2D7BF',
          300: '#E7BD98',
          400: '#DAA070',
          500: '#C88D56',
          600: '#B2743E',
          700: '#8E5528',
          800: '#6A3E1B',
          900: '#472810',
          950: '#2E1807',
        }
      }
    },
  },
  plugins: [],
}

