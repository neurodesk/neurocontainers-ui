import { TrashIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Variable } from "@/components/common";

export function VariableComponent({ variable, onChange }: { variable: Variable, onChange?: (variable: Variable) => void }) {
    if (typeof variable === 'string') {
        return (
            <input
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                value={variable}
                onChange={(e) => onChange && onChange(e.target.value)}
            />
        );
    } else if (Array.isArray(variable)) {
        return (
            <div className="space-y-2">
                {variable.map((item, index) => (
                    <div key={index} className="flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={JSON.stringify(item)}
                            onChange={(e) => {
                                if (onChange) {
                                    try {
                                        const updated = [...variable];
                                        updated[index] = JSON.parse(e.target.value);
                                        onChange(updated);
                                    } catch (err) {
                                        // Handle parse error
                                    }
                                }
                            }}
                        />
                        {onChange && (
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329]"
                                onClick={() => {
                                    const updated = variable.filter((_, i) => i !== index);
                                    onChange(updated);
                                }}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ))}
                {onChange && (
                    <button
                        className="mt-1 flex items-center text-sm text-[#4f7b38] hover:text-[#6aa329]"
                        onClick={() => onChange([...variable, ""])}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Item
                    </button>
                )}
            </div>
        );
    } else {
        return (
            <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] min-h-[80px] font-mono text-sm"
                value={JSON.stringify(variable, null, 2)}
                onChange={(e) => {
                    if (onChange) {
                        try {
                            onChange(JSON.parse(e.target.value));
                        } catch (err) {
                            // Handle parse error
                        }
                    }
                }}
            />
        );
    }
}

export default function VariableDirectiveComponent({
    variables,
    onChange
}: {
    variables: { [key: string]: Variable },
    onChange: (variables: { [key: string]: Variable }) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newVarKey, setNewVarKey] = useState("");

    const updateVariable = (key: string, value: Variable) => {
        onChange({ ...variables, [key]: value });
    };

    const removeVariable = (key: string) => {
        const updated = { ...variables };
        delete updated[key];
        onChange(updated);
    };

    const addVariable = () => {
        if (newVarKey.trim()) {
            onChange({ ...variables, [newVarKey]: "" });
            setNewVarKey("");
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
                <h2 className="text-[#0c0e0a] font-medium">Variables</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {Object.entries(variables).map(([key, value], index) => (
                        <div key={index} className="mb-4 last:mb-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-sm text-[#1e2a16]">{key}</span>
                                <button
                                    className="text-gray-400 hover:text-[#6aa329]"
                                    onClick={() => removeVariable(key)}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                <VariableComponent
                                    variable={value}
                                    onChange={(updated) => updateVariable(key, updated)}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            placeholder="New variable name"
                            value={newVarKey}
                            onChange={(e) => setNewVarKey(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                        />
                        <button
                            className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38]"
                            onClick={addVariable}
                        >
                            Add Variable
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}