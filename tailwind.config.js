export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F5F1EC',
          surface: '#FFFCF8',
          'surface-hover': '#EAE3DA',
          border: '#CFC5B8',
          primary: '#211F1D',
          muted: '#6F685F',
          accent: '#8B0000',
          'accent-hover': '#650000',
          'accent-text': '#ffffff',
        },
        bg: '#F5F1EC',
        surface: '#FFFCF8',
        'surface-hover': '#EAE3DA',
        accent: '#8B0000',
        'accent-hover': '#650000',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Bodoni Moda', 'sans-serif'],
      },
      borderRadius: {
        theme: '2px',
      },
    },
  },
  plugins: [],
};