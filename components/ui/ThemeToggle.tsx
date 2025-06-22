"use client";

import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from "@heroicons/react/24/outline";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/theme";
import { useState } from "react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown' | 'icon';
}

export function ThemeToggle({ 
  className = "", 
  showLabel = false,
  variant = 'button'
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon },
  ] as const;
  
  // For display purposes, show sun/moon based on resolved theme
  const displayTheme = theme === 'system' ? resolvedTheme : theme;
  const displayThemeData = themes.find(t => t.value === displayTheme) || themes[0];
  const DisplayIcon = displayThemeData.icon;

  // Keep system theme handling but simplify user interaction

  if (variant === 'icon') {
    return (
      <button
        onClick={() => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        }}
        className={cn(
          "p-2 rounded-md transition-colors",
          isDark 
            ? "text-[#c4e382] hover:text-[#7bb33a] hover:bg-[#1f2e18]" 
            : "text-gray-600 hover:text-[#4f7b38] hover:bg-gray-100",
          className
        )}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <DisplayIcon className="h-5 w-5" />
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
            isDark
              ? "text-[#c4e382] hover:text-[#7bb33a] hover:bg-[#1f2e18] border border-[#2d4222]"
              : "text-gray-700 hover:text-[#4f7b38] hover:bg-gray-100 border border-gray-200",
            className
          )}
        >
          <DisplayIcon className="h-4 w-4" />
          {showLabel && <span>{displayThemeData.label}</span>}
          <svg
            className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <div className={cn(
              "absolute right-0 mt-2 py-1 rounded-md shadow-lg border z-20 min-w-[120px]",
              isDark
                ? "bg-[#161a0e] border-[#2d4222]"
                : "bg-white border-gray-200"
            )}>
              {themes.filter(t => t.value !== 'system').map((themeOption) => {
                const Icon = themeOption.icon;
                const isSelected = displayTheme === themeOption.value;
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left",
                      isSelected
                        ? isDark
                          ? "bg-[#1f2e18] text-[#7bb33a]"
                          : "bg-gray-100 text-[#4f7b38]"
                        : isDark
                          ? "text-[#c4e382] hover:bg-[#1f2e18] hover:text-[#7bb33a]"
                          : "text-gray-700 hover:bg-gray-100 hover:text-[#4f7b38]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{themeOption.label}</span>
                    {isSelected && (
                      <svg className="h-4 w-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
        isDark
          ? "bg-[#1f2e18] text-[#c4e382] hover:bg-[#2d4222] hover:text-[#7bb33a] border border-[#2d4222]"
          : "bg-white text-gray-700 hover:bg-gray-100 hover:text-[#4f7b38] border border-gray-200",
        className
      )}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <DisplayIcon className="h-4 w-4" />
      {showLabel && <span>{displayThemeData.label}</span>}
    </button>
  );
}

// Convenience components for different use cases
export function ThemeToggleIcon(props: Omit<ThemeToggleProps, 'variant'>) {
  return <ThemeToggle {...props} variant="icon" />;
}

export function ThemeToggleDropdown(props: Omit<ThemeToggleProps, 'variant'>) {
  return <ThemeToggle {...props} variant="dropdown" />;
}

export function ThemeToggleButton(props: Omit<ThemeToggleProps, 'variant'>) {
  return <ThemeToggle {...props} variant="button" />;
}