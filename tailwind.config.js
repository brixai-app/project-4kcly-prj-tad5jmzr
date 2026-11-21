export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F5F1EB',
          surface: '#FFFDF9',
          'surface-hover': '#EEE7DE',
          border: '#CFC6BA',
          primary: '#2B2B2B',
          muted: '#716A63',
          accent: '#8B0000',
          'accent-hover': '#650000',
          'accent-text': '#ffffff',
        },
        bg: '#F5F1EB',
        surface: '#FFFDF9',
        'surface-hover': '#EEE7DE',
        accent: '#8B0000',
        'accent-hover': '#650000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'sans-serif'],
      },
      borderRadius: {
        theme: '2px',
      },
    },
  },
  plugins: [],
};