/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};
