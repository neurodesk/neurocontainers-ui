import {
    PlusIcon,
    TrashIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    LinkIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    ExclamationCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe, Architecture, CopyrightInfo } from "@/components/common";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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

function LicenseDropdown({
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
            // Small delay to ensure the dropdown is rendered
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
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
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
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Mobile overlay */}
                    {isMobile && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
                    )}

                    <div
                        className={`
              ${isMobile
                                ? "fixed inset-x-0 top-0 bottom-0 z-50 bg-white flex flex-col"
                                : "absolute z-10 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden"
                            }
            `}
                    >
                        {/* Mobile header */}
                        {isMobile && (
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-[#0c0e0a]">
                                    Select License
                                </h3>
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
                        <div
                            className={`${isMobile ? "p-4" : "p-2"
                                } border-b border-gray-100`}
                        >
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className={`w-full pl-9 pr-3 ${isMobile ? "py-3" : "py-2"
                                        } text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]`}
                                    placeholder="Search licenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* License list */}
                        <div
                            className={`${isMobile ? "flex-1 overflow-y-auto" : "max-h-48 overflow-y-auto"
                                }`}
                        >
                            {/* Custom License Option */}
                            <button
                                type="button"
                                className={`w-full ${isMobile ? "px-4 py-4" : "px-3 py-3"
                                    } text-left hover:bg-[#f0f7e7] focus:bg-[#f0f7e7] focus:outline-none text-sm border-b border-gray-100 flex items-center gap-2`}
                                onClick={handleCustomLicense}
                            >
                                <PencilIcon className="h-4 w-4 text-[#6aa329]" />
                                <div>
                                    <div className="font-medium text-[#0c0e0a]">
                                        Custom License
                                    </div>
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
                                        className={`w-full ${isMobile ? "px-4 py-3" : "px-3 py-2"
                                            } text-left hover:bg-[#f0f7e7] focus:bg-[#f0f7e7] focus:outline-none text-sm`}
                                        onClick={() => handleSelect(license)}
                                    >
                                        <div className="font-medium text-[#0c0e0a]">
                                            {license.id}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {license.name}
                                        </div>
                                    </button>
                                ))
                            ) : searchTerm ? (
                                <div
                                    className={`${isMobile ? "px-4 py-3" : "px-3 py-2"
                                        } text-sm text-gray-500`}
                                >
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

// Validation functions
function validateName(name: string): string | null {
    if (!name.trim()) return "Container name is required";
    if (name.length < 2) return "Container name must be at least 2 characters";
    // validate the name is a valid docker tag.
    const validNameRegex = /^[a-z0-9][a-z0-9]{0,62}$/;
    if (!validNameRegex.test(name)) {
        return "Container name must be lowercase and can only contain letters, and numbers";
    }
    return null;
}

function validateVersion(version: string): string | null {
    if (!version.trim()) return "Version is required";
    return null;
}

function validateDocumentation(recipe: ContainerRecipe): string | null {
    const hasReadme = recipe.readme && recipe.readme.trim();
    const hasReadmeUrl = recipe.readme_url && recipe.readme_url.trim();

    if (!hasReadme && !hasReadmeUrl) {
        return "Documentation is required (either content or URL)";
    }

    if (hasReadmeUrl && !/^https?:\/\/.+/.test(recipe.readme_url!)) {
        return "Documentation URL must be a valid HTTP/HTTPS URL";
    }

    return null;
}

export default function ContainerMetadata({
    recipe,
    onChange,
}: {
    recipe: ContainerRecipe;
    onChange: (recipe: ContainerRecipe) => void;
}) {
    const [readmeContent, setReadmeContent] = useState(recipe.readme || "");
    const [showPreview, setShowPreview] = useState(false);
    const [showArchitectureHelp, setShowArchitectureHelp] = useState(false);
    const [showReadmeHelp, setShowReadmeHelp] = useState(false);
    const [showCopyrightHelp, setShowCopyrightHelp] = useState(false);
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [showInputTypeWarning, setShowInputTypeWarning] = useState(false);
    const [pendingInputType, setPendingInputType] = useState<"content" | "url" | null>(null);
    const [customLicenseIndex, setCustomLicenseIndex] = useState<number | null>(null);
    const [showValidation, setShowValidation] = useState(false);

    const inputType =
        recipe.readme !== undefined
            ? "content"
            : recipe.readme_url !== undefined
                ? "url"
                : "content";

    // Validation states
    const nameError = validateName(recipe.name);
    const versionError = validateVersion(recipe.version);
    const documentationError = validateDocumentation(recipe);
    const architectureError = recipe.architectures.length === 0 ? "At least one architecture must be selected" : null;

    const hasErrors = !!(nameError || versionError || documentationError || architectureError);

    useEffect(() => {
        // Update local state when recipe changes externally
        setReadmeContent(recipe.readme || "");
    }, [recipe.readme, recipe.readme_url]);

    // Show validation after user has interacted with the form
    useEffect(() => {
        if (recipe.name || recipe.version || recipe.readme || recipe.readme_url) {
            setShowValidation(true);
        }
    }, [recipe.name, recipe.version, recipe.readme, recipe.readme_url]);

    const updateName = (name: string) => {
        onChange({ ...recipe, name });
    };

    const updateVersion = (version: string) => {
        onChange({ ...recipe, version });
    };

    const updateArchitectures = (architectures: Architecture[]) => {
        onChange({ ...recipe, architectures });
    };

    const updateReadme = (readme: string) => {
        setReadmeContent(readme);
        onChange({ ...recipe, readme, readme_url: undefined });
    };

    const updateReadmeUrl = (readme_url: string) => {
        onChange({ ...recipe, readme_url, readme: undefined });
    };

    const updateCopyright = (index: number, info: CopyrightInfo) => {
        if (!recipe.copyright) return;

        const updated = [...recipe.copyright];
        updated[index] = info;
        onChange({ ...recipe, copyright: updated });
    };

    const addCopyright = () => {
        const newCopyright = { license: "", url: "" };
        onChange({
            ...recipe,
            copyright: [...(recipe.copyright || []), newCopyright],
        });
    };

    const removeCopyright = (index: number) => {
        if (!recipe.copyright) return;

        onChange({
            ...recipe,
            copyright: recipe.copyright.filter((_, i) => i !== index),
        });
        setDeleteConfirmIndex(null);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const cancelDelete = () => {
        setDeleteConfirmIndex(null);
    };

    const toggleInputType = (type: "content" | "url") => {
        if (type === inputType) return;

        // Check if there's content that would be lost
        const hasContent = (inputType === "content" && readmeContent.trim()) ||
            (inputType === "url" && recipe.readme_url?.trim());

        if (hasContent) {
            setPendingInputType(type);
            setShowInputTypeWarning(true);
            return;
        }

        // No content to lose, switch immediately
        performInputTypeSwitch(type);
    };

    const performInputTypeSwitch = (type: "content" | "url") => {
        if (type === "content") {
            onChange({
                ...recipe,
                readme: readmeContent,
                readme_url: undefined,
            });
        } else {
            onChange({
                ...recipe,
                readme: undefined,
                readme_url: recipe.readme_url || "",
            });
        }
    };

    const confirmInputTypeSwitch = () => {
        if (pendingInputType) {
            performInputTypeSwitch(pendingInputType);
        }
        setShowInputTypeWarning(false);
        setPendingInputType(null);
    };

    const cancelInputTypeSwitch = () => {
        setShowInputTypeWarning(false);
        setPendingInputType(null);
    };

    const handleArchitectureToggle = (arch: Architecture, checked: boolean) => {
        if (checked) {
            updateArchitectures([...recipe.architectures, arch]);
        } else {
            updateArchitectures(
                recipe.architectures.filter((a) => a !== arch)
            );
        }
    };

    const handleLicenseChange = (index: number, license: string, url: string) => {
        if (!recipe.copyright) return;
        updateCopyright(index, { license, url });
    };

    const handleCustomLicense = (index: number) => {
        setCustomLicenseIndex(index);
    };

    const isCustomLicense = (index: number) => {
        if (!recipe.copyright?.[index]) return false;
        const license = recipe.copyright[index].license;
        return !SPDX_LICENSES.find(l => l.id === license) && license;
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md border border-[#d3e7b6] mb-6">
                {/* Validation Summary */}
                {showValidation && hasErrors && (
                    <div className="p-4 bg-red-50 border-b border-red-200 rounded-t-lg">
                        <div className="flex items-start gap-3">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                    Please fix the following issues:
                                </h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    {nameError && <li>• {nameError}</li>}
                                    {versionError && <li>• {versionError}</li>}
                                    {documentationError && <li>• {documentationError}</li>}
                                    {architectureError && <li>• {architectureError}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 sm:p-6">
                    {/* Basic Information Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-[#0c0e0a] mb-4">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block mb-2 font-medium text-[#1e2a16]">
                                    Container Name *
                                </label>
                                <input
                                    className={`w-full px-3 py-2 border rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 transition-colors ${showValidation && nameError
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                        : "border-gray-200 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                        }`}
                                    value={recipe.name}
                                    onChange={(e) => updateName(e.target.value)}
                                    placeholder="e.g., my-neuroimaging-container"
                                />
                                {showValidation && nameError ? (
                                    <p className="text-xs text-red-600 mt-1">{nameError}</p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        A unique identifier for your container
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-[#1e2a16]">
                                    Version *
                                </label>
                                <input
                                    className={`w-full px-3 py-2 border rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 transition-colors ${showValidation && versionError
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                        : "border-gray-200 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                        }`}
                                    value={recipe.version}
                                    onChange={(e) => updateVersion(e.target.value)}
                                    placeholder="e.g., 1.0.0"
                                />
                                {showValidation && versionError ? (
                                    <p className="text-xs text-red-600 mt-1">{versionError}</p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Semantic version number (recommended)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Architecture Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">
                                Target Architectures *
                            </h3>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowArchitectureHelp(!showArchitectureHelp);
                                    }}
                                    className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                                    title="Show documentation"
                                >
                                    <InformationCircleIcon className="h-4 w-4" />
                                </button>
                                {showArchitectureHelp && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowArchitectureHelp(false)}
                                        />
                                        <div className="absolute left-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                            <h4 className="font-semibold text-[#0c0e0a] mb-2">
                                                Target Architectures
                                            </h4>
                                            <div className="text-sm text-gray-600 space-y-2">
                                                <p>
                                                    Choose the processor architectures your container should support:
                                                </p>
                                                <div className="space-y-2">
                                                    <div>
                                                        <strong>x86_64 (Intel/AMD):</strong> Most common architecture
                                                        <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                                                            <li>Desktop computers, most laptops</li>
                                                            <li>Most cloud instances (AWS EC2, Google Cloud, Azure)</li>
                                                            <li>Traditional servers and workstations</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong>aarch64 (ARM 64-bit):</strong> Growing in popularity
                                                        <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                                                            <li>Apple Silicon Macs (M1, M2, M3)</li>
                                                            <li>AWS Graviton instances</li>
                                                            <li>Raspberry Pi 4+ and other ARM devices</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <p className="text-xs">
                                                    💡 <strong>Tip:</strong> Select both for maximum compatibility, or just x86_64 if you&apos;re unsure.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className={`inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all ${recipe.architectures.includes("x86_64")
                                ? "bg-[#f0f7e7] border-[#6aa329] shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                }`}>
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("x86_64")}
                                    onChange={(e) =>
                                        handleArchitectureToggle(
                                            "x86_64",
                                            e.target.checked
                                        )
                                    }
                                />
                                <div className="ml-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[#0c0e0a]">
                                            x86_64
                                        </span>
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            Most Common
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Intel/AMD processors
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Desktop, laptop, most cloud servers
                                    </p>
                                </div>
                            </label>

                            <label className={`inline-flex items-center p-4 rounded-lg border cursor-pointer transition-all ${recipe.architectures.includes("aarch64")
                                ? "bg-[#f0f7e7] border-[#6aa329] shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                }`}>
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#6aa329] focus:ring-[#6aa329]"
                                    checked={recipe.architectures.includes("aarch64")}
                                    onChange={(e) =>
                                        handleArchitectureToggle(
                                            "aarch64",
                                            e.target.checked
                                        )
                                    }
                                />
                                <div className="ml-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[#0c0e0a]">
                                            aarch64
                                        </span>
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                            Growing
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        ARM 64-bit processors
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Apple Silicon, AWS Graviton, Raspberry Pi
                                    </p>
                                </div>
                            </label>
                        </div>

                        {showValidation && architectureError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                                <p className="font-medium">
                                    No architectures selected
                                </p>
                                <p>
                                    Please select at least one target
                                    architecture for your container.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Documentation Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-medium text-[#0c0e0a]">
                                Documentation *
                            </h3>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowReadmeHelp(!showReadmeHelp);
                                    }}
                                    className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                                    title="Show documentation"
                                >
                                    <InformationCircleIcon className="h-4 w-4" />
                                </button>
                                {showReadmeHelp && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowReadmeHelp(false)}
                                        />
                                        <div className="absolute left-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                            <h4 className="font-semibold text-[#0c0e0a] mb-2">
                                                Documentation
                                            </h4>
                                            <div className="text-sm text-gray-600 space-y-2">
                                                <p>
                                                    Provide documentation for your container users:
                                                </p>
                                                <div>
                                                    <strong>Options:</strong>
                                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                                        <li><strong>Enter Content:</strong> Write documentation directly using Markdown syntax</li>
                                                        <li><strong>Provide URL:</strong> Link to external documentation (e.g., GitHub README)</li>
                                                    </ul>
                                                </div>
                                                <p>
                                                    Good documentation helps users understand how to use your container effectively.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="inline-flex p-1 bg-gray-100 rounded-md">
                                <button
                                    type="button"
                                    onClick={() => toggleInputType("content")}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${inputType === "content"
                                        ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                        : "text-gray-600 hover:text-[#4f7b38]"
                                        }`}
                                >
                                    <DocumentTextIcon className="h-4 w-4" />
                                    Enter Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleInputType("url")}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${inputType === "url"
                                        ? "bg-white shadow-sm text-[#4f7b38] font-medium"
                                        : "text-gray-600 hover:text-[#4f7b38]"
                                        }`}
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    Provide URL
                                </button>
                            </div>
                        </div>

                        {inputType === "content" ? (
                            <div className={`border rounded-lg overflow-hidden ${showValidation && documentationError ? "border-red-300" : "border-gray-200"
                                }`}>
                                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
                                    <div className="text-sm font-medium text-gray-700">
                                        {showPreview
                                            ? "Markdown Preview"
                                            : "Markdown Editor"}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-sm px-3 py-1.5 rounded-md bg-[#f0f7e7] text-[#4f7b38] hover:bg-[#e5f0d5] transition-colors font-medium"
                                        onClick={() =>
                                            setShowPreview(!showPreview)
                                        }
                                    >
                                        {showPreview ? "Edit" : "Preview"}
                                    </button>
                                </div>

                                {showPreview ? (
                                    <div className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
                                        {readmeContent ? (
                                            <ReactMarkdown>
                                                {readmeContent}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="text-gray-400 italic text-center py-8">
                                                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>
                                                    Preview will appear here when
                                                    you add content
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full px-4 py-3 text-[#0c0e0a] focus:outline-none focus:ring-0 border-0 min-h-[250px] resize-y font-mono text-sm leading-relaxed"
                                        value={readmeContent}
                                        onChange={(e) =>
                                            updateReadme(e.target.value)
                                        }
                                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    className={`w-full px-3 py-2 border rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 transition-colors ${showValidation && documentationError
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                        : "border-gray-200 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                        }`}
                                    value={recipe.readme_url || ""}
                                    onChange={(e) =>
                                        updateReadmeUrl(e.target.value)
                                    }
                                    placeholder="https://raw.githubusercontent.com/user/repo/main/README.md"
                                />
                                {showValidation && documentationError ? (
                                    <p className="text-xs text-red-600 mt-1">{documentationError}</p>
                                ) : (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter a URL to an external documentation file.
                                        GitHub raw file URLs work well for this purpose.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Copyright Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-[#0c0e0a]">
                                    License Information
                                </h3>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCopyrightHelp(!showCopyrightHelp);
                                        }}
                                        className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                                        title="Show documentation"
                                    >
                                        <InformationCircleIcon className="h-4 w-4" />
                                    </button>
                                    {showCopyrightHelp && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowCopyrightHelp(false)}
                                            />
                                            <div className="absolute left-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                                <h4 className="font-semibold text-[#0c0e0a] mb-2">
                                                    License Information
                                                </h4>
                                                <div className="text-sm text-gray-600 space-y-2">
                                                    <p>
                                                        Specify licenses for your container and any included software:
                                                    </p>
                                                    <div>
                                                        <strong>Options:</strong>
                                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                                            <li><strong>SPDX Licenses:</strong> Choose from common standardized licenses</li>
                                                            <li><strong>Custom License:</strong> Specify your own license name and URL</li>
                                                        </ul>
                                                    </div>
                                                    <p>
                                                        This is important for legal compliance and distribution.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#f0f7e7] transition-colors"
                                onClick={addCopyright}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add License
                            </button>
                        </div>

                        {(recipe.copyright || []).length === 0 ? (
                            <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="mb-2">No licenses specified</p>
                                <p className="text-sm">
                                    Click &quot;Add License&quot; to specify
                                    licensing information
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(recipe.copyright || []).map((info, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-[#f0f7e7] rounded-md border border-[#e6f1d6] relative"
                                    >
                                        <button
                                            className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                            onClick={() =>
                                                handleDeleteClick(index)
                                            }
                                            title="Delete license"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-[#1e2a16]">
                                                    License Identifier
                                                </label>
                                                {customLicenseIndex === index ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                                            value={info.license}
                                                            onChange={(e) =>
                                                                updateCopyright(index, {
                                                                    ...info,
                                                                    license: e.target.value,
                                                                })
                                                            }
                                                            placeholder="e.g., Proprietary, Custom License v1.0"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="text-xs px-2 py-1 bg-[#6aa329] text-white rounded hover:bg-[#4f7b38] transition-colors"
                                                                onClick={() => setCustomLicenseIndex(null)}
                                                            >
                                                                Done
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                                                onClick={() => {
                                                                    updateCopyright(index, { ...info, license: "", url: "" });
                                                                    setCustomLicenseIndex(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <LicenseDropdown
                                                        value={info.license}
                                                        onChange={(license, url) =>
                                                            handleLicenseChange(index, license, url)
                                                        }
                                                        onCustomLicense={() => handleCustomLicense(index)}
                                                        placeholder="Select or search for a license"
                                                    />
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {isCustomLicense(index)
                                                        ? "Custom license name"
                                                        : "SPDX license identifiers are preferred"
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-[#1e2a16]">
                                                    License URL
                                                </label>
                                                <input
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] bg-white"
                                                    value={info.url}
                                                    onChange={(e) =>
                                                        updateCopyright(index, {
                                                            ...info,
                                                            url: e.target.value,
                                                        })
                                                    }
                                                    placeholder="https://opensource.org/licenses/MIT"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Link to the full license text
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Type Switch Warning Modal */}
            {showInputTypeWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Switch Documentation Input?
                                    </h3>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                You have existing documentation content. Switching to{" "}
                                {pendingInputType === "content" ? "content entry" : "URL input"}{" "}
                                will clear your current{" "}
                                {inputType === "content" ? "written content" : "URL"}.
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={cancelInputTypeSwitch}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                                    onClick={confirmInputTypeSwitch}
                                >
                                    Switch Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrashIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Delete License
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        License #{deleteConfirmIndex + 1}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this license
                                information? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={cancelDelete}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    onClick={() =>
                                        removeCopyright(deleteConfirmIndex)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}