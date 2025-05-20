import { ChevronDownIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Template } from "@/components/common";
import { VariableComponent } from "@/components/directives/variable";

export default function TemplateDirectiveComponent({
    template,
    onChange
}: {
    template: Template,
    onChange: (template: Template) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newParamKey, setNewParamKey] = useState("");

    const updateName = (name: string) => {
        onChange({ ...template, name });
    };

    const updateParam = (key: string, value: unknown) => {
        onChange({ ...template, [key]: value });
    };

    const removeParam = (key: string) => {
        if (key === 'name') return; // Don't allow removing the name

        const updated = { ...template };
        delete updated[key];
        onChange(updated);
    };

    const addParam = () => {
        if (newParamKey.trim() && newParamKey !== 'name') {
            onChange({ ...template, [newParamKey]: "" });
            setNewParamKey("");
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
                <h2 className="text-[#0c0e0a] font-medium">Template: {template.name}</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium text-sm text-[#1e2a16]">Template Name</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            value={template.name}
                            onChange={(e) => updateName(e.target.value)}
                        />
                    </div>

                    {Object.entries(template).map(([key, value]) => {
                        if (key === 'name') return null;
                        return (
                            <div key={key} className="mb-4 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <label className="block font-medium text-sm text-[#1e2a16]">{key}</label>
                                    <button
                                        className="text-gray-400 hover:text-[#6aa329]"
                                        onClick={() => removeParam(key)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="pl-4 border-l-2 border-[#d3e7b6]">
                                    <VariableComponent
                                        variable={value}
                                        onChange={(updated) => updateParam(key, updated)}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-4 flex">
                        <input
                            className="flex-grow px-3 py-2 border border-gray-200 rounded-l-md text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329]"
                            placeholder="New parameter name"
                            value={newParamKey}
                            onChange={(e) => setNewParamKey(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addParam()}
                        />
                        <button
                            className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38]"
                            onClick={addParam}
                        >
                            Add Parameter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}