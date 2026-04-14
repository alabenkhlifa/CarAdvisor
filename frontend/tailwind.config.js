/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        cream: '#FAFAF7',
        charcoal: '#1A1A1A',
        terracotta: {
          DEFAULT: '#C4553A',
          hover: '#A8432C',
        },
        sage: {
          DEFAULT: '#6B8F71',
        },
        peach: '#FFF0EB',
        warmgray: {
          DEFAULT: '#6B6B6B',
          border: '#E8E6E1',
        },
        surface: '#FFFFFF',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        warm: '0 2px 8px rgba(26, 26, 26, 0.06)',
        'warm-md': '0 4px 16px rgba(26, 26, 26, 0.08)',
        'warm-lg': '0 8px 32px rgba(26, 26, 26, 0.10)',
        'warm-hover': '0 8px 24px rgba(26, 26, 26, 0.12)',
      },
    },
  },
  plugins: [],
};
