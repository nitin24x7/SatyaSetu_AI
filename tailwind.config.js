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
          DEFAULT: '#0F766E', // rich teal-700
          deep: '#134E4A',    // dark teal-900
          light: '#14B8A6',   // vibrant teal-500
        },
        brand: {
          DEFAULT: '#0D9488', // teal-600
          teal: '#0D9488',
          'teal-light': '#F0FDFA',
          'teal-dark': '#0F766E',
          blue: '#0D9488',    // seamlessly rerouted to teal
          'blue-light': '#F0FDFA',
          'blue-dark': '#0F766E',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          subtle: '#F1F5F9',
        },
        slate: {
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        status: {
          success: '#059669',
          'success-bg': '#ECFDF5',
          warning: '#D97706',
          'warning-bg': '#FFFBEB',
          error: '#E11D48',
          'error-bg': '#FFF1F2',
          info: '#0D9488',
          'info-bg': '#F0FDFA',
        }
      },
      borderRadius: {
        'squircle-sm': '12px',
        'squircle': '18px',
        'squircle-md': '22px',
        'squircle-lg': '28px',
        'squircle-xl': '36px',
        'ios': '20px',
        'ios-lg': '26px',
        'ios-xl': '32px',
      },
      boxShadow: {
        'ios': '0 2px 12px -2px rgba(13, 148, 136, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.03), 0 8px 24px -4px rgba(15, 23, 42, 0.04)',
        'ios-elevated': '0 12px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(13, 148, 136, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
