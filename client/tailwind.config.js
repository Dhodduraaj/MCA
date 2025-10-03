/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#0d3b0d',
        },
        eco: {
          primary: '#2e7d32',
          secondary: '#a5d6a7',
          background: '#e8f5e9',
          accent: '#4caf50',
        }
      }
    },
  },
  plugins: [
    // Line clamp plugin is included in Tailwind CSS v3.3+
    // No need to import separately
  ],
}
