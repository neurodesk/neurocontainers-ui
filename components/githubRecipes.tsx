// components/RecipesList.tsx
'use client';

import { useGitHubFiles } from '@/lib/useGithub';
import { load as loadYAML } from 'js-yaml';
import { useState, useMemo } from 'react';
import {
    ClockIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    ExclamationTriangleIcon,
    CodeBracketIcon,
    XMarkIcon,
    ArrowPathIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { mergeAdditionalFilesIntoRecipe, migrateLegacyRecipe, type ContainerRecipe } from '@/components/common';
import { BUTTONS, iconStyles, textStyles, inputStyles, cn } from '@/lib/styles';

interface RecipesListProps {
    owner: string;
    repo: string;
    branch?: string;
    onLoadRecipe?: (recipe: ContainerRecipe) => void;
    showAsModal?: boolean;
    onClose?: () => void;
}

export default function RecipesList({
    owner,
    repo,
    branch = 'main',
    onLoadRecipe,
    showAsModal = false,
    onClose,
}: RecipesListProps) {
    const { files, repoInfo, loading, error, refetch, clearCache, cacheInfo } =
        useGitHubFiles(owner, repo, branch);

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
            onClose?.();
        } catch (error) {
            console.error('Error loading recipe:', error);
        } finally {
            setLoadingRecipe(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateMessage = (message: string, maxLength: number = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const containerClasses = showAsModal
        ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10'
        : 'w-full';

    const modalClasses = showAsModal
        ? 'bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'
        : 'bg-white rounded-lg shadow-md border border-[#d3e7b6]';

    if (loading) {
        return (
            <div className={containerClasses}>
                <div className={modalClasses}>
                    <div className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin h-8 w-8 border-2 border-[#6aa329] border-t-transparent rounded-full"></div>
                            <div className={cn(
                                textStyles({ size: 'lg', weight: 'medium', color: 'secondary' })
                            )}>
                                Loading recipes...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={containerClasses}>
                <div className={modalClasses}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <ExclamationTriangleIcon className={cn(iconStyles('lg'), "flex-shrink-0")} />
                            <h3 className={textStyles({ size: 'lg', weight: 'semibold' })}>Error loading recipes</h3>
                        </div>
                        <p className={cn(textStyles({ color: 'muted' }), "text-red-600 mb-6")}>{error}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={refetch}
                                className={cn(BUTTONS.primary, "gap-2")}
                            >
                                <ArrowPathIcon className={iconStyles('sm')} />
                                Try Again
                            </button>
                            {showAsModal && onClose && (
                                <button
                                    onClick={onClose}
                                    className={BUTTONS.secondary}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const content = (
        <div className={modalClasses}>
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white border-b border-[#d3e7b6]">
                {/* Title Bar */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#f8fdf5] to-[#f0f7e7]">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            {/* Mobile Layout - Stacked */}
                            <div className="block lg:hidden">
                                <h2 className={cn(
                                    textStyles({ size: 'xl', weight: 'bold', color: 'primary' }),
                                    "mb-2"
                                )}>
                                    Container Recipes
                                </h2>
                                <div className={cn("flex items-center gap-3", textStyles({ size: 'sm' }))}>
                                    <a
                                        href={`https://github.com/${owner}/${repo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5",
                                            "bg-white/80 border border-[#d3e7b6] rounded-lg",
                                            "text-[#4f7b38] hover:bg-white hover:border-[#6aa329] hover:text-[#6aa329]",
                                            "transition-all duration-200 font-medium shadow-sm",
                                            textStyles({ size: 'sm' })
                                        )}
                                    >
                                        <CodeBracketIcon className={iconStyles('sm')} />
                                        {owner.toLowerCase()}/{repo.toLowerCase()}
                                        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                    </a>
                                    <span className="text-[#4f7b38]">•</span>
                                    <span className={cn(textStyles({ weight: 'medium', color: 'secondary' }))}>
                                        {files.length} recipe{files.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Desktop Layout - Inline */}
                            <div className="hidden lg:flex items-center gap-4">
                                <h2 className={textStyles({ size: 'xl', weight: 'bold', color: 'primary' })}>
                                    Container Recipes
                                </h2>
                                <a
                                    href={`https://github.com/${owner}/${repo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5",
                                        "bg-white/80 border border-[#d3e7b6] rounded-lg",
                                        "text-[#4f7b38] hover:bg-white hover:border-[#6aa329] hover:text-[#6aa329]",
                                        "transition-all duration-200 font-medium shadow-sm flex-shrink-0",
                                        textStyles({ size: 'sm' })
                                    )}
                                >
                                    <CodeBracketIcon className={iconStyles('sm')} />
                                    {owner.toLowerCase()}/{repo.toLowerCase()}
                                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                </a>
                                <span className="text-[#4f7b38]">•</span>
                                <span className={cn(textStyles({ weight: 'medium', color: 'secondary' }))}>
                                    {files.length} recipe{files.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {showAsModal && onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors ml-4"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="px-6 py-4 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        {/* Search - fills available space */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className={cn(
                                iconStyles('sm', 'muted'),
                                "absolute left-3 top-1/2 transform -translate-y-1/2"
                            )} />
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(
                                    inputStyles(),
                                    "w-full pl-9 pr-3 py-2.5 shadow-sm",
                                    "focus:ring-2 focus:ring-[#6aa329] focus:border-transparent"
                                )}
                            />
                        </div>

                        {/* Action buttons with better spacing */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={refetch}
                                className={cn(BUTTONS.primary, "gap-2 px-4 py-2.5 shadow-sm")}
                            >
                                <ArrowPathIcon className={iconStyles('sm')} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={clearCache}
                                className={cn(BUTTONS.secondary, "gap-2 px-4 py-2.5 shadow-sm")}
                            >
                                <TrashIcon className={iconStyles('sm')} />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        </div>
                    </div>

                    {/* Results indicator - fixed height to prevent layout shift */}
                    <div className="mt-2 h-5 flex items-center">
                        {searchTerm && (
                            <div className={cn(textStyles({ size: 'xs', color: 'secondary' }))}>
                                {filteredFiles.length} of {files.length} recipes
                                {filteredFiles.length === 0 && (
                                    <>
                                        {' • '}
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className={cn(
                                                textStyles({ weight: 'medium' }),
                                                "text-[#6aa329] hover:text-[#4f7b38] underline"
                                            )}
                                        >
                                            clear search
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Repository Info - Collapsible */}
                {repoInfo && (
                    <div className="px-6 py-3 bg-white border-t border-gray-100">
                        <div className={cn("flex items-center gap-3", textStyles({ size: 'sm' }))}>
                            <CodeBracketIcon className={cn(iconStyles('sm', 'secondary'), "flex-shrink-0")} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={textStyles({ color: 'muted' })}>Latest:</span>
                                    <a
                                        href={repoInfo.lastCommit.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            textStyles({ size: 'xs' }),
                                            "bg-[#4f7b38] text-white px-2 py-0.5 rounded font-mono hover:bg-[#3d5f2b] transition-colors"
                                        )}
                                    >
                                        {repoInfo.lastCommit.sha.substring(0, 7)}
                                    </a>
                                    <span className={cn(textStyles({ color: 'muted' }), "truncate")}>
                                        &quot;{truncateMessage(repoInfo.lastCommit.message, 40)}&quot;
                                    </span>
                                </div>
                            </div>
                            <div className={cn(textStyles({ size: 'xs', color: 'muted' }), "flex items-center gap-1")}>
                                <ClockIcon className="h-3 w-3" />
                                {formatDate(repoInfo.lastCommit.date)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {filteredFiles.length === 0 ? (
                    <div className={cn(
                        "flex items-center justify-center h-full min-h-[300px] text-center",
                        textStyles({ color: 'muted' })
                    )}>
                        <div>
                            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            {searchTerm ? (
                                <>
                                    <p className={cn(textStyles({ size: 'base', weight: 'medium' }), "mb-1")}>No matching recipes</p>
                                    <p className={textStyles({ size: 'sm' })}>Try a different search term</p>
                                </>
                            ) : (
                                <>
                                    <p className={cn(textStyles({ size: 'base', weight: 'medium' }), "mb-1")}>No recipes found</p>
                                    <p className={textStyles({ size: 'sm' })}>This repository doesn&apos;t contain any container recipes</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="space-y-2">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.path}
                                    className="group border border-gray-200 rounded-lg p-4 hover:border-[#6aa329] hover:bg-[#fafdfb] transition-all duration-150 bg-white"
                                >
                                    {/* Desktop Layout */}
                                    <div className="hidden sm:flex items-center gap-4">
                                        {/* Recipe info - consistent width */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={cn(
                                                textStyles({ size: 'base', weight: 'semibold', color: 'primary' }),
                                                "truncate mb-1"
                                            )}>
                                                {getRecipeName(file.path)}
                                            </h3>
                                            <p className={cn(
                                                textStyles({ size: 'sm', color: 'muted' }),
                                                "truncate font-mono"
                                            )}>
                                                {file.path}
                                            </p>
                                        </div>

                                        {/* Desktop action buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {onLoadRecipe && file.downloadUrl && (
                                                <button
                                                    onClick={() => handleLoadRecipe(file)}
                                                    disabled={loadingRecipe === file.path}
                                                    className={cn(
                                                        BUTTONS.primary,
                                                        "gap-2 px-4 py-2 min-w-[80px] justify-center",
                                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    {loadingRecipe === file.path ? (
                                                        <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <>
                                                            <ArrowDownTrayIcon className={iconStyles('sm')} />
                                                            Load
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <a
                                                href={file.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    BUTTONS.secondary,
                                                    "gap-2 px-3 py-2 min-w-[70px] justify-center"
                                                )}
                                            >
                                                <EyeIcon className={iconStyles('sm')} />
                                                View
                                            </a>
                                        </div>
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="sm:hidden">
                                        {/* Recipe info */}
                                        <div className="mb-3">
                                            <h3 className={cn(
                                                textStyles({ size: 'base', weight: 'semibold', color: 'primary' }),
                                                "mb-1"
                                            )}>
                                                {getRecipeName(file.path)}
                                            </h3>
                                            <p className={cn(
                                                textStyles({ size: 'sm', color: 'muted' }),
                                                "font-mono break-all"
                                            )}>
                                                {file.path}
                                            </p>
                                        </div>

                                        {/* Mobile action buttons - full width stack */}
                                        <div className="flex flex-col gap-2">
                                            {onLoadRecipe && file.downloadUrl && (
                                                <button
                                                    onClick={() => handleLoadRecipe(file)}
                                                    disabled={loadingRecipe === file.path}
                                                    className={cn(
                                                        BUTTONS.primary,
                                                        "justify-center gap-2 w-full px-4 py-3",
                                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    {loadingRecipe === file.path ? (
                                                        <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <>
                                                            <ArrowDownTrayIcon className={iconStyles('sm')} />
                                                            Load Recipe
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <a
                                                href={file.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    BUTTONS.secondary,
                                                    "justify-center gap-2 w-full px-4 py-3"
                                                )}
                                            >
                                                <EyeIcon className={iconStyles('sm')} />
                                                View on GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Footer */}
            {cacheInfo.isValid && cacheInfo.expiresAt && (
                <div className={cn(
                    "flex-shrink-0 px-6 py-2 bg-gray-50 border-t border-gray-200",
                    "flex items-center gap-2",
                    textStyles({ size: 'xs', color: 'muted' })
                )}>
                    <ClockIcon className="h-3 w-3" />
                    Cache expires: {cacheInfo.expiresAt.toLocaleString()}
                </div>
            )}
        </div>
    );

    return showAsModal ? <div className={containerClasses}>{content}</div> : content;
}