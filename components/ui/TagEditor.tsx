import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import { Input } from "./FormField";
import { textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
    const { isDark } = useTheme();
    const [inputValue, setInputValue] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

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

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(tags[index]);
        setTimeout(() => editInputRef.current?.focus(), 0);
    };

    const saveEdit = () => {
        if (editingIndex !== null) {
            const newValue = editValue.trim();
            if (newValue && (allowDuplicates || !tags.includes(newValue) || tags[editingIndex] === newValue)) {
                const newTags = [...tags];
                newTags[editingIndex] = newValue;
                onChange(newTags);
            }
            setEditingIndex(null);
            setEditValue("");
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue("");
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

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
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
                            <div key={index} className="group relative">
                                {editingIndex === index ? (
                                    <div className={cn(
                                        "flex items-center px-3 py-2 rounded-md border",
                                        isDark
                                            ? "bg-[#1f2e18] border-[#2d4222]"
                                            : "bg-[#f0f7e7] border-[#e6f1d6]"
                                    )}>
                                        <Input
                                            ref={editInputRef}
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={handleEditKeyDown}
                                            className="min-w-0 flex-1 text-sm font-mono border-0 bg-transparent p-0 focus:ring-0"
                                            monospace
                                        />
                                        <div className="flex items-center ml-2 gap-1">
                                            <button
                                                type="button"
                                                onClick={saveEdit}
                                                className={cn(
                                                    "p-1 rounded transition-colors",
                                                    isDark
                                                        ? "hover:bg-[#2a3d20] text-[#91c84a]"
                                                        : "hover:bg-[#e8f4d9] text-[#4f7b38]"
                                                )}
                                                title="Save changes (Enter)"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className={cn(
                                                    "p-1 rounded transition-colors",
                                                    isDark
                                                        ? "hover:bg-[#2a3d20] text-[#91c84a]"
                                                        : "hover:bg-[#e8f4d9] text-[#4f7b38]"
                                                )}
                                                title="Cancel editing (Escape)"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "flex items-center px-3 py-2 rounded-md border transition-colors group",
                                        isDark
                                            ? "bg-[#1f2e18] border-[#2d4222] hover:bg-[#2a3d20]"
                                            : "bg-[#f0f7e7] border-[#e6f1d6] hover:bg-[#e8f4d9]"
                                    )}>
                                        <span className={cn(textStyles(isDark, { size: 'sm', color: 'primary' }), "font-mono mr-2 break-all")}>
                                            {tag}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(index)}
                                                className={cn(
                                                    "p-1 rounded transition-colors",
                                                    isDark
                                                        ? "bg-[#374151] text-[#91c84a]"
                                                        : "bg-[#d1e7c1] text-[#4f7b38]"
                                                )}
                                                title="Edit item"
                                            >
                                                <PencilIcon className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(index)}
                                                onKeyDown={(e) => handleTagKeyDown(e, index)}
                                                className={cn(
                                                    "p-1 rounded transition-colors",
                                                    isDark
                                                        ? "bg-[#374151] text-[#91c84a]"
                                                        : "bg-[#d1e7c1] text-[#4f7b38]"
                                                )}
                                                title="Remove item"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : emptyMessage ? (
                <div className={cn(
                    "mb-4 p-4 rounded-md border",
                    isDark ? "bg-[#2d4222] border-[#374151]" : "bg-gray-50 border-gray-200"
                )}>
                    <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center")}>
                        {emptyMessage}
                    </p>
                </div>
            ) : null}

            <div>
                <div className="flex">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        monospace
                        className="flex-grow rounded-r-none"
                    />
                    <button
                        type="button"
                        onClick={() => addTag()}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "px-4 py-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center rounded-r-md rounded-l-none",
                            inputValue.trim()
                                ? (isDark
                                    ? "bg-[#1f2e18] border-[#2d4222] hover:bg-[#2a3d20] focus:ring-[#7bb33a] text-[#91c84a]"
                                    : "bg-[#f0f7e7] border-[#e6f1d6] hover:bg-[#e8f4d9] focus:ring-[#6aa329] text-[#4f7b38]")
                                : (isDark
                                    ? "bg-[#2d4222] border-[#374151] cursor-not-allowed text-[#6b7280]"
                                    : "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400")
                        )}
                        title="Add item"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {filteredSuggestions.length > 0 && inputValue && (
                    <div className="mt-2 space-y-1">
                        <p className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "mb-2")}>Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                            {filteredSuggestions.slice(0, 6).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className={cn(
                                        textStyles(isDark, { size: 'xs' }),
                                        "px-2 py-1 border rounded transition-colors",
                                        isDark
                                            ? "bg-[#2d4222] hover:bg-[#1f2e18] border-[#374151]"
                                            : "bg-gray-100 hover:bg-[#f0f7e7] border-gray-200"
                                    )}
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