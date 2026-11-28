export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F9F7F6',
          surface: '#EFE9E3',
          'surface-hover': '#E5DDD5',
          border: '#CFC4BA',
          primary: '#211E1D',
          muted: '#665F5B',
          accent: '#8B0000',
          'accent-hover': '#680000',
          'accent-text': '#ffffff',
        },
        bg: '#F9F7F6',
        surface: '#EFE9E3',
        'surface-hover': '#E5DDD5',
        accent: '#8B0000',
        'accent-hover': '#680000',
      },
      fontFamily: {
        sans: ['Lora', 'sans-serif'],
        display: ['Bodoni Moda', 'sans-serif'],
      },
      borderRadius: {
        theme: '4px',
      },
    },
  },
  plugins: [],
};