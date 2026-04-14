/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ecefff',
          300: '#c3ceff',
          500: '#7c8cff',
          700: '#5a63d8',
        },
      },
      boxShadow: {
        glass: '0 10px 30px rgba(30, 41, 59, 0.15)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'slide-in': 'slideIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
}

