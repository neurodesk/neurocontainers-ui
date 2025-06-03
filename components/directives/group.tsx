import {
    ChevronDownIcon,
    ChevronRightIcon,
    TrashIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
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
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastDirectiveRef = useRef<HTMLDivElement>(null);

    const handleDirectiveChange = (
        index: number,
        updatedDirective: Directive
    ) => {
        const updatedGroup = [...group];
        updatedGroup[index] = updatedDirective;
        onChange(updatedGroup);
    };

    const addDirective = (directive: Directive) => {
        onChange([...group, directive]);
    };

    // Scroll to the newly added directive
    useEffect(() => {
        if (lastDirectiveRef.current && group.length > 0) {
            setTimeout(() => {
                lastDirectiveRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }, 100);
        }
    }, [group.length]);

    const removeDirective = (index: number) => {
        const updatedGroup = group.filter((_, i) => i !== index);
        onChange(updatedGroup);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const updatedGroup = [...group];
        const draggedItem = updatedGroup[draggedIndex];

        // Remove the dragged item
        updatedGroup.splice(draggedIndex, 1);

        // Insert at the new position
        const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        updatedGroup.splice(insertIndex, 0, draggedItem);

        onChange(updatedGroup);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
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
                <div className="p-4 border-t border-[#e6f1d6]" ref={containerRef}>
                    {group.map((directive, index) => (
                        <div
                            key={index}
                            ref={index === group.length - 1 ? lastDirectiveRef : null}
                            className={`mb-3 last:mb-0 relative transition-all duration-200 ${draggedIndex === index ? "opacity-50" : ""
                                } ${dragOverIndex === index
                                    ? "border-t-2 border-[#6aa329] pt-2"
                                    : ""
                                }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex items-start gap-2">
                                <button
                                    className="mt-3 text-gray-400 hover:text-[#6aa329] cursor-grab active:cursor-grabbing flex-shrink-0"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <Bars3Icon className="h-5 w-5" />
                                </button>

                                <div className="flex-1">
                                    <DirectiveComponent
                                        directive={directive}
                                        onChange={(updated) => handleDirectiveChange(index, updated)}
                                    />
                                </div>

                                <button
                                    className="mt-3 text-gray-400 hover:text-[#6aa329] flex-shrink-0"
                                    onClick={() => removeDirective(index)}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
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