// components/RecipesList.tsx
'use client';

import { useGitHubFiles } from '@/lib/useGithub';
import { load as loadYAML } from 'js-yaml';
import { useState } from 'react';
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
} from '@heroicons/react/24/outline';
import { mergeAdditionalFilesIntoRecipe, migrateLegacyRecipe, type ContainerRecipe } from '@/components/common';

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

            // Migrate legacy recipe format if necessary
            parsedRecipe = migrateLegacyRecipe(parsedRecipe);
            // If the recipe has additional files, fetch them and merge into the recipe
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
            // You might want to show a toast notification here
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

    const truncateMessage = (message: string, maxLength: number = 60) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const getRecipeName = (path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 2] || 'Unknown Recipe';
    };

    const containerClasses = showAsModal
        ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'
        : 'w-full';

    const modalClasses = showAsModal
        ? 'bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'
        : 'bg-white rounded-lg shadow-md border border-[#d3e7b6]';

    if (loading) {
        return (
            <div className={containerClasses}>
                <div className={modalClasses}>
                    <div className="p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin h-8 w-8 border-2 border-[#6aa329] border-t-transparent rounded-full"></div>
                            <div className="text-[#4f7b38] text-lg font-medium">
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
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-red-600 mb-4">
                            <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
                            <h3 className="font-semibold text-lg">Error loading recipes</h3>
                        </div>
                        <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={refetch}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                Try Again
                            </button>
                            {showAsModal && onClose && (
                                <button
                                    onClick={onClose}
                                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
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
            {/* Header */}
            <div className="p-4 sm:p-6 bg-[#f0f7e7] border-b border-[#d3e7b6] flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0c0e0a] mb-1">
                            Available Recipes
                        </h2>
                        <p className="text-[#4f7b38] text-sm">
                            {files.length} container recipe{files.length !== 1 ? 's' : ''}{' '}
                            found
                        </p>
                        <p className="text-[#4f7b38] text-xs opacity-75 truncate">
                            {owner}/{repo}
                        </p>
                    </div>

                    {showAsModal && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors ml-2 flex-shrink-0"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button
                        onClick={refetch}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-[#6aa329] text-white rounded-lg hover:bg-[#4f7b38] text-sm font-medium transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span className="sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={clearCache}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                    >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sm:inline">Clear Cache</span>
                    </button>
                </div>

                {/* Repository Info */}
                {repoInfo && (
                    <div className="bg-white rounded-lg p-3 sm:p-4 border border-[#d3e7b6]">
                        <div className="flex items-start gap-3">
                            <CodeBracketIcon className="h-5 w-5 text-[#4f7b38] mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-[#0c0e0a]">
                                        Latest commit:
                                    </span>
                                    <a
                                        href={repoInfo.lastCommit.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-[#4f7b38] text-white px-2 py-1 rounded font-mono hover:bg-[#3d5f2b] transition-colors inline-block"
                                    >
                                        {repoInfo.lastCommit.sha.substring(0, 7)}
                                    </a>
                                </div>
                                <p className="text-sm text-[#1e2a16] mb-2 break-words">
                                    &quot;{truncateMessage(repoInfo.lastCommit.message)}&quot;
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-[#4f7b38]">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        <span>{formatDate(repoInfo.lastCommit.date)}</span>
                                    </div>
                                    <span className="hidden sm:inline">•</span>
                                    <span>by {repoInfo.lastCommit.author}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {cacheInfo.isValid && cacheInfo.expiresAt && (
                    <div className="text-xs text-[#4f7b38] bg-white p-2 rounded border border-[#d3e7b6] mt-3">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        Cache expires: {cacheInfo.expiresAt.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {files.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-base mb-2">No build.yaml files found</p>
                        <p className="text-sm">
                            This repository doesn&apos;t contain any container recipes.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3">
                            {files.map((file) => (
                                <div
                                    key={file.path}
                                    className="border border-[#d3e7b6] rounded-lg p-4 hover:bg-[#f9fdf5] transition-colors"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Recipe header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-[#0c0e0a] text-base sm:text-lg">
                                                        {getRecipeName(file.path)}
                                                    </h3>
                                                    <span className="text-xs bg-[#e6f1d6] text-[#4f7b38] px-2 py-1 rounded self-start">
                                                        {file.path.split('/')[1] || 'recipes'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 break-all">
                                                    {file.path}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {onLoadRecipe && file.downloadUrl && (
                                                <button
                                                    onClick={() => handleLoadRecipe(file)}
                                                    disabled={loadingRecipe === file.path}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6aa329] text-white rounded-lg hover:bg-[#4f7b38] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loadingRecipe === file.path ? (
                                                        <>
                                                            <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                                            Load Recipe
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <a
                                                href={file.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#e6f1d6] text-[#4f7b38] rounded-lg hover:bg-[#d3e7b6] text-sm font-medium transition-colors"
                                            >
                                                <EyeIcon className="h-4 w-4" />
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
        </div>
    );

    return showAsModal ? <div className={containerClasses}>{content}</div> : content;
}