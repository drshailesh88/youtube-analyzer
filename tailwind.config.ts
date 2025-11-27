import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        display: ['var(--font-cabinet)'],
      },
      colors: {
        ink: {
          50: '#f7f7f5',
          100: '#edede8',
          200: '#d8d8ce',
          300: '#bdbdad',
          400: '#9d9d87',
          500: '#82826a',
          600: '#686854',
          700: '#545445',
          800: '#45453a',
          900: '#3b3b32',
          950: '#1f1f1a',
        },
        accent: {
          red: '#e63946',
          green: '#2a9d8f',
          amber: '#e9c46a',
          blue: '#457b9d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
