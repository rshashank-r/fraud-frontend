/**
 * Professional Color System & Design Tokens
 * Consistent color palette and design variables across the application
 */

export const colors = {
    // Brand Colors - Professional and Modern
    primary: {
        50: '#e0f7ff',
        100: '#b3eaff',
        200: '#80dcff',
        300: '#4dceff',
        400: '#26c2ff',
        500: '#00b4ff', // Main brand color
        600: '#00a0e6',
        700: '#0087cc',
        800: '#006eb3',
        900: '#004b80',
    },

    // Accent Colors
    accent: {
        cyan: '#06b6d4',
        teal: '#14b8a6',
        emerald: '#10b981',
        violet: '#8b5cf6',
        fuchsia: '#d946ef',
    },

    // Semantic Colors
    success: {
        light: '#4ade80',
        DEFAULT: '#22c55e',
        dark: '#16a34a',
    },

    warning: {
        light: '#fbbf24',
        DEFAULT: '#f59e0b',
        dark: '#d97706',
    },

    error: {
        light: '#f87171',
        DEFAULT: '#ef4444',
        dark: '#dc2626',
    },

    info: {
        light: '#60a5fa',
        DEFAULT: '#3b82f6',
        dark: '#2563eb',
    },

    // Neutral Colors (Dark Theme Optimized)
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },

    // Background Colors
    background: {
        primary: '#0f172a',    // Main background
        secondary: '#1e293b',  // Cards, panels
        tertiary: '#334155',   // Hover states
        elevated: '#475569',   // Elevated components
    },

    // Text Colors
    text: {
        primary: '#f1f5f9',    // Main text
        secondary: '#cbd5e1',  // Secondary text
        tertiary: '#94a3b8',   // Muted text
        disabled: '#64748b',   // Disabled text
    },

    // Border Colors
    border: {
        DEFAULT: '#334155',
        focus: '#00b4ff',
        error: '#ef4444',
        success: '#22c55e',
    },
};

export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
};

export const borderRadius = {
    sm: '0.375rem',   // 6px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    full: '9999px',
};

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgba(0, 180, 255, 0.3)',
    glowSuccess: '0 0 20px rgba(34, 197, 94, 0.3)',
    glowError: '0 0 20px rgba(239, 68, 68, 0.3)',
};

export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
    },

    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export const transitions = {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    DEFAULT: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 250ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const zIndex = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
};

// Component-specific styles
export const components = {
    button: {
        primary: `
      bg-gradient-to-r from-cyan-500 to-blue-600 
      hover:from-cyan-600 hover:to-blue-700 
      text-white font-medium 
      px-6 py-3 rounded-lg 
      shadow-lg hover:shadow-cyan-500/50 
      transition-all duration-300 
      transform hover:scale-105
    `,

        secondary: `
      bg-slate-700 hover:bg-slate-600 
      text-white font-medium 
      px-6 py-3 rounded-lg 
      border border-slate-600 
      transition-all duration-200
    `,

        success: `
      bg-gradient-to-r from-emerald-500 to-green-600 
      hover:from-emerald-600 hover:to-green-700 
      text-white font-medium 
      px-6 py-3 rounded-lg 
      shadow-lg hover:shadow-emerald-500/50 
      transition-all duration-300
    `,

        danger: `
      bg-gradient-to-r from-red-500 to-rose-600 
      hover:from-red-600 hover:to-rose-700 
      text-white font-medium 
      px-6 py-3 rounded-lg 
      shadow-lg hover:shadow-red-500/50 
      transition-all duration-300
    `,

        ghost: `
      bg-transparent hover:bg-slate-800 
      text-gray-300 hover:text-white 
      px-6 py-3 rounded-lg 
      border border-transparent hover:border-slate-700 
      transition-all duration-200
    `,
    },

    card: {
        DEFAULT: `
      bg-slate-800 border border-slate-700 
      rounded-xl p-6 
      shadow-xl 
      transition-all duration-300 
      hover:shadow-2xl hover:border-slate-600
    `,

        elevated: `
      bg-gradient-to-br from-slate-800 to-slate-900 
      border border-slate-700 
      rounded-xl p-6 
      shadow-2xl 
      transition-all duration-300 
      hover:shadow-cyan-500/10
    `,
    },

    input: {
        DEFAULT: `
      w-full px-4 py-3 
      bg-slate-900 border-2 border-slate-700 
      rounded-lg text-white 
      focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 
      outline-none 
      transition-all duration-200 
      placeholder:text-gray-500
    `,

        error: `
      w-full px-4 py-3 
      bg-slate-900 border-2 border-red-500/50 
      rounded-lg text-white 
      focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
      outline-none 
      transition-all duration-200
    `,
    },
};

export default { colors, spacing, borderRadius, shadows, typography, transitions, zIndex, components };
