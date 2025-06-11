import { useState, useRef, useEffect } from "react";
import {
    TrashIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";
import AddDirectiveButton from "@/components/add";

interface DirectivesListProps {
    directives: Directive[];
    baseImage: string;
    onAddDirective: (directive: Directive, index?: number) => void;
    onUpdateDirective: (index: number, directive: Directive) => void;
    onRemoveDirective: (index: number) => void;
    onMoveDirective: (index: number, direction: "up" | "down") => void;
    onReorderDirectives: (directives: Directive[]) => void;
}

interface DirectiveDeleteModalProps {
    isOpen: boolean;
    directiveIndex: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function DirectiveDeleteModal({
    isOpen,
    directiveIndex,
    onConfirm,
    onCancel,
}: DirectiveDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <TrashIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Delete Directive</h3>
                            <p className="text-sm text-gray-500">Step {directiveIndex + 1}</p>
                        </div>
                    </div>
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to delete this directive? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                            onClick={onConfirm}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DirectivesList({
    directives,
    baseImage,
    onAddDirective,
    onUpdateDirective,
    onRemoveDirective,
    onMoveDirective,
    onReorderDirectives,
}: DirectivesListProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [showDirectivesHelp, setShowDirectivesHelp] = useState(false);

    // Refs for scroll behavior - only for user-added directives
    const lastDirectiveRef = useRef<HTMLDivElement>(null);
    const shouldScrollToNew = useRef(false);

    // Scroll to newly added directive only when explicitly added by user
    useEffect(() => {
        if (shouldScrollToNew.current && lastDirectiveRef.current) {
            setTimeout(() => {
                lastDirectiveRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }, 100);
            shouldScrollToNew.current = false;
        }
    }, [directives.length]);

    const handleAddDirective = (directive: Directive, index?: number) => {
        // Only scroll if adding at the end (no index specified or index is at the end)
        shouldScrollToNew.current = index === undefined || index >= directives.length;
        onAddDirective(directive, index);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmIndex !== null) {
            onRemoveDirective(deleteConfirmIndex);
            setDeleteConfirmIndex(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmIndex(null);
    };

    // Drag and drop handlers
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

        const updatedDirectives = [...directives];
        const draggedItem = updatedDirectives[draggedIndex];

        // Remove the dragged item
        updatedDirectives.splice(draggedIndex, 1);

        // Insert at the new position
        const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        updatedDirectives.splice(insertIndex, 0, draggedItem);

        onReorderDirectives(updatedDirectives);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const directivesHelpContent = (
        <>
            <h4 className="font-semibold text-[#0c0e0a] mb-2">Directives</h4>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    Directives define the software and configurations to install in your container.
                </p>
                <div>
                    <strong>Key Points:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Executed in order - dependencies should be placed before software that requires them</li>
                        <li>Use drag and drop or arrow buttons to reorder directives</li>
                        <li>Each directive represents a specific installation or configuration step</li>
                        <li>Common directives: INSTALL (software), RUN (commands), ENV (environment variables)</li>
                    </ul>
                </div>
                <p>
                    <strong>💡 Tip:</strong> Start with system dependencies, then install your main software, and finish with configurations.
                </p>
            </div>
        </>
    );

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-[#0c0e0a]">Directives</h3>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {directives.length} directive{directives.length !== 1 ? "s" : ""}
                </div>
                <button
                    type="button"
                    className={`text-[#4f7b38] hover:text-[#6aa329] p-1 transition-colors ${showDirectivesHelp ? 'text-[#6aa329]' : ''}`}
                    onClick={() => setShowDirectivesHelp(!showDirectivesHelp)}
                    title={showDirectivesHelp ? "Hide documentation" : "Show documentation"}
                >
                    <InformationCircleIcon className="h-4 w-4" />
                </button>
            </div>

            {showDirectivesHelp && (
                <div className="mb-4 px-4 py-3 bg-[#fafcf7] border border-[#e6f1d6] rounded-md">
                    {directivesHelpContent}
                </div>
            )}

            <div className="space-y-2">
                {directives.length === 0 ? (
                    <AddDirectiveButton 
                        onAddDirective={handleAddDirective} 
                        variant="empty" 
                        index={0} 
                    />
                ) : (
                    <>
                        {/* First add button - only shows when there are directives */}
                        <div className="py-1">
                            <AddDirectiveButton 
                                onAddDirective={handleAddDirective} 
                                variant="inline" 
                                index={0} 
                            />
                        </div>

                        {directives.map((directive, index) => (
                            <div key={`directive-${index}`}>
                                {/* Directive */}
                                <div
                                    ref={index === directives.length - 1 ? lastDirectiveRef : null}
                                    className={`flex flex-col sm:flex-row gap-3 transition-all duration-200 ${
                                        draggedIndex === index ? "opacity-50" : ""
                                    } ${
                                        dragOverIndex === index &&
                                        !document.body.hasAttribute("data-list-editor-dragging")
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
                                    {/* Mobile: Horizontal Controls */}
                                    <div className="flex sm:hidden items-center justify-between bg-gray-50 p-2 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-gray-400 hover:text-[#6aa329] cursor-grab active:cursor-grabbing"
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >
                                                <Bars3Icon className="h-4 w-4" />
                                            </button>
                                            <span className="text-xs font-medium text-gray-600">
                                                Step {index + 1}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    className={`p-1.5 rounded ${
                                                        index === 0
                                                            ? "text-gray-300 cursor-not-allowed"
                                                            : "text-gray-600 hover:text-[#6aa329] hover:bg-white"
                                                    } transition-colors`}
                                                    onClick={() => onMoveDirective(index, "up")}
                                                    disabled={index === 0}
                                                    title="Move up"
                                                >
                                                    <ChevronUpIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className={`p-1.5 rounded ${
                                                        index === directives.length - 1
                                                            ? "text-gray-300 cursor-not-allowed"
                                                            : "text-gray-600 hover:text-[#6aa329] hover:bg-white"
                                                    } transition-colors`}
                                                    onClick={() => onMoveDirective(index, "down")}
                                                    disabled={index === directives.length - 1}
                                                    title="Move down"
                                                >
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-white"
                                                    onClick={() => handleDeleteClick(index)}
                                                    title="Delete directive"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Vertical Controls */}
                                    <div className="hidden sm:flex flex-col items-center pt-3 flex-shrink-0">
                                        <div className="flex flex-col bg-white border border-gray-300 rounded-md shadow-sm">
                                            <button
                                                className="p-2 border-b border-gray-200 text-gray-400 hover:text-[#6aa329] cursor-grab active:cursor-grabbing transition-colors"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                title="Drag to reorder"
                                            >
                                                <Bars3Icon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className={`p-2 border-b border-gray-200 ${
                                                    index === 0
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-600 hover:text-[#6aa329] hover:bg-[#f0f7e7]"
                                                } transition-colors`}
                                                onClick={() => onMoveDirective(index, "up")}
                                                disabled={index === 0}
                                                title="Move up"
                                            >
                                                <ChevronUpIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className={`p-2 border-b border-gray-200 ${
                                                    index === directives.length - 1
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-600 hover:text-[#6aa329] hover:bg-[#f0f7e7]"
                                                } transition-colors`}
                                                onClick={() => onMoveDirective(index, "down")}
                                                disabled={index === directives.length - 1}
                                                title="Move down"
                                            >
                                                <ChevronDownIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                onClick={() => handleDeleteClick(index)}
                                                title="Delete directive"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Directive Content */}
                                    <div className="flex-1 min-w-0">
                                        <DirectiveComponent
                                            directive={directive}
                                            baseImage={baseImage}
                                            onChange={(updated) => onUpdateDirective(index, updated)}
                                        />
                                    </div>
                                </div>

                                {/* Add button after this directive */}
                                <div className="py-1">
                                    <AddDirectiveButton 
                                        onAddDirective={handleAddDirective} 
                                        variant="inline" 
                                        index={index + 1} 
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <DirectiveDeleteModal
                isOpen={deleteConfirmIndex !== null}
                directiveIndex={deleteConfirmIndex ?? 0}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
}