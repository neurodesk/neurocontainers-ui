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
  // Primary Brand Colors - Green theme (Light Mode)
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

  // Semantic colors (Light Mode)
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Semantic colors (Dark Mode)
  successDark: '#34d399',   // Lighter green for dark backgrounds
  warningDark: '#fbbf24',   // Lighter amber for dark backgrounds
  errorDark: '#f87171',     // Lighter red for dark backgrounds
  infoDark: '#60a5fa',      // Lighter blue for dark backgrounds

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
    border: '#2d4222',          // Border color
    borderLight: '#3f5b2e',     // Lighter border
    text: '#e8f5d0',           // Primary text
    textSecondary: '#c4e382',   // Secondary text
    textMuted: '#a8d65c',       // Muted text
  },
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

  // Text colors (Light Mode)
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

  // Text colors (Dark Mode)
  colorDark: {
    primary: `text-[${colors.dark.text}]`,
    secondary: `text-[${colors.dark.textSecondary}]`,
    muted: `text-[${colors.dark.textMuted}]`,
    disabled: `text-[${colors.grayDark[400]}]`,
    white: `text-[${colors.grayDark[900]}]`,
    success: `text-[${colors.successDark}]`,
    warning: `text-[${colors.warningDark}]`,
    error: `text-[${colors.errorDark}]`,
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
// DARK MODE COMPONENT STYLES
// ============================================================================

const componentsDark = {
  // Form inputs - dark mode
  input: {
    base: `w-full px-3 py-1.5 border border-[${colors.dark.border}] bg-[${colors.dark.surface}] rounded-md text-[${colors.dark.text}] text-sm`,
    focus: `focus:outline-none focus:ring-1 focus:ring-[${colors.primaryDark[500]}] focus:border-[${colors.primaryDark[500]}]`,
    disabled: `disabled:bg-[${colors.grayDark[100]}] disabled:text-[${colors.grayDark[400]}] disabled:cursor-not-allowed`,
    error: `border-[${colors.errorDark}] focus:ring-[${colors.errorDark}] focus:border-[${colors.errorDark}]`,
    get full() { return `${this.base} ${this.focus} ${this.disabled}` }
  },

  // Textarea - dark mode
  textarea: {
    base: `w-full px-3 py-1.5 border border-[${colors.dark.border}] bg-[${colors.dark.surface}] rounded-md text-[${colors.dark.text}] text-sm resize-none`,
    focus: `focus:outline-none focus:ring-1 focus:ring-[${colors.primaryDark[500]}] focus:border-[${colors.primaryDark[500]}]`,
    monospace: 'font-mono',
    get full() { return `${this.base} ${this.focus}` },
    get fullMono() { return `${this.base} ${this.focus} ${this.monospace}` }
  },

  // Buttons - dark mode
  button: {
    base: 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-1',

    primary: `bg-[${colors.primaryDark[500]}] text-[${colors.dark.background}] hover:bg-[${colors.primaryDark[600]}] focus:ring-[${colors.primaryDark[500]}]`,
    secondary: `bg-[${colors.dark.surface}] border border-[${colors.dark.borderLight}] text-[${colors.dark.textSecondary}] hover:bg-[${colors.dark.surfaceElevated}] focus:ring-[${colors.primaryDark[500]}]`,
    ghost: `text-[${colors.dark.textSecondary}] hover:text-[${colors.primaryDark[500]}] hover:bg-[${colors.primaryDark[200]}]`,
    danger: `bg-[${colors.errorDark}] text-[${colors.dark.background}] hover:bg-red-400 focus:ring-[${colors.errorDark}]`,

    // Size variants (same as light mode)
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', // default
    lg: 'px-4 py-2 text-base',

    // State variants
    disabled: `disabled:opacity-50 disabled:cursor-not-allowed`,

    get primaryFull() { return `${this.base} ${this.primary} ${this.disabled}` },
    get secondaryFull() { return `${this.base} ${this.secondary} ${this.disabled}` },
    get ghostFull() { return `${this.base} ${this.ghost} ${this.disabled}` },
  },

  // Cards and containers - dark mode
  card: {
    base: `bg-[${colors.dark.surface}] rounded-md shadow-sm border border-[${colors.dark.border}]`,
    elevated: `bg-[${colors.dark.surfaceElevated}] rounded-lg shadow-md border border-[${colors.dark.borderLight}]`,
    theme: `bg-[${colors.primaryDark[200]}] border border-[${colors.primaryDark[300]}] rounded-md`,

    // Padding variants (same as light mode)
    padding: {
      sm: 'p-1',
      md: 'p-2', // default
      lg: 'p-4',
    }
  },

  // Form fields - dark mode
  formField: {
    container: 'mb-3', // same as light mode
    label: `block text-sm font-medium text-[${colors.dark.text}] mb-1.5`,
    description: `mt-1 text-xs text-[${colors.dark.textMuted}]`,
    error: `mt-1 text-xs text-[${colors.errorDark}]`,
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