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
        win: '#22c55e',
        loss: '#ef4444',
        gamingDark: '#121212',
        gamingCard: '#1e1e2e',
        gamingAccent: '#8b5cf6',
        radiant: '#3cff00',
        dire: '#ff4c00',
        strength: '#f44336',
        agility: '#4caf50',
        intelligence: '#2196f3',
      },
      fontFamily: {
        outfit: ["Outfit_400Regular"],
        'outfit-semibold': ["Outfit_600SemiBold"],
        'outfit-bold': ["Outfit_700Bold"],
        'outfit-extrabold': ["Outfit_800ExtraBold"],
        'outfit-black': ["Outfit_900Black"],
      }
    },
  },
  plugins: [],
}
