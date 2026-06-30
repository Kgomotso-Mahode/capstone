/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        airbnb: '#FF385C',
        'airbnb-dark': '#e31c5f',
        'airbnb-light': '#fff0f0',
        charcoal: '#222222',
        grey: '#717171',
        'grey-light': '#ebebeb',
        'grey-bg': '#f7f7f7',
      },
      fontFamily: {
        airbnb: ['Airbnb Cereal VF', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'airbnb': '12px',
        'airbnb-lg': '16px',
      },
      boxShadow: {
        'airbnb': '0 2px 8px rgba(0,0,0,0.04)',
        'airbnb-hover': '0 4px 20px rgba(0,0,0,0.08)',
        'airbnb-lg': '0 4px 24px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
