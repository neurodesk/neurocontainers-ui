import {
    TrashIcon,
    FolderIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import type { JSX } from "react";
import { Directive, GroupDirective } from "@/components/common";
import DirectiveComponent from "./factory";
import { registerDirective, DirectiveMetadata } from "./registry";
import { DirectiveContainer, FormField, Input, ToggleButtonGroup, TagEditor } from "@/components/ui";
import { getButtons, iconStyles, textStyles, cn } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import { DirectiveControllers } from "../ui/DirectiveContainer";

// Lazy import to avoid circular dependency
const AddDirectiveButton = lazy(() => import("@/components/add"));

interface BaseGroupEditorArgument {
    name: string;
    required: boolean;
    description?: string;
    advanced?: boolean;
}

export type GroupEditorArgument = (BaseGroupEditorArgument & {
    type: "dropdown";
    options: string[];
    defaultValue?: string;
}) | (BaseGroupEditorArgument & {
    type: "text";
    defaultValue?: string;
    multiline?: boolean;
}) | (BaseGroupEditorArgument & {
    // the array is represented as space separated strings
    type: "array";
    defaultValue?: string[];
}) | (BaseGroupEditorArgument & {
    type: "boolean";
    defaultValue?: boolean;
});

// Initialize the group editors registry at module level
const groupEditors: Map<string, GroupEditor> = new Map();

export interface GroupEditor {
    metadata: DirectiveMetadata;
    arguments: GroupEditorArgument[];
    helpContent: (isDark: boolean) => JSX.Element;
    updateDirective: (args: Record<string, unknown>) => GroupDirective;
}

export function createGroupEditorComponent(editorInfo: GroupEditor) {
    return function CustomGroupEditorComponent({
        group,
        onChange: onGroupChange,
        customParams = {},
        controllers,
    }: {
        group: Directive[];
        baseImage: string;
        onChange: (group: Directive[], params: Record<string, unknown>) => void;
        customParams?: Record<string, unknown>;
        controllers: DirectiveControllers;
    }) {
        const { isDark } = useTheme();
        const [showAdvanced, setShowAdvanced] = useState(false);
        const initializedRef = useRef(false);

        const onChangeWrapper = (updatedGroup: Directive[], params: Record<string, unknown>) => {
            console.log("Group updated:", updatedGroup, "Params:", params);
            onGroupChange(updatedGroup, params);
        };

        // Initialize with default values if no custom params exist
        const getDefaultParams = () => {
            const defaults: Record<string, unknown> = {};
            editorInfo.arguments.forEach(arg => {
                if ('defaultValue' in arg && arg.defaultValue !== undefined) {
                    defaults[arg.name] = arg.defaultValue;
                }
            });
            return defaults;
        };

        // If no custom params exist, initialize with defaults
        const currentParams = Object.keys(customParams).length > 0 ? customParams : getDefaultParams();

        // Update a single parameter and regenerate directives
        const updateParameter = (key: string, value: unknown) => {
            const updatedParams = { ...currentParams, [key]: value };

            // Generate new directives
            const updatedDirective = editorInfo.updateDirective(updatedParams);
            onChangeWrapper(updatedDirective.group, updatedParams);
        };

        // Auto-initialize on first render if no custom params exist
        useEffect(() => {
            if (!initializedRef.current && Object.keys(customParams).length === 0) {
                const defaultParams = getDefaultParams();

                // Generate initial directives
                const updatedDirective = editorInfo.updateDirective(defaultParams);
                onChangeWrapper(updatedDirective.group, defaultParams);
                initializedRef.current = true;
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [customParams]);

        const renderArgument = (arg: GroupEditorArgument) => {
            const getDefaultValue = () => {
                if (arg.type === 'boolean' && 'defaultValue' in arg) {
                    return arg.defaultValue ?? false;
                }
                if (arg.type === 'text' && 'defaultValue' in arg) {
                    return arg.defaultValue ?? '';
                }
                if (arg.type === 'array' && 'defaultValue' in arg) {
                    return arg.defaultValue ?? [];
                }
                return '';
            };

            const currentValue = currentParams[arg.name] ?? getDefaultValue();

            if (arg.advanced && !showAdvanced) return null;

            switch (arg.type) {
                case 'dropdown':
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <select
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent"
                                value={String(currentValue)}
                                onChange={(e) => updateParameter(arg.name, e.target.value)}
                            >
                                {arg.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </FormField>
                    );

                case 'boolean':
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <ToggleButtonGroup
                                options={[
                                    { value: 'true', label: 'Yes' },
                                    { value: 'false', label: 'No' }
                                ]}
                                value={String(currentValue)}
                                onChange={(value) => updateParameter(arg.name, value === 'true')}
                            />
                        </FormField>
                    );

                case 'array':
                    const displayName = arg.name
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            <TagEditor
                                tags={Array.isArray(currentValue) ? currentValue : []}
                                onChange={(tags) => updateParameter(arg.name, tags)}
                                placeholder={`Add ${displayName.toLowerCase()}...`}
                                emptyMessage={`No ${displayName.toLowerCase()} added yet`}
                            />
                        </FormField>
                    );

                case 'text':
                default:
                    return (
                        <FormField key={arg.name} label={arg.name} description={arg.description}>
                            {arg.multiline ? (
                                <textarea
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent font-mono"
                                    rows={6}
                                    value={String(currentValue)}
                                    onChange={(e) => updateParameter(arg.name, e.target.value)}
                                    placeholder={`Enter ${arg.name}`}
                                />
                            ) : (
                                <Input
                                    value={String(currentValue)}
                                    onChange={(e) => updateParameter(arg.name, e.target.value)}
                                    placeholder={`Enter ${arg.name}`}
                                    monospace
                                />
                            )}
                        </FormField>
                    );
            }
        };

        const basicArgs = editorInfo.arguments.filter(arg => !arg.advanced);
        const advancedArgs = editorInfo.arguments.filter(arg => arg.advanced);

        return (
            <DirectiveContainer
                title={editorInfo.metadata.label}
                helpContent={editorInfo.helpContent(isDark)}
                controllers={controllers}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className={textStyles(isDark, { size: 'sm', weight: 'medium', color: 'secondary' })}>
                            {editorInfo.metadata.label} Configuration
                        </h4>
                        <button
                            onClick={() => {
                                // Remove custom properties and switch to advanced mode
                                onChangeWrapper(group, {});
                            }}
                            className={cn(getButtons(isDark).secondary, "text-xs")}
                            title="Switch to advanced mode for full control (cannot be undone)"
                        >
                            Switch to Advanced Mode
                        </button>
                    </div>

                    {basicArgs.map(renderArgument)}
                </div>

                {
                    advancedArgs.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className={textStyles(isDark, { size: 'sm', weight: 'medium', color: 'secondary' })}>Advanced Settings</h4>
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className={cn(getButtons(isDark).secondary, "text-xs")}
                                >
                                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                                </button>
                            </div>
                            {showAdvanced && (
                                <div className="space-y-4 border-l-4 border-[#d3e7b6] pl-4">
                                    {advancedArgs.map(renderArgument)}
                                </div>
                            )}
                        </div>
                    )
                }
            </DirectiveContainer >
        );
    };
}

