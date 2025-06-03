import { ChevronDownIcon, ChevronRightIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function RunCommandDirectiveComponent({
    run,
    onChange
}: {
    run: string[],
    onChange: (run: string[]) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addCommand = () => {
        onChange([...run, ""]);
    };

    const updateCommand = (index: number, value: string) => {
        const updated = [...run];
        updated[index] = value;
        onChange(updated);
    };

    const removeCommand = (index: number) => {
        onChange(run.filter((_, i) => i !== index));
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
                <h2 className="text-[#0c0e0a] font-medium">Run Commands</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {run.map((command, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={command}
                                onChange={(e) => updateCommand(index, e.target.value)}
                                placeholder="Command to run"
                            />
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeCommand(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-2 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addCommand}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Command
                    </button>
                </div>
            )}
        </div>
    );
}