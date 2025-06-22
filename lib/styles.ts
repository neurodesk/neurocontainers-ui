/**
 * Style utility functions and helpers
 * 
 * This file provides helper functions for working with the centralized theme system.
 */

import {
  cn,
  themeClass,
  getThemeComponents,
  getThemePresets
} from './theme';

// ============================================================================
// COMPONENT STYLE BUILDERS
// ============================================================================

/**
 * Input field style builder with variants (theme-aware)
 */
export function inputStyles(
  isDark: boolean,
  variant?: 'default' | 'error',
  size?: 'sm' | 'md' | 'lg'
) {
  const themeComponents = getThemeComponents(isDark);
  const baseStyle = themeComponents.input.full;
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', // default
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    default: '',
    error: themeComponents.input.error,
  };

  return cn(
    baseStyle,
    variant && variantStyles[variant],
    size && sizeStyles[size]
  );
}

/**
 * Button style builder with variants and sizes (theme-aware)
 */
export function buttonStyles(
  isDark: boolean,
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const themeComponents = getThemeComponents(isDark);
  const baseStyle = themeComponents.button.base;
  const variantStyles = {
    primary: themeComponents.button.primary,
    secondary: themeComponents.button.secondary,
    ghost: themeComponents.button.ghost,
    danger: themeComponents.button.danger,
  };

  const sizeStyles = {
    sm: themeComponents.button.sm,
    md: themeComponents.button.md,
    lg: themeComponents.button.lg,
  };

  return cn(
    baseStyle,
    variantStyles[variant],
    sizeStyles[size],
    themeComponents.button.disabled
  );
}

/**
 * Textarea style builder (theme-aware)
 */
export function textareaStyles(isDark: boolean, options?: {
  monospace?: boolean;
  height?: string;
  error?: boolean;
}) {
  const themeComponents = getThemeComponents(isDark);
  const baseStyle = themeComponents.textarea.full;
  const monoStyle = options?.monospace ? themeComponents.textarea.monospace : '';
  const heightStyle = options?.height ? options.height : '';
  const errorStyle = options?.error ? themeComponents.input.error : '';

  return cn(baseStyle, monoStyle, heightStyle, errorStyle);
}

/**
 * Card style builder (theme-aware)
 */
export function cardStyles(
  isDark: boolean,
  variant?: 'default' | 'elevated' | 'theme',
  padding?: 'zero' | 'sm' | 'md' | 'lg',
) {
  const themeComponents = getThemeComponents(isDark);

  const variantStyles = {
    default: themeComponents.card.base,
    elevated: themeComponents.card.elevated,
    theme: themeComponents.card.theme,
  };

  const paddingStyles = {
    zero: "",
    sm: themeComponents.card.padding.sm,
    md: themeComponents.card.padding.md,
    lg: themeComponents.card.padding.lg,
  };

  return cn(
    variantStyles[variant || 'default'],
    paddingStyles[padding || 'md']
  );
}

/**
 * Icon style builder (theme-aware)
 */
