/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0D1B2A',
        red:     '#C8392B',
        steel:   '#3D5166',
        sand:    '#E8DFD0',
        cement:  '#9AA0A6',
        signal:  '#E8A832',
        offwhite:'#F4F2EE',
        darkbg:  '#080F17',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans:    ['"IBM Plex Sans"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'ticker':    'ticker 30s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%,100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%':     { opacity: 1,   transform: 'scale(1.3)' },
        },
      },
    },
  },
  plugins: [],
}