export function registerGroupEditor(name: string, editor: GroupEditor) {
    groupEditors.set(name, editor);
    const component = createGroupEditorComponent(editor);
    const metadata = {
        ...editor.metadata,
        component
    };
    registerDirective(metadata);
}

export function getGroupEditor(name: string): GroupEditor | undefined {
    return groupEditors.get(name);
}

export default function GroupDirectiveComponent({
    group,
    baseImage,
    onChange,
    condition,
    onConditionChange,
    headerColor,
    borderColor,
    iconColor,
    icon,
    controllers,
}: {
    group: Directive[];
    baseImage: string;
    onChange: (group: Directive[]) => void;
    condition?: string;
    onConditionChange?: (condition: string | undefined) => void;
    headerColor?: { light: string, dark: string };
    borderColor?: { light: string, dark: string };
    iconColor?: { light: string, dark: string };
    icon?: React.ComponentType<{ className?: string }>;
    controllers: DirectiveControllers,
}) {
    const { isDark } = useTheme();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
        null
    );
    const lastDirectiveRef = useRef<HTMLDivElement>(null);
    const shouldScrollToNew = useRef(false);

    const handleDirectiveChange = (
        index: number,
        updatedDirective: Directive
    ) => {
        const updatedGroup = [...group];
        updatedGroup[index] = updatedDirective;
        onChange(updatedGroup);
    };

    const addDirective = (directive: Directive, index?: number) => {
        // Only scroll if adding at the end (no index specified or index is at the end)
        shouldScrollToNew.current = index === undefined || index >= group.length;
        const updatedGroup = [...group];
        if (index !== undefined) {
            updatedGroup.splice(index, 0, directive);
        } else {
            updatedGroup.push(directive);
        }
        onChange(updatedGroup);
    };

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
    }, [group.length]);

    const removeDirective = (index: number) => {
        const updatedGroup = group.filter((_, i) => i !== index);
        onChange(updatedGroup);
        setDeleteConfirmIndex(null);
    };

    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const cancelDelete = () => {
        setDeleteConfirmIndex(null);
    };

    const moveDirective = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= group.length) return;

        const updatedGroup = [...group];
        [updatedGroup[index], updatedGroup[newIndex]] = [
            updatedGroup[newIndex],
            updatedGroup[index],
        ];

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
        <>
            <DirectiveContainer
                title={`Group Directive (${group.length} item${group.length !== 1 ? "s" : ""})`}
                condition={condition}
                onConditionChange={onConditionChange}
                headerColor={headerColor}
                borderColor={borderColor}
                iconColor={iconColor}
                icon={icon}
                controllers={controllers}
            >
                <div className="space-y-2">
                    {group.length === 0 ? (
                        <Suspense fallback={<div>Loading...</div>}>
                            <AddDirectiveButton
                                onAddDirective={addDirective}
                                variant="empty"
                                index={0}
                                emptyText={{
                                    title: "No items in group",
                                    subtitle: "Click here to add directives to this group"
                                }}
                            />
                        </Suspense>
                    ) : (
                        <>
                            {/* First add button - only shows when there are items */}
                            <div className="py-1">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <AddDirectiveButton
                                        onAddDirective={addDirective}
                                        variant="inline"
                                        index={0}
                                    />
                                </Suspense>
                            </div>

                            {group.map((directive, index) => (
                                <div key={index}>
                                    {/* Directive */}
                                    <div
                                        ref={
                                            index === group.length - 1
                                                ? lastDirectiveRef
                                                : null
                                        }
                                        className={`transition-all duration-200 ${draggedIndex === index
                                            ? "opacity-50"
                                            : ""
                                            } ${dragOverIndex === index && !document.body.hasAttribute("data-list-editor-dragging")
                                                ? "border-t-2 border-[#6aa329] pt-2"
                                                : ""
                                            }`}
                                    >
                                        {/* Directive Content */}
                                        <div className="w-full">
                                            <DirectiveComponent
                                                directive={directive}
                                                baseImage={baseImage}
                                                onChange={(updated) =>
                                                    handleDirectiveChange(
                                                        index,
                                                        updated
                                                    )
                                                }
                                                controllers={{
                                                    onMoveUp: () => moveDirective(index, "up"),
                                                    onMoveDown: () => moveDirective(index, "down"),
                                                    onDelete: () => handleDeleteClick(index),
                                                    canMoveUp: index !== 0,
                                                    canMoveDown: index !== group.length - 1,
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
                                    </div>

                                    {/* Add button after this directive */}
                                    <div className="py-1">
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <AddDirectiveButton
                                                onAddDirective={addDirective}
                                                variant="inline"
                                                index={index + 1}
                                            />
                                        </Suspense>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </DirectiveContainer>

            {/* Delete Confirmation Modal */}
            {deleteConfirmIndex !== null && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrashIcon className={cn(iconStyles(isDark, 'lg'), "text-red-600")} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Delete Group Item
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Item {deleteConfirmIndex + 1} in group
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this item from
                                the group? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className={cn(getButtons(isDark).secondary, "text-sm")}
                                    onClick={cancelDelete}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={cn("px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors")}
                                    onClick={() =>
                                        removeDirective(deleteConfirmIndex)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Register this directive
export const groupDirectiveMetadata: DirectiveMetadata = {
    key: "group",
    label: "Group",
    description: "Group related directives together",
    icon: FolderIcon,
    color: { light: "bg-green-50 border-green-200 hover:bg-green-100", dark: "bg-green-900 border-green-700 hover:bg-green-800" },
    headerColor: { light: "bg-green-50", dark: "bg-green-900" },
    borderColor: { light: "border-green-200", dark: "border-green-700" },
    iconColor: { light: "text-green-600", dark: "text-green-400" },
    defaultValue: { group: [] as Directive[] },
    keywords: ["group", "folder", "organize", "collection"],
    component: GroupDirectiveComponent,
};

registerDirective(groupDirectiveMetadata);