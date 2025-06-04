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
    CodeBracketIcon
} from '@heroicons/react/24/outline';
import type { ContainerRecipe } from '@/components/common';

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

    const handleLoadRecipe = async (file: { path: string; downloadUrl?: string }) => {
        if (!file.downloadUrl || !onLoadRecipe) return;

        setLoadingRecipe(file.path);
        try {
            const response = await fetch(file.downloadUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch recipe: ${response.statusText}`);
            }

            const yamlText = await response.text();
            const parsedRecipe = loadYAML(yamlText) as ContainerRecipe;

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

    const truncateMessage = (message: string, maxLength: number = 80) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const getRecipeName = (path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 2] || 'Unknown Recipe';
    };

    const containerClasses = showAsModal
        ? "bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        : "bg-white rounded-lg shadow-md border border-[#d3e7b6]";

    const contentClasses = showAsModal
        ? "flex-1 overflow-y-auto"
        : "";

    if (loading) {
        return (
            <div className={containerClasses}>
                <div className="p-6 text-center">
                    <div className="animate-pulse text-[#4f7b38] text-lg">
                        Loading recipes...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={containerClasses}>
                <div className="p-6">
                    <div className="flex items-center text-red-600 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                        <h3 className="font-semibold">Error loading recipes</h3>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className="p-4 sm:p-6 bg-[#f0f7e7] border-b border-[#d3e7b6]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0c0e0a]">
                            Available Recipes
                        </h2>
                        <p className="text-[#4f7b38] text-sm mt-1">
                            {files.length} container recipes found in {owner}/{repo}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {showAsModal && onClose && (
                            <button
                                onClick={onClose}
                                className="px-3 py-2 text-[#4f7b38] hover:bg-[#e6f1d6] rounded-md text-sm"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={refetch}
                            className="px-3 py-2 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38] text-sm"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={clearCache}
                            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                            Clear Cache
                        </button>
                    </div>
                </div>

                {/* Repository Info */}
                {repoInfo && (
                    <div className="bg-[#e6f1d6] rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <CodeBracketIcon className="h-5 w-5 text-[#4f7b38] mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-[#0c0e0a]">
                                        Latest commit:
                                    </span>
                                    <a
                                        href={repoInfo.lastCommit.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-[#4f7b38] text-white px-2 py-1 rounded font-mono hover:bg-[#3d5f2b]"
                                    >
                                        {repoInfo.lastCommit.sha.substring(0, 7)}
                                    </a>
                                </div>
                                <p className="text-sm text-[#1e2a16] mb-2">
                                    &quot;{truncateMessage(repoInfo.lastCommit.message)}&quot;
                                </p>
                                <div className="flex items-center text-xs text-[#4f7b38]">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>{formatDate(repoInfo.lastCommit.date)}</span>
                                    <span className="mx-2">•</span>
                                    <span>by {repoInfo.lastCommit.author}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {cacheInfo.isValid && cacheInfo.expiresAt && (
                    <div className="text-xs text-[#4f7b38] bg-white p-2 rounded border border-[#d3e7b6]">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        Cache expires: {cacheInfo.expiresAt.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={contentClasses}>
                {files.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No build.yaml files found in this repository.</p>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6">
                        <div className="grid gap-3">
                            {files.map((file) => (
                                <div
                                    key={file.path}
                                    className="border border-[#d3e7b6] rounded-lg p-4 hover:bg-[#f9fdf5] transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-[#0c0e0a] text-lg">
                                                    {getRecipeName(file.path)}
                                                </h3>
                                                <span className="text-xs bg-[#e6f1d6] text-[#4f7b38] px-2 py-1 rounded">
                                                    {file.path.split('/')[1] || 'recipes'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 truncate">
                                                {file.path}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {onLoadRecipe && file.downloadUrl && (
                                                <button
                                                    onClick={() => handleLoadRecipe(file)}
                                                    disabled={loadingRecipe === file.path}
                                                    className="px-3 py-2 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38] text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingRecipe === file.path ? (
                                                        <>
                                                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                                            Load
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <a
                                                href={file.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 bg-[#e6f1d6] text-[#4f7b38] rounded-md hover:bg-[#d3e7b6] text-sm"
                                            >
                                                View
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
}