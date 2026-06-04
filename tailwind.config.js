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
        card:    '#162030',
        card2:   '#1e2e40',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans:    ['"IBM Plex Sans"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
