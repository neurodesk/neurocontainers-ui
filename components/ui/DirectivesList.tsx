import { useState, useRef, useEffect } from "react";
import {
    TrashIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Directive } from "@/components/common";
import DirectiveComponent from "@/components/directives/factory";
import AddDirectiveButton from "@/components/add";
import { iconStyles, textStyles, buttonStyles, cn, getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
    const { isDark } = useTheme();
    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed inset-0 flex items-center justify-center z-50 p-4",
            isDark ? "bg-black/90" : "bg-black/80"
        )}>
            <div className={cn(
                "rounded-lg shadow-xl max-w-md w-full",
                isDark ? "bg-[#161a0e]" : "bg-white"
            )}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                            isDark ? "bg-red-900/30" : "bg-red-100"
                        )}>
                            <TrashIcon className={cn(
                                iconStyles(isDark, 'lg'),
                                isDark ? "text-red-400" : "text-red-600"
                            )} />
                        </div>
                        <div>
                            <h3 className={textStyles(isDark, { size: 'lg', weight: 'medium' })}>Delete Directive</h3>
                            <p className={textStyles(isDark, { size: 'sm', color: 'muted' })}>Step {directiveIndex + 1}</p>
                        </div>
                    </div>
                    <p className={cn(textStyles(isDark, { color: 'muted' }), "mb-6")}>
                        Are you sure you want to delete this directive? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            className={buttonStyles(isDark, 'secondary', 'md')}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className={buttonStyles(isDark, 'danger', 'md')}
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
    const { isDark } = useTheme();
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
            <h4 className={getHelpSection(isDark).title}>Directives</h4>
            <div className={cn(getHelpSection(isDark).text, "space-y-2")}>
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
                <h3 className={textStyles(isDark, { size: 'lg', weight: 'medium', color: 'primary' })}>Directives</h3>
                <div className={cn(
                    textStyles(isDark, { size: 'xs', color: 'muted' }),
                    "px-2 py-1 rounded",
                    isDark ? "bg-[#2d4222]" : "bg-gray-100"
                )}>
                    {directives.length} directive{directives.length !== 1 ? "s" : ""}
                </div>
                <button
                    type="button"
                    className={cn(
                        "p-1 transition-colors",
                        iconStyles(isDark, 'sm', 'primary'),
                        isDark
                            ? "hover:text-[#7bb33a]"
                            : "hover:text-[#6aa329]",
                        showDirectivesHelp && (isDark ? "text-[#7bb33a]" : "text-[#6aa329]")
                    )}
                    onClick={() => setShowDirectivesHelp(!showDirectivesHelp)}
                    title={showDirectivesHelp ? "Hide documentation" : "Show documentation"}
                >
                    <InformationCircleIcon className={iconStyles(isDark, 'sm')} />
                </button>
            </div>

            {showDirectivesHelp && (
                <div className={cn(getHelpSection(isDark).container, "mb-4")}>
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
                                    className={`transition-all duration-200 ${draggedIndex === index ? "opacity-50" : ""
                                        } ${dragOverIndex === index &&
                                            !document.body.hasAttribute("data-list-editor-dragging")
                                            ? (isDark ? "border-t-2 border-[#7bb33a] pt-2" : "border-t-2 border-[#6aa329] pt-2")
                                            : ""
                                        }`}
                                >
                                    {/* Directive Content with Integrated Controls */}
                                    <DirectiveComponent
                                        directive={directive}
                                        baseImage={baseImage}
                                        onChange={(updated) => onUpdateDirective(index, updated)}
                                        controllers={{
                                            onMoveUp: () => onMoveDirective(index, "up"),
                                            onMoveDown: () => onMoveDirective(index, "down"),
                                            onDelete: () => handleDeleteClick(index),
                                            canMoveUp: index !== 0,
                                            canMoveDown: index !== directives.length - 1,
                                            stepNumber: index + 1,
                                            draggable: true,
                                            onDragStart: (e) => handleDragStart(e, index),
                                            onDragOver: (e) => handleDragOver(e, index),
                                            onDragLeave: handleDragLeave,
                                            onDrop: (e) => handleDrop(e, index),
                                            onDragEnd: handleDragEnd,
                                        }}
                                    />
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