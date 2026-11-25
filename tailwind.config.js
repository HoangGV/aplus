/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        royal: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C4D1FD",
          300: "#9EB4FA",
          400: "#6F8FF2",
          500: "#4169E1",
          600: "#3457C8",
          700: "#2945A6",
          800: "#223887",
          900: "#1D2E6B",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
