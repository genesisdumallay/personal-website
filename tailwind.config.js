/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // make Montserrat the default sans for Tailwind utilities
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "-apple-system", "\"Segoe UI\"", "Roboto", "\"Helvetica Neue\"", "Arial"],
      },
    },
  },
  plugins: [],
};
