import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CopyrightInfo } from "@/components/common";
import { FormField, Input } from "./FormField";
import LicenseDropdown from "./LicenseDropdown";

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

    const addLicense = () => {
        const newLicense = { license: "", url: "" };
        onChange([...licenses, newLicense]);
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
        setCustomLicenseIndex(index);
    };

    const isCustomLicense = (index: number) => {
        if (!licenses[index]) return false;
        const license = licenses[index].license;
        // Check if it's not in SPDX list (simplified check)
        const commonSpdxIds = ['MIT', 'Apache-2.0', 'GPL-3.0', 'GPL-2.0', 'BSD-3-Clause', 'BSD-2-Clause'];
        return !commonSpdxIds.includes(license) && license;
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <button
                    className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#f0f7e7] transition-colors"
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
                            className="p-4 bg-[#f0f7e7] rounded-md border border-[#e6f1d6] relative"
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
                                    label="License Identifier"
                                    description={
                                        isCustomLicense(index)
                                            ? "Custom license name"
                                            : "SPDX license identifiers are preferred"
                                    }
                                >
                                    {customLicenseIndex === index ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={info.license}
                                                onChange={(e) =>
                                                    updateLicense(index, {
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
                                            value={info.license}
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
                                    description="Link to the full license text"
                                >
                                    <Input
                                        value={info.url}
                                        onChange={(e) =>
                                            updateLicense(index, {
                                                ...info,
                                                url: e.target.value,
                                            })
                                        }
                                        placeholder="https://opensource.org/licenses/MIT"
                                    />
                                </FormField>
                            </div>
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