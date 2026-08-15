/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        makka: {
          brown: '#4A2E1B',
          cocoa: '#362113',
          sand: '#F4ECE1',
          cream: '#FAF6F0',
          gold: '#D4AF37',
        },
        laresa: {
          brown: '#4A2E1B',
          cocoa: '#362113',
          sand: '#F4ECE1',
          cream: '#FAF6F0',
          gold: '#D4AF37',
          warm: '#D4AF37',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        glow: '0 0 12px rgba(212, 175, 55, 0.3)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
