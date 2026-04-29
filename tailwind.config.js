/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C3E7F',
        accent: '#4A90E2',
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
