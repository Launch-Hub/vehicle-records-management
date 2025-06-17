export default {
  content: ['./src/**/*.{jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // borderRadius: {
      //   '4xl': '2rem',
      // },
      // fontSize: {
      //   '3xs': '0.5rem', // 8px
      //   '2xs': '0.625rem', // 10px
      // },
      colors: {
        // ✅ New semantic colors
        success: 'oklch(var(--success) / <alpha-value>)',
        'success-foreground': 'oklch(var(--success-foreground) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)',
        'warning-foreground': 'oklch(var(--warning-foreground) / <alpha-value>)',
        error: 'oklch(var(--error) / <alpha-value>)',
        'error-foreground': 'oklch(var(--error-foreground) / <alpha-value>)',
      },
    },
    // prettier-ignore
    screens: {
      'sm': '640px', // 576 in bootstrap
      // => @media (min-width: 640px) { ... }
      'md': '768px', // 768 in bootstrap
      // => @media (min-width: 768px) { ... }
      'lg': '1024px', // 992 in bootstrap
      // => @media (min-width: 1024px) { ... }
      'xl': '1280px', // 1200 in bootstrap
      // => @media (min-width: 1280px) { ... }
      '2xl': '1536px', // 1400 in bootstrap
      // => @media (min-width: 1536px) { ... }
      '3xl': '1792px',
      // => @media (min-width: 1792px) { ... }
      'fhd': '1920px',
      // => @media (min-width: 1920px) { ... }
      'uhd': '2048px',
      // => @media (min-width: 1920px) { ... }
      '2k': '2560px',
      // => @media (min-width: 1920px) { ... }
      '4k': '3840px',
      // => @media (min-width: 1920px) { ... }
    },
  },
  plugins: [],
}
