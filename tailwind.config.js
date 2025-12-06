/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#0a0a1a',
        'cyber-primary': '#00ffff',
        'cyber-secondary': '#ff00ff',
        'cyber-accent': '#ffff00',
        'cyber-success': '#00ff00',
        'cyber-warning': '#ff9900',
        'cyber-danger': '#ff0000',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
