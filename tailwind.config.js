/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        win: '#28a745',
        loss: '#dc3545',
        gamingDark: '#121212',
        gamingAccent: '#8b5cf6'
      }
    },
  },
  plugins: [],
}
