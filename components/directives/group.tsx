import { ChevronDownIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Directive } from "@/components/common";
import DirectiveComponent from "./factory";
import AddDirectiveButton from "@/components/add";

export default function GroupDirectiveComponent({
    group,
    onChange,
}: {
    group: Directive[];
    onChange: (group: Directive[]) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleDirectiveChange = (index: number, updatedDirective: Directive) => {
        const updatedGroup = [...group];
        updatedGroup[index] = updatedDirective;
        onChange(updatedGroup);
    };

    const addDirective = (directive: Directive) => {
        onChange([...group, directive]);
    };

    const removeDirective = (index: number) => {
        const updatedGroup = group.filter((_, i) => i !== index);
        onChange(updatedGroup);
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
                <h2 className="text-[#0c0e0a] font-medium">Group Directive</h2>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {group.map((directive, index) => (
                        <div key={index} className="mb-3 last:mb-0 relative">
                            <DirectiveComponent
                                directive={directive}
                                onChange={(updated) => handleDirectiveChange(index, updated)}
                            />
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-[#6aa329]"
                                onClick={() => removeDirective(index)}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    <div className="mt-4">
                        <AddDirectiveButton onAddDirective={addDirective} />
                    </div>
                </div>
            )}
        </div>
    );
}