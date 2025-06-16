export default {
  content: ['./src/**/*.{jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // primary: 'oklch(var(--primary) / <alpha-value>)',
        // 'primary-foreground': 'oklch(var(--primary-foreground) / <alpha-value>)',
        // secondary: 'oklch(var(--secondary) / <alpha-value>)',
        // 'secondary-foreground': 'oklch(var(--secondary-foreground) / <alpha-value>)',

        // ✅ New semantic colors
        success: 'oklch(var(--success) / <alpha-value>)',
        'success-foreground': 'oklch(var(--success-foreground) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)',
        'warning-foreground': 'oklch(var(--warning-foreground) / <alpha-value>)',
        error: 'oklch(var(--error) / <alpha-value>)',
        'error-foreground': 'oklch(var(--error-foreground) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
