/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "sc-",
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--sc-background)",
        foreground: "var(--sc-foreground)",
        primary: "var(--sc-primary)",
      },
      fontFamily: {
        sans: ["var(--sc-font-montserrat)", "sans-serif"],
        heading: ["var(--sc-font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
