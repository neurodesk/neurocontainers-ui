import { useState, useRef, useEffect, useCallback } from "react";
import { Directive } from "@/components/common";
import {
    ChevronDownIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { getAllDirectives } from "@/components/directives";
import type { DirectiveMetadata } from "@/components/directives/registry";
import { BUTTONS, iconStyles, textStyles, inputStyles, cn } from "@/lib/styles";

interface AddDirectiveButtonProps {
    onAddDirective: (directive: Directive, index?: number) => void;
    index?: number;
    variant?: 'default' | 'inline' | 'empty';
    emptyText?: { title: string; subtitle: string };
}

interface DropdownPosition {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

// Get directive types dynamically from registry
const getDirectiveTypes = () => {
    const directives = getAllDirectives();
    const directiveTypes: Record<string, DirectiveMetadata> = {};

    directives.forEach(directive => {
        directiveTypes[directive.key] = directive;
    });

    return directiveTypes;
};

// Shared directive item component to reduce duplication
interface DirectiveItemProps {
    directiveKey: string;
    config: DirectiveMetadata;
    index: number;
    isFocused: boolean;
    isMobile: boolean;
    onSelect: (key: string) => void;
    onMouseEnter: (index: number) => void;
    itemRef: (el: HTMLButtonElement | null) => void;
}

const DirectiveItem = ({
    directiveKey,
    config,
    index,
    isFocused,
    isMobile,
    onSelect,
    onMouseEnter,
    itemRef,
}: DirectiveItemProps) => {
    const IconComponent = config.icon;

    return (
        <button
            ref={itemRef}
            type="button"
            onClick={() => onSelect(directiveKey)}
            onMouseEnter={() => onMouseEnter(index)}
            className={cn(
                "w-full flex items-center text-left transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#6aa329] active:scale-95",
                config.color,
                isMobile ? "gap-4 p-4 rounded-xl" : "gap-3 p-3 rounded-lg",
                "border-2",
                isFocused ? "ring-2 ring-[#6aa329] ring-offset-1 shadow-lg scale-[1.02] bg-opacity-80" : ""
            )}
            role="menuitem"
        >
            <div
                className={cn(
                    "flex-shrink-0 flex items-center justify-center transition-all duration-200",
                    config.iconColor,
                    isMobile ? "w-12 h-12 rounded-xl" : "w-8 h-8 rounded-lg",
                    isFocused ? "bg-white shadow-md" : "bg-white/70"
                )}
            >
                <IconComponent
                    className={cn(
                        iconStyles(isMobile ? 'lg' : 'md'),
                        "transition-transform duration-200",
                        isFocused ? "scale-110" : ""
                    )}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        textStyles({
                            size: isMobile ? 'base' : 'sm',
                            weight: 'semibold',
                            color: 'primary'
                        }),
                        isMobile ? "mb-1" : ""
                    )}
                >
                    {config.label}
                </div>
                <div
                    className={cn(
                        textStyles({
                            size: isMobile ? 'sm' : 'xs',
                            color: 'secondary'
                        }),
                        isMobile ? "leading-relaxed" : "truncate"
                    )}
                >
                    {config.description}
                </div>
            </div>
            <PlusIcon
                className={cn(
                    iconStyles('md'),
                    "flex-shrink-0 transition-all duration-200",
                    isFocused ? "text-[#6aa329] scale-110" : "text-gray-400"
                )}
            />
        </button>
    );
};

export default function AddDirectiveButton({
    onAddDirective,
    index,
    variant = 'default',
    emptyText = { title: "No directives added yet", subtitle: "Click here to start building your container" },
}: AddDirectiveButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>(
        {}
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Get directive types from registry
    const directiveTypes = getDirectiveTypes();

    // Filter directives based on search term
    const filteredDirectives = Object.entries(directiveTypes).filter(
        ([key, config]) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                config.label.toLowerCase().includes(searchLower) ||
                config.description.toLowerCase().includes(searchLower) ||
                config.keywords.some((keyword: string) =>
                    keyword.toLowerCase().includes(searchLower)
                ) ||
                key.toLowerCase().includes(searchLower)
            );
        }
    );

    // Stable position calculation that only runs when needed
    const calculateDropdownPosition = useCallback((): DropdownPosition => {
        if (!buttonRef.current) return {};

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const dropdownWidth = 384; // w-96
        const dropdownHeight = 512; // max-h-[32rem]
        const margin = 8;

        const spaceRight = viewportWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        const position: DropdownPosition = {};

        // Horizontal positioning
        if (spaceRight >= dropdownWidth + margin) {
            position.left = buttonRect.left;
        } else if (spaceLeft >= dropdownWidth + margin) {
            position.right = viewportWidth - buttonRect.right;
        } else {
            // Center if neither side has enough space
            position.left = Math.max(
                margin,
                Math.min(buttonRect.left, viewportWidth - dropdownWidth - margin)
            );
        }

        // Vertical positioning
        if (spaceBelow >= dropdownHeight + margin) {
            position.top = buttonRect.bottom + margin;
        } else if (spaceAbove >= dropdownHeight + margin) {
            position.bottom = viewportHeight - buttonRect.top + margin;
        } else {
            // Use the side with more space
            if (spaceBelow > spaceAbove) {
                position.top = buttonRect.bottom + margin;
            } else {
                position.bottom = viewportHeight - buttonRect.top + margin;
            }
        }

        return position;
    }, []);

    // Update position function
    const updatePosition = useCallback(() => {
        if (isOpen) {
            const position = calculateDropdownPosition();
            setDropdownPosition(position);
        }
    }, [isOpen, calculateDropdownPosition]);

    // Update position when opening dropdown
    useEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, updatePosition]);

    // Handle scroll and resize events to keep dropdown attached
    useEffect(() => {
        if (!isOpen) return;

        // Throttle function to limit how often we recalculate position
        let timeoutId: NodeJS.Timeout;
        const throttledUpdate = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updatePosition, 10);
        };

        // Add event listeners for scroll and resize
        const handleScroll = throttledUpdate;
        const handleResize = throttledUpdate;

        // Listen to scroll events on window and all scrollable parents
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });

        // Also listen to scroll events on all parent elements that might be scrollable
        let element = buttonRef.current?.parentElement;
        const scrollableParents: Element[] = [];

        while (element && element !== document.body) {
            const computedStyle = window.getComputedStyle(element);
            const overflowY = computedStyle.overflowY;
            const overflowX = computedStyle.overflowX;

            if (
                overflowY === "scroll" ||
                overflowY === "auto" ||
                overflowX === "scroll" ||
                overflowX === "auto"
            ) {
                scrollableParents.push(element);
                element.addEventListener("scroll", handleScroll, { passive: true });
            }
            element = element.parentElement;
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);

            // Clean up parent scroll listeners
            scrollableParents.forEach((parent) => {
                parent.removeEventListener("scroll", handleScroll);
            });
        };
    }, [isOpen, updatePosition]);

    const scrollToFocusedItem = useCallback((index: number) => {
        const item = itemRefs.current[index];
        const list = listRef.current;

        if (item && list) {
            const itemRect = item.getBoundingClientRect();
            const listRect = list.getBoundingClientRect();

            if (itemRect.bottom > listRect.bottom) {
                list.scrollTop += itemRect.bottom - listRect.bottom + 8;
            } else if (itemRect.top < listRect.top) {
                list.scrollTop -= listRect.top - itemRect.top + 8;
            }
        }
    }, []);

    const handleAddDirective = useCallback(
        (directiveType: string) => {
            const directiveConfig = directiveTypes[directiveType];
            onAddDirective(directiveConfig.defaultValue, index);
            setIsOpen(false);
            setSearchTerm("");
            setFocusedIndex(-1);
        },
        [onAddDirective, directiveTypes, index]
    );

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
    }, []);

    // Click outside handler
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                closeModal();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, closeModal]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto-select first item when search changes
    useEffect(() => {
        setFocusedIndex(filteredDirectives.length > 0 ? 0 : -1);
    }, [searchTerm, filteredDirectives.length]);

    // Scroll to focused item
    useEffect(() => {
        if (focusedIndex >= 0) {
            scrollToFocusedItem(focusedIndex);
        }
    }, [focusedIndex, scrollToFocusedItem]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (!isOpen) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (event.key) {
            case "Escape":
                closeModal();
                break;
            case "ArrowDown":
                event.preventDefault();
                if (filteredDirectives.length > 0) {
                    setFocusedIndex((prev) =>
                        prev < filteredDirectives.length - 1 ? prev + 1 : 0
                    );
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (filteredDirectives.length > 0) {
                    setFocusedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredDirectives.length - 1
                    );
                }
                break;
            case "Enter":
                event.preventDefault();
                if (focusedIndex >= 0 && filteredDirectives[focusedIndex]) {
                    handleAddDirective(filteredDirectives[focusedIndex][0]);
                }
                break;
        }
    };

    const renderSearchInput = (isMobile: boolean) => (
        <div className="relative">
            <MagnifyingGlassIcon
                className={cn(
                    iconStyles(isMobile ? 'md' : 'sm', 'muted'),
                    "absolute left-3 top-1/2 transform -translate-y-1/2"
                )}
            />
            <input
                ref={searchInputRef}
                type="text"
                placeholder="Search directives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                    inputStyles(),
                    "bg-white text-gray-800 placeholder-gray-400",
                    "w-full pl-10 pr-4",
                    isMobile ? "py-3 text-base rounded-xl" : "py-2 text-sm rounded-lg",
                    "border-[#e6f1d6] focus:border-[#6aa329]"
                )}
            />
        </div>
    );

    const renderDirectiveList = (isMobile: boolean) => (
        <div className={isMobile ? "space-y-3" : "grid grid-cols-1 gap-1"}>
            {filteredDirectives.map(([key, config], index) => (
                <DirectiveItem
                    key={key}
                    directiveKey={key}
                    config={config}
                    index={index}
                    isFocused={index === focusedIndex}
                    isMobile={isMobile}
                    onSelect={handleAddDirective}
                    onMouseEnter={setFocusedIndex}
                    itemRef={(el) => {
                        itemRefs.current[index] = el;
                    }}
                />
            ))}
        </div>
    );

    const renderEmptyState = (isMobile: boolean) => (
        <div
            className={cn(
                "text-center",
                textStyles({ color: 'muted' }),
                isMobile ? "py-12" : "p-4"
            )}
        >
            <MagnifyingGlassIcon
                className={cn(
                    "mx-auto text-gray-300",
                    isMobile ? "w-12 h-12 mb-4" : "w-8 h-8 mb-2"
                )}
            />
            <p className={cn(textStyles({
                size: isMobile ? 'base' : 'sm',
                weight: 'medium'
            }))}>
                No directives found
            </p>
            <p
                className={cn(
                    textStyles({
                        size: isMobile ? 'sm' : 'xs',
                        color: 'disabled'
                    }),
                    isMobile ? "mt-2" : "mt-1"
                )}
            >
                Try a different search term
            </p>
        </div>
    );

    const renderTriggerButton = () => {
        if (variant === 'empty') {
            return (
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "group w-full text-center py-8",
                        "border-2 border-dashed border-gray-200 hover:border-[#6aa329]",
                        "rounded-lg hover:bg-[#f8fdf2] transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-1",
                        textStyles({ color: 'muted' })
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-label="Add your first directive"
                >
                    <p className={cn("mb-2 group-hover:text-[#6aa329]")}>{emptyText.title}</p>
                    <p className={cn(textStyles({ size: 'sm' }), "group-hover:text-[#6aa329]")}>{emptyText.subtitle}</p>
                </button>
            );
        }

        if (variant === 'inline') {
            return (
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "group flex items-center justify-center gap-2 w-full py-1.5",
                        "text-gray-400 hover:text-[#6aa329] hover:bg-[#f8fdf2]",
                        "border border-dashed border-gray-300 hover:border-[#6aa329]",
                        "rounded-md transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-1",
                        "opacity-50 hover:opacity-100"
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-label="Add directive here"
                >
                    <PlusIcon className={cn(iconStyles('sm'), "group-hover:scale-110 transition-transform duration-200")} />
                    <span className={cn(textStyles({ size: 'xs', weight: 'medium' }), "hidden sm:inline text-gray-500 group-hover:text-[#6aa329]")}>Add directive</span>
                </button>
            );
        }

        return (
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={cn(
                    BUTTONS.primary,
                    "inline-flex items-center gap-2 min-w-0 flex-shrink-0",
                    "px-3 py-2 sm:px-4 sm:py-2.5"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Add new directive"
            >
                <PlusIcon className={cn(iconStyles('sm'), "flex-shrink-0")} />
                <span className="hidden sm:inline">Add Directive</span>
                <span className="sm:hidden">Add</span>
                <ChevronDownIcon
                    className={cn(
                        iconStyles('sm'),
                        "flex-shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                    )}
                />
            </button>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Trigger Button */}
            {renderTriggerButton()}

            {/* Modal/Dropdown */}
            {isOpen && (
                <>
                    {/* Mobile Full Screen Modal */}
                    <div className="fixed inset-0 bg-black/80 z-50 sm:hidden">
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
                                {/* Mobile Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f8fdf2]">
                                    <h2 className={textStyles({
                                        size: 'lg',
                                        weight: 'semibold',
                                        color: 'primary'
                                    })}>
                                        Add Directive
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className={cn(
                                            BUTTONS.icon,
                                            "p-2 rounded-lg hover:bg-[#e6f1d6]"
                                        )}
                                    >
                                        <XMarkIcon className={cn(iconStyles('md', 'secondary'))} />
                                    </button>
                                </div>

                                {/* Mobile Search */}
                                <div className="p-4 border-b border-gray-100 bg-[#f8fdf2]">
                                    {renderSearchInput(true)}
                                </div>

                                {/* Mobile Directive List */}
                                <div
                                    ref={listRef}
                                    className="p-4 overflow-y-auto"
                                    style={{ maxHeight: "calc(90vh - 200px)" }}
                                >
                                    {filteredDirectives.length > 0
                                        ? renderDirectiveList(true)
                                        : renderEmptyState(true)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Dropdown */}
                    <div
                        className="
              hidden sm:block fixed z-50
              w-96 max-w-[calc(100vw-2rem)] max-h-[32rem] overflow-hidden
              bg-white rounded-xl shadow-xl border border-gray-200
              animate-in fade-in-0 zoom-in-95 duration-200
            "
                        style={dropdownPosition}
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {/* Desktop Header with Search */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-[#f8fdf2]">
                            <h3 className={cn(
                                textStyles({
                                    size: 'sm',
                                    weight: 'semibold',
                                    color: 'primary'
                                }),
                                "mb-2"
                            )}>
                                Choose a directive type
                            </h3>
                            {renderSearchInput(false)}
                        </div>

                        {/* Desktop Directive Grid */}
                        <div ref={listRef} className="p-2 max-h-80 overflow-y-auto">
                            {filteredDirectives.length > 0
                                ? renderDirectiveList(false)
                                : renderEmptyState(false)}
                        </div>

                        {/* Desktop Footer */}
                        {filteredDirectives.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 bg-[#f8fdf2]">
                                <div className={cn(
                                    "flex items-center justify-between",
                                    textStyles({ size: 'xs', color: 'secondary' })
                                )}>
                                    <span>Use ↑↓ to navigate</span>
                                    <span>Enter to select • Esc to close</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}