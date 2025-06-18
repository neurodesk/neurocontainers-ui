import { CATEGORIES } from "@/components/common";
import { useState } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
                    className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-[#6aa329] ${
                        showValidation && error ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {selectedCategories.length === 0 ? (
                                <span className="text-gray-500">Select categories</span>
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {selectedCategories.map(category => (
                                        <span
                                            key={category}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#4f7b38] bg-[#f0f8e8] rounded-full"
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
                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                                    <div className="font-medium text-sm">{category}</div>
                                    <div className="text-xs text-gray-500">{description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            {showValidation && error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}