import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CopyrightInfo } from "@/components/common";
import { FormField, Input } from "./FormField";
import LicenseDropdown from "./LicenseDropdown";
import spdxLicenses from "./licenses.json";

interface LicenseSectionProps {
    licenses: CopyrightInfo[];
    onChange: (licenses: CopyrightInfo[]) => void;
}

export default function LicenseSection({ licenses, onChange }: LicenseSectionProps) {
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [customLicenseIndex, setCustomLicenseIndex] = useState<number | null>(null);

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

    const addLicense = () => {
        const newLicense = { license: "", url: "" };
        onChange([...licenses, newLicense]);
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

    return (
        <>
            <div className="flex items-center justify-end mb-4">
                <button
                    className="text-sm text-white bg-[#6aa329] hover:bg-[#4f7b38] flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                    onClick={addLicense}
                >
                    <PlusIcon className="h-4 w-4" />
                    Add License
                </button>
            </div>

            {licenses.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="mb-2">No licenses specified</p>
                    <p className="text-sm">Click &quot;Add License&quot; to specify licensing information</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {licenses.map((info, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-md border border-gray-200 relative"
                        >
                            <button
                                className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                onClick={() => handleDeleteClick(index)}
                                title="Delete license"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                <FormField
                                    label={
                                        <div className="flex items-center gap-2">
                                            <span>License Identifier</span>
                                            {isCustomLicense(index) && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
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
                                                    className="text-xs px-2 py-1 bg-[#6aa329] text-white rounded hover:bg-[#4f7b38] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                    onClick={() => setCustomLicenseIndex(null)}
                                                    disabled={!getLicenseIdentifier(info)?.trim()}
                                                >
                                                    Done
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
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
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                    <ul className="list-disc list-inside space-y-1">
                                        {validateLicense(info).map((error, errorIndex) => (
                                            <li key={errorIndex}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmIndex !== null && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrashIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Delete License</h3>
                                    <p className="text-sm text-gray-500">License #{deleteConfirmIndex + 1}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this license information? This action
                                cannot be undone.
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