import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { DeployInfo } from "@/components/common";

export default function DeployDirectiveComponent({
    deploy,
    onChange
}: {
    deploy: DeployInfo,
    onChange: (deploy: DeployInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addPath = () => {
        onChange({
            ...deploy,
            path: [...(deploy.path || []), ""]
        });
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...(deploy.path || [])];
        updated[index] = value;
        onChange({ ...deploy, path: updated });
    };

    const removePath = (index: number) => {
        onChange({
            ...deploy,
            path: (deploy.path || []).filter((_, i) => i !== index)
        });
    };

    const addBin = () => {
        onChange({
            ...deploy,
            bins: [...(deploy.bins || []), ""]
        });
    };

    const updateBin = (index: number, value: string) => {
        const updated = [...(deploy.bins || [])];
        updated[index] = value;
        onChange({ ...deploy, bins: updated });
    };

    const removeBin = (index: number) => {
        onChange({
            ...deploy,
            bins: (deploy.bins || []).filter((_, i) => i !== index)
        });
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
                <h2 className="text-[#0c0e0a] font-medium">Deploy</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Paths</h3>
                            <button
                                className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                                onClick={addPath}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Path
                            </button>
                        </div>

                        {(deploy.path || []).map((path, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={path}
                                    onChange={(e) => updatePath(index, e.target.value)}
                                    placeholder="/path/to/deploy"
                                />
                                <button
                                    className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removePath(index)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Binaries</h3>
                            <button
                                className="text-sm text-[#4f7b38] hover:text-[#6aa329] flex items-center"
                                onClick={addBin}
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Binary
                            </button>
                        </div>

                        {(deploy.bins || []).map((bin, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                    value={bin}
                                    onChange={(e) => updateBin(index, e.target.value)}
                                    placeholder="binary-name"
                                />
                                <button
                                    className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removeBin(index)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}