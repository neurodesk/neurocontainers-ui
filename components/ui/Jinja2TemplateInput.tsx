import React, { useState, useRef, forwardRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface Jinja2TemplateInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
}

interface SuggestionItem {
    text: string;
    type: 'variable' | 'function' | 'keyword';
    description?: string;
}

interface HighlightSegment {
    text: string;
    type: 'normal' | 'variable' | 'statement' | 'comment';
    start: number;
    end: number;
}

const JINJA2_KEYWORDS = [
    { text: 'if', type: 'keyword' as const, description: 'Conditional statement' },
    { text: 'else', type: 'keyword' as const, description: 'Alternative condition' },
    { text: 'elif', type: 'keyword' as const, description: 'Additional condition' },
    { text: 'endif', type: 'keyword' as const, description: 'End conditional' },
    { text: 'for', type: 'keyword' as const, description: 'Loop statement' },
    { text: 'endfor', type: 'keyword' as const, description: 'End loop' },
    { text: 'in', type: 'keyword' as const, description: 'Loop iterator' },
    { text: 'with', type: 'keyword' as const, description: 'Context manager' },
    { text: 'endwith', type: 'keyword' as const, description: 'End context' },
    { text: 'set', type: 'keyword' as const, description: 'Variable assignment' },
    { text: 'block', type: 'keyword' as const, description: 'Template block' },
    { text: 'endblock', type: 'keyword' as const, description: 'End block' },
    { text: 'macro', type: 'keyword' as const, description: 'Define macro' },
    { text: 'endmacro', type: 'keyword' as const, description: 'End macro' },
    { text: 'call', type: 'keyword' as const, description: 'Call macro' },
    { text: 'endcall', type: 'keyword' as const, description: 'End macro call' },
    { text: 'filter', type: 'keyword' as const, description: 'Apply filter' },
    { text: 'endfilter', type: 'keyword' as const, description: 'End filter' },
    { text: 'raw', type: 'keyword' as const, description: 'Raw content' },
    { text: 'endraw', type: 'keyword' as const, description: 'End raw content' },
];

const COMMON_VARIABLES = [
    { text: 'context.version', type: 'variable' as const, description: 'Container version' },
    { text: 'context.name', type: 'variable' as const, description: 'Container name' },
    { text: 'context.architecture', type: 'variable' as const, description: 'Target architecture' },
];

const JINJA2_FUNCTIONS = [
    { text: 'length', type: 'function' as const, description: 'Get length of sequence' },
    { text: 'join', type: 'function' as const, description: 'Join sequence elements' },
    { text: 'split', type: 'function' as const, description: 'Split string' },
    { text: 'upper', type: 'function' as const, description: 'Convert to uppercase' },
    { text: 'lower', type: 'function' as const, description: 'Convert to lowercase' },
    { text: 'title', type: 'function' as const, description: 'Title case' },
    { text: 'replace', type: 'function' as const, description: 'Replace substring' },
    { text: 'default', type: 'function' as const, description: 'Default value' },
    { text: 'list', type: 'function' as const, description: 'Convert to list' },
    { text: 'dict', type: 'function' as const, description: 'Convert to dictionary' },
    { text: 'int', type: 'function' as const, description: 'Convert to integer' },
    { text: 'float', type: 'function' as const, description: 'Convert to float' },
    { text: 'string', type: 'function' as const, description: 'Convert to string' },
];

