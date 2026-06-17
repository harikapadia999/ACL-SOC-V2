/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        slate: {
          750: '#293548',
          850: '#1a202e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '16': '4rem',      // 64px for collapsed sidebar
        '58': '14.5rem',   // 232px for expanded sidebar
      },
      borderWidth: {
        '3': '3px',
      },
      transitionProperty: {
        'width': 'width',
        'margin': 'margin',
      },
    },
  },
  plugins: [],
}
