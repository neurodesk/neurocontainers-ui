"use client";

import { useState, useMemo } from "react";
import { load as loadYAML } from "js-yaml";
import {
    CloudIcon,
    ComputerDesktopIcon,
    TrashIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe, migrateLegacyRecipe, mergeAdditionalFilesIntoRecipe } from "@/components/common";
import LocalFilesystem from "@/components/localFilesystem";
import { useGitHubFiles } from '@/lib/useGithub';
import { iconStyles, textStyles, inputStyles, cn, cardStyles, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface RemoteContainersListProps {
    onLoadRecipe: (recipe: ContainerRecipe) => void;
    onLoadLocalRecipe: (content: string, filename: string) => void;
    filesystemMode: 'local' | 'remote';
    onFilesystemModeChange: (mode: 'local' | 'remote') => void;
}

export function RemoteContainersList({
    onLoadRecipe,
    onLoadLocalRecipe,
    filesystemMode,
    onFilesystemModeChange
}: RemoteContainersListProps) {
    const { isDark } = useTheme();
    const { files, loading, error, refetch, clearCache } = useGitHubFiles("neurodesk", "neurocontainers", "main");
    const [loadingRecipe, setLoadingRecipe] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getRecipeName = (path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 2] || 'Unknown Recipe';
    };

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;

        return files.filter(file => {
            const recipeName = getRecipeName(file.path).toLowerCase();
            const path = file.path.toLowerCase();
            const search = searchTerm.toLowerCase();

            return recipeName.includes(search) || path.includes(search);
        });
    }, [files, searchTerm]);

    const handleLoadRecipe = async (file: {
        path: string;
        downloadUrl?: string;
    }) => {
        if (!file.downloadUrl || !onLoadRecipe) return;

        setLoadingRecipe(file.path);
        try {
            const response = await fetch(file.downloadUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch recipe: ${response.statusText}`);
            }

            const yamlText = await response.text();
            let parsedRecipe = loadYAML(yamlText) as ContainerRecipe;

            parsedRecipe = migrateLegacyRecipe(parsedRecipe);
            parsedRecipe = await mergeAdditionalFilesIntoRecipe(
                parsedRecipe,
                async (filename: string) => {
                    const fileResponse = await fetch(
                        `${file.downloadUrl!.replace(/build\.yaml$/, '')}${filename}`
                    );
                    if (!fileResponse.ok) {
                        throw new Error(
                            `Failed to fetch additional file ${filename}: ${fileResponse.statusText}`
                        );
                    }
                    return await fileResponse.text();
                }
            );

            onLoadRecipe(parsedRecipe);
        } catch (error) {
            console.error('Error loading recipe:', error);
        } finally {
            setLoadingRecipe(null);
        }
    };

    return (
        <div className={cn(cardStyles(isDark, 'elevated'), "h-fit")}>
            {/* Header */}
            <div
                className={cn("border-b p-4", isDark ? "border-[#2d4222]" : "border-[#f0f7e7]")}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {filesystemMode === 'remote' ? (
                            <CloudIcon className={iconStyles(isDark, 'md', 'secondary')} />
                        ) : (
                            <ComputerDesktopIcon className={iconStyles(isDark, 'md', 'secondary')} />
                        )}
                        <h2 className={textStyles(isDark, { size: 'lg', weight: 'semibold', color: 'primary' })}>
                            {filesystemMode === 'remote' ? 'Published Containers' : 'Local Repository'}
                        </h2>
                        <div className={cn(
                            "px-2 py-1 rounded-full",
                            textStyles(isDark, { size: 'xs' }),
                            isDark ? "bg-[#2d4222] text-[#7bb33a]" : "bg-[#f0f7e7] text-[#4f7b38]"
                        )}>
                            {filesystemMode === 'remote' ? 'NeuroContainers' : 'Local Files'}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {filesystemMode === 'remote' && (
                            <>
                                <button
                                    onClick={refetch}
                                    disabled={loading}
                                    className={cn(buttonStyles(isDark, 'ghost', 'sm'), "disabled:opacity-50")}
                                    title="Refresh recipes"
                                >
                                    <ArrowPathIcon className={cn(iconStyles(isDark, 'sm'), loading && 'animate-spin')} />
                                </button>
                                <button
                                    onClick={clearCache}
                                    className={cn(buttonStyles(isDark, 'ghost', 'sm'), "hover:text-red-600")}
                                    title="Clear cache"
                                >
                                    <TrashIcon className={iconStyles(isDark, 'sm')} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>
                        {filesystemMode === 'remote'
                            ? (loading ? 'Loading...' : error ? 'Error loading recipes' : `${files.length} recipes available`)
                            : 'Browse local neurocontainers repository'
                        }
                    </p>
                    {/* Mode Toggle Switch */}
                    <div className={cn(
                        "flex items-center space-x-1 rounded-lg p-1",
                        isDark ? "bg-[#2d4222]" : "bg-gray-100"
                    )}>
                        <button
                            onClick={() => onFilesystemModeChange('remote')}
                            className={cn(
                                "flex items-center px-2 py-1 rounded text-xs font-medium transition-colors",
                                filesystemMode === 'remote'
                                    ? (isDark
                                        ? 'bg-[#161a0e] text-[#7bb33a] shadow-sm'
                                        : 'bg-white text-[#6aa329] shadow-sm')
                                    : (isDark
                                        ? 'text-[#d1d5db] hover:text-[#f9fafb]'
                                        : 'text-gray-600 hover:text-gray-900')
                            )}
                        >
                            <CloudIcon className="h-3 w-3 mr-1" />
                            GitHub
                        </button>
                        <button
                            onClick={() => onFilesystemModeChange('local')}
                            className={cn(
                                "flex items-center px-2 py-1 rounded text-xs font-medium transition-colors",
                                filesystemMode === 'local'
                                    ? (isDark
                                        ? 'bg-[#161a0e] text-[#7bb33a] shadow-sm'
                                        : 'bg-white text-[#6aa329] shadow-sm')
                                    : (isDark
                                        ? 'text-[#d1d5db] hover:text-[#f9fafb]'
                                        : 'text-gray-600 hover:text-gray-900')
                            )}
                        >
                            <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                            Local
                        </button>
                    </div>
                </div>
            </div>

            {filesystemMode === 'remote' ? (
                <>
                    {/* Search */}
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
                                placeholder="Search recipes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(inputStyles(isDark), "pl-9")}
                            />
                        </div>
                        {searchTerm && (
                            <p className="text-xs text-gray-500 mt-2">
                                {filteredFiles.length} of {files.length} recipes match
                            </p>
                        )}
                    </div>

                    {/* Recipe List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className={cn("animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto mb-3", isDark ? "border-[#7bb33a]" : "border-green-600")}></div>
                                <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>Loading recipes...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <ExclamationTriangleIcon className={cn("h-12 w-12 mx-auto mb-3 opacity-50", isDark ? "text-red-400" : "text-red-600")} />
                                <p className={cn(textStyles(isDark, { size: 'sm' }), isDark ? "text-red-400" : "text-red-600")}>Failed to load recipes</p>
                                <button
                                    onClick={refetch}
                                    className={cn("mt-2 text-xs hover:underline", isDark ? "text-[#7bb33a]" : "text-green-600")}
                                >
                                    Try again
                                </button>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="text-center py-12">
                                <CloudIcon className={cn(iconStyles(isDark, 'lg', 'secondary'), "mx-auto mb-3 opacity-50 h-12 w-12")} />
                                <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>
                                    {searchTerm ? 'No matching recipes found' : 'No recipes available'}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className={cn("mt-1 text-xs hover:underline", isDark ? "text-[#7bb33a]" : "text-green-600")}
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={cn("divide-y", isDark ? "divide-[#2d4222]" : "divide-[#f0f7e7]")}>
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.path}
                                        className={cn(
                                            "group p-4 transition-colors",
                                            isDark ? "hover:bg-[#1f2616]" : "hover:bg-[#f0f7e7]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 mr-3">
                                                <h3
                                                    className={cn(
                                                        textStyles(isDark, { size: 'sm', weight: 'medium' }),
                                                        "truncate",
                                                        isDark ? "text-[#d1d5db]" : "text-[#0c0e0a]"
                                                    )}
                                                >
                                                    {getRecipeName(file.path)}
                                                </h3>
                                                <div className={cn(textStyles(isDark, { size: 'xs', color: 'muted' }), "mt-1 font-mono truncate")}>
                                                    {file.path}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleLoadRecipe(file)}
                                                    disabled={loadingRecipe === file.path}
                                                    className={cn(buttonStyles(isDark, 'primary', 'md'), "rounded-lg disabled:opacity-50")}
                                                >
                                                    {loadingRecipe === file.path ? (
                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        'Load'
                                                    )}
                                                </button>
                                                <a
                                                    href={file.htmlUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn("p-1.5 transition-colors", isDark ? "text-gray-400 hover:text-[#7bb33a]" : "text-gray-400 hover:text-green-600")}
                                                    title="View on GitHub"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Local Filesystem Mode */
                <div className="flex-1">
                    <LocalFilesystem
                        onRecipeSelect={onLoadLocalRecipe}
                    />
                </div>
            )}
        </div>
    );
}