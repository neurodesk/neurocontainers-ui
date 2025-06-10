import { useState, useEffect, useRef } from "react";
import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

// SPDX License list (common ones - you can expand this)
const SPDX_LICENSES = [
    { id: "MIT", name: "MIT License", url: "https://opensource.org/licenses/MIT" },
    { id: "Apache-2.0", name: "Apache License 2.0", url: "https://opensource.org/licenses/Apache-2.0" },
    { id: "GPL-3.0", name: "GNU General Public License v3.0", url: "https://opensource.org/licenses/GPL-3.0" },
    { id: "GPL-2.0", name: "GNU General Public License v2.0", url: "https://opensource.org/licenses/GPL-2.0" },
    { id: "BSD-3-Clause", name: "BSD 3-Clause License", url: "https://opensource.org/licenses/BSD-3-Clause" },
    { id: "BSD-2-Clause", name: "BSD 2-Clause License", url: "https://opensource.org/licenses/BSD-2-Clause" },
    { id: "LGPL-3.0", name: "GNU Lesser General Public License v3.0", url: "https://opensource.org/licenses/LGPL-3.0" },
    { id: "LGPL-2.1", name: "GNU Lesser General Public License v2.1", url: "https://opensource.org/licenses/LGPL-2.1" },
    { id: "ISC", name: "ISC License", url: "https://opensource.org/licenses/ISC" },
    { id: "MPL-2.0", name: "Mozilla Public License 2.0", url: "https://opensource.org/licenses/MPL-2.0" },
    { id: "CC0-1.0", name: "Creative Commons Zero v1.0 Universal", url: "https://creativecommons.org/publicdomain/zero/1.0/" },
    { id: "Unlicense", name: "The Unlicense", url: "https://unlicense.org/" },
    { id: "AGPL-3.0", name: "GNU Affero General Public License v3.0", url: "https://opensource.org/licenses/AGPL-3.0" },
];

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
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    const filteredLicenses = SPDX_LICENSES.filter(
        (license) =>
            license.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            license.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleSelect = (license: typeof SPDX_LICENSES[0]) => {
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
    const isCustomLicense = !selectedLicense && value;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? "text-[#0c0e0a]" : "text-gray-400"}>
                    {selectedLicense ? (
                        `${selectedLicense.id} - ${selectedLicense.name}`
                    ) : isCustomLicense ? (
                        <span className="flex items-center gap-2">
                            <PencilIcon className="h-4 w-4 text-[#6aa329]" />
                            {value} (Custom)
                        </span>
                    ) : (
                        placeholder || "Select a license"
                    )}
                </span>
                <ChevronDownIcon
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Mobile overlay */}
                    {isMobile && <div className="fixed inset-0 bg-black/80 z-40 md:hidden" />}

                    <div
                        className={`
              ${
                  isMobile
                      ? "fixed inset-x-0 top-0 bottom-0 z-50 bg-white flex flex-col"
                      : "absolute z-10 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden"
              }
            `}
                    >
                        {/* Mobile header */}
                        {isMobile && (
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-[#0c0e0a]">Select License</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-md"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        )}

                        {/* Search input */}
                        <div className={`${isMobile ? "p-4" : "p-2"} border-b border-gray-100`}>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className={`w-full pl-9 pr-3 ${
                                        isMobile ? "py-3" : "py-2"
                                    } text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]`}
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
                                className={`w-full ${
                                    isMobile ? "px-4 py-4" : "px-3 py-3"
                                } text-left hover:bg-[#f0f7e7] focus:bg-[#f0f7e7] focus:outline-none text-sm border-b border-gray-100 flex items-center gap-2`}
                                onClick={handleCustomLicense}
                            >
                                <PencilIcon className="h-4 w-4 text-[#6aa329]" />
                                <div>
                                    <div className="font-medium text-[#0c0e0a]">Custom License</div>
                                    <div className="text-xs text-gray-500">
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
                                        className={`w-full ${
                                            isMobile ? "px-4 py-3" : "px-3 py-2"
                                        } text-left hover:bg-[#f0f7e7] focus:bg-[#f0f7e7] focus:outline-none text-sm`}
                                        onClick={() => handleSelect(license)}
                                    >
                                        <div className="font-medium text-[#0c0e0a]">{license.id}</div>
                                        <div className="text-xs text-gray-500 truncate">{license.name}</div>
                                    </button>
                                ))
                            ) : searchTerm ? (
                                <div className={`${isMobile ? "px-4 py-3" : "px-3 py-2"} text-sm text-gray-500`}>
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