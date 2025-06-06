import {
    ChevronDownIcon,
    ChevronRightIcon,
    XMarkIcon,
    QuestionMarkCircleIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, useCallback } from "react";
import { loadPackageDatabase, searchPackagesSync } from "@/lib/packages";

type PackageManager = "system";

const packageManagers: { value: PackageManager; label: string }[] = [
    { value: "system", label: "System Package Manager" },
];

interface Package {
    name: string;
    description: string;
    version?: string;
    section?: string;
}

export default function InstallDirectiveComponent({
    install,
    baseImage,
    onChange,
}: {
    install: string | string[];
    baseImage: string;
    onChange: (install: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [packages, setPackages] = useState<string[]>([]);
    const [newPackage, setNewPackage] = useState("");
    const [packageManager, setPackageManager] = useState<PackageManager>("system");
    const [showDocumentation, setShowDocumentation] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchResults, setSearchResults] = useState<Package[]>([]);
    const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);
    const [databaseLoaded, setDatabaseLoaded] = useState(false);
    const [packageDatabase, setPackageDatabase] = useState<Package[]>([]);
    const [searchTime, setSearchTime] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

    // Parse the install string into individual packages
    useEffect(() => {
        if (typeof install === "string") {
            setPackages(install.split(/\s+/).filter((pkg) => pkg.trim() !== ""));
        } else if (Array.isArray(install)) {
            const allPackages = install.flatMap((pkg) =>
                pkg.split(/\s+/).filter((p) => p.trim() !== "")
            );
            setPackages(allPackages);
        } else {
            setPackages([]);
        }
    }, [install]);

    // Load database on mount
    useEffect(() => {
        const loadDatabase = async () => {
            setIsLoadingDatabase(true);
            try {
                const db = await loadPackageDatabase();
                setPackageDatabase(db);
                setDatabaseLoaded(true);
            } catch (error) {
                console.error("Failed to load package database:", error);
            } finally {
                setIsLoadingDatabase(false);
            }
        };

        loadDatabase();
    }, []);

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

    const updatePackages = (newPackages: string[]) => {
        const newInstallString = newPackages.join(" ");
        onChange(newInstallString);
    };

    const addPackage = (packageName?: string) => {
        const pkgToAdd = packageName || newPackage.trim();
        if (pkgToAdd && !packages.includes(pkgToAdd)) {
            const updatedPackages = [...packages, pkgToAdd];
            updatePackages(updatedPackages);
            setNewPackage("");
            setIsDropdownOpen(false);
            setSelectedIndex(-1);
            setSearchResults([]);
            setSearchTime(null);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const removePackage = (index: number) => {
        const updatedPackages = packages.filter((_, i) => i !== index);
        updatePackages(updatedPackages);
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
        <div className="bg-white rounded-md shadow-sm border border-[#e6f1d6] mb-4">
            <div
                className="flex items-center p-3 bg-[#f0f7e7] rounded-t-md cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-2 text-[#4f7b38]">
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <h2 className="text-[#0c0e0a] font-medium flex-grow">Install</h2>
                <div className="relative">
                    <button
                        className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDocumentation(!showDocumentation);
                        }}
                        title="Show documentation"
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                    </button>
                    {showDocumentation && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDocumentation(false)}
                            />
                            <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                <h3 className="font-semibold text-[#0c0e0a] mb-2">
                                    INSTALL Directive
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        Search from {databaseLoaded ? packageDatabase.length.toLocaleString() : '80,000+'} Ubuntu 24.04 packages.
                                    </p>
                                    <div>
                                        <strong>Keyboard Shortcuts:</strong>
                                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                            <li><kbd className="bg-gray-100 px-1 rounded">Enter</kbd> - Add package</li>
                                            <li><kbd className="bg-gray-100 px-1 rounded">↑/↓</kbd> - Navigate suggestions</li>
                                            <li><kbd className="bg-gray-100 px-1 rounded">Tab</kbd> - Autocomplete</li>
                                            <li><kbd className="bg-gray-100 px-1 rounded">Backspace</kbd> - Remove last (when empty)</li>
                                            <li><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> - Close suggestions</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {baseImage !== "ubuntu:24.04" && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="text-amber-800 font-medium">Ubuntu 24.04 Only</p>
                                <p className="text-amber-700">
                                    Package search is currently limited to Ubuntu 24.04 LTS packages.
                                    Other distributions are not supported yet.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#0c0e0a] mb-2">
                            Package Manager
                        </label>
                        <select
                            value={packageManager}
                            disabled={true} // Disable for now, only system package manager supported
                            onChange={(e) =>
                                setPackageManager(e.target.value as PackageManager)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-500 bg-gray-100 cursor-not-allowed focus:outline-none"
                        >
                            {packageManagers.map((pm) => (
                                <option key={pm.value} value={pm.value}>
                                    {pm.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {packages.length > 0 ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#0c0e0a] mb-2">
                                Packages to Install ({packages.length})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {packages.map((pkg, index) => (
                                    <button
                                        key={index}
                                        className="flex items-center bg-[#f0f7e7] px-3 py-2 rounded-md border border-[#e6f1d6] group hover:bg-[#e8f4d9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-1"
                                        onClick={() => removePackage(index)}
                                        onKeyDown={(e) => handlePackageKeyDown(e, index)}
                                        title={`Remove ${pkg} (Enter or Space)`}
                                    >
                                        <span className="font-mono text-[#0c0e0a] mr-2 text-sm break-all">
                                            {pkg}
                                        </span>
                                        <XMarkIcon className="h-4 w-4 text-[#4f7b38] group-hover:text-[#3a5c29] opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-600 text-center">
                                No packages selected for installation.
                            </p>
                            <p className="text-xs text-gray-500 text-center mt-1">
                                Start typing below to search from {databaseLoaded ? packageDatabase.length.toLocaleString() : '80,000+'} Ubuntu 24.04 packages.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#0c0e0a] mb-2">
                            Add Package
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="font-mono w-full px-3 py-2 pr-8 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
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
                                        <div className="animate-spin h-4 w-4 border-2 border-[#6aa329] border-t-transparent rounded-full" />
                                    ) : (
                                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    <div className="max-h-64 overflow-y-auto">
                                        {searchResults.length > 0 ? (
                                            <>
                                                {searchResults.map((pkg, index) => (
                                                    <button
                                                        key={pkg.name}
                                                        type="button"
                                                        className={`w-full px-3 py-2 text-left focus:outline-none text-sm border-b border-gray-50 last:border-b-0 ${index === selectedIndex
                                                            ? "bg-[#6aa329] text-white"
                                                            : "hover:bg-[#f0f7e7] focus:bg-[#f0f7e7]"
                                                            }`}
                                                        onClick={() => addPackage(pkg.name)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                    >
                                                        <div
                                                            className={`font-mono font-medium text-sm sm:text-base ${index === selectedIndex
                                                                ? "text-white"
                                                                : "text-[#0c0e0a]"
                                                                }`}
                                                        >
                                                            {pkg.name}
                                                            {pkg.version && (
                                                                <span className={`ml-2 text-xs ${index === selectedIndex ? "text-green-100" : "text-gray-400"
                                                                    }`}>
                                                                    {pkg.version}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`text-xs truncate ${index === selectedIndex
                                                                ? "text-green-100"
                                                                : "text-gray-500"
                                                                }`}
                                                        >
                                                            {pkg.description}
                                                        </div>
                                                    </button>
                                                ))}
                                                {searchTime !== null && (
                                                    <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                                                        Search completed in {searchTime}ms
                                                    </div>
                                                )}
                                            </>
                                        ) : newPackage.length >= 2 && databaseLoaded ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No packages found matching &quot;{newPackage}&quot;
                                                {searchTime !== null && (
                                                    <span className="block text-xs mt-1">
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
                                <p className="text-xs text-gray-500">
                                    {databaseLoaded
                                        ? "Use ↑/↓ to navigate, Tab to autocomplete, Enter to add"
                                        : "Database loading..."
                                    }
                                </p>
                                {/* Mobile-specific help */}
                                <p className="text-xs text-gray-400 sm:hidden">
                                    Tap suggestions to add packages
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}