"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ComputerDesktopIcon,
    TrashIcon,
    ClockIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe } from "@/components/common";
import { SavedContainer, getSavedContainers, formatTimeAgo } from "@/lib/containerStorage";
import { iconStyles, textStyles, inputStyles, cn, useThemeStyles, cardStyles, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface LocalContainersListProps {
    onLoadContainer: (container: ContainerRecipe, id: string) => void;
    onDeleteContainer: (id: string) => void;
    githubFiles?: { path: string; downloadUrl?: string; htmlUrl?: string }[];
}

export function LocalContainersList({
    onLoadContainer,
    onDeleteContainer,
    githubFiles = []
}: LocalContainersListProps) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);
    const [savedContainers, setSavedContainers] = useState<SavedContainer[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setSavedContainers(getSavedContainers());
    }, []);

    const isPublishedContainer = (containerName: string) => {
        return githubFiles.some(file => {
            const parts = file.path.split('/');
            const recipeName = parts[parts.length - 2] || '';
            return recipeName.toLowerCase() === containerName.toLowerCase();
        });
    };

    const filteredContainers = useMemo(() => {
        if (!searchTerm) return savedContainers;

        return savedContainers.filter(container => {
            const name = container.name.toLowerCase();
            const version = container.version.toLowerCase();
            const search = searchTerm.toLowerCase();

            return name.includes(search) || version.includes(search);
        });
    }, [savedContainers, searchTerm]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            onDeleteContainer(confirmDeleteId);
            setSavedContainers(getSavedContainers());
            setConfirmDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteId(null);
    };

    return (
        <div className={cn(cardStyles(isDark, 'elevated'), "h-fit")}>
            {/* Header */}
            <div
                className={cn("border-b p-4", isDark ? "border-[#2d4222]" : "border-[#e6f1d6]")}
            >
                <div className="flex items-center space-x-2 mb-2">
                    <ComputerDesktopIcon className={iconStyles(isDark, 'md', 'secondary')} />
                    <h2 className={textStyles(isDark, { size: 'lg', weight: 'semibold', color: 'primary' })}>
                        Recent Containers
                    </h2>
                    <div className={cn(
                        "px-2 py-1 rounded-full",
                        textStyles(isDark, { size: 'xs' }),
                        isDark ? "bg-[#2d4222] text-[#7bb33a]" : "bg-[#f0f7e7] text-[#4f7b38]"
                    )}>
                        Browser Only
                    </div>
                </div>
                <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>
                    {savedContainers.length} container{savedContainers.length !== 1 ? 's' : ''} recently worked on
                </p>
            </div>

            {/* Search */}
            {savedContainers.length > 0 && (
                <div
                    className={cn("p-4 border-b", isDark
                        ? "border-[#2d4222]"
                        : "border-[#f0f7e7]"
                    )}
                >
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search containers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(inputStyles(isDark), "pl-9")}
                        />
                    </div>
                    {searchTerm && (
                        <p className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "mt-2")}>
                            {filteredContainers.length} of {savedContainers.length} containers match
                        </p>
                    )}
                </div>
            )}

            {/* Container List */}
            <div className="max-h-96 overflow-y-auto">
                {savedContainers.length === 0 ? (
                    <div className="text-center py-12">
                        <ComputerDesktopIcon className={cn(iconStyles(isDark, 'lg', 'secondary'), "mx-auto mb-3 opacity-50 h-12 w-12")} />
                        <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>No containers saved yet</p>
                        <p className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "mt-1")}>Your work will appear here automatically</p>
                    </div>
                ) : filteredContainers.length === 0 ? (
                    <div className="text-center py-12">
                        <ComputerDesktopIcon className={cn(iconStyles(isDark, 'lg', 'secondary'), "mx-auto mb-3 opacity-50 h-12 w-12")} />
                        <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>No matching containers found</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className={cn(textStyles(isDark, { size: 'xs' }), "mt-1 hover:underline", isDark ? "text-[#7bb33a]" : "text-green-600")}
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className={cn("divide-y", isDark ? "divide-[#2d4222]" : "divide-[#f0f7e7]")}>
                        {filteredContainers.map((container) => (
                            <div
                                key={container.id}
                                className={cn(
                                    "group p-4 transition-colors",
                                    isDark ? "hover:bg-[#1f2616]" : "hover:bg-[#f0f7e7]"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <h3 className={cn(
                                            textStyles(isDark, { size: 'sm', weight: 'medium' }),
                                            "truncate",
                                            container.name === "Untitled"
                                                ? (isDark ? "text-gray-400 italic" : "text-gray-500 italic")
                                                : (isDark ? "text-[#d1d5db]" : "text-[#0c0e0a]")
                                        )}>
                                            {container.name}
                                        </h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className={textStyles(isDark, { size: 'xs', color: 'secondary' })}>
                                                v{container.version || '0.0.0'}
                                            </span>
                                            <span className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "flex items-center")}>
                                                <ClockIcon className={cn(iconStyles(isDark, 'sm'), "mr-1 h-3 w-3")} />
                                                {formatTimeAgo(container.lastModified)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={textStyles(isDark, { size: 'xs', color: 'muted' })}>
                                                {container.data.build.directives?.length || 0} build steps
                                            </span>
                                            {!isPublishedContainer(container.data.name) && (
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded-full text-xs",
                                                    isDark 
                                                        ? "bg-orange-900/60 text-orange-200 border border-orange-700/50" 
                                                        : "bg-orange-100 text-orange-700"
                                                )}>
                                                    Unpublished
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() => onLoadContainer(container.data, container.id)}
                                            className={cn(buttonStyles(isDark, 'primary', 'md'), "rounded-lg")}
                                        >
                                            Open
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(container.id, e)}
                                            className={cn(buttonStyles(isDark, 'ghost', 'sm'), "hover:text-red-600")}
                                            title="Delete container"
                                        >
                                            <TrashIcon className={iconStyles(isDark, 'sm')} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className={cn(styles.cards.default, "p-6 max-w-sm mx-4")}>
                        <h3 className={cn(textStyles(isDark, { size: 'lg', weight: 'semibold', color: 'primary' }), "mb-3")}>
                            Delete Container?
                        </h3>
                        <p className={cn(textStyles(isDark, { color: 'secondary' }), "mb-6")}>
                            This action cannot be undone. The container will be permanently removed from your browser.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDelete}
                                className={cn(buttonStyles(isDark, 'secondary', 'md'), "flex-1")}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className={cn(buttonStyles(isDark, 'danger', 'md'), "flex-1")}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}