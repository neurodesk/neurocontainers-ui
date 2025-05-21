import {
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon,
    XIcon,
} from "@heroicons/react/outline";
import { useState } from "react";
import { DeployInfo } from "@/components/common";

export default function DeployDirectiveComponent({
    deploy,
    onChange,
}: {
    deploy: DeployInfo;
    onChange: (deploy: DeployInfo) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newPath, setNewPath] = useState("");
    const [newBin, setNewBin] = useState("");

    const addPath = () => {
        if (newPath.trim() !== "") {
            onChange({
                ...deploy,
                path: [...(deploy.path || []), newPath.trim()],
            });
            setNewPath("");
        }
    };

    const removePath = (index: number) => {
        onChange({
            ...deploy,
            path: (deploy.path || []).filter((_, i) => i !== index),
        });
    };

    const addBin = () => {
        if (newBin.trim() !== "") {
            onChange({
                ...deploy,
                bins: [...(deploy.bins || []), newBin.trim()],
            });
            setNewBin("");
        }
    };

    const removeBin = (index: number) => {
        onChange({
            ...deploy,
            bins: (deploy.bins || []).filter((_, i) => i !== index),
        });
    };

    const handlePathKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addPath();
        }
    };

    const handleBinKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addBin();
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
                <h2 className="text-[#0c0e0a] font-medium">Deploy</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Paths</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {(deploy.path || []).map((path, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-[#f0f7e7] px-3 py-1 rounded-md border border-[#e6f1d6]"
                                >
                                    <span className="font-mono text-[#0c0e0a] mr-2">{path}</span>
                                    <button
                                        onClick={() => removePath(index)}
                                        className="text-[#4f7b38] hover:text-[#3a5c29]"
                                        aria-label={`Remove ${path}`}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {(deploy.path || []).length === 0 && (
                                <div className="text-sm text-gray-500 italic">
                                    No paths added yet
                                </div>
                            )}
                        </div>

                        <div className="flex">
                            <input
                                type="text"
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                placeholder="Add a path..."
                                value={newPath}
                                onChange={(e) => setNewPath(e.target.value)}
                                onKeyDown={handlePathKeyDown}
                            />
                            <button
                                onClick={addPath}
                                className="bg-[#6aa329] hover:bg-[#4f7b38] text-white px-3 py-2 rounded-r-md flex items-center"
                                disabled={newPath.trim() === ""}
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm text-[#1e2a16]">Binaries</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {(deploy.bins || []).map((bin, index) => (
                                <div
                                    key={index}
                                    className="flex items-center bg-[#f0f7e7] px-3 py-1 rounded-md border border-[#e6f1d6]"
                                >
                                    <span className="font-mono text-[#0c0e0a] mr-2">{bin}</span>
                                    <button
                                        onClick={() => removeBin(index)}
                                        className="text-[#4f7b38] hover:text-[#3a5c29]"
                                        aria-label={`Remove ${bin}`}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {(deploy.bins || []).length === 0 && (
                                <div className="text-sm text-gray-500 italic">
                                    No binaries added yet
                                </div>
                            )}
                        </div>

                        <div className="flex">
                            <input
                                type="text"
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                placeholder="Add a binary..."
                                value={newBin}
                                onChange={(e) => setNewBin(e.target.value)}
                                onKeyDown={handleBinKeyDown}
                            />
                            <button
                                onClick={addBin}
                                className="bg-[#6aa329] hover:bg-[#4f7b38] text-white px-3 py-2 rounded-r-md flex items-center"
                                disabled={newBin.trim() === ""}
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
