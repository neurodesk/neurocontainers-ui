import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import { Input } from "./FormField";

interface TagEditorProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
    emptyMessage?: string;
    allowDuplicates?: boolean;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
}

export default function TagEditor({
    tags,
    onChange,
    placeholder = "Add tag...",
    className = "",
    emptyMessage,
    allowDuplicates = false,
    suggestions = [],
    onSuggestionClick,
}: TagEditorProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tag?: string) => {
        const tagToAdd = (tag || inputValue).trim();
        if (tagToAdd && (allowDuplicates || !tags.includes(tagToAdd))) {
            onChange([...tags, tagToAdd]);
            setInputValue("");
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            e.preventDefault();
            removeTag(tags.length - 1);
        }
    };

    const handleTagKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        index: number
    ) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            removeTag(index);
        }
    };

    const filteredSuggestions = suggestions.filter(
        suggestion => 
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            (allowDuplicates || !tags.includes(suggestion))
    );

    return (
        <div className={className}>
            {tags.length > 0 ? (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <button
                                key={index}
                                className="flex items-center bg-[#f0f7e7] px-3 py-2 rounded-md border border-[#e6f1d6] group hover:bg-[#e8f4d9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-1"
                                onClick={() => removeTag(index)}
                                onKeyDown={(e) => handleTagKeyDown(e, index)}
                                title={`Remove ${tag} (Enter or Space)`}
                            >
                                <span className="font-mono text-[#0c0e0a] mr-2 text-sm break-all">
                                    {tag}
                                </span>
                                <XMarkIcon className="h-4 w-4 text-[#4f7b38] group-hover:text-[#3a5c29] opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : emptyMessage ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                        {emptyMessage}
                    </p>
                </div>
            ) : null}

            <div>
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    monospace
                />

                {filteredSuggestions.length > 0 && inputValue && (
                    <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                            {filteredSuggestions.slice(0, 6).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#f0f7e7] border border-gray-200 rounded transition-colors"
                                    onClick={() => {
                                        addTag(suggestion);
                                        onSuggestionClick?.(suggestion);
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}