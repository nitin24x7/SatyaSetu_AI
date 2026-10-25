/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#142B4A',
          deep: '#0B1930',
          light: '#1F3F6D',
        },
        brand: {
          blue: '#315FEA',
          'blue-light': '#EAF0FF',
          'blue-dark': '#2146BA',
        },
        surface: {
          bg: '#F6F8FC',
          card: '#FFFFFF',
          sidebar: '#0B1930',
          subtle: '#F1F4F9',
        },
        slate: {
          text: '#17243A',
          muted: '#69778D',
          border: '#E4E9F1',
        },
        status: {
          success: '#16845B',
          'success-bg': '#E8F7F0',
          warning: '#B7791F',
          'warning-bg': '#FEF7E7',
          error: '#C63F46',
          'error-bg': '#FDF0F0',
          info: '#2762B8',
          'info-bg': '#EBF2FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

