export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F9F7F6',
          surface: '#F1ECE7',
          'surface-hover': '#E8DFD7',
          border: '#C9BEB4',
          primary: '#2E2E2E',
          muted: '#6F665F',
          accent: '#8B0000',
          'accent-hover': '#650000',
          'accent-text': '#ffffff',
        },
        bg: '#F9F7F6',
        surface: '#F1ECE7',
        'surface-hover': '#E8DFD7',
        accent: '#8B0000',
        'accent-hover': '#650000',
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