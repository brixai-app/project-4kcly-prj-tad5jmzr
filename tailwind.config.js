export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F9F7F6',
          surface: '#EEE8E2',
          'surface-hover': '#E3D9D0',
          border: '#C9BDB2',
          primary: '#2E2E2E',
          muted: '#6E655E',
          accent: '#8B0000',
          'accent-hover': '#650000',
          'accent-text': '#ffffff',
        },
        bg: '#F9F7F6',
        surface: '#EEE8E2',
        'surface-hover': '#E3D9D0',
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