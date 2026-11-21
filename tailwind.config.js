export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F9F7F6',
          surface: '#EFEAE5',
          'surface-hover': '#E5DDD5',
          border: '#C9BDB2',
          primary: '#2B2B2B',
          muted: '#6E655F',
          accent: '#B11226',
          'accent-hover': '#8F0E1F',
          'accent-text': '#ffffff',
        },
        bg: '#F9F7F6',
        surface: '#EFEAE5',
        'surface-hover': '#E5DDD5',
        accent: '#B11226',
        'accent-hover': '#8F0E1F',
      },
      fontFamily: {
        sans: ['Lora', 'sans-serif'],
        display: ['Playfair Display', 'sans-serif'],
      },
      borderRadius: {
        theme: '2px',
      },
    },
  },
  plugins: [],
};