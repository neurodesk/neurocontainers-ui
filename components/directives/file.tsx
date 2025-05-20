import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { FileInfo } from "@/components/common";

export default function FileDirectiveComponent({
    file,
    onChange
}: {
    file: FileInfo,
    onChange: (file: FileInfo) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const updateName = (value: string) => {
        onChange({ ...file, name: value });
    };

    const updateFilename = (value: string) => {
        onChange({ ...file, filename: value });
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
                <h2 className="text-[#0c0e0a] font-medium">File: {file.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Filename</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={file.filename}
                            onChange={(e) => updateFilename(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}