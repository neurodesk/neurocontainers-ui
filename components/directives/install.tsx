import { ChevronDownIcon, ChevronRightIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function InstallDirectiveComponent({
    install,
    onChange,
}: {
    install: string | string[];
    onChange: (install: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [packages, setPackages] = useState<string[]>([]);
    const [newPackage, setNewPackage] = useState("");

    // Parse the install string into individual packages when component mounts or install changes
    useEffect(() => {
        if (typeof install === "string") {
            setPackages(install.split(/\s+/).filter((pkg) => pkg.trim() !== ""));
        } else if (Array.isArray(install)) {
            setPackages(install.filter((pkg) => pkg.trim() !== ""));
        } else {
            setPackages([]);
        }
    }, [install]);

    // Update the parent component when packages change
    const updatePackages = (newPackages: string[]) => {
        const newInstallString = newPackages.join(" ");
        onChange(newInstallString);
    };

    const addPackage = () => {
        if (newPackage.trim() !== "") {
            const updatedPackages = [...packages, newPackage.trim()];
            updatePackages(updatedPackages);
            setNewPackage("");
        }
    };

    const removePackage = (index: number) => {
        const updatedPackages = packages.filter((_, i) => i !== index);
        updatePackages(updatedPackages);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addPackage();
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
                <h2 className="text-[#0c0e0a] font-medium">Install</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {packages.map((pkg, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-[#f0f7e7] px-3 py-1 rounded-md border border-[#e6f1d6]"
                                >
                                    <span className="font-mono text-[#0c0e0a] mr-2">{pkg}</span>
                                    <button
                                        onClick={() => removePackage(index)}
                                        className="text-[#4f7b38] hover:text-[#3a5c29]"
                                        aria-label={`Remove ${pkg}`}
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex">
                            <input
                                type="text"
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                placeholder="Add a package..."
                                value={newPackage}
                                onChange={(e) => setNewPackage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                onClick={addPackage}
                                className="bg-[#6aa329] hover:bg-[#4f7b38] text-white px-3 py-2 rounded-r-md flex items-center"
                                disabled={newPackage.trim() === ""}
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
