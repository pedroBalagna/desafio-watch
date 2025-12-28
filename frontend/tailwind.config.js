/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./src/components/**/*.{js,ts,jsx,tsx,vue}"
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary-watch': "#ff501a",
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(90deg, rgba(255,162,26,0.7497199563419117) 0%, rgba(255,80,26,0.5844538498993348) 100%)',
      },
    },
  },
  plugins: [],
}
