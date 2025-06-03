import {
    ChevronDownIcon,
    ChevronRightIcon,
    TrashIcon,
    PlusIcon,
    QuestionMarkCircleIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";

export default function RunCommandDirectiveComponent({
    run,
    onChange,
}: {
    run: string[];
    onChange: (run: string[]) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showDocumentation, setShowDocumentation] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    // Update refs array when run array changes
    useEffect(() => {
        textareaRefs.current = textareaRefs.current.slice(0, run.length);
    }, [run.length]);

    const addCommand = () => {
        onChange([...run, ""]);
        // Focus the new textarea after it's rendered
        setTimeout(() => {
            const newIndex = run.length;
            textareaRefs.current[newIndex]?.focus();
        }, 0);
    };

    const updateCommand = (index: number, value: string) => {
        const updated = [...run];
        updated[index] = value;
        onChange(updated);
    };

    const removeCommand = (index: number) => {
        onChange(run.filter((_, i) => i !== index));
    };

    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        // Use line height to calculate minimum height for single line
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const padding = 16; // py-2 = 8px top + 8px bottom
        const minHeight = lineHeight + padding;
        textarea.style.height = Math.max(minHeight, scrollHeight) + "px";
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        index: number
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            // Insert new command after current one
            const newRun = [...run];
            newRun.splice(index + 1, 0, "");
            onChange(newRun);

            // Focus the new textarea after it's rendered
            setTimeout(() => {
                textareaRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        index: number
    ) => {
        updateCommand(index, e.target.value);
        adjustTextareaHeight(e.target);
    };

    // Adjust height on mount and when content changes
    useEffect(() => {
        textareaRefs.current.forEach((textarea) => {
            if (textarea) {
                adjustTextareaHeight(textarea);
            }
        });
    }, [run]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.stopPropagation();
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only clear drag over if we're leaving the component entirely
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newRun = [...run];
        const draggedItem = newRun[draggedIndex];

        // Remove the dragged item
        newRun.splice(draggedIndex, 1);

        // Insert at the new position (adjust index if we removed an item before the drop position)
        const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newRun.splice(adjustedDropIndex, 0, draggedItem);

        onChange(newRun);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
                <h2 className="text-[#0c0e0a] font-medium flex-grow">Run Commands</h2>
                <div className="relative">
                    <button
                        className="text-[#4f7b38] hover:text-[#6aa329] p-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDocumentation(!showDocumentation);
                        }}
                        title="Show documentation"
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                    </button>
                    {showDocumentation && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDocumentation(false)}
                            />
                            <div className="absolute right-0 top-8 w-80 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-20">
                                <h3 className="font-semibold text-[#0c0e0a] mb-2">
                                    RUN Directive
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        The RUN instruction executes commands in a new layer on top
                                        of the current image and commits the results.
                                    </p>
                                    <div>
                                        <strong>Usage:</strong>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>All lines are concatenated together as a single Docker layer</li>
                                            <li>Press Enter to add a new command</li>
                                            <li>Press Shift+Enter for a new line within a command</li>
                                            <li>Drag the handle to reorder commands</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong>Examples:</strong>
                                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1 whitespace-pre-wrap">
                                            {`mkdir -p /app/data`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-[#e6f1d6]">
                    {run.map((command, index) => (
                        <div
                            key={`command-${index}`}
                            className={`flex mb-2 transition-opacity ${draggedIndex === index ? "opacity-50" : ""
                                } ${dragOverIndex === index ? "border-t-2 border-[#6aa329]" : ""
                                }`}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div
                                className="flex items-start px-2 py-2 bg-gray-50 border border-gray-200 rounded-l-md cursor-grab active:cursor-grabbing hover:bg-gray-100"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                            >
                                <Bars3Icon className="h-4 w-4 text-gray-400 mt-1" />
                            </div>
                            <textarea
                                ref={(el) => { (textareaRefs.current[index] = el) }}
                                className="font-mono flex-grow px-3 py-2 border border-gray-200 border-l-0 text-[#0c0e0a] focus:outline-none focus:ring-1 focus:ring-[#6aa329] focus:border-[#6aa329] resize-none overflow-hidden leading-5"
                                value={command}
                                onChange={(e) => handleTextareaChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                placeholder="Command to run (Enter for new command, Shift+Enter for new line)"
                                rows={1}
                            />
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] border border-gray-200 border-l-0 rounded-r-md text-gray-400 hover:text-[#6aa329] flex items-start"
                                onClick={() => removeCommand(index)}
                            >
                                <TrashIcon className="h-5 w-5 mt-1" />
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