/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#EDE6DE',
          surface: '#D8C8B8',
          accent: '#C9A46A',
          primary: '#5F6F5A',
          primary2: '#7A8F73',
          muted: '#A9B8A3',
          text: '#2B2B2B',
        },
        navy: '#2B2B2B',
        crimson: '#5F6F5A',
        amber: '#C9A46A',
        paper: '#EDE6DE',
        muted: '#A9B8A3',
        offwhite: '#D8C8B8',
        sage: '#7A8F73',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 50px -28px rgba(43, 43, 43, 0.24)',
      },
    },
  },
  plugins: [],
}

