import { TrashIcon, PlusIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useState, ReactNode } from "react";
import { iconStyles, textStyles, buttonStyles, cardStyles, cn } from "@/lib/styles";
import { colors } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";

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
    const { isDark } = useTheme();
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
                <div className={cn(cardStyles(isDark, 'default', 'md'), "mb-3")}>
                    <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "text-center")}>
                        {emptyMessage}
                    </p>
                </div>
                <button
                    className={cn(
                        buttonStyles(isDark, 'ghost', 'sm'),
                        "flex items-center gap-1 px-0"
                    )}
                    onClick={addItem}
                >
                    <PlusIcon className={iconStyles(isDark, 'sm')} />
                    {addButtonText}
                </button>
            </div>
        );
    }

    return (
        <div className={className}>
            {items.length > 0 && (
                <div className="space-y-1.5 mb-3">
                    {items.map((item, index) => {
                        // Insert placeholder before this item if needed
                        const showPlaceholderBefore = dragOverIndex === index && draggedIndex !== null;
                        // Insert placeholder after this item if it's the last item and dragOverIndex is beyond
                        const showPlaceholderAfter = index === items.length - 1 && dragOverIndex === items.length && draggedIndex !== null;

                        return (
                            <div key={index}>
                                {/* Drop indicator before current item */}
                                {showPlaceholderBefore && (
                                    <div
                                        className="h-0.5 rounded-full mx-3 mb-1 opacity-75 transition-opacity duration-150"
                                        style={{
                                            backgroundColor: isDark ? colors.primaryDark[500] : colors.primary[500]
                                        }}
                                    ></div>
                                )}

                                <div
                                    className={cn(
                                        "flex transition-all duration-150 border rounded-md will-change-transform",
                                        isDark ? "bg-[#161a0e]" : "bg-white",
                                        focusedIndex === index
                                            ? (isDark
                                                ? "border-[#7bb33a] shadow-sm"
                                                : "border-[#6aa329] shadow-sm")
                                            : (isDark ? "border-[#374151]" : "border-gray-200"),
                                        draggedIndex === index && "opacity-30 scale-95"
                                    )}
                                    onDragOver={allowReorder ? (e) => handleDragOver(e, index) : undefined}
                                    onDragLeave={allowReorder ? handleDragLeave : undefined}
                                    onDrop={allowReorder ? handleDrop : undefined}
                                >
                                    {allowReorder && (
                                        <div
                                            className={cn(
                                                "flex items-start px-2 py-2 rounded-l-md cursor-grab active:cursor-grabbing touch-manipulation select-none transition-colors",
                                                isDark
                                                    ? "bg-[#2d4222] hover:bg-[#374151]"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            )}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onTouchStart={(e) => e.stopPropagation()}
                                        >
                                            <Bars3Icon className={cn(iconStyles(isDark, 'sm', 'muted'))} />
                                        </div>
                                    )}
                                    <div className={`flex-grow ${allowReorder ? "" : "rounded-l-md"}`} style={{ overflow: 'visible' }}>
                                        {renderItem(item, index, (updatedItem) => updateItem(index, updatedItem))}
                                    </div>
                                    <button
                                        className={cn(
                                            "px-2 py-2 rounded-r-md flex items-start transition-colors",
                                            isDark
                                                ? "bg-[#1f2e18] text-[#9ca3af] hover:text-[#7bb33a]"
                                                : "bg-[#f0f8e8] text-gray-400 hover:text-[#4f7b38]"
                                        )}
                                        onClick={() => removeItem(index)}
                                    >
                                        <TrashIcon className={cn(iconStyles(isDark, 'sm'), "mt-0.5")} />
                                    </button>
                                </div>

                                {/* Drop indicator after current item (only for last item) */}
                                {showPlaceholderAfter && (
                                    <div
                                        className="h-0.5 rounded-full mx-3 mt-1 opacity-75 transition-opacity duration-150"
                                        style={{
                                            backgroundColor: isDark ? colors.primaryDark[500] : colors.primary[500]
                                        }}
                                    ></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                className={cn(
                    buttonStyles(isDark, 'ghost', 'sm'),
                    "flex items-center gap-1 px-0"
                )}
                onClick={addItem}
            >
                <PlusIcon className={iconStyles(isDark, 'sm')} />
                {addButtonText}
            </button>
        </div>
    );
}