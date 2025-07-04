import { useState, useEffect, useRef } from "react";
import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import spdxLicenses from "./licenses.json";
import { cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

// Transform SPDX license data to our format
const SPDX_LICENSES = spdxLicenses.licenses
    .filter(license => !license.isDeprecatedLicenseId)
    .map(license => ({
        id: license.licenseId,
        name: license.name,
        url: license.seeAlso?.[0] || license.reference,
        isOsiApproved: license.isOsiApproved
    }));

interface License {
    id: string;
    name: string;
    url: string;
    isOsiApproved: boolean;
}

interface LicenseDropdownProps {
    value: string;
    onChange: (license: string, url: string) => void;
    onCustomLicense: () => void;
    placeholder?: string;
}

export default function LicenseDropdown({
    value,
    onChange,
    onCustomLicense,
    placeholder,
}: LicenseDropdownProps) {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    const filteredLicenses = SPDX_LICENSES.filter((license) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        const licenseId = license.id.toLowerCase();
        const licenseName = license.name.toLowerCase();

        // Direct matches
        if (licenseId.includes(term) || licenseName.includes(term)) {
            return true;
        }

        // Smart matching: handle common patterns
        // gpl3 -> GPL-3.0, gpl-3, etc.
        if (term.match(/^gpl\d+$/)) {
            const version = term.replace('gpl', '');
            return licenseId.includes(`gpl-${version}`);
        }

        // apache2 -> Apache-2.0
        if (term.match(/^apache\d+$/)) {
            const version = term.replace('apache', '');
            return licenseId.includes(`apache-${version}`);
        }

        // bsd2, bsd3 -> BSD-2-Clause, BSD-3-Clause
        if (term.match(/^bsd\d+$/)) {
            const version = term.replace('bsd', '');
            return licenseId.includes(`bsd-${version}`);
        }

        // lgpl2, lgpl3 -> LGPL-2.1, LGPL-3.0
        if (term.match(/^lgpl\d+$/)) {
            const version = term.replace('lgpl', '');
            return licenseId.includes(`lgpl-${version}`);
        }

        // Remove common separators and try fuzzy matching
        const normalizedTerm = term.replace(/[\s\-_.]/g, '');
        const normalizedId = licenseId.replace(/[\s\-_.]/g, '');
        const normalizedName = licenseName.replace(/[\s\-_.]/g, '');

        return normalizedId.includes(normalizedTerm) || normalizedName.includes(normalizedTerm);
    }).sort((a, b) => {
        if (!searchTerm.trim()) {
            // Default sort when no search
            if (a.isOsiApproved !== b.isOsiApproved) {
                return a.isOsiApproved ? -1 : 1;
            }
            return a.id.localeCompare(b.id);
        }

        const term = searchTerm.toLowerCase().trim();
        const aId = a.id.toLowerCase();
        const bId = b.id.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Exact ID match gets highest priority
        const aExactId = aId === term;
        const bExactId = bId === term;
        if (aExactId !== bExactId) return aExactId ? -1 : 1;

        // ID starts with search term gets second priority
        const aStartsId = aId.startsWith(term);
        const bStartsId = bId.startsWith(term);
        if (aStartsId !== bStartsId) return aStartsId ? -1 : 1;

        // Name starts with search term gets third priority
        const aStartsName = aName.startsWith(term);
        const bStartsName = bName.startsWith(term);
        if (aStartsName !== bStartsName) return aStartsName ? -1 : 1;

        // OSI approved licenses get preference
        if (a.isOsiApproved !== b.isOsiApproved) {
            return a.isOsiApproved ? -1 : 1;
        }

        // Finally, sort alphabetically
        return a.id.localeCompare(b.id);
    });

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Prevent body scroll on mobile when dropdown is open
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [isMobile, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (license: License) => {
        onChange(license.id, license.url);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleCustomLicense = () => {
        onCustomLicense();
        setIsOpen(false);
        setSearchTerm("");
    };

    const selectedLicense = SPDX_LICENSES.find((l) => l.id === value);
    const isCustomLicense = !selectedLicense && value && value.trim();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className={cn(
                    "w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-1 flex items-center justify-between",
                    isDark
                        ? "border-[#374151] text-[#e5e7eb] bg-[#161a0e] focus:ring-[#7bb33a] focus:border-[#7bb33a]"
                        : "border-gray-200 text-[#0c0e0a] bg-white focus:ring-[#6aa329] focus:border-[#6aa329]"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn(
                    value
                        ? (isDark ? "text-[#e5e7eb]" : "text-[#0c0e0a]")
                        : (isDark ? "text-[#9ca3af]" : "text-gray-400")
                )}>
                    {selectedLicense ? (
                        `${selectedLicense.id} - ${selectedLicense.name}`
                    ) : isCustomLicense ? (
                        <span className="flex items-center gap-2">
                            <PencilIcon className={cn(
                                "h-4 w-4",
                                isDark ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className="font-medium">{value}</span>
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                isDark ? "bg-[#374151] text-[#d1d5db]" : "bg-gray-100 text-gray-600"
                            )}>Custom</span>
                        </span>
                    ) : (
                        placeholder || "Select a license"
                    )}
                </span>
                <ChevronDownIcon
                    className={cn(
                        "h-4 w-4 transition-transform",
                        isDark ? "text-[#9ca3af]" : "text-gray-400",
                        isOpen ? "rotate-180" : ""
                    )}
                />
            </button>

            {isOpen && (
                <>
                    {/* Mobile overlay */}
                    {isMobile && <div className="fixed inset-0 bg-black/80 z-40 md:hidden" />}

                    <div
                        className={cn(
                            isMobile
                                ? "fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col"
                                : "absolute z-10 w-full bottom-full mb-1 border rounded-md shadow-lg max-h-60 overflow-hidden",
                            isDark
                                ? "bg-[#161a0e] border-[#374151]"
                                : "bg-white border-gray-200"
                        )}
                    >
                        {/* Mobile header */}
                        {isMobile && (
                            <div className={cn(
                                "flex items-center justify-between p-4 border-b",
                                isDark ? "border-[#374151]" : "border-gray-200"
                            )}>
                                <h3 className={cn(
                                    "text-lg font-medium",
                                    isDark ? "text-[#e5e7eb]" : "text-[#0c0e0a]"
                                )}>Select License</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={cn(
                                        "p-2 rounded-md",
                                        isDark ? "hover:bg-[#374151]" : "hover:bg-gray-100"
                                    )}
                                >
                                    <XMarkIcon className={cn(
                                        "h-5 w-5",
                                        isDark ? "text-[#9ca3af]" : "text-gray-500"
                                    )} />
                                </button>
                            </div>
                        )}

                        {/* Search input */}
                        <div className={cn(
                            isMobile ? "p-4" : "p-2",
                            "border-b",
                            isDark ? "border-[#374151]" : "border-gray-100"
                        )}>
                            <div className="relative">
                                <MagnifyingGlassIcon className={cn(
                                    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                                    isDark ? "text-[#9ca3af]" : "text-gray-400"
                                )} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className={cn(
                                        "w-full pl-9 pr-3 text-sm border rounded-md focus:outline-none focus:ring-1",
                                        isMobile ? "py-3" : "py-2",
                                        isDark
                                            ? "border-[#374151] bg-[#2d4222] text-[#e5e7eb] focus:ring-[#7bb33a] focus:border-[#7bb33a]"
                                            : "border-gray-200 bg-white text-[#0c0e0a] focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    )}
                                    placeholder="Search licenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* License list */}
                        <div className={`${isMobile ? "flex-1 overflow-y-auto" : "max-h-48 overflow-y-auto"}`}>
                            {/* Custom License Option */}
                            <button
                                type="button"
                                className={cn(
                                    "w-full text-left focus:outline-none text-sm border-b flex items-center gap-2",
                                    isMobile ? "px-4 py-4" : "px-3 py-3",
                                    isDark
                                        ? "hover:bg-[#2d4222] focus:bg-[#2d4222] border-[#374151]"
                                        : "hover:bg-gray-50 focus:bg-gray-50 border-gray-100"
                                )}
                                onClick={handleCustomLicense}
                            >
                                <PencilIcon className={cn(
                                    "h-4 w-4",
                                    isDark ? "text-blue-400" : "text-blue-600"
                                )} />
                                <div>
                                    <div className={cn(
                                        "font-medium",
                                        isDark ? "text-[#e5e7eb]" : "text-[#0c0e0a]"
                                    )}>Custom License</div>
                                    <div className={cn(
                                        "text-xs",
                                        isDark ? "text-[#9ca3af]" : "text-gray-500"
                                    )}>
                                        Specify your own license name and URL
                                    </div>
                                </div>
                            </button>

                            {/* SPDX Licenses */}
                            {filteredLicenses.length > 0 ? (
                                filteredLicenses.map((license) => (
                                    <button
                                        key={license.id}
                                        type="button"
                                        className={cn(
                                            "w-full text-left focus:outline-none text-sm",
                                            isMobile ? "px-4 py-3" : "px-3 py-2",
                                            isDark
                                                ? "hover:bg-[#2d4222] focus:bg-[#2d4222]"
                                                : "hover:bg-gray-50 focus:bg-gray-50"
                                        )}
                                        onClick={() => handleSelect(license)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "font-medium",
                                                isDark ? "text-[#e5e7eb]" : "text-[#0c0e0a]"
                                            )}>{license.id}</div>
                                            {license.isOsiApproved && (
                                                <span className={cn(
                                                    "text-xs px-1.5 py-0.5 rounded",
                                                    isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    OSI
                                                </span>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "text-xs truncate",
                                            isDark ? "text-[#9ca3af]" : "text-gray-500"
                                        )}>{license.name}</div>
                                    </button>
                                ))
                            ) : searchTerm ? (
                                <div className={cn(
                                    "text-sm",
                                    isMobile ? "px-4 py-3" : "px-3 py-2",
                                    isDark ? "text-[#9ca3af]" : "text-gray-500"
                                )}>
                                    No licenses found matching &quot;{searchTerm}&quot;
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}