import {
    XMarkIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, useCallback } from "react";
import { searchPackagesSync } from "@/lib/packages";
import { getThemePresets, iconStyles, textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface Package {
    name: string;
    description: string;
    version?: string;
    section?: string;
}

interface PackageTagEditorProps {
    packages: string[];
    onChange: (packages: string[]) => void;
    packageDatabase: Package[];
    databaseLoaded: boolean;
    isLoadingDatabase: boolean;
    baseImage: string;
    className?: string;
}

export default function PackageTagEditor({
    packages,
    onChange,
    packageDatabase,
    databaseLoaded,
    isLoadingDatabase,
    baseImage,
    className = "",
}: PackageTagEditorProps) {
    const { isDark } = useTheme();
    const [newPackage, setNewPackage] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchResults, setSearchResults] = useState<Package[]>([]);
    const [searchTime, setSearchTime] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Debounced search function with timing
    const performSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (query.length >= 2 && packageDatabase.length > 0) {
                const startTime = performance.now();
                const results = searchPackagesSync(query, 8);
                const endTime = performance.now();
                const searchDuration = Math.round(endTime - startTime);

                setSearchResults(results.filter(pkg => !packages.includes(pkg.name)));
                setSearchTime(searchDuration);
            } else {
                setSearchResults([]);
                setSearchTime(null);
            }
        }, 150);
    }, [packageDatabase, packages]);

    // Handle clicks outside dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setSelectedIndex(-1);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset selected index when search results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResults.length]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const addPackage = (packageName?: string) => {
        const pkgToAdd = packageName || newPackage.trim();
        if (pkgToAdd && !packages.includes(pkgToAdd)) {
            onChange([...packages, pkgToAdd]);
            setNewPackage("");
            setIsDropdownOpen(false);
            setSelectedIndex(-1);
            setSearchResults([]);
            setSearchTime(null);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const removePackage = (index: number) => {
        onChange(packages.filter((_, i) => i !== index));
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewPackage(value);

        if (value.length >= 2 && databaseLoaded) {
            setIsDropdownOpen(true);
            performSearch(value);
        } else {
            setIsDropdownOpen(false);
            setSearchResults([]);
            setSearchTime(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                addPackage(searchResults[selectedIndex].name);
            } else {
                addPackage();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (isDropdownOpen && searchResults.length > 0) {
                setSelectedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : 0
                );
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (isDropdownOpen && searchResults.length > 0) {
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : searchResults.length - 1
                );
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
            setSelectedIndex(-1);
        } else if (e.key === "Tab") {
            if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                e.preventDefault();
                setNewPackage(searchResults[selectedIndex].name);
                setIsDropdownOpen(false);
                setSelectedIndex(-1);
            }
        } else if (e.key === "Backspace" && !newPackage && packages.length > 0) {
            e.preventDefault();
            removePackage(packages.length - 1);
        }
    };

    const handlePackageKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        index: number
    ) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            removePackage(index);
        }
    };

    return (
        <div className={className}>
            {baseImage !== "ubuntu:24.04" && (
                <div className={cn(
                    "mb-4 p-3 border rounded-md flex items-start",
                    isDark ? "bg-amber-900/20 border-amber-700" : "bg-amber-50 border-amber-200"
                )}>
                    <ExclamationTriangleIcon className={cn(
                        iconStyles(isDark, 'md'),
                        "mr-2 mt-0.5 flex-shrink-0",
                        isDark ? "text-amber-400" : "text-amber-600"
                    )} />
                    <div className={textStyles(isDark, { size: 'sm' })}>
                        <p className={cn(
                            "font-medium",
                            isDark ? "text-amber-400" : "text-amber-800"
                        )}>
                            Ubuntu 24.04 Only
                        </p>
                        <p className={isDark ? "text-amber-300" : "text-amber-700"}>
                            Package search is currently limited to Ubuntu 24.04 LTS packages.
                            Other distributions are not supported yet.
                        </p>
                    </div>
                </div>
            )}

            {packages.length > 0 ? (
                <div className="mb-4">
                    <label className={getThemePresets(isDark).formLabel}>
                        Packages to Install ({packages.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {packages.map((pkg, index) => (
                            <button
                                key={index}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-md border group transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                                    isDark
                                        ? "bg-[#1f2e18] border-[#2d4222] hover:bg-[#2a3d20] focus:ring-[#7bb33a]"
                                        : "bg-[#f0f7e7] border-[#e6f1d6] hover:bg-[#e8f4d9] focus:ring-[#6aa329]"
                                )}
                                onClick={() => removePackage(index)}
                                onKeyDown={(e) => handlePackageKeyDown(e, index)}
                                title={`Remove ${pkg} (Enter or Space)`}
                            >
                                <span className={cn(textStyles(isDark, { size: 'sm', color: 'primary' }), "font-mono mr-2 break-all")}>
                                    {pkg}
                                </span>
                                <XMarkIcon className={cn(
                                    iconStyles(isDark, 'sm'),
                                    "opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0",
                                    isDark
                                        ? "text-[#91c84a] group-hover:text-[#7bb33a]"
                                        : "text-[#4f7b38] group-hover:text-[#3a5c29]"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={cn(
                    "mb-4 p-4 rounded-md border",
                    isDark ? "bg-[#2d4222] border-[#374151]" : "bg-gray-50 border-gray-200"
                )}>
                    <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center")}>
                        No packages selected for installation.
                    </p>
                    <p className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "text-center mt-1")}>
                        Start typing below to search from {databaseLoaded ? packageDatabase.length.toLocaleString() : '80,000+'} Ubuntu 24.04 packages.
                    </p>
                </div>
            )}

            <div>
                <label className={getThemePresets(isDark).formLabel}>
                    Add Package
                </label>
                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            className={cn(getThemePresets(isDark).input, "font-mono pr-8")}
                            placeholder={
                                isLoadingDatabase
                                    ? "Loading database..."
                                    : `Search ${databaseLoaded ? packageDatabase.length.toLocaleString() : '80,000+'} packages...`
                            }
                            value={newPackage}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={isLoadingDatabase}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isLoadingDatabase ? (
                                <div className={cn(
                                    "animate-spin h-4 w-4 border-2 border-t-transparent rounded-full",
                                    isDark ? "border-[#7bb33a]" : "border-[#6aa329]"
                                )} />
                            ) : (
                                <MagnifyingGlassIcon className={cn(
                                    iconStyles(isDark, 'sm'),
                                    isDark ? "text-[#9ca3af]" : "text-gray-400"
                                )} />
                            )}
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className={cn(
                            "absolute z-10 w-full top-full mt-1 border rounded-md shadow-lg",
                            isDark ? "bg-[#161a0e] border-[#374151]" : "bg-white border-gray-200"
                        )}>
                            <div className="max-h-64 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <>
                                        {searchResults.map((pkg, index) => (
                                            <button
                                                key={pkg.name}
                                                type="button"
                                                className={cn(
                                                    "w-full px-3 py-2 text-left focus:outline-none text-sm border-b last:border-b-0",
                                                    isDark ? "border-[#374151]" : "border-gray-50",
                                                    index === selectedIndex
                                                        ? (isDark ? "bg-[#7bb33a] text-white" : "bg-[#6aa329] text-white")
                                                        : (isDark
                                                            ? "hover:bg-[#1f2e18] focus:bg-[#1f2e18]"
                                                            : "hover:bg-[#f0f7e7] focus:bg-[#f0f7e7]")
                                                )}
                                                onClick={() => addPackage(pkg.name)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                            >
                                                <div
                                                    className={cn(
                                                        "font-mono font-medium",
                                                        textStyles(isDark, { size: 'sm' }),
                                                        "sm:text-base",
                                                        index === selectedIndex
                                                            ? "text-white"
                                                            : textStyles(isDark, { color: 'primary' })
                                                    )}
                                                >
                                                    {pkg.name}
                                                    {pkg.version && (
                                                        <span className={cn(
                                                            "ml-2 text-xs",
                                                            index === selectedIndex
                                                                ? "text-green-100"
                                                                : (isDark ? "text-[#9ca3af]" : "text-gray-400")
                                                        )}>
                                                            {pkg.version}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={cn(
                                                        textStyles(isDark, { size: 'xs' }),
                                                        "truncate",
                                                        index === selectedIndex
                                                            ? "text-green-100"
                                                            : textStyles(isDark, { color: 'muted' })
                                                    )}
                                                >
                                                    {pkg.description}
                                                </div>
                                            </button>
                                        ))}
                                        {searchTime !== null && (
                                            <div className={cn(
                                                "px-3 py-2 border-t",
                                                textStyles(isDark, { size: 'xs', color: 'muted' }),
                                                isDark ? "bg-[#2d4222] border-[#374151]" : "bg-gray-50 border-gray-100"
                                            )}>
                                                Search completed in {searchTime}ms
                                            </div>
                                        )}
                                    </>
                                ) : newPackage.length >= 2 && databaseLoaded ? (
                                    <div className={cn("px-3 py-2", textStyles(isDark, { size: 'sm', color: 'muted' }))}>
                                        No packages found matching &quot;{newPackage}&quot;
                                        {searchTime !== null && (
                                            <span className={cn("block mt-1", textStyles(isDark, { size: 'xs' }))}>
                                                Search completed in {searchTime}ms
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>

                {/* Help text - always visible when not loading */}
                {!isLoadingDatabase && (
                    <div className="mt-2 space-y-1">
                        <p className={textStyles(isDark, { size: 'xs', color: 'muted' })}>
                            {databaseLoaded
                                ? "Use ↑/↓ to navigate, Tab to autocomplete, Enter to add"
                                : "Database loading..."
                            }
                        </p>
                        {/* Mobile-specific help */}
                        <p className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "sm:hidden opacity-60")}>
                            Tap suggestions to add packages
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}