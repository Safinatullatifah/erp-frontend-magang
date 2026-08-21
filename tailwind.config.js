/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E3A8A',   // Deep Blue
          secondary: '#10B981', // Emerald Green
          accent: '#F59E0B',    // Amber / Jingga
          light: '#F8FAFC'      // Latar Belakang Terang
        }
      }
    },
  },
  plugins: [],
}