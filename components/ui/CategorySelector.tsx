import { CATEGORIES } from "@/components/common";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getThemePresets, iconStyles, textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

export function CategorySelector({
    selectedCategories,
    onChange,
    error,
    showValidation,
}: {
    selectedCategories: (keyof typeof CATEGORIES)[];
    onChange: (categories: (keyof typeof CATEGORIES)[]) => void;
    error: string | null;
    showValidation: boolean;
}) {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const toggleCategory = (category: keyof typeof CATEGORIES) => {
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter(c => c !== category));
        } else {
            onChange([...selectedCategories, category]);
        }
    };

    const removeCategory = (category: keyof typeof CATEGORIES) => {
        onChange(selectedCategories.filter(c => c !== category));
    };

    return (
        <div>
            <div className="relative" ref={dropdownRef}>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                    className={cn(
                        getThemePresets(isDark).input,
                        "text-left shadow-sm cursor-pointer",
                        isDark ? "bg-[#161a0e]" : "bg-white",
                        showValidation && error ? 'border-red-500' : '',
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        isDark ? "focus:ring-[#7bb33a]" : "focus:ring-[#6aa329]"
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedCategories.length === 0 ? (
                                <span className={textStyles(isDark, { color: 'muted' })}>Select categories</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {selectedCategories.map(category => (
                                        <span
                                            key={category}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded-full",
                                                textStyles(isDark, { size: 'xs', weight: 'medium', color: 'secondary' }),
                                                isDark ? "bg-[#2d4222]" : "bg-[#f0f8e8]"
                                            )}
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCategory(category);
                                                }}
                                                className={cn(
                                                    "inline-flex items-center justify-center rounded-full p-0.5",
                                                    isDark ? "hover:text-[#7bb33a] hover:bg-[#1f2e18]" : "hover:text-[#6aa329] hover:bg-[#e6f1d6]"
                                                )}
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <ChevronDownIcon className={cn(
                            iconStyles(isDark, 'md'),
                            "transition-transform",
                            isDark ? "text-[#9ca3af]" : "text-gray-400",
                            isOpen && "rotate-180"
                        )} />
                    </div>
                </div>

                {isOpen && (
                    <div className={cn(
                        "absolute z-10 mt-1 w-full border rounded-md shadow-lg max-h-60 overflow-auto",
                        isDark
                            ? "bg-[#161a0e] border-[#374151]"
                            : "bg-white border-gray-300"
                    )}>
                        {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, string][]).map(([category, description]) => (
                            <label
                                key={category}
                                className={cn(
                                    "flex items-start gap-3 px-3 py-2 cursor-pointer",
                                    isDark ? "hover:bg-[#2d4222]" : "hover:bg-gray-50"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => toggleCategory(category)}
                                    className={cn(
                                        "mt-0.5 h-4 w-4 rounded",
                                        isDark
                                            ? "text-[#7bb33a] border-[#374151] focus:ring-[#7bb33a] bg-[#161a0e]"
                                            : "text-[#6aa329] border-gray-300 focus:ring-[#6aa329]"
                                    )}
                                />
                                <div className="flex-1">
                                    <div className={textStyles(isDark, { size: 'sm', weight: 'medium' })}>{category}</div>
                                    <div className={textStyles(isDark, { size: 'xs', color: 'muted' })}>{description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            {showValidation && error && (
                <p className={cn(
                    "mt-1",
                    textStyles(isDark, { size: 'sm' }),
                    isDark ? "text-red-400" : "text-red-600"
                )}>
                    {error}
                </p>
            )}
        </div>
    );
}