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
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          300: 'var(--color-secondary-300)',
          500: 'var(--color-secondary-500)',
        },
        accent: {
          100: 'var(--color-accent-100)',
          300: 'var(--color-accent-300)',
          500: 'var(--color-accent-500)',
        },
        neutral: {
          0: 'var(--color-neutral-0)',
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'title-1': ['1.375rem', { lineHeight: '1.35', fontWeight: '700' }],
        'title-2': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-1': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-2': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'button': ['0.9375rem', { lineHeight: '1.0', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
        'float': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      maxWidth: {
        'app': '430px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 20px)',
      },
    },
  },
  plugins: [],
};
export default config;
