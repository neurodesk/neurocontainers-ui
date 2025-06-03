import { ChevronDownIcon, ChevronRightIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function EnvironmentDirectiveComponent({
    environment,
    onChange
}: {
    environment: { [key: string]: string },
    onChange: (environment: { [key: string]: string }) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const addEnvironmentVariable = () => {
        onChange({ ...environment, "": "" });
    };

    const updateKey = (oldKey: string, newKey: string) => {
        const updated = { ...environment };
        const value = updated[oldKey];
        delete updated[oldKey];
        updated[newKey] = value;
        onChange(updated);
    };

    const updateValue = (key: string, value: string) => {
        onChange({ ...environment, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...environment };
        delete updated[key];
        onChange(updated);
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
                <h2 className="text-[#0c0e0a] font-medium">Environment Variables</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm text-[#1e2a16]">
                        <div className="col-span-5">Key</div>
                        <div className="col-span-6">Value</div>
                        <div className="col-span-1"></div>
                    </div>

                    {Object.entries(environment).map(([key, value], index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                            <input
                                className="font-mono col-span-5 px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={key}
                                onChange={(e) => updateKey(key, e.target.value)}
                            />
                            <input
                                className="font-mono col-span-6 px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                                value={value}
                                onChange={(e) => updateValue(key, e.target.value)}
                            />
                            <button
                                className="col-span-1 flex justify-center items-center text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeVariable(key)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="mt-3 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={addEnvironmentVariable}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Environment Variable
                    </button>
                </div>
            )}
        </div>
    );
}
