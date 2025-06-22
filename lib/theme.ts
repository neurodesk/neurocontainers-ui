/**
 * Centralized theme system for Neurocontainers UI
 * 
 * This file consolidates all styling patterns, colors, typography, and component styles
 * to ensure consistency across the application and optimize content density.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // Primary Brand Colors - Green theme
  primary: {
    50: '#fafdfb',    // Lightest background
    100: '#f8fdf2',   // Very light background  
    200: '#f0f7e7',   // Light background
    300: '#e6f1d6',   // Border light
    400: '#d3e7b6',   // Border medium
    500: '#6aa329',   // Primary brand
    600: '#4f7b38',   // Primary dark
    700: '#3a5829',   // Darker
    800: '#1e2a16',   // Very dark
    900: '#0c0e0a',   // Text dark
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - Optimized for content density
// ============================================================================

export const typography = {
  // Text sizes - optimized for more content on screen
  size: {
    xs: 'text-xs',     // 12px - Fine print, captions
    sm: 'text-sm',     // 14px - Secondary text, most UI text
    base: 'text-sm',   // 14px - Main body text (reduced from text-base)
    md: 'text-base',   // 16px - Important content
    lg: 'text-lg',     // 18px - Section headers
    xl: 'text-xl',     // 20px - Page titles
    '2xl': 'text-2xl', // 24px - Main headings
  },

  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },

  // Line heights - optimized for density
  leading: {
    tight: 'leading-tight',   // 1.25
    snug: 'leading-snug',     // 1.375  
    normal: 'leading-normal', // 1.5
    relaxed: 'leading-relaxed', // 1.625
  },

  // Text colors
  color: {
    primary: `text-[${colors.primary[900]}]`,
    secondary: `text-[${colors.primary[600]}]`,
    muted: 'text-gray-500',
    disabled: 'text-gray-400',
    white: 'text-white',
    success: `text-[${colors.success}]`,
    warning: `text-[${colors.warning}]`,
    error: `text-[${colors.error}]`,
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  // Standard spacing scale
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const components = {
  // Form inputs - standardized
  input: {
    base: `w-full px-3 py-1.5 border border-gray-200 rounded-md text-[${colors.primary[900]}] text-sm`,
    focus: `focus:outline-none focus:ring-1 focus:ring-[${colors.primary[500]}] focus:border-[${colors.primary[500]}]`,
    disabled: `disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`,
    error: `border-[${colors.error}] focus:ring-[${colors.error}] focus:border-[${colors.error}]`,
    get full() { return `${this.base} ${this.focus} ${this.disabled}` }
  },

  // Textarea - standardized
  textarea: {
    base: `w-full px-3 py-1.5 border border-gray-200 rounded-md text-[${colors.primary[900]}] text-sm resize-none`,
    focus: `focus:outline-none focus:ring-1 focus:ring-[${colors.primary[500]}] focus:border-[${colors.primary[500]}]`,
    monospace: 'font-mono',
    get full() { return `${this.base} ${this.focus}` },
    get fullMono() { return `${this.base} ${this.focus} ${this.monospace}` }
  },

  // Buttons
  button: {
    base: 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-1',

    primary: `bg-[${colors.primary[500]}] text-white hover:bg-[${colors.primary[600]}] focus:ring-[${colors.primary[500]}]`,
    secondary: `bg-white border border-[${colors.primary[300]}] text-[${colors.primary[600]}] hover:bg-[${colors.primary[100]}] focus:ring-[${colors.primary[500]}]`,
    ghost: `text-[${colors.primary[600]}] hover:text-[${colors.primary[500]}] hover:bg-[${colors.primary[50]}]`,
    danger: `bg-[${colors.error}] text-white hover:bg-red-600 focus:ring-[${colors.error}]`,

    // Size variants
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', // default
    lg: 'px-4 py-2 text-base',

    // State variants
    disabled: `disabled:opacity-50 disabled:cursor-not-allowed`,

    get primaryFull() { return `${this.base} ${this.primary} ${this.disabled}` },
    get secondaryFull() { return `${this.base} ${this.secondary} ${this.disabled}` },
    get ghostFull() { return `${this.base} ${this.ghost} ${this.disabled}` },
  },

  // Cards and containers
  card: {
    base: `bg-white rounded-md shadow-sm border border-gray-200`,
    elevated: `bg-white rounded-lg shadow-md border border-[${colors.primary[400]}]`,
    theme: `bg-[${colors.primary[50]}] border border-[${colors.primary[300]}] rounded-md`,

    // Padding variants
    padding: {
      sm: 'p-1',
      md: 'p-2', // default
      lg: 'p-4',
    }
  },

  // Form fields
  formField: {
    container: 'mb-3', // Reduced from mb-4 for density
    label: `block text-sm font-medium text-[${colors.primary[900]}] mb-1.5`, // Reduced margin
    description: `mt-1 text-xs text-gray-500`, // Smaller text
    error: `mt-1 text-xs text-[${colors.error}]`,
  },

  // Help sections
  help: {
    container: ``,
    title: `font-semibold text-[${colors.primary[900]}] mb-2 text-sm`,
    text: `text-xs text-gray-600`,
    code: `bg-gray-100 px-2 py-1 rounded text-xs font-mono`,
  },

  // Icons
  icon: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', // default
    lg: 'h-6 w-6',
    color: {
      primary: `text-[${colors.primary[600]}]`,
      secondary: `text-gray-500`,
      muted: `text-gray-400`,
    }
  },

  // States and interactions
  state: {
    hover: {
      card: `hover:bg-[${colors.primary[50]}] hover:shadow-md`,
      icon: `hover:text-[${colors.primary[500]}]`,
      text: `hover:text-[${colors.primary[500]}]`,
    },

    focus: {
      ring: `focus:ring-1 focus:ring-[${colors.primary[500]}] focus:outline-none`,
      ringThick: `focus:ring-2 focus:ring-[${colors.primary[500]}]/20 focus:outline-none`,
    },

    disabled: {
      opacity: 'disabled:opacity-50',
      cursor: 'disabled:cursor-not-allowed',
      full: 'disabled:opacity-50 disabled:cursor-not-allowed',
    }
  },

  // Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    grid: {
      cols1: 'grid grid-cols-1',
      cols2: 'grid grid-cols-1 md:grid-cols-2',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      gap: {
        sm: 'gap-2',
        md: 'gap-4', // default
        lg: 'gap-6',
      }
    },
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      start: 'flex items-center justify-start',
      col: 'flex flex-col',
    }
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines multiple class strings, filtering out falsy values
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Theme-aware class builder
 */
export function themeClass(baseClasses: string, themeClasses?: string): string {
  return cn(baseClasses, themeClasses);
}

// ============================================================================
// PRESET COMBINATIONS (Most commonly used patterns)
// ============================================================================

export const presets = {
  // Input field (most common pattern)
  input: components.input.full,

  // Textarea with monospace
  textareaMono: components.textarea.fullMono,

  // Primary button
  buttonPrimary: components.button.primaryFull,

  // Secondary button  
  buttonSecondary: components.button.secondaryFull,

  // Icon button
  buttonIcon: components.button.ghostFull,

  // Danger button
  buttonDanger: components.button.danger,

  // Form field container
  formField: components.formField.container,

  // Form label
  formLabel: components.formField.label,

  // Help section
  helpSection: components.help.container,

  // Card with theme styling
  cardTheme: components.card.theme,

  // Standard card
  card: `${components.card.base} ${components.card.padding.md}`,

  // Focus ring
  focusRing: components.state.focus.ring,

  // Hover effects
  hoverCard: components.state.hover.card,
  hoverIcon: components.state.hover.icon,
} as const;

// Export individual sections for easier imports
export { colors as themeColors, typography as themeTypography, spacing as themeSpacing, components as themeComponents };