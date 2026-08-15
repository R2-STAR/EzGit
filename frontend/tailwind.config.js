/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8f6ef',
          100: '#eae7dc',
          200: '#d0ccbd',
          300: '#aca899',
          400: '#858174',
          500: '#67635a',
          600: '#4a4841',
          700: '#37362f',
          750: '#2b2a25',
          800: '#22221e',
          850: '#1d1d19',
          900: '#181816',
          925: '#141412',
          950: '#0f0f0d',
        },
        brand: {
          50: '#fdf6e9',
          100: '#faecd1',
          200: '#f4d9a0',
          300: '#eec472',
          400: '#e8b156',
          500: '#e09d3d',
          600: '#c07f2a',
          700: '#976221',
          800: '#6e4718',
          900: '#452c10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: 'inset 0 1px 0 rgba(255,255,255,0.035), 0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -16px rgba(0,0,0,0.55)',
        lift: 'inset 0 1px 0 rgba(255,255,255,0.045), 0 20px 44px -20px rgba(0,0,0,0.75)',
        btn: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 22px -10px rgba(224,157,61,0.65)',
        'btn-hover': 'inset 0 1px 0 rgba(255,255,255,0.4), 0 10px 26px -10px rgba(224,157,61,0.8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
