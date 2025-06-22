/**
 * Style utility functions and helpers
 * 
 * This file provides helper functions for working with the centralized theme system.
 */

import { presets, components, cn, themeClass } from './theme';

// ============================================================================
// COMPONENT STYLE BUILDERS
// ============================================================================

/**
 * Input field style builder with variants
 */
export function inputStyles(variant?: 'default' | 'error', size?: 'sm' | 'md' | 'lg') {
  const baseStyle = components.input.full;
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm', // default
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    default: '',
    error: components.input.error,
  };

  return cn(
    baseStyle,
    variant && variantStyles[variant],
    size && sizeStyles[size]
  );
}

/**
 * Button style builder with variants and sizes
 */
export function buttonStyles(
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const baseStyle = components.button.base;
  const variantStyles = {
    primary: components.button.primary,
    secondary: components.button.secondary,
    ghost: components.button.ghost,
    danger: components.button.danger,
  };

  const sizeStyles = {
    sm: components.button.sm,
    md: components.button.md,
    lg: components.button.lg,
  };

  return cn(
    baseStyle,
    variantStyles[variant],
    sizeStyles[size],
    components.button.disabled
  );
}

/**
 * Textarea style builder
 */
export function textareaStyles(options?: {
  monospace?: boolean;
  height?: string;
  error?: boolean;
}) {
  const baseStyle = components.textarea.full;
  const monoStyle = options?.monospace ? components.textarea.monospace : '';
  const heightStyle = options?.height ? options.height : '';
  const errorStyle = options?.error ? components.input.error : '';

  return cn(baseStyle, monoStyle, heightStyle, errorStyle);
}

/**
 * Card style builder
 */
export function cardStyles(variant?: 'default' | 'elevated' | 'theme', padding?: 'zero' | 'sm' | 'md' | 'lg') {
  const variantStyles = {
    default: components.card.base,
    elevated: components.card.elevated,
    theme: components.card.theme,
  };

  const paddingStyles = {
    zero: "",
    sm: components.card.padding.sm,
    md: components.card.padding.md,
    lg: components.card.padding.lg,
  };

  return cn(
    variantStyles[variant || 'default'],
    paddingStyles[padding || 'md']
  );
}

/**
 * Icon style builder  
 */
export function iconStyles(size?: 'sm' | 'md' | 'lg', color?: 'primary' | 'secondary' | 'muted') {
  const sizeStyles = {
    sm: components.icon.sm,
    md: components.icon.md,
    lg: components.icon.lg,
  };

  const colorStyles = {
    primary: components.icon.color.primary,
    secondary: components.icon.color.secondary,
    muted: components.icon.color.muted,
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
export function gridStyles(cols: 1 | 2 | 3 = 1, gap?: 'sm' | 'md' | 'lg') {
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
export function flexStyles(variant: 'center' | 'between' | 'start' | 'col') {
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
export function formFieldStyles(hasError?: boolean) {
  return cn(
    components.formField.container,
    hasError && 'mb-2' // Reduce margin when there's an error message
  );
}

/**
 * Form label styles
 */
export function formLabelStyles(required?: boolean) {
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
export function interactiveStyles(options?: {
  hover?: boolean;
  focus?: boolean;
  disabled?: boolean;
}) {
  return cn(
    options?.hover && components.state.hover.card,
    options?.focus && components.state.focus.ring,
    options?.disabled && components.state.disabled.full
  );
}

/**
 * Focus ring styles
 */
export function focusRingStyles(thick?: boolean) {
  return thick ? components.state.focus.ringThick : components.state.focus.ring;
}

// ============================================================================
// TYPOGRAPHY HELPERS
// ============================================================================

/**
 * Text style builder
 */
export function textStyles(options?: {
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
      primary: 'text-[#0c0e0a]',
      secondary: 'text-[#4f7b38]',
      muted: 'text-gray-500',
      disabled: 'text-gray-400',
      white: 'text-white',
    }[color],
    leading && `leading-${leading}`
  );
}

// ============================================================================
// COMMONLY USED PRESET COMBINATIONS
// ============================================================================

/**
 * Standard input field with label
 */
export const INPUT_FIELD = {
  container: presets.formField,
  label: presets.formLabel,
  input: presets.input,
};

/**
 * Help section components
 */
export const HELP_SECTION = {
  container: presets.helpSection,
  title: components.help.title,
  text: components.help.text,
  code: components.help.code,
};

/**
 * Button variants
 */
export const BUTTONS = {
  primary: presets.buttonPrimary,
  secondary: presets.buttonSecondary,
  icon: presets.buttonIcon,
  danger: presets.buttonDanger,
};

/**
 * Card variants
 */
export const CARDS = {
  default: presets.card,
  theme: presets.cardTheme,
  elevated: cardStyles('elevated'),
  minimal: cardStyles('elevated', 'sm'),
};

// Export commonly used individual styles
export {
  presets,
  cn,
  themeClass,
};