import { ChevronDownIcon, ChevronRightIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function CopyDirectiveComponent({
    copy,
    onChange
}: {
    copy: string[] | string,
    onChange: (copy: string[]) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addPath = () => {
        onChange([...copy, ""]);
    };

    const updatePath = (index: number, value: string) => {
        const updated = [...copy];
        updated[index] = value;
        onChange(updated);
    };

    const copyAsArray = Array.isArray(copy) ? copy : copy.split(" ");

    const removePath = (index: number) => {
        onChange(copyAsArray.filter((_, i) => i !== index));
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
                <h2 className="text-[#0c0e0a] font-medium">Copy</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {copyAsArray.map((path, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={path}
                                onChange={(e) => updatePath(index, e.target.value)}
                                placeholder="source:destination"
                            />
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removePath(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-2 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addPath}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Path
                    </button>
                </div>
            )}
        </div>
    );
}