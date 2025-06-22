import { useState } from "react";
import {
    PlusIcon,
    TrashIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ScaleIcon
} from "@heroicons/react/24/outline";
import { CopyrightInfo } from "@/components/common";
import { FormField, Input } from "./FormField";
import LicenseDropdown from "./LicenseDropdown";
import spdxLicenses from "./licenses.json";
import { iconStyles, cardStyles, textStyles, cn, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import { DirectiveControllers } from "./DirectiveContainer";

interface LicenseSectionProps {
    licenses: CopyrightInfo[];
    onChange: (licenses: CopyrightInfo[]) => void;
    onAddLicense?: (index?: number) => void;
    showAddButton?: boolean;
    renderAddButton?: (addLicense: () => void) => React.ReactNode;
    onMoveLicense?: (index: number, direction: "up" | "down") => void;
    onReorderLicenses?: (licenses: CopyrightInfo[]) => void;
}

export default function LicenseSection({
    licenses,
    onChange,
    onAddLicense,
    showAddButton = true,
    renderAddButton,
    onMoveLicense,
    onReorderLicenses
}: LicenseSectionProps) {
    const { isDark } = useTheme();
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [customLicenseIndex, setCustomLicenseIndex] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const updateLicense = (index: number, info: CopyrightInfo) => {
        const updated = [...licenses];
        updated[index] = info;
        onChange(updated);
    };

    const getLicenseIdentifier = (info: CopyrightInfo): string => {
        return 'license' in info ? info.license : info.name;
    };

    const setLicenseIdentifier = (info: CopyrightInfo, identifier: string): CopyrightInfo => {
        if ('license' in info) {
            return { ...info, license: identifier };
        } else {
            return { ...info, name: identifier };
        }
    };

    const addLicense = (index?: number) => {
        if (onAddLicense) {
            onAddLicense(index);
        } else {
            const newLicense = { license: "", url: "" };
            const updatedLicenses = [...licenses];
            if (index !== undefined) {
                updatedLicenses.splice(index, 0, newLicense);
            } else {
                updatedLicenses.push(newLicense);
            }
            onChange(updatedLicenses);
        }
    };

    const validateLicense = (info: CopyrightInfo): string[] => {
        const errors: string[] = [];

        const identifier = getLicenseIdentifier(info);

        if (!identifier?.trim()) {
            errors.push("License identifier is required");
        }

        if (info.url && info.url.trim() && !/^https?:\/\/.+/.test(info.url)) {
            errors.push("License URL must be a valid HTTP/HTTPS URL");
        }

        // For SPDX licenses (license property), validate that it's a valid SPDX identifier
        if ('license' in info && info.license?.trim()) {
            const isValidSpdx = spdxLicenses.licenses
                .filter(l => !l.isDeprecatedLicenseId)
                .some(l => l.licenseId === info.license);

            if (!isValidSpdx) {
                errors.push(`"${info.license}" is not a valid SPDX license identifier. Use a custom license instead or select a valid SPDX license.`);
            }
        }

        // For custom licenses (name property), URL is strongly recommended
        if ('name' in info && !info.url?.trim()) {
            errors.push("Custom licenses should include a URL to the license text for legal clarity");
        }

        // Check for potentially problematic custom license names
        if ('name' in info && identifier?.trim()) {
            const name = identifier.trim();
            if (name.length < 2) {
                errors.push("License name should be at least 2 characters");
            }
        }

        return errors;
    };

    const removeLicense = (index: number) => {
        onChange(licenses.filter((_, i) => i !== index));
        setDeleteConfirmIndex(null);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const cancelDelete = () => {
        setDeleteConfirmIndex(null);
    };

    const handleLicenseChange = (index: number, license: string, url: string) => {
        updateLicense(index, { license, url });
    };

    const handleCustomLicense = (index: number) => {
        // Convert to custom license format
        const currentInfo = licenses[index];
        const currentIdentifier = getLicenseIdentifier(currentInfo);
        updateLicense(index, { name: currentIdentifier || "", url: currentInfo.url || "" });
        setCustomLicenseIndex(index);
    };

    const isCustomLicense = (index: number) => {
        if (!licenses[index]) return false;
        const info = licenses[index];

        // If it has a 'name' property, it's a CustomCopyrightInfo
        if ('name' in info) return true;

        // If it has a 'license' property, check if it's in SPDX list
        if ('license' in info) {
            const license = info.license;
            if (!license || !license.trim()) return false;

            const spdxLicenseIds = spdxLicenses.licenses
                .filter(l => !l.isDeprecatedLicenseId)
                .map(l => l.licenseId);
            return !spdxLicenseIds.includes(license);
        }

        return false;
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const updatedLicenses = [...licenses];
        const draggedItem = updatedLicenses[draggedIndex];

        // Remove the dragged item
        updatedLicenses.splice(draggedIndex, 1);

        // Insert at the new position
        const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        updatedLicenses.splice(insertIndex, 0, draggedItem);

        if (onReorderLicenses) {
            onReorderLicenses(updatedLicenses);
        } else {
            onChange(updatedLicenses);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleMoveLicense = (index: number, direction: "up" | "down") => {
        if (onMoveLicense) {
            onMoveLicense(index, direction);
        } else {
            // Fallback implementation if onMoveLicense is not provided
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= licenses.length) return;

            const updatedLicenses = [...licenses];
            const temp = updatedLicenses[index];
            updatedLicenses[index] = updatedLicenses[newIndex];
            updatedLicenses[newIndex] = temp;
            onChange(updatedLicenses);
        }
    };

    const AddLicenseButton = () => (
        <button
            className={cn(buttonStyles(isDark, 'primary', 'md'), "flex items-center gap-2")}
            onClick={() => addLicense()}
        >
            <PlusIcon className={iconStyles(isDark, 'sm')} />
            Add License
        </button>
    );

    const InlineAddButton = ({ index }: { index: number }) => (
        <div className="py-1">
            <button
                type="button"
                onClick={() => addLicense(index)}
                className={cn(
                    "group flex items-center justify-center gap-2 w-full py-1.5",
                    "border border-dashed rounded-md transition-all duration-200",
                    "opacity-50 hover:opacity-100",
                    isDark
                        ? "text-[#9ca3af] hover:text-[#7bb33a] hover:bg-[#1f2e18] border-[#374151] hover:border-[#7bb33a]"
                        : "text-gray-400 hover:text-[#6aa329] hover:bg-[#f8fdf2] border-gray-300 hover:border-[#6aa329]"
                )}
            >
                <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className={cn(
                    "text-xs font-medium hidden sm:inline",
                    isDark
                        ? "text-[#9ca3af] group-hover:text-[#7bb33a]"
                        : "text-gray-500 group-hover:text-[#6aa329]"
                )}>
                    Add license
                </span>
            </button>
        </div>
    );

    return (
        <>
            {showAddButton && !renderAddButton && (
                <div className="flex items-center justify-end mb-4">
                    <AddLicenseButton />
                </div>
            )}

            {licenses.length === 0 ? (
                <button
                    onClick={() => addLicense(0)}
                    className={cn(
                        "group w-full text-center py-8",
                        "border-2 border-dashed rounded-lg transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        isDark
                            ? "text-[#9ca3af] border-[#374151] hover:border-[#7bb33a] hover:bg-[#1f2e18] focus:ring-[#7bb33a]"
                            : "text-gray-500 border-gray-200 hover:border-[#6aa329] hover:bg-[#f8fdf2] focus:ring-[#6aa329]"
                    )}
                >
                    <p className={cn(
                        "mb-2",
                        isDark ? "group-hover:text-[#7bb33a]" : "group-hover:text-[#6aa329]"
                    )}>
                        No licenses specified
                    </p>
                    <p className={cn(
                        "text-sm",
                        isDark ? "group-hover:text-[#7bb33a]" : "group-hover:text-[#6aa329]"
                    )}>
                        Click here to add licensing information
                    </p>
                </button>
            ) : (
                <>
                    {/* First add button - only shows when there are licenses */}
                    <InlineAddButton index={0} />

                    {licenses.map((info, index) => {
                        const controllers: DirectiveControllers = {
                            onMoveUp: () => handleMoveLicense(index, "up"),
                            onMoveDown: () => handleMoveLicense(index, "down"),
                            onDelete: () => handleDeleteClick(index),
                            canMoveUp: index > 0,
                            canMoveDown: index < licenses.length - 1,
                            stepNumber: index + 1,
                            draggable: true,
                            onDragStart: (e) => handleDragStart(e, index),
                            onDragOver: (e) => handleDragOver(e, index),
                            onDragLeave: handleDragLeave,
                            onDrop: (e) => handleDrop(e, index),
                            onDragEnd: handleDragEnd,
                        };

                        return (
                            <div key={`license-${index}`}>
                                {/* License Container using DirectiveContainer style */}
                                <div
                                    className={cn(
                                        cardStyles(isDark, "default", "zero"),
                                        isDark ? "border-[#2d4222]" : "border-gray-200",
                                        draggedIndex === index ? "opacity-50" : "",
                                        dragOverIndex === index ? "border-t-2 border-[#6aa329] pt-2" : ""
                                    )}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    {/* Header with DirectiveContainer style */}
                                    <div className={cn(
                                        "flex items-center w-full p-1 rounded-t-md",
                                        isDark ? "bg-[#1f2e18]" : "bg-[#f0f7e7]"
                                    )}>                                    {/* Left-aligned Controls */}
                                        <div className="flex items-center gap-0.5 mr-2 flex-shrink-0">
                                            {/* Drag Handle */}
                                            <button
                                                className={cn(
                                                    "cursor-grab active:cursor-grabbing transition-colors p-1 flex items-center justify-center",
                                                    isDark
                                                        ? "text-[#9ca3af] hover:text-[#7bb33a]"
                                                        : "text-gray-400 hover:text-[#6aa329]"
                                                )}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                title="Drag to reorder"
                                            >
                                                <Bars3Icon className={iconStyles(isDark, 'sm')} />
                                            </button>

                                            {/* Step Number */}
                                            <div className={cn(
                                                "px-1.5 py-0.5 rounded text-xs font-medium min-w-[1.5rem] text-center flex items-center justify-center",
                                                isDark ? "bg-[#374151] text-[#d1d5db]" : "bg-gray-200 text-gray-600"
                                            )}>
                                                {index + 1}
                                            </div>

                                            {/* Reorder Controls - Vertically Centered */}
                                            <div className="flex flex-col -space-y-px">
                                                <button
                                                    className={cn(
                                                        "transition-colors p-0.5 flex items-center justify-center",
                                                        iconStyles(isDark, 'sm'),
                                                        controllers.canMoveUp
                                                            ? (isDark
                                                                ? "text-[#d1d5db] hover:text-[#7bb33a]"
                                                                : "text-gray-600 hover:text-[#6aa329]")
                                                            : (isDark ? "text-[#6b7280] cursor-not-allowed" : "text-gray-300 cursor-not-allowed")
                                                    )}
                                                    onClick={controllers.onMoveUp}
                                                    disabled={!controllers.canMoveUp}
                                                    title="Move up"
                                                >
                                                    <ChevronUpIcon className="w-3 h-3" />
                                                </button>
                                                <button
                                                    className={cn(
                                                        "transition-colors p-0.5 flex items-center justify-center",
                                                        iconStyles(isDark, 'sm'),
                                                        controllers.canMoveDown
                                                            ? (isDark
                                                                ? "text-[#d1d5db] hover:text-[#7bb33a]"
                                                                : "text-gray-600 hover:text-[#6aa329]")
                                                            : (isDark ? "text-[#6b7280] cursor-not-allowed" : "text-gray-300 cursor-not-allowed")
                                                    )}
                                                    onClick={controllers.onMoveDown}
                                                    disabled={!controllers.canMoveDown}
                                                    title="Move down"
                                                >
                                                    <ChevronDownIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                className={cn(
                                                    "transition-colors p-1 flex items-center justify-center",
                                                    isDark
                                                        ? "text-[#f87171] hover:text-[#ef4444]"
                                                        : "text-[#ef4444] hover:text-red-600"
                                                )}
                                                onClick={controllers.onDelete}
                                                title="Delete license"
                                            >
                                                <TrashIcon className={iconStyles(isDark, 'sm')} />
                                            </button>
                                        </div>

                                        {/* Icon and Title */}
                                        <ScaleIcon className={cn(
                                            iconStyles(isDark, 'md'),
                                            "mr-2",
                                            isDark ? "text-[#d1d5db]" : "text-gray-600"
                                        )} />
                                        <h2 className={cn(textStyles(isDark, { size: 'base', weight: 'medium', color: 'primary' }), "flex-1")}>
                                            License {index + 1}
                                            {isCustomLicense(index) && (
                                                <span className={cn(
                                                    "ml-2 text-xs px-1.5 py-0.5 rounded",
                                                    isDark ? "bg-[#374151] text-[#d1d5db]" : "bg-gray-200 text-gray-600"
                                                )}>
                                                    Custom
                                                </span>
                                            )}
                                        </h2>
                                    </div>


                                    <div className={cn(
                                        "border-t",
                                        isDark ? "border-[#2d4222]" : "border-[#e6f1d6]"
                                    )}>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    label={
                                                        <div className="flex items-center gap-2">
                                                            <span>License Identifier</span>
                                                            {isCustomLicense(index) && (
                                                                <span className={cn(
                                                                    "text-xs px-1.5 py-0.5 rounded",
                                                                    isDark ? "bg-[#374151] text-[#d1d5db]" : "bg-gray-100 text-gray-600"
                                                                )}>
                                                                    Custom
                                                                </span>
                                                            )}
                                                        </div>
                                                    }
                                                    description={
                                                        isCustomLicense(index)
                                                            ? "Custom license name or identifier"
                                                            : "SPDX license identifiers are preferred for standardization"
                                                    }
                                                >
                                                    {customLicenseIndex === index ? (
                                                        <div className="space-y-2">
                                                            <Input
                                                                value={getLicenseIdentifier(info)}
                                                                onChange={(e) =>
                                                                    updateLicense(index, setLicenseIdentifier(info, e.target.value))
                                                                }
                                                                placeholder="e.g., Proprietary, Custom License v1.0, Company Internal License"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "text-xs px-2 py-1 rounded transition-colors disabled:cursor-not-allowed",
                                                                        isDark
                                                                            ? "bg-[#7bb33a] text-white hover:bg-[#4f7b38] disabled:bg-[#6b7280]"
                                                                            : "bg-[#6aa329] text-white hover:bg-[#4f7b38] disabled:bg-gray-300"
                                                                    )}
                                                                    onClick={() => setCustomLicenseIndex(null)}
                                                                    disabled={!getLicenseIdentifier(info)?.trim()}
                                                                >
                                                                    Done
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "text-xs px-2 py-1 rounded transition-colors",
                                                                        isDark
                                                                            ? "bg-[#374151] text-[#d1d5db] hover:bg-[#4b5563]"
                                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                    )}
                                                                    onClick={() => {
                                                                        updateLicense(index, { license: "", url: "" });
                                                                        setCustomLicenseIndex(null);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <LicenseDropdown
                                                            value={getLicenseIdentifier(info)}
                                                            onChange={(license, url) =>
                                                                handleLicenseChange(index, license, url)
                                                            }
                                                            onCustomLicense={() => handleCustomLicense(index)}
                                                            placeholder="Select or search for a license"
                                                        />
                                                    )}
                                                </FormField>

                                                <FormField
                                                    label="License URL"
                                                    description={isCustomLicense(index) ? "Link to your custom license text" : "Link to the full license text"}
                                                >
                                                    <Input
                                                        value={info.url}
                                                        onChange={(e) =>
                                                            updateLicense(index, {
                                                                ...info,
                                                                url: e.target.value,
                                                            })
                                                        }
                                                        placeholder={isCustomLicense(index) ? "https://example.com/license.txt" : "https://opensource.org/licenses/MIT"}
                                                    />
                                                </FormField>
                                            </div>

                                            {/* Show validation errors */}
                                            {validateLicense(info).length > 0 && (
                                                <div className={cn(
                                                    "mt-3 p-3 border rounded text-sm",
                                                    isDark
                                                        ? "bg-red-900/20 border-red-700 text-red-400"
                                                        : "bg-red-50 border-red-200 text-red-600"
                                                )}>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {validateLicense(info).map((error, errorIndex) => (
                                                            <li key={errorIndex}>{error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Add button after this license */}
                                <InlineAddButton index={index + 1} />
                            </div>
                        );
                    })}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmIndex !== null && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className={cn(
                        "rounded-lg shadow-xl max-w-md w-full",
                        isDark ? "bg-[#161a0e]" : "bg-white"
                    )}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                    isDark ? "bg-red-900/30" : "bg-red-100"
                                )}>
                                    <TrashIcon className={cn(
                                        "h-6 w-6",
                                        isDark ? "text-red-400" : "text-red-600"
                                    )} />
                                </div>
                                <div>
                                    <h3 className={cn(
                                        "text-lg font-medium",
                                        isDark ? "text-[#e5e7eb]" : "text-gray-900"
                                    )}>Delete License</h3>
                                    <p className={cn(
                                        "text-sm",
                                        isDark ? "text-[#9ca3af]" : "text-gray-500"
                                    )}>License #{deleteConfirmIndex + 1}</p>
                                </div>
                            </div>
                            <p className={cn(
                                "mb-6",
                                isDark ? "text-[#d1d5db]" : "text-gray-700"
                            )}>
                                Are you sure you want to delete this license information? This action
                                cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                        isDark
                                            ? "text-[#d1d5db] bg-[#374151] hover:bg-[#4b5563]"
                                            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                                    )}
                                    onClick={cancelDelete}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium text-white rounded-md transition-colors",
                                        isDark ? "bg-red-600 hover:bg-red-700" : "bg-red-600 hover:bg-red-700"
                                    )}
                                    onClick={() => removeLicense(deleteConfirmIndex)}
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