export const Jinja2TemplateInput = forwardRef<HTMLTextAreaElement, Jinja2TemplateInputProps>(
    ({ value, onChange, className = "", placeholder, onKeyDown: externalOnKeyDown, ...props }, ref) => {
        const { isDark } = useTheme();
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
        const [selectedSuggestion, setSelectedSuggestion] = useState(0);
        const [cursorPosition, setCursorPosition] = useState(0);
        const [highlightSegments, setHighlightSegments] = useState<HighlightSegment[]>([]);
        const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 240 });
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const highlightRef = useRef<HTMLDivElement>(null);
        const suggestionsRef = useRef<HTMLDivElement>(null);

        // Combine ref from forwardRef with internal ref
        const combinedRef = (element: HTMLTextAreaElement | null) => {
            textareaRef.current = element;
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        };

        // Parse text and create highlight segments
        const parseHighlights = useCallback((text: string): HighlightSegment[] => {
            const segments: HighlightSegment[] = [];
            let currentIndex = 0;

            // Regex patterns for Jinja2 syntax
            const patterns = [
                { regex: /\{\{[^}]*\}\}/g, type: 'variable' as const },
                { regex: /\{%[^%]*%\}/g, type: 'statement' as const },
                { regex: /\{#[^#]*#\}/g, type: 'comment' as const }
            ];

            // Find all matches
            const allMatches: Array<{ start: number; end: number; type: 'variable' | 'statement' | 'comment' }> = [];

            patterns.forEach(({ regex, type }) => {
                let match: RegExpExecArray | null;
                while ((match = regex.exec(text)) !== null) {
                    allMatches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        type
                    });
                }
            });

            // Sort matches by start position
            allMatches.sort((a, b) => a.start - b.start);

            // Create segments
            allMatches.forEach((match) => {
                // Add normal text before this match
                if (currentIndex < match.start) {
                    segments.push({
                        text: text.substring(currentIndex, match.start),
                        type: 'normal',
                        start: currentIndex,
                        end: match.start
                    });
                }

                // Add the highlighted match
                segments.push({
                    text: text.substring(match.start, match.end),
                    type: match.type,
                    start: match.start,
                    end: match.end
                });

                currentIndex = match.end;
            });

            // Add remaining normal text
            if (currentIndex < text.length) {
                segments.push({
                    text: text.substring(currentIndex),
                    type: 'normal',
                    start: currentIndex,
                    end: text.length
                });
            }

            return segments;
        }, []);

        // Update highlights when value changes
        useEffect(() => {
            setHighlightSegments(parseHighlights(value));
        }, [value, parseHighlights]);

        // Sync scroll between textarea and highlight overlay
        const syncScroll = useCallback(() => {
            if (textareaRef.current && highlightRef.current) {
                highlightRef.current.scrollTop = textareaRef.current.scrollTop;
                highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
            }
        }, []);

        // Get autocomplete suggestions based on cursor position
        const getSuggestions = (text: string, position: number): SuggestionItem[] => {
            const beforeCursor = text.substring(0, position);

            // Check if we're inside Jinja2 template syntax
            const lastOpenTag = Math.max(
                beforeCursor.lastIndexOf('{{'),
                beforeCursor.lastIndexOf('{%')
            );
            const lastCloseTag = Math.max(
                beforeCursor.lastIndexOf('}}'),
                beforeCursor.lastIndexOf('%}')
            );

            // Only show suggestions if we're inside a template tag
            if (lastOpenTag === -1 || lastCloseTag > lastOpenTag) {
                return [];
            }

            // Get the current word being typed (more lenient matching)
            const currentWord = beforeCursor.match(/[\w.]*$/)?.[0] || '';

            // Show all suggestions if no word is typed yet, or filter based on current word
            const allSuggestions = [...JINJA2_KEYWORDS, ...COMMON_VARIABLES, ...JINJA2_FUNCTIONS];

            if (currentWord.length === 0) {
                return allSuggestions;
            }

            return allSuggestions.filter(suggestion =>
                suggestion.text.toLowerCase().includes(currentWord.toLowerCase())
            );
        };


        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            const position = e.target.selectionStart || 0;

            onChange(newValue);
            setCursorPosition(position);

            // Update suggestions with debouncing for better performance
            const newSuggestions = getSuggestions(newValue, position);
            setSuggestions(newSuggestions);
            setShowSuggestions(newSuggestions.length > 0);

            // Reset selection to first item when suggestions change
            setSelectedSuggestion(0);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Handle autocomplete suggestions navigation (VSCode style)
            if (showSuggestions && suggestions.length > 0) {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        setSelectedSuggestion(prev => {
                            const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
                            // Scroll selected item into view
                            setTimeout(() => {
                                const suggestionElement = suggestionsRef.current?.children[newIndex] as HTMLElement;
                                suggestionElement?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return newIndex;
                        });
                        return;
                    case 'ArrowUp':
                        e.preventDefault();
                        setSelectedSuggestion(prev => {
                            const newIndex = prev > 0 ? prev - 1 : prev;
                            // Scroll selected item into view
                            setTimeout(() => {
                                const suggestionElement = suggestionsRef.current?.children[newIndex] as HTMLElement;
                                suggestionElement?.scrollIntoView({ block: 'nearest' });
                            }, 0);
                            return newIndex;
                        });
                        return;
                    case 'PageDown':
                        e.preventDefault();
                        setSelectedSuggestion(prev =>
                            Math.min(prev + 5, suggestions.length - 1)
                        );
                        return;
                    case 'PageUp':
                        e.preventDefault();
                        setSelectedSuggestion(prev =>
                            Math.max(prev - 5, 0)
                        );
                        return;
                    case 'Home':
                        e.preventDefault();
                        setSelectedSuggestion(0);
                        return;
                    case 'End':
                        e.preventDefault();
                        setSelectedSuggestion(suggestions.length - 1);
                        return;
                    case 'Tab':
                    case 'Enter':
                        e.preventDefault();
                        insertSuggestion(suggestions[selectedSuggestion]);
                        return;
                    case 'Escape':
                        e.preventDefault();
                        setShowSuggestions(false);
                        textareaRef.current?.focus();
                        return;
                    // Let other keys pass through to potentially filter suggestions
                    default:
                        // Don't prevent default for typing keys - let external handler deal with it
                        if (externalOnKeyDown) {
                            externalOnKeyDown(e);
                        }
                        break;
                }
                return; // If we handled suggestions, don't call external handler
            }

            // Ctrl+Space to trigger autocomplete manually
            if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
                e.preventDefault();
                const position = e.currentTarget.selectionStart || 0;
                const newSuggestions = getSuggestions(value, position);
                setSuggestions(newSuggestions);
                setShowSuggestions(newSuggestions.length > 0);
                setSelectedSuggestion(0);
                return;
            }

            // If we didn't handle the key and there's an external handler, call it
            if (externalOnKeyDown) {
                externalOnKeyDown(e);
            }
        };

        const insertSuggestion = (suggestion: SuggestionItem) => {
            if (!textareaRef.current) return;

            const textarea = textareaRef.current;
            const beforeCursor = value.substring(0, cursorPosition);
            const afterCursor = value.substring(cursorPosition);

            // Find the start of the current word
            const currentWordMatch = beforeCursor.match(/[\w.]*$/);
            const currentWord = currentWordMatch?.[0] || '';
            const wordStart = cursorPosition - currentWord.length;

            // Replace the current word with the suggestion
            const newValue = value.substring(0, wordStart) + suggestion.text + afterCursor;
            const newCursorPosition = wordStart + suggestion.text.length;

            onChange(newValue);
            setShowSuggestions(false);

            // Set cursor position after the inserted text
            setTimeout(() => {
                textarea.setSelectionRange(newCursorPosition, newCursorPosition);
                textarea.focus();
            }, 0);
        };

        const getSegmentStyle = (type: HighlightSegment['type']) => {
            switch (type) {
                case 'variable':
                    return isDark ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold';
                case 'statement':
                    return isDark ? 'text-purple-400 font-semibold' : 'text-purple-600 font-semibold';
                case 'comment':
                    return isDark ? 'text-gray-500 italic' : 'text-gray-600 italic';
                default:
                    return '';
            }
        };

        const baseClasses = cn(
            "w-full px-3 py-2 text-sm border rounded-md transition-colors font-mono",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "placeholder:text-gray-400 resize-none",
            isDark
                ? "border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                : "border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
        );

        // Add mobile detection
        const [isMobile, setIsMobile] = useState(false);

        useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        // Calculate dropdown position relative to viewport
        const updateDropdownPosition = useCallback(() => {
            if (textareaRef.current && showSuggestions) {
                const rect = textareaRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;

                // Position above if there's more space above and not enough below
                const shouldPositionAbove = spaceBelow < 200 && spaceAbove > spaceBelow;

                setDropdownPosition({
                    top: shouldPositionAbove ? rect.top - Math.min(240, spaceAbove - 10) : rect.bottom + 2,
                    left: Math.max(8, Math.min(rect.left, window.innerWidth - 300)), // Keep within viewport
                    width: rect.width,
                    maxHeight: shouldPositionAbove ? Math.min(240, spaceAbove - 10) : Math.min(240, spaceBelow - 10)
                });
            }
        }, [showSuggestions]);

        // Update position when suggestions show or window scrolls/resizes
        useEffect(() => {
            if (showSuggestions) {
                updateDropdownPosition();

                const handleUpdate = () => updateDropdownPosition();
                window.addEventListener('scroll', handleUpdate, true);
                window.addEventListener('resize', handleUpdate);

                return () => {
                    window.removeEventListener('scroll', handleUpdate, true);
                    window.removeEventListener('resize', handleUpdate);
                };
            }
        }, [showSuggestions, updateDropdownPosition]);

        // Handle clicks outside to close suggestions (especially useful on mobile)
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent | TouchEvent) => {
                if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                    textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
                    setShowSuggestions(false);
                }
            };

            if (showSuggestions) {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('touchstart', handleClickOutside);

                return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                    document.removeEventListener('touchstart', handleClickOutside);
                };
            }
        }, [showSuggestions]);

        return (
            <>
                <div className="relative" style={{ overflow: 'visible', zIndex: 1 }}>
                    {/* Syntax highlighting overlay */}
                    <div
                        ref={highlightRef}
                        className={cn(
                            "absolute inset-0 px-3 py-2 text-sm font-mono pointer-events-none overflow-hidden whitespace-pre-wrap break-words",
                            "border border-transparent rounded-md",
                            isDark ? "text-gray-100" : "text-gray-900"
                        )}
                        style={{
                            lineHeight: '1.5',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                        onScroll={syncScroll}
                    >
                        {highlightSegments.map((segment, index) => (
                            <span
                                key={index}
                                className={getSegmentStyle(segment.type)}
                            >
                                {segment.text}
                            </span>
                        ))}
                    </div>

                    {/* Input textarea */}
                    <textarea
                        ref={combinedRef}
                        value={value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onScroll={syncScroll}
                        className={cn(baseClasses, "relative bg-transparent caret-gray-900 dark:caret-gray-100", className)}
                        style={{ color: 'transparent' }}
                        placeholder={placeholder}
                        spellCheck={false}
                        autoComplete="off"
                        {...props}
                    />

                    {/* Mobile autocomplete trigger button */}
                    {isMobile && (
                        <button
                            type="button"
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded",
                                "text-xs font-medium",
                                isDark
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                            )}
                            onClick={() => {
                                const position = textareaRef.current?.selectionStart || 0;
                                const newSuggestions = getSuggestions(value, position);
                                setSuggestions(newSuggestions);
                                setShowSuggestions(newSuggestions.length > 0);
                                setSelectedSuggestion(0);
                                textareaRef.current?.focus();
                            }}
                            aria-label="Show autocomplete suggestions"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Autocomplete suggestions - Use React Portal */}
                {showSuggestions && suggestions.length > 0 && typeof window !== 'undefined' &&
                    createPortal(
                        <div
                            ref={suggestionsRef}
                            className={cn(
                                "fixed overflow-auto rounded-md shadow-2xl border",
                                isDark
                                    ? "bg-gray-800 border-gray-600"
                                    : "bg-white border-gray-300"
                            )}
                            style={{
                                position: 'fixed',
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                width: isMobile ? `${dropdownPosition.width}px` : 'auto',
                                minWidth: isMobile ? '100%' : '200px',
                                maxWidth: isMobile ? '100%' : '400px',
                                maxHeight: `${dropdownPosition.maxHeight}px`,
                                zIndex: 2147483647,
                                pointerEvents: 'auto'
                            }}
                            role="listbox"
                            aria-label="Autocomplete suggestions"
                        >
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={`${suggestion.type}-${suggestion.text}`}
                                    className={cn(
                                        "px-3 py-3 cursor-pointer text-sm md:py-2",
                                        "touch-manipulation", // Improves touch responsiveness
                                        index === selectedSuggestion && (
                                            isDark ? "bg-gray-700" : "bg-blue-50"
                                        ),
                                        isDark ? "hover:bg-gray-700 active:bg-gray-600" : "hover:bg-gray-100 active:bg-gray-200"
                                    )}
                                    onClick={() => insertSuggestion(suggestion)}
                                    onTouchStart={() => setSelectedSuggestion(index)}
                                    role="option"
                                    aria-selected={index === selectedSuggestion}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "font-mono",
                                            suggestion.type === 'variable' && "text-blue-600 dark:text-blue-400",
                                            suggestion.type === 'function' && "text-green-600 dark:text-green-400",
                                            suggestion.type === 'keyword' && "text-purple-600 dark:text-purple-400"
                                        )}>
                                            {suggestion.text}
                                        </span>
                                        <span className={cn(
                                            "text-xs px-1.5 py-0.5 rounded",
                                            suggestion.type === 'variable' && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                                            suggestion.type === 'function' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                                            suggestion.type === 'keyword' && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                        )}>
                                            {suggestion.type}
                                        </span>
                                    </div>
                                    {suggestion.description && (
                                        <div className={cn(
                                            "text-xs mt-1",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            {suggestion.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>,
                        document.body
                    )
                }
            </>
        );
    }
);

Jinja2TemplateInput.displayName = "Jinja2TemplateInput";