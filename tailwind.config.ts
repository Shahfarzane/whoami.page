// const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  prefligth: false,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    extend: {
      fontFamily: {
        sans: ['GeistSans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['GeistMono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        bs: 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.05)',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
      },
      colors: {
        header: 'rgba(16, 16, 16, 0.85)',
        elHeader: 'rgba(24, 24, 24, 0.85)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',

        blue: 'hsl(var(--blue) / <alpha-value>)',
        'surface-75': 'hsl(var(--background-surface-75) / <alpha-value>)',
        'surface-100': 'hsl(var(--background-surface-100) / <alpha-value>)',
        'button-default': 'hsl(var(--border) / <alpha-value>)',
        muted: 'hsl(var(--background-muted) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        control: 'var(--background-control)',
        selection: 'var(--background-selection)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        'button-hover': 'var(--border-button-hover)',
        stronger: 'var(--border-stronger)',
        strong: 'hsl(var(--border-strong) / <alpha-value>)',
        overlay: 'var(--border-overlay)',
        secondary: 'var(--border-secondary)',
        brand: 'hsl(var(--brand) / <alpha-value>)',
        alternative:
          'hsl(var(--background-alternative-default) / <alpha-value>)',
        gray: {
          2: 'hsl(var(--gray-2) / <alpha-value>)',
          4: 'hsl(var(--gray-4) / <alpha-value>)',
          6: 'hsl(var(--gray-6) / <alpha-value>)',
          7: 'hsl(var(--gray-7) / <alpha-value>)',
          8: 'hsl(var(--gray-8) / <alpha-value>)',
          9: 'hsl(var(--gray-9) / <alpha-value>)',
          10: 'hsl(var(--gray-10) / <alpha-value>)',
          11: 'hsl(var(--gray-11) / <alpha-value>)',
          12: 'hsl(var(--gray-12) / <alpha-value>)',
          a2: 'var(--gray-a2)',
          a3: 'var(--gray-a3)',
          a4: 'var(--gray-a4)',
          a5: 'var(--gray-a5)',
          a6: 'var(--gray-a6)',
          a10: 'var(--gray-a10)',

          a12: 'var(--gray-a12)',
        },

        'foreground-light': 'hsl(var(--foreground-lighter) / <alpha-value>)',
        'foreground-contrast':
          'hsl(var(--foreground-contrast) / <alpha-value>)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: {
            opacity: '0',
            transform: 'translate(-50%, -49%) scale(0.98)',
          },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
