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
  // Primary Brand Colors - Green theme (Light Mode) - Enhanced for vibrancy
  primary: {
    50: '#f0fdf4',    // Brightest green tint
    100: '#dcfce7',   // Very light green background  
    200: '#bbf7d0',   // Light green background
    300: '#86efac',   // Bright border light
    400: '#4ade80',   // Vibrant border medium
    500: '#16a34a',   // Strong primary brand
    600: '#15803d',   // Rich primary dark
    700: '#166534',   // Deep green
    800: '#14532d',   // Very dark green
    900: '#052e16',   // Deep forest text
  },

  // Primary Brand Colors - Dark Mode variants
  primaryDark: {
    50: '#0a0c08',    // Darkest background (inverted from 900)
    100: '#161a0e',   // Very dark background (inverted from 800)
    200: '#1f2e18',   // Dark background (adjusted from 700)
    300: '#2d4222',   // Border dark (adjusted)
    400: '#3f5b2e',   // Border medium dark (adjusted)
    500: '#7bb33a',   // Primary brand (lighter for dark bg)
    600: '#91c84a',   // Primary light (for hover states)
    700: '#a8d65c',   // Lighter variant
    800: '#c4e382',   // Very light (for subtle elements)
    900: '#e8f5d0',   // Lightest text (inverted from 50)
  },

  // Semantic colors (Light Mode) - Enhanced vibrancy
  success: '#059669',   // Richer emerald green
  warning: '#d97706',   // Deeper amber orange
  error: '#dc2626',     // Bold red
  info: '#2563eb',      // Strong blue
  purple: '#7c3aed',    // Rich purple
  pink: '#db2777',      // Vibrant pink
  indigo: '#4338ca',    // Deep indigo
  cyan: '#0891b2',      // Bright cyan

  // Semantic colors (Dark Mode)
  successDark: '#10b981',   // Bright emerald for dark backgrounds
  warningDark: '#f59e0b',   // Bright amber for dark backgrounds
  errorDark: '#f87171',     // Lighter red for dark backgrounds
  infoDark: '#60a5fa',      // Lighter blue for dark backgrounds
  purpleDark: '#a855f7',    // Bright purple for dark backgrounds
  pinkDark: '#ec4899',      // Bright pink for dark backgrounds
  indigoDark: '#6366f1',    // Bright indigo for dark backgrounds
  cyanDark: '#06b6d4',      // Bright cyan for dark backgrounds

  // Gray scale colors (Light Mode)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#2d4222',
    900: '#111827',
  },

  // Gray scale colors (Dark Mode)
  grayDark: {
    50: '#111827',     // Darkest (inverted from 900)
    100: '#2d4222',    // Very dark (inverted from 800)
    200: '#374151',    // Dark (inverted from 700)
    300: '#4b5563',    // Medium dark (inverted from 600)
    400: '#6b7280',    // Medium (inverted from 500)
    500: '#9ca3af',    // Medium light (inverted from 400)
    600: '#d1d5db',    // Light (inverted from 300)
    700: '#e5e7eb',    // Very light (inverted from 200)
    800: '#f3f4f6',    // Lightest (inverted from 100)
    900: '#ffffff',    // White text
  },

  // Special dark mode colors
  dark: {
    background: '#0a0c08',      // Main dark background
    surface: '#161a0e',         // Card/surface background
    surfaceElevated: '#1f2e18', // Elevated surface background
    border: '#1f2e18',          // Subtle border color
    borderLight: '#2d4222',     // Slightly more visible border
    text: '#e8f5d0',           // Primary text
    textSecondary: '#c4e382',   // Secondary text
    textMuted: '#a8d65c',       // Muted text
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - Optimized for content density
// ============================================================================

export const typography = {
  // Text sizes - mobile-first responsive typography
  size: {
    xs: 'text-sm md:text-xs',      // 14px mobile / 12px desktop - Better readability on mobile
    sm: 'text-base md:text-sm',    // 16px mobile / 14px desktop - Improved mobile UX
    base: 'text-base md:text-sm',  // 16px mobile / 14px desktop - Standard mobile-friendly base
    md: 'text-lg md:text-base',    // 18px mobile / 16px desktop - Important content
    lg: 'text-xl md:text-lg',      // 20px mobile / 18px desktop - Section headers
    xl: 'text-2xl md:text-xl',     // 24px mobile / 20px desktop - Page titles
    '2xl': 'text-3xl md:text-2xl', // 30px mobile / 24px desktop - Main headings
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

  // Text colors (Light Mode)
  color: {
    primary: 'text-[#052e16]',
    secondary: 'text-[#15803d]',
    muted: 'text-gray-500',
    disabled: 'text-gray-400',
    white: 'text-white',
    success: 'text-[#059669]',
    warning: 'text-[#d97706]',
    error: 'text-[#dc2626]',
  },

  // Text colors (Dark Mode)
  colorDark: {
    primary: 'text-[#e8f5d0]',
    secondary: 'text-[#c4e382]',
    muted: 'text-[#a8d65c]',
    disabled: 'text-[#6b7280]',
    white: 'text-[#ffffff]',
    success: 'text-[#10b981]',
    warning: 'text-[#f59e0b]',
    error: 'text-[#f87171]',
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

const components = {
  // Form inputs - standardized
  input: {
    base: `w-full px-3 py-1.5 border border-gray-200 rounded-md text-gray-900 text-sm`,
    focus: `focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`,
    disabled: `disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`,
    error: `border-red-500 focus:ring-red-500 focus:border-red-500`,
    get full() { return `${this.base} ${this.focus} ${this.disabled}` }
  },

  // Textarea - standardized
  textarea: {
    base: `w-full px-3 py-1.5 border border-gray-200 rounded-md text-gray-900 text-sm resize-none`,
    focus: `focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`,
    monospace: 'font-mono',
    get full() { return `${this.base} ${this.focus}` },
    get fullMono() { return `${this.base} ${this.focus} ${this.monospace}` }
  },

  // Buttons - mobile-first with touch-friendly targets
  button: {
    base: 'font-medium rounded-md transition-colors focus:outline-none focus:ring-1 touch-manipulation',

    primary: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,
    secondary: `bg-white border border-green-300 text-green-700 hover:bg-green-50 focus:ring-green-500`,
    ghost: `text-green-700 hover:text-green-600 hover:bg-green-50`,
    danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,

    // Size variants - mobile-first approach
    sm: 'px-3 py-2 text-sm md:px-2 md:py-1 md:text-xs min-h-[40px] md:min-h-[auto]',
    md: 'px-4 py-3 text-base md:px-3 md:py-1.5 md:text-sm min-h-[44px] md:min-h-[auto]', // default
    lg: 'px-6 py-4 text-lg md:px-4 md:py-2 md:text-base min-h-[48px] md:min-h-[auto]',

    // State variants
    disabled: `disabled:opacity-50 disabled:cursor-not-allowed`,

    get primaryFull() { return `${this.base} ${this.primary} ${this.disabled}` },
    get secondaryFull() { return `${this.base} ${this.secondary} ${this.disabled}` },
    get ghostFull() { return `${this.base} ${this.ghost} ${this.disabled}` },
  },

  // Cards and containers - subtle styling
  card: {
    base: `bg-white rounded-lg shadow-md border border-gray-200`,
    elevated: `bg-white rounded-xl shadow-xl border border-gray-300`,
    theme: `bg-gradient-to-br from-white to-green-50/30 border border-green-300/50 rounded-lg shadow-md`,

    // Padding variants - mobile-first spacing
    padding: {
      sm: 'p-3 md:p-1',
      md: 'p-4 md:p-2', // default
      lg: 'p-6 md:p-4',
    }
  },

  // Form fields - mobile-first responsive spacing
  formField: {
    container: 'mb-4 md:mb-3', // More space on mobile, compact on desktop
    label: `block font-medium text-gray-900 mb-2 md:mb-1.5 text-base md:text-sm`, // Larger text on mobile
    description: `mt-2 md:mt-1 text-sm md:text-xs text-gray-500`, // Better readability on mobile
    error: `mt-2 md:mt-1 text-sm md:text-xs text-red-600`,
  },

  // Help sections
  help: {
    container: ``,
    title: `font-semibold text-gray-900 mb-2 text-sm`,
    text: `text-xs text-gray-600`,
    code: `bg-gray-100 px-2 py-1 rounded text-xs font-mono`,
  },

  // Icons
  icon: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', // default
    lg: 'h-6 w-6',
    color: {
      primary: `text-green-600`,
      secondary: `text-gray-500`,
      muted: `text-gray-400`,
    }
  },

  // States and interactions
  state: {
    hover: {
      card: `hover:bg-green-50 hover:shadow-md`,
      icon: `hover:text-green-600`,
      text: `hover:text-green-600`,
    },

    focus: {
      ring: `focus:ring-1 focus:ring-green-500 focus:outline-none`,
      ringThick: `focus:ring-2 focus:ring-green-500/20 focus:outline-none`,
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
// DARK MODE COMPONENT STYLES
// ============================================================================

const componentsDark = {
  // Form inputs - dark mode
  input: {
    base: 'w-full px-3 py-1.5 border border-[#1f2e18] bg-[#161a0e] rounded-md text-[#e8f5d0] text-sm',
    focus: 'focus:outline-none focus:ring-1 focus:ring-[#7bb33a] focus:border-[#7bb33a]',
    disabled: 'disabled:bg-[#2d4222] disabled:text-[#6b7280] disabled:cursor-not-allowed',
    error: 'border-[#f87171] focus:ring-[#f87171] focus:border-[#f87171]',
    get full() { return `${this.base} ${this.focus} ${this.disabled}` }
  },

  // Textarea - dark mode
  textarea: {
    base: 'w-full px-3 py-1.5 border border-[#1f2e18] bg-[#161a0e] rounded-md text-[#e8f5d0] text-sm resize-none',
    focus: 'focus:outline-none focus:ring-1 focus:ring-[#7bb33a] focus:border-[#7bb33a]',
    monospace: 'font-mono',
    get full() { return `${this.base} ${this.focus}` },
    get fullMono() { return `${this.base} ${this.focus} ${this.monospace}` }
  },

  // Buttons - dark mode with mobile-first touch targets
  button: {
    base: 'font-medium rounded-md transition-colors focus:outline-none focus:ring-1 touch-manipulation',

    primary: `bg-green-700 text-white hover:bg-green-600 focus:ring-green-500`,
    secondary: `bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-green-500`,
    ghost: `text-gray-300 hover:text-green-400 hover:bg-gray-800`,
    danger: `bg-red-600 text-white hover:bg-red-500 focus:ring-red-500`,

    // Size variants - mobile-first approach (same as light mode)
    sm: 'px-3 py-2 text-sm md:px-2 md:py-1 md:text-xs min-h-[40px] md:min-h-[auto]',
    md: 'px-4 py-3 text-base md:px-3 md:py-1.5 md:text-sm min-h-[44px] md:min-h-[auto]', // default
    lg: 'px-6 py-4 text-lg md:px-4 md:py-2 md:text-base min-h-[48px] md:min-h-[auto]',

    // State variants
    disabled: `disabled:opacity-50 disabled:cursor-not-allowed`,

    get primaryFull() { return `${this.base} ${this.primary} ${this.disabled}` },
    get secondaryFull() { return `${this.base} ${this.secondary} ${this.disabled}` },
    get ghostFull() { return `${this.base} ${this.ghost} ${this.disabled}` },
  },

  // Cards and containers - dark mode
  card: {
    base: `bg-[#161a0e] rounded-md shadow-sm border border-[#1f2e18]`,
    elevated: `bg-[#1f2e18] rounded-lg shadow-md border border-[#2d4222]`,
    theme: `bg-[#1f2e18] border border-[#2d4222] rounded-md`,

    // Padding variants (same as light mode)
    padding: {
      sm: 'p-1',
      md: 'p-2', // default
      lg: 'p-4',
    }
  },

  // Form fields - dark mode with mobile-first responsive spacing
  formField: {
    container: 'mb-4 md:mb-3', // same as light mode
    label: `block font-medium text-[${colors.dark.text}] mb-2 md:mb-1.5 text-base md:text-sm`,
    description: `mt-2 md:mt-1 text-sm md:text-xs text-[${colors.dark.textMuted}]`,
    error: `mt-2 md:mt-1 text-sm md:text-xs text-[${colors.errorDark}]`,
  },

  // Help sections - dark mode
  help: {
    container: ``,
    title: `font-semibold text-[${colors.dark.text}] mb-2 text-sm`,
    text: `text-xs text-[${colors.dark.textMuted}]`,
    code: `bg-[${colors.dark.surfaceElevated}] px-2 py-1 rounded text-xs font-mono`,
  },

  // Icons - dark mode
  icon: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', // default
    lg: 'h-6 w-6',
    color: {
      primary: `text-[${colors.dark.textSecondary}]`,
      secondary: `text-[${colors.dark.textMuted}]`,
      muted: `text-[${colors.grayDark[400]}]`,
    }
  },

  // States and interactions - dark mode
  state: {
    hover: {
      card: `hover:bg-[${colors.primaryDark[200]}] hover:shadow-md`,
      icon: `hover:text-[${colors.primaryDark[500]}]`,
      text: `hover:text-[${colors.primaryDark[500]}]`,
    },

    focus: {
      ring: `focus:ring-1 focus:ring-[${colors.primaryDark[500]}] focus:outline-none`,
      ringThick: `focus:ring-2 focus:ring-[${colors.primaryDark[500]}]/20 focus:outline-none`,
    },

    disabled: {
      opacity: 'disabled:opacity-50',
      cursor: 'disabled:cursor-not-allowed',
      full: 'disabled:opacity-50 disabled:cursor-not-allowed',
    }
  },

  // Layout (same as light mode)
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

const presets = {
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

// ============================================================================
// DARK MODE PRESET COMBINATIONS
// ============================================================================

const presetsDark = {
  // Input field (most common pattern)
  input: componentsDark.input.full,

  // Textarea with monospace
  textareaMono: componentsDark.textarea.fullMono,

  // Primary button
  buttonPrimary: componentsDark.button.primaryFull,

  // Secondary button  
  buttonSecondary: componentsDark.button.secondaryFull,

  // Icon button
  buttonIcon: componentsDark.button.ghostFull,

  // Danger button
  buttonDanger: componentsDark.button.danger,

  // Form field container
  formField: componentsDark.formField.container,

  // Form label
  formLabel: componentsDark.formField.label,

  // Help section
  helpSection: componentsDark.help.container,

  // Card with theme styling
  cardTheme: componentsDark.card.theme,

  // Standard card
  card: `${componentsDark.card.base} ${componentsDark.card.padding.md}`,

  // Focus ring
  focusRing: componentsDark.state.focus.ring,

  // Hover effects
  hoverCard: componentsDark.state.hover.card,
  hoverIcon: componentsDark.state.hover.icon,
} as const;

// ============================================================================
// THEME-AWARE UTILITIES
// ============================================================================

/**
 * Gets the appropriate color palette based on theme
 */
export function getThemeColors(isDark: boolean = false) {
  return {
    primary: isDark ? colors.primaryDark : colors.primary,
    gray: isDark ? colors.grayDark : colors.gray,
    success: isDark ? colors.successDark : colors.success,
    warning: isDark ? colors.warningDark : colors.warning,
    error: isDark ? colors.errorDark : colors.error,
    info: isDark ? colors.infoDark : colors.info,
    ...(isDark ? { dark: colors.dark } : {}),
  };
}

/**
 * Gets the appropriate component styles based on theme
 */
export function getThemeComponents(isDark: boolean) {
  return isDark ? componentsDark : components;
}

/**
 * Gets the appropriate presets based on theme
 */
export function getThemePresets(isDark: boolean) {
  return isDark ? presetsDark : presets;
}

/**
 * Gets the appropriate typography colors based on theme
 */
export function getThemeTypography(isDark: boolean) {
  return {
    ...typography,
    color: isDark ? typography.colorDark : typography.color,
  };
}

// Export individual sections for easier imports
export {
  colors as themeColors,
  typography as themeTypography,
  spacing as themeSpacing,
  components as themeComponents,
  componentsDark as themeComponentsDark
};