import { TrashIcon, PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useState, ReactNode } from "react";
import { iconStyles, textStyles, cn } from "@/lib/styles";

interface ListEditorProps<T> {
    items: T[];
    onChange: (items: T[]) => void;
    renderItem: (item: T, index: number, onChange: (item: T) => void) => ReactNode;
    createNewItem: () => T;
    addButtonText?: string;
    emptyMessage?: string;
    allowReorder?: boolean;
    className?: string;
    focusedIndex?: number | null;
}

export default function ListEditor<T>({
    items,
    onChange,
    renderItem,
    createNewItem,
    addButtonText = "Add Item",
    emptyMessage,
    allowReorder = false,
    className = "",
    focusedIndex = null,
}: ListEditorProps<T>) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const addItem = () => {
        onChange([...items, createNewItem()]);
    };

    const updateItem = (index: number, item: T) => {
        const updated = [...items];
        updated[index] = item;
        onChange(updated);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (!allowReorder) return;
        e.stopPropagation(); // Prevent parent drag handlers
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Disable text selection during drag
        document.body.style.userSelect = "none";
        // Add a data attribute to prevent parent drag styling
        document.body.setAttribute("data-list-editor-dragging", "true");
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        if (!allowReorder) return;
        e.preventDefault();
        e.stopPropagation(); // Prevent parent drag handlers
        e.dataTransfer.dropEffect = "move";
        
        // Determine if we're in the top or bottom half of the element
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        // Add a small deadzone (20% from center) to reduce sensitivity
        const deadzone = rect.height * 0.1;
        let insertIndex;
        
        if (e.clientY < midY - deadzone) {
            insertIndex = index;
        } else if (e.clientY > midY + deadzone) {
            insertIndex = index + 1;
        } else {
            // In deadzone, don't change if we already have a valid dragOverIndex
            insertIndex = dragOverIndex !== null ? dragOverIndex : index;
        }
        
        setDragOverIndex(insertIndex);
    };

    const handleDragLeave = () => {
        if (!allowReorder) return;
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!allowReorder) return;
        e.preventDefault();
        e.stopPropagation(); // Prevent parent drag handlers

        if (draggedIndex === null || dragOverIndex === null) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            // Clean up drag state
            document.body.style.userSelect = "";
            document.body.removeAttribute("data-list-editor-dragging");
            return;
        }

        const updatedItems = [...items];
        const draggedItem = updatedItems[draggedIndex];

        // Remove the dragged item
        updatedItems.splice(draggedIndex, 1);

        // Insert at the new position using dragOverIndex
        const insertIndex = draggedIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
        updatedItems.splice(insertIndex, 0, draggedItem);

        onChange(updatedItems);
        setDraggedIndex(null);
        setDragOverIndex(null);
        // Re-enable text selection and remove drag indicator
        document.body.style.userSelect = "";
        document.body.removeAttribute("data-list-editor-dragging");
    };

    const handleDragEnd = () => {
        if (!allowReorder) return;
        setDraggedIndex(null);
        setDragOverIndex(null);
        // Re-enable text selection and remove drag indicator
        document.body.style.userSelect = "";
        document.body.removeAttribute("data-list-editor-dragging");
    };

    if (items.length === 0 && emptyMessage) {
        return (
            <div className={className}>
                <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className={cn(textStyles({ size: 'sm', color: 'muted' }), "text-center")}>
                        {emptyMessage}
                    </p>
                </div>
                <button
                    className={cn("flex items-center", textStyles({ size: 'sm', color: 'secondary' }), "hover:text-[#6aa329]")}
                    onClick={addItem}
                >
                    <PlusIcon className={cn(iconStyles('sm'), "mr-1")} />
                    {addButtonText}
                </button>
            </div>
        );
    }

    return (
        <div className={className}>
            {items.length > 0 && (
                <div className="space-y-2 mb-4">
                    {items.map((item, index) => {
                        // Insert placeholder before this item if needed
                        const showPlaceholderBefore = dragOverIndex === index && draggedIndex !== null;
                        // Insert placeholder after this item if it's the last item and dragOverIndex is beyond
                        const showPlaceholderAfter = index === items.length - 1 && dragOverIndex === items.length && draggedIndex !== null;
                        
                        return (
                            <div key={index}>
                                {/* Drop indicator before current item */}
                                {showPlaceholderBefore && (
                                    <div className="h-1 bg-[#6aa329] rounded-full mx-4 mb-2 opacity-75 transition-opacity duration-150"></div>
                                )}
                                
                                <div
                                    className={`flex transition-all duration-150 border rounded-md will-change-transform ${
                                        focusedIndex === index ? "border-[#6aa329]" : "border-gray-200"
                                    } ${
                                        draggedIndex === index ? "opacity-30 scale-95" : ""
                                    }`}
                                    onDragOver={allowReorder ? (e) => handleDragOver(e, index) : undefined}
                                    onDragLeave={allowReorder ? handleDragLeave : undefined}
                                    onDrop={allowReorder ? handleDrop : undefined}
                                >
                            {allowReorder && (
                                <div
                                    className="flex items-start px-3 py-3 bg-gray-50 rounded-l-md cursor-grab active:cursor-grabbing hover:bg-gray-100 touch-manipulation select-none"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <Bars3Icon className={cn(iconStyles('md'), "text-gray-400")} />
                                </div>
                            )}
                            <div className={`flex-grow ${allowReorder ? "" : "rounded-l-md"}`}>
                                {renderItem(item, index, (updatedItem) => updateItem(index, updatedItem))}
                            </div>
                            <button
                                className="px-3 py-2 bg-[#f0f7e7] rounded-r-md text-gray-400 hover:text-[#6aa329] flex items-start"
                                onClick={() => removeItem(index)}
                            >
                                <TrashIcon className={cn(iconStyles('md'), "mt-1")} />
                            </button>
                                </div>
                                
                                {/* Drop indicator after current item (only for last item) */}
                                {showPlaceholderAfter && (
                                    <div className="h-1 bg-[#6aa329] rounded-full mx-4 mt-2 opacity-75 transition-opacity duration-150"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                className={cn("flex items-center", textStyles({ size: 'sm', color: 'secondary' }), "hover:text-[#6aa329]")}
                onClick={addItem}
            >
                <PlusIcon className={cn(iconStyles('sm'), "mr-1")} />
                {addButtonText}
            </button>
        </div>
    );
}