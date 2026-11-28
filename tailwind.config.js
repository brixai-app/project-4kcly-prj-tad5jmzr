export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F5F1EB',
          surface: '#FAF9F6',
          'surface-hover': '#EEE7DE',
          border: '#CFC5B8',
          primary: '#1C1C1C',
          muted: '#68625C',
          accent: '#8B0000',
          'accent-hover': '#650000',
          'accent-text': '#ffffff',
        },
        bg: '#F5F1EB',
        surface: '#FAF9F6',
        'surface-hover': '#EEE7DE',
        accent: '#8B0000',
        'accent-hover': '#650000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'sans-serif'],
      },
      borderRadius: {
        theme: '4px',
      },
    },
  },
  plugins: [],
};