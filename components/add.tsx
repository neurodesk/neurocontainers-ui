import { useState, useRef, useEffect } from "react";
import { Directive } from "@/components/common";
import {
    ChevronDownIcon,
    PlusIcon,
    FolderIcon,
    CogIcon,
    FolderOpenIcon,
    PlayIcon,
    VariableIcon,
    DocumentDuplicateIcon,
    UserIcon,
    DocumentIcon,
    BeakerIcon,
    RocketLaunchIcon,
    CommandLineIcon,
    ClipboardDocumentListIcon,
    DocumentArrowDownIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

/**
 * Props for the AddDirectiveButton component
 */
interface AddDirectiveButtonProps {
    /** Callback function called when a new directive is added */
    onAddDirective: (directive: Directive) => void;
}

/**
 * Configuration for available directive types with their display names, icons, and default values
 */
const DIRECTIVE_TYPES = {
    group: {
        label: "Group",
        description: "Group related directives together",
        icon: FolderIcon,
        color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
        iconColor: "text-blue-600",
        defaultValue: { group: [] as Directive[] },
        keywords: ["group", "folder", "organize", "collection"],
    },
    environment: {
        label: "Environment",
        description: "Set environment variables",
        icon: CogIcon,
        color: "bg-green-50 border-green-200 hover:bg-green-100",
        iconColor: "text-green-600",
        defaultValue: { environment: {} },
        keywords: ["environment", "env", "variables", "config", "settings"],
    },
    install: {
        label: "Install",
        description: "Install packages or dependencies",
        icon: CommandLineIcon,
        color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        iconColor: "text-purple-600",
        defaultValue: { install: "" },
        keywords: ["install", "package", "dependency", "apt", "yum", "npm"],
    },
    workdir: {
        label: "Working Directory",
        description: "Set the working directory",
        icon: FolderOpenIcon,
        color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
        iconColor: "text-yellow-600",
        defaultValue: { workdir: "" },
        keywords: ["workdir", "directory", "folder", "path", "cd"],
    },
    run: {
        label: "Run Commands",
        description: "Execute shell commands",
        icon: PlayIcon,
        color: "bg-red-50 border-red-200 hover:bg-red-100",
        iconColor: "text-red-600",
        defaultValue: { run: [] as string[] },
        keywords: ["run", "command", "execute", "shell", "bash", "script"],
    },
    variables: {
        label: "Variables",
        description: "Define template variables",
        icon: VariableIcon,
        color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
        iconColor: "text-indigo-600",
        defaultValue: { variables: {} },
        keywords: ["variables", "var", "template", "placeholder", "substitution"],
    },
    template: {
        label: "Template",
        description: "Define a reusable template",
        icon: DocumentDuplicateIcon,
        color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
        iconColor: "text-pink-600",
        defaultValue: { template: { name: "new-template" } },
        keywords: ["template", "reusable", "pattern", "blueprint"],
    },
    deploy: {
        label: "Deploy",
        description: "Configure deployment settings",
        icon: RocketLaunchIcon,
        color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
        iconColor: "text-orange-600",
        defaultValue: { deploy: { path: [] as string[], bins: [] as string[] } },
        keywords: ["deploy", "deployment", "publish", "release", "launch"],
    },
    user: {
        label: "User",
        description: "Set the user context",
        icon: UserIcon,
        color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
        iconColor: "text-teal-600",
        defaultValue: { user: "" },
        keywords: ["user", "account", "permission", "context", "identity"],
    },
    copy: {
        label: "Copy",
        description: "Copy files or directories",
        icon: DocumentIcon,
        color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
        iconColor: "text-cyan-600",
        defaultValue: { copy: [] as string[] },
        keywords: ["copy", "file", "transfer", "duplicate", "move"],
    },
    file: {
        label: "File",
        description: "Create or manage files",
        icon: ClipboardDocumentListIcon,
        color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
        iconColor: "text-emerald-600",
        defaultValue: { file: { name: "", filename: "" } },
        keywords: ["file", "create", "manage", "document", "content"],
    },
    test: {
        label: "Test",
        description: "Define test scripts",
        icon: BeakerIcon,
        color: "bg-violet-50 border-violet-200 hover:bg-violet-100",
        iconColor: "text-violet-600",
        defaultValue: { test: { name: "", script: "" } },
        keywords: ["test", "testing", "validation", "check", "verify"],
    },
    include: {
        label: "Include",
        description: "Include external configuration files",
        icon: DocumentArrowDownIcon,
        color: "bg-slate-50 border-slate-200 hover:bg-slate-100",
        iconColor: "text-slate-600",
        defaultValue: { include: "macros/openrecon/neurodocker.yaml" },
        keywords: ["include", "import", "external", "reference", "link"],
    },
} as const;

/**
 * AddDirectiveButton - A graphical component for adding new directives to a container builder
 *
 * This component provides a custom dropdown with visual directive cards that can be
 * added to a container configuration. Each directive type has an icon, color coding,
 * and predefined default values for quick setup. Includes keyboard search functionality.
 *
 * @param props - The component props
 * @returns A styled dropdown button with graphical directive selection and search
 */
export default function AddDirectiveButton({
    onAddDirective,
}: AddDirectiveButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Filter directives based on search term
    const filteredDirectives = Object.entries(DIRECTIVE_TYPES).filter(
        ([key, config]) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                config.label.toLowerCase().includes(searchLower) ||
                config.description.toLowerCase().includes(searchLower) ||
                config.keywords.some((keyword) =>
                    keyword.toLowerCase().includes(searchLower)
                ) ||
                key.toLowerCase().includes(searchLower)
            );
        }
    );

    /**
     * Scrolls the focused item into view
     */
    const scrollToFocusedItem = (index: number) => {
        if (itemRefs.current[index] && listRef.current) {
            const item = itemRefs.current[index];
            const list = listRef.current;

            if (item) {
                const itemRect = item.getBoundingClientRect();
                const listRect = list.getBoundingClientRect();

                if (itemRect.bottom > listRect.bottom) {
                    list.scrollTop += itemRect.bottom - listRect.bottom + 8;
                } else if (itemRect.top < listRect.top) {
                    list.scrollTop -= listRect.top - itemRect.top + 8;
                }
            }
        }
    };

    /**
     * Handles adding a new directive of the specified type
     */
    const handleAddDirective = (directiveType: keyof typeof DIRECTIVE_TYPES) => {
        const directiveConfig = DIRECTIVE_TYPES[directiveType];
        onAddDirective(directiveConfig.defaultValue);
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
    };

    /**
     * Handles clicking outside the dropdown to close it
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm("");
                setFocusedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * Focus search input when dropdown opens
     */
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            // Small delay to ensure dropdown is rendered
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    /**
     * Auto-select first item when search term changes and there are results
     */
    useEffect(() => {
        if (filteredDirectives.length > 0) {
            setFocusedIndex(0);
        } else {
            setFocusedIndex(-1);
        }
    }, [searchTerm, filteredDirectives.length]);

    /**
     * Scroll to focused item when focus changes
     */
    useEffect(() => {
        if (focusedIndex >= 0) {
            scrollToFocusedItem(focusedIndex);
        }
    }, [focusedIndex]);

    /**
     * Handles keyboard navigation and search
     */
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
                setIsOpen(false);
                setSearchTerm("");
                setFocusedIndex(-1);
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
                    handleAddDirective(
                        filteredDirectives[focusedIndex][0] as keyof typeof DIRECTIVE_TYPES
                    );
                }
                break;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className="
                    inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5
                    text-sm font-medium text-white
                    rounded-lg
                    bg-[#4f7b38] hover:bg-[#6aa329]
                    focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-2
                    transition-all duration-200
                    min-w-0 flex-shrink-0
                "
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Add new directive"
            >
                <PlusIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add Directive</span>
                <span className="sm:hidden">Add</span>
                <ChevronDownIcon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Custom Dropdown */}
            {isOpen && (
                <>
                    {/* Mobile Overlay */}
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden" />

                    <div
                        className={`
                            fixed sm:absolute
                            inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:top-full sm:translate-y-0 sm:left-0 sm:mt-2
                            z-50 w-auto sm:w-96
                            max-h-[80vh] sm:max-h-96 overflow-hidden
                            bg-white rounded-xl shadow-xl border border-gray-200
                            animate-in fade-in-0 zoom-in-95 duration-200
                        `}
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {/* Header with Search */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-[#f8fdf2]">
                            <h3 className="text-sm font-semibold text-[#0c0e0a] mb-2">
                                Choose a directive type
                            </h3>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search directives..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="
                                        w-full pl-10 pr-4 py-2
                                        text-sm border border-[#e6f1d6] rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-[#6aa329]
                                        transition-colors duration-200
                                        bg-white
                                    "
                                />
                            </div>
                        </div>

                        {/* Directive Grid */}
                        <div
                            ref={listRef}
                            className="p-2 max-h-60 sm:max-h-60 overflow-y-auto scroll-smooth"
                        >
                            {filteredDirectives.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                    {filteredDirectives.map(([key, config], index) => {
                                        const IconComponent = config.icon;
                                        const isFocused = index === focusedIndex;
                                        return (
                                            <button
                                                key={key}
                                                ref={(el) => {
                                                    itemRefs.current[index] = el;
                                                }}
                                                type="button"
                                                onClick={() =>
                                                    handleAddDirective(
                                                        key as keyof typeof DIRECTIVE_TYPES
                                                    )
                                                }
                                                onMouseEnter={() => setFocusedIndex(index)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg border-2 text-left
                                                    transition-all duration-200
                                                    ${config.color}
                                                    ${isFocused
                                                        ? "ring-2 ring-[#6aa329] ring-offset-1 shadow-md scale-[1.02] bg-opacity-80"
                                                        : ""
                                                    }
                                                    focus:outline-none focus:ring-2 focus:ring-[#6aa329]
                                                    active:scale-95
                                                `}
                                                role="menuitem"
                                            >
                                                <div
                                                    className={`
                                                        flex-shrink-0 w-8 h-8 rounded-lg
                                                        flex items-center justify-center
                                                        ${config.iconColor} 
                                                        ${isFocused
                                                            ? "bg-white shadow-sm"
                                                            : "bg-white/50"
                                                        }
                                                        transition-all duration-200
                                                    `}
                                                >
                                                    <IconComponent
                                                        className={`w-4 h-4 ${isFocused ? "scale-110" : ""
                                                            } transition-transform duration-200`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className={`text-sm font-medium ${isFocused
                                                                ? "text-[#0c0e0a]"
                                                                : "text-[#0c0e0a]"
                                                            }`}
                                                    >
                                                        {config.label}
                                                    </div>
                                                    <div
                                                        className={`text-xs truncate ${isFocused
                                                                ? "text-[#4f7b38]"
                                                                : "text-[#4f7b38]"
                                                            }`}
                                                    >
                                                        {config.description}
                                                    </div>
                                                </div>
                                                <PlusIcon
                                                    className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isFocused
                                                            ? "text-[#6aa329] scale-110"
                                                            : "text-gray-400"
                                                        }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No directives found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Try a different search term
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer with keyboard hints */}
                        {filteredDirectives.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 bg-[#f8fdf2]">
                                <div className="flex items-center justify-between text-xs text-[#4f7b38]">
                                    <span className="hidden sm:inline">Use ↑↓ to navigate</span>
                                    <span className="sm:hidden">Tap to select</span>
                                    <span className="hidden sm:inline">
                                        Enter to select • Esc to close
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}