import { CATEGORIES } from "@/components/common";
import { useState } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { presets, iconStyles, textStyles, cn } from "@/lib/styles";

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
    const [isOpen, setIsOpen] = useState(false);

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
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        presets.input,
                        "text-left bg-white shadow-sm",
                        showValidation && error ? 'border-red-500' : ''
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedCategories.length === 0 ? (
                                <span className={textStyles({ color: 'muted' })}>Select categories</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {selectedCategories.map(category => (
                                        <span
                                            key={category}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#f0f8e8]",
                                                textStyles({ size: 'xs', weight: 'medium', color: 'secondary' })
                                            )}
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCategory(category);
                                                }}
                                                className="hover:text-[#6aa329]"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <ChevronDownIcon className={cn(iconStyles('md'), "text-gray-400 transition-transform", isOpen && "rotate-180")} />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, string][]).map(([category, description]) => (
                            <label
                                key={category}
                                className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => toggleCategory(category)}
                                    className="mt-0.5 h-4 w-4 text-[#6aa329] border-gray-300 rounded focus:ring-[#6aa329]"
                                />
                                <div className="flex-1">
                                    <div className={textStyles({ size: 'sm', weight: 'medium' })}>{category}</div>
                                    <div className={textStyles({ size: 'xs', color: 'muted' })}>{description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            {showValidation && error && (
                <p className={cn("mt-1 text-red-600", textStyles({ size: 'sm' }))}>{error}</p>
            )}
        </div>
    );
}