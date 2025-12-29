/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        primary: 'oklch(var(--primary) / <alpha-value>)',
        secondary: 'oklch(var(--secondary) / <alpha-value>)',
        accent: 'oklch(var(--accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
