import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#DBEAFE',
          green: '#10B981',
          'green-dark': '#059669',
          amber: '#F59E0B',
          'amber-dark': '#D97706',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          dark: '#1E293B',
          muted: '#F1F5F9',
        },
        text: {
          DEFAULT: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
          inverse: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '768px',
        wide: '1200px',
      },
    },
  },
  plugins: [],
};
export default config;