export function iconStyles(
  isDark: boolean,
  size?: 'sm' | 'md' | 'lg',
  color?: 'primary' | 'secondary' | 'muted'
) {
  const themeComponents = getThemeComponents(isDark);
  const sizeStyles = {
    sm: themeComponents.icon.sm,
    md: themeComponents.icon.md,
    lg: themeComponents.icon.lg,
  };

  const colorStyles = {
    primary: themeComponents.icon.color.primary,
    secondary: themeComponents.icon.color.secondary,
    muted: themeComponents.icon.color.muted,
  };

  return cn(
    sizeStyles[size || 'md'],
    color && colorStyles[color]
  );
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Grid layout builder
 */
export function gridStyles(isDark: boolean, cols: 1 | 2 | 3 = 1, gap?: 'sm' | 'md' | 'lg') {
  const components = getThemeComponents(isDark);

  const colStyles = {
    1: components.layout.grid.cols1,
    2: components.layout.grid.cols2,
    3: components.layout.grid.cols3,
  };

  const gapStyles = {
    sm: components.layout.grid.gap.sm,
    md: components.layout.grid.gap.md,
    lg: components.layout.grid.gap.lg,
  };

  return cn(
    colStyles[cols],
    gap && gapStyles[gap]
  );
}

/**
 * Flex layout builder
 */
export function flexStyles(isDark: boolean, variant: 'center' | 'between' | 'start' | 'col') {
  const components = getThemeComponents(isDark);

  const variants = {
    center: components.layout.flex.center,
    between: components.layout.flex.between,
    start: components.layout.flex.start,
    col: components.layout.flex.col,
  };

  return variants[variant];
}

// ============================================================================
// FORM HELPERS
// ============================================================================

/**
 * Form field wrapper styles
 */
export function formFieldStyles(isDark: boolean, hasError?: boolean) {
  const components = getThemeComponents(isDark);

  return cn(
    components.formField.container,
    hasError && 'mb-2' // Reduce margin when there's an error message
  );
}

/**
 * Form label styles
 */
export function formLabelStyles(isDark: boolean, required?: boolean) {
  const components = getThemeComponents(isDark);

  return cn(
    components.formField.label,
    required && "after:content-['*'] after:text-red-500 after:ml-1"
  );
}

// ============================================================================
// STATE HELPERS
// ============================================================================

/**
 * Interactive state styles
 */
export function interactiveStyles(isDark: boolean, options?: {
  hover?: boolean;
  focus?: boolean;
  disabled?: boolean;
}) {
  const components = getThemeComponents(isDark);

  return cn(
    options?.hover && components.state.hover.card,
    options?.focus && components.state.focus.ring,
    options?.disabled && components.state.disabled.full
  );
}

/**
 * Focus ring styles
 */
export function focusRingStyles(isDark: boolean, thick?: boolean) {
  const components = getThemeComponents(isDark);

  return thick ? components.state.focus.ringThick : components.state.focus.ring;
}

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================

/**
 * Text style builder
 */
export function textStyles(isDark: boolean, options?: {
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'disabled' | 'white';
  leading?: 'tight' | 'snug' | 'normal' | 'relaxed';
}) {
  const { size, weight, color, leading } = options || {};

  return cn(
    size && `text-${size}`,
    weight && `font-${weight}`,
    color && {
      primary: isDark ? "text-[#e8f5d0]" : 'text-[#0c0e0a]',
      secondary: isDark ? "text-[#91c84a]" : 'text-[#4f7b38]',
      muted: isDark ? "text-gray-500" : 'text-gray-500',
      disabled: isDark ? "text-gray-600" : 'text-gray-400',
      white: isDark ? "text-black" : 'text-white',
    }[color],
    leading && `leading-${leading}`
  );
}

// ============================================================================
// THEME-AWARE PRESET COMBINATIONS
// ============================================================================

/**
 * Theme-aware input field components
 */
export function getInputField(isDark: boolean) {
  const themePresets = getThemePresets(isDark);
  return {
    container: themePresets.formField,
    label: themePresets.formLabel,
    input: themePresets.input,
  };
}

/**
 * Theme-aware help section components
 */
export function getHelpSection(isDark: boolean) {
  const themeComponents = getThemeComponents(isDark);
  const themePresets = getThemePresets(isDark);
  return {
    container: themePresets.helpSection,
    title: themeComponents.help.title,
    text: themeComponents.help.text,
    code: themeComponents.help.code,
  };
}

/**
 * Theme-aware button variants
 */
export function getButtons(isDark: boolean) {
  const themePresets = getThemePresets(isDark);
  return {
    primary: themePresets.buttonPrimary,
    secondary: themePresets.buttonSecondary,
    icon: themePresets.buttonIcon,
    danger: themePresets.buttonDanger,
  };
}

/**
 * Theme-aware card variants
 */
export function getCards(isDark: boolean) {
  const themePresets = getThemePresets(isDark);
  return {
    default: themePresets.card,
    theme: themePresets.cardTheme,
    elevated: cardStyles(isDark, 'elevated', 'md'),
    minimal: cardStyles(isDark, 'elevated', 'sm'),
  };
}

// ============================================================================
// THEME-AWARE UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets theme-appropriate class names for common UI patterns
 */
export function getThemeClasses(isDark: boolean) {
  const themePresets = getThemePresets(isDark);
  const themeComponents = getThemeComponents(isDark);

  return {
    // Form elements
    input: themePresets.input,
    textarea: themeComponents.textarea.full,
    textareaMono: themePresets.textareaMono,
    formField: themePresets.formField,
    formLabel: themePresets.formLabel,

    // Buttons
    buttonPrimary: themePresets.buttonPrimary,
    buttonSecondary: themePresets.buttonSecondary,
    buttonGhost: themePresets.buttonIcon,
    buttonDanger: themePresets.buttonDanger,

    // Cards and containers
    card: themePresets.card,
    cardTheme: themePresets.cardTheme,

    // Interactive states
    focusRing: themePresets.focusRing,
    hoverCard: themePresets.hoverCard,
    hoverIcon: themePresets.hoverIcon,

    // Help sections
    helpTitle: themeComponents.help.title,
    helpText: themeComponents.help.text,
    helpCode: themeComponents.help.code,
  };
}

/**
 * Convenience hook-like function for getting all theme-aware styles
 */
export function useThemeStyles(isDark: boolean) {
  return {
    classes: getThemeClasses(isDark),
    inputField: getInputField(isDark),
    helpSection: getHelpSection(isDark),
    buttons: getButtons(isDark),
    cards: getCards(isDark),

    // Style builders
    input: (variant?: 'default' | 'error', size?: 'sm' | 'md' | 'lg') =>
      inputStyles(isDark, variant, size),
    button: (variant?: 'primary' | 'secondary' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg') =>
      buttonStyles(isDark, variant, size),
    card: (variant?: 'default' | 'elevated' | 'theme', padding?: 'zero' | 'sm' | 'md' | 'lg') =>
      cardStyles(isDark, variant, padding),
    icon: (size?: 'sm' | 'md' | 'lg', color?: 'primary' | 'secondary' | 'muted') =>
      iconStyles(isDark, size, color),
    textarea: (options?: { monospace?: boolean; height?: string; error?: boolean; }) =>
      textareaStyles(isDark, { ...options }),
  };
}

// Export commonly used individual styles
export {
  cn,
  themeClass,
  getThemeComponents,
  getThemePresets,
};