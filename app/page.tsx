"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    ArrowUpTrayIcon,
    ChevronDownIcon,
    InformationCircleIcon,
    CogIcon,
    CheckCircleIcon,
    Bars3Icon,
    XMarkIcon,
    PlusIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    TrashIcon,
    ClockIcon,
    ComputerDesktopIcon,
    CloudIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    RectangleStackIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    GlobeAltIcon,
    CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe, migrateLegacyRecipe, mergeAdditionalFilesIntoRecipe } from "@/components/common";
import BuildRecipeComponent from "@/components/recipe";
import ContainerMetadata from "@/components/metadata";
import ValidateRecipeComponent from "@/components/validate";
import GitHubModal from "@/components/githubExport";
import { useGitHubFiles } from '@/lib/useGithub';

enum Section {
    BasicInfo = "basic-info",
    BuildRecipe = "build-recipe",
    ValidateRecipe = "validate-recipe",
}

enum SaveStatus {
    Saved = "saved",
    Saving = "saving",
    Unsaved = "unsaved",
}

const sections = [
    {
        id: Section.BasicInfo,
        title: "Basic Info",
        description: "Container metadata",
        icon: InformationCircleIcon,
    },
    {
        id: Section.BuildRecipe,
        title: "Build Recipe",
        description: "Define build process",
        icon: CogIcon,
    },
    {
        id: Section.ValidateRecipe,
        title: "Validate",
        description: "Test & generate",
        icon: CheckCircleIcon,
    },
];

const LOCAL_STORAGE_KEY = "neurocontainers-builder-saved";

interface SavedContainer {
    id: string;
    name: string;
    version: string;
    lastModified: number;
    data: ContainerRecipe;
}

async function getDefaultYAML(): Promise<ContainerRecipe> {
    const res = await fetch("/qsmxt.yaml");
    if (!res.ok) {
        throw new Error("Failed to fetch YAML file");
    }
    const text = await res.text();
    return loadYAML(text) as ContainerRecipe;
}

function getNewContainerYAML(): ContainerRecipe {
    return {
        name: "",
        version: "",
        architectures: ["x86_64"],
        structured_readme: {
            description: "",
            example: "",
            documentation: "",
            citation: "",
        },
        build: {
            kind: "neurodocker",
            "base-image": "ubuntu:24.04",
            "pkg-manager": "apt",
            directives: [],
        },
    };
}

// Local storage utilities for multiple containers
function getSavedContainers(): SavedContainer[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved) as SavedContainer[];
        }
    } catch (error) {
        console.error("Failed to load saved containers:", error);
    }
    return [];
}

function saveContainer(data: ContainerRecipe, existingId?: string): string {
    try {
        const saved = getSavedContainers();
        const id = existingId || `untitled-${Date.now()}`;
        const displayName = data.name && data.name.trim() ? data.name.trim() : "Untitled";
        const container: SavedContainer = {
            id,
            name: displayName,
            version: data.version,
            lastModified: Date.now(),
            data,
        };

        // If we have an existing ID, update that container
        if (existingId) {
            const index = saved.findIndex(c => c.id === existingId);
            if (index !== -1) {
                saved[index] = container;
            } else {
                saved.unshift(container);
            }
        } else {
            // Remove any existing container with same name and add new one
            const filtered = saved.filter(c => c.name !== data.name);
            filtered.unshift(container);
            saved.splice(0, saved.length, ...filtered);
        }

        // Keep only the 10 most recent containers
        const limited = saved.slice(0, 10);

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(limited));
        return id;
    } catch (error) {
        console.error("Failed to save container:", error);
        return existingId || "";
    }
}

function deleteContainer(id: string) {
    try {
        const saved = getSavedContainers();
        const filtered = saved.filter(c => c.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Failed to delete container:", error);
    }
}

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function SaveIndicator({ status }: { status: SaveStatus }) {
    const getIcon = () => {
        switch (status) {
            case SaveStatus.Saved:
                return <CheckIcon className="h-4 w-4 text-green-600" />;
            case SaveStatus.Saving:
                return <CloudIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
            case SaveStatus.Unsaved:
                return <div className="h-2 w-2 bg-orange-500 rounded-full" />;
        }
    };

    const getText = () => {
        switch (status) {
            case SaveStatus.Saved:
                return "Saved Locally";
            case SaveStatus.Saving:
                return "Saving...";
            case SaveStatus.Unsaved:
                return "Unsaved changes";
        }
    };

    const getTextColor = () => {
        switch (status) {
            case SaveStatus.Saved:
                return "text-green-600";
            case SaveStatus.Saving:
                return "text-blue-500";
            case SaveStatus.Unsaved:
                return "text-orange-600";
        }
    };

    return (
        <div className={`flex items-center space-x-1 text-xs ${getTextColor()}`}>
            {getIcon()}
            <span>{getText()}</span>
        </div>
    );
}

function LocalContainersList({
    onLoadContainer,
    onDeleteContainer,
    githubFiles = []
}: {
    onLoadContainer: (container: ContainerRecipe, id: string) => void;
    onDeleteContainer: (id: string) => void;
    githubFiles?: { path: string; downloadUrl?: string; htmlUrl?: string }[];
}) {
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
        <div className="bg-white rounded-xl border border-[#e6f1d6] h-fit">
            {/* Header */}
            <div className="border-b border-[#e6f1d6] p-4">
                <div className="flex items-center space-x-2 mb-2">
                    <ComputerDesktopIcon className="h-5 w-5 text-[#4f7b38]" />
                    <h2 className="text-lg font-semibold text-[#0c0e0a]">
                        Recent Containers
                    </h2>
                    <div className="text-xs bg-[#e6f1d6] text-[#4f7b38] px-2 py-1 rounded-full">
                        Browser Only
                    </div>
                </div>
                <p className="text-sm text-[#4f7b38]">
                    {savedContainers.length} container{savedContainers.length !== 1 ? 's' : ''} recently worked on
                </p>
            </div>

            {/* Search */}
            {savedContainers.length > 0 && (
                <div className="p-4 border-b border-[#f0f7e7]">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search containers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent text-sm"
                        />
                    </div>
                    {searchTerm && (
                        <p className="text-xs text-gray-500 mt-2">
                            {filteredContainers.length} of {savedContainers.length} containers match
                        </p>
                    )}
                </div>
            )}

            {/* Container List */}
            <div className="max-h-96 overflow-y-auto">
                {savedContainers.length === 0 ? (
                    <div className="text-center py-12 text-[#4f7b38]">
                        <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No containers saved yet</p>
                        <p className="text-xs text-gray-500 mt-1">Your work will appear here automatically</p>
                    </div>
                ) : filteredContainers.length === 0 ? (
                    <div className="text-center py-12 text-[#4f7b38]">
                        <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No matching containers found</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-1 text-xs text-[#6aa329] hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-[#f0f7e7]">
                        {filteredContainers.map((container) => (
                            <div
                                key={container.id}
                                className="group p-4 hover:bg-[#fafdfb] transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <h3 className={`font-medium text-sm truncate ${container.name === "Untitled" ? "text-gray-500 italic" : "text-[#0c0e0a]"}`}>
                                            {container.name}
                                        </h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className="text-xs text-[#4f7b38]">
                                                v{container.version || '0.0.0'}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                {formatTimeAgo(container.lastModified)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-500">
                                                {container.data.build.directives?.length || 0} build steps
                                            </span>
                                            {!isPublishedContainer(container.data.name) && (
                                                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                                                    Unpublished
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() => onLoadContainer(container.data, container.id)}
                                            className="px-3 py-1.5 bg-[#6aa329] text-white rounded-lg text-xs font-medium hover:bg-[#4f7b38] transition-colors"
                                        >
                                            Open
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(container.id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete container"
                                        >
                                            <TrashIcon className="h-4 w-4" />
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
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-[#0c0e0a] mb-3">
                            Delete Container?
                        </h3>
                        <p className="text-[#4f7b38] mb-6">
                            This action cannot be undone. The container will be permanently removed from your browser.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 border border-[#e6f1d6] text-[#4f7b38] rounded-md hover:bg-[#f8fdf2] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
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

function RemoteContainersList({
    onLoadRecipe
}: {
    onLoadRecipe: (recipe: ContainerRecipe) => void;
}) {
    const { files, loading, error, refetch, clearCache } = useGitHubFiles("neurodesk", "neurocontainers", "main");
    const [loadingRecipe, setLoadingRecipe] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getRecipeName = (path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 2] || 'Unknown Recipe';
    };

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files; // Show all files by default

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
        <div className="bg-white rounded-xl border border-[#e6f1d6] h-fit">
            {/* Header */}
            <div className="border-b border-[#e6f1d6] p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <CloudIcon className="h-5 w-5 text-[#4f7b38]" />
                        <h2 className="text-lg font-semibold text-[#0c0e0a]">
                            Published Containers
                        </h2>
                        <div className="text-xs bg-[#f0f7e7] text-[#4f7b38] px-2 py-1 rounded-full">
                            NeuroContainers
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="p-1.5 text-[#4f7b38] hover:text-[#6aa329] transition-colors disabled:opacity-50"
                            title="Refresh recipes"
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={clearCache}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Clear cache"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-[#4f7b38]">
                        {loading ? 'Loading...' : error ? 'Error loading recipes' : `${files.length} recipes available`}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[#f0f7e7]">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:border-transparent text-sm"
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
                        <div className="animate-spin h-8 w-8 border-2 border-[#6aa329] border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-sm text-[#4f7b38]">Loading recipes...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-600">
                        <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Failed to load recipes</p>
                        <button
                            onClick={refetch}
                            className="mt-2 text-xs text-[#6aa329] hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-[#4f7b38]">
                        <CloudIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">
                            {searchTerm ? 'No matching recipes found' : 'No recipes available'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-1 text-xs text-[#6aa329] hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-[#f0f7e7]">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.path}
                                className="group p-4 hover:bg-[#fafdfb] transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <h3 className="font-medium text-sm truncate text-[#0c0e0a]">
                                            {getRecipeName(file.path)}
                                        </h3>
                                        <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                                            {file.path}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleLoadRecipe(file)}
                                            disabled={loadingRecipe === file.path}
                                            className="px-3 py-1.5 bg-[#6aa329] text-white rounded-lg text-xs font-medium hover:bg-[#4f7b38] transition-colors disabled:opacity-50"
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
                                            className="p-1.5 text-gray-400 hover:text-[#6aa329] transition-colors"
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
        </div>
    );
}

function Footer() {
    return (
        <footer className="bg-white border-t border-[#e6f1d6] mt-12">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Main Site */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0c0e0a] mb-3">Neurodesk</h3>
                        <a
                            href="https://neurodesk.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>neurodesk.org</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            A comprehensive neuroimaging environment
                        </p>
                    </div>

                    {/* Containers Repository */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0c0e0a] mb-3">Containers</h3>
                        <a
                            href="https://github.com/neurodesk/neurocontainers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <CodeBracketIcon className="h-4 w-4" />
                            <span>neurodesk/neurocontainers</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            Container recipes and configurations
                        </p>
                    </div>

                    {/* UI Repository */}
                    <div>
                        <h3 className="text-sm font-semibold text-[#0c0e0a] mb-3">Builder UI</h3>
                        <a
                            href="https://github.com/neurodesk/neurocontainers-ui"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm text-[#4f7b38] hover:text-[#6aa329] transition-colors"
                        >
                            <CodeBracketIcon className="h-4 w-4" />
                            <span>neurodesk/neurocontainers-ui</span>
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                            This visual builder interface
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[#f0f7e7] mt-8 pt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Built for the neuroimaging community by the Neurodesk team.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function SideNavigation({
    activeSection,
    onSectionChange,
    isOpen,
    onToggle,
    yamlData,
    onNewContainer,
    onExportYAML,
    onOpenGitHub,
    saveStatus,
    isPublished,
    githubUrl,
    isModified,
}: {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    isOpen: boolean;
    onToggle: () => void;
    yamlData: ContainerRecipe | null;
    onNewContainer: () => void;
    onExportYAML: () => void;
    onOpenGitHub: () => void;
    saveStatus: SaveStatus;
    isPublished?: boolean;
    githubUrl?: string;
    isModified?: boolean;
}) {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <nav
                className={`
                    fixed lg:sticky top-0 left-0 h-full lg:h-screen
                    w-full lg:w-64 bg-white border-r border-[#e6f1d6] 
                    transform transition-transform duration-300 ease-in-out z-50
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex flex-col
                `}
            >
                {/* Header with Title */}
                <div className="p-4 border-b border-[#e6f1d6] bg-[#0c0e0a] text-white">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-bold">
                            Neurocontainers Builder
                        </h1>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-1 rounded-md hover:bg-[#1e2a16]"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Save Status */}
                    {yamlData && (
                        <div className="mt-2">
                            <SaveIndicator status={saveStatus} />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-b border-[#e6f1d6] bg-[#f8fdf2]">
                    <div className="space-y-1">
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors"
                            onClick={onNewContainer}
                        >
                            <RectangleStackIcon className="h-4 w-4" />
                            <span>Container Library</span>
                        </button>
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onExportYAML}
                            disabled={!yamlData}
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Download YAML</span>
                        </button>
                        {isPublished && githubUrl ? (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors"
                            >
                                <EyeIcon className="h-4 w-4" />
                                <span>View on GitHub</span>
                            </a>

                        ) : (<></>)}
                        <button
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onOpenGitHub}
                            disabled={!yamlData}
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            <span>Publish to GitHub</span>
                        </button>
                        <a
                            href="https://github.com/neurodesk/neurocontainers-ui/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#1e2a16] hover:bg-[#e6f1d6] rounded-md transition-colors"
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Report an Issue</span>
                        </a>
                    </div>
                </div>

                {/* Unpublished Warning */}
                {yamlData && !isPublished && (
                    <div className="p-3 border-b border-[#e6f1d6] bg-orange-50">
                        <div className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-orange-800">Unpublished Container</p>
                                <p className="text-xs text-orange-700 mt-1">
                                    This container is not available in the public repository. Consider publishing it to make it accessible to others.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modified Warning */}
                {yamlData && isPublished && isModified && (
                    <div className="p-3 border-b border-[#e6f1d6] bg-yellow-50">
                        <div className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-yellow-800">Modified Container</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    This container has been modified from the published version. Your changes are only saved locally.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Build Steps Header */}
                <div className="p-3 border-b border-[#e6f1d6]">
                    <h2 className="text-sm font-semibold text-[#0c0e0a]">
                        Build Steps
                    </h2>
                    <p className="text-xs text-[#4f7b38] mt-1">
                        Follow these steps to build your container
                    </p>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;

                        return (
                            <button
                                key={section.id}
                                onClick={() => {
                                    onSectionChange(section.id);
                                    // Close sidebar on mobile after selection
                                    if (window.innerWidth < 1024) {
                                        onToggle();
                                    }
                                }}
                                className={`
                                    w-full text-left p-3 rounded-md transition-all duration-200
                                    flex items-start space-x-3 group relative
                                    ${isActive
                                        ? "bg-[#6aa329] text-white shadow-sm"
                                        : "hover:bg-[#f0f7e7] text-[#1e2a16]"
                                    }
                                `}
                            >
                                {/* Step number */}
                                <div
                                    className={`
                                        flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold
                                        ${isActive
                                            ? "bg-white text-[#6aa329]"
                                            : "bg-[#e6f1d6] text-[#4f7b38] group-hover:bg-[#d3e7b6]"
                                        }
                                    `}
                                >
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon className="h-3 w-3 flex-shrink-0" />
                                        <div className="font-medium truncate text-sm">
                                            {section.title}
                                        </div>
                                    </div>
                                    <div
                                        className={`
                                            text-xs leading-tight
                                            ${isActive
                                                ? "text-white/90"
                                                : "text-[#4f7b38]"
                                            }
                                        `}
                                    >
                                        {section.description}
                                    </div>
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

function TopNavigation({
    onSidebarToggle,
    yamlData,
    onNewContainer,
    onOpenGitHub,
    saveStatus,
}: {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    onSidebarToggle: () => void;
    yamlData: ContainerRecipe | null;
    onNewContainer: () => void;
    onOpenGitHub: () => void;
    saveStatus: SaveStatus;
}) {
    return (
        <div className="fixed top-0 left-0 right-0 bg-[#0c0e0a] border-b border-[#1e2a16] p-3 lg:hidden z-30">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-md hover:bg-[#1e2a16] text-white"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            Neurocontainers Builder
                        </h1>
                        {yamlData && (
                            <SaveIndicator status={saveStatus} />
                        )}
                    </div>
                </div>

                {/* Action buttons for mobile */}
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-[#1e2a16] hover:bg-[#161c10] px-3 py-1 rounded-md text-xs font-medium transition-colors text-white"
                        onClick={onNewContainer}
                    >
                        New
                    </button>
                    <button
                        className="bg-[#4f7b38] hover:bg-[#6aa329] px-3 py-1 rounded-md text-xs font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onOpenGitHub}
                        disabled={!yamlData}
                    >
                        Publish
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-[#6aa329] rounded-lg shadow-sm">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0c0e0a]">
                    {title}
                </h2>
                <p className="text-[#4f7b38] mt-1">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function Home() {
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingContainer, setLoadingContainer] = useState<string | null>(null);
    const [containerError, setContainerError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState(Section.BasicInfo);
    const [yamlText, setYamlText] = useState("");
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Saved);
    const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
    const [currentRoute, setCurrentRoute] = useState<string>("");
    const [isPublishedContainer, setIsPublishedContainer] = useState<boolean>(false);
    const [isModifiedFromGithub, setIsModifiedFromGithub] = useState<boolean>(false);
    const [originalGithubYaml, setOriginalGithubYaml] = useState<string>("");
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isUpdatingUrl, setIsUpdatingUrl] = useState<boolean>(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { files } = useGitHubFiles("neurodesk", "neurocontainers", "main");

    // Helper function to normalize YAML for comparison (ignore whitespace differences)
    const normalizeYamlForComparison = useCallback((yamlString: string): string => {
        try {
            // Parse and re-dump to normalize formatting
            const parsed = loadYAML(yamlString);
            return dumpYAML(parsed, {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
                sortKeys: true
            }).trim();
        } catch {
            // If parsing fails, just trim whitespace
            return yamlString.trim();
        }
    }, []);

    // Check if current container is modified from GitHub version
    const checkIfModifiedFromGithub = useCallback(async (recipe: ContainerRecipe): Promise<boolean> => {
        if (!isPublishedContainer || !originalGithubYaml) {
            return false;
        }

        try {
            // Convert current recipe to YAML
            const currentYaml = dumpYAML(recipe, {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
                sortKeys: true
            });

            // Normalize both for comparison
            const normalizedCurrent = normalizeYamlForComparison(currentYaml);
            const normalizedOriginal = normalizeYamlForComparison(originalGithubYaml);

            return normalizedCurrent !== normalizedOriginal;
        } catch (err) {
            console.error('Error comparing YAML:', err);
            return false;
        }
    }, [isPublishedContainer, originalGithubYaml, normalizeYamlForComparison]);

    // Helper function to get container name for URL
    const getContainerUrlName = (recipe: ContainerRecipe) => {
        if (recipe.name && recipe.name.trim()) {
            return recipe.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        }
        return `untitled-${new Date().toISOString().split('T')[0]}`;
    };

    // Helper function to find GitHub file by container name
    const findGithubFileByName = useCallback((containerName: string) => {
        return files.find(file => {
            const parts = file.path.split('/');
            const recipeName = parts[parts.length - 2] || '';
            return recipeName.toLowerCase() === containerName.toLowerCase();
        });
    }, [files]);

    // Update URL based on current container
    const updateUrl = useCallback((recipe: ContainerRecipe | null) => {
        if (recipe) {
            const urlName = getContainerUrlName(recipe);
            const newHash = `#/${urlName}`;
            if (window.location.hash !== newHash) {
                window.history.pushState(null, '', newHash);
                setCurrentRoute(urlName);
            }
        } else {
            if (window.location.hash !== '') {
                window.history.pushState(null, '', window.location.pathname);
                setCurrentRoute('');
            }
        }
    }, []);

    // Load container by name from local storage or GitHub
    const loadContainerByName = useCallback(async (containerName: string) => {
        // Don't load if we're editing or updating URL, or if we already have matching data
        if (isEditingName || isUpdatingUrl) return;

        // If we already have data and the URL name matches what we'd generate, don't load
        if (yamlData && getContainerUrlName(yamlData) === containerName) {
            setCurrentRoute(containerName);
            return;
        }

        setLoadingContainer(containerName);
        setContainerError(null);

        try {
            // First try to find in local storage
            const savedContainers = getSavedContainers();
            const localContainer = savedContainers.find(container => {
                const urlName = getContainerUrlName(container.data);
                return urlName === containerName.toLowerCase();
            });

            if (localContainer) {
                setYamlData(localContainer.data);
                setCurrentContainerId(localContainer.id);
                setSaveStatus(SaveStatus.Saved);
                const isPublished = !!findGithubFileByName(localContainer.data.name);
                setIsPublishedContainer(isPublished);

                // If published, fetch original GitHub YAML to compare for modifications
                if (isPublished) {
                    const githubFile = findGithubFileByName(localContainer.data.name);
                    if (githubFile?.downloadUrl) {
                        fetch(githubFile.downloadUrl)
                            .then(response => response.text())
                            .then(yamlText => {
                                setOriginalGithubYaml(yamlText);
                                checkIfModifiedFromGithub(localContainer.data).then(setIsModifiedFromGithub);
                            })
                            .catch(err => console.error('Error fetching GitHub YAML for comparison:', err));
                    }
                } else {
                    setOriginalGithubYaml("");
                    setIsModifiedFromGithub(false);
                }
                setLoadingContainer(null);
                return;
            }

            // If not found locally, try to load from GitHub
            const githubFile = findGithubFileByName(containerName);
            if (githubFile && githubFile.downloadUrl) {
                const response = await fetch(githubFile.downloadUrl);
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
                            `${githubFile.downloadUrl!.replace(/build\.yaml$/, '')}${filename}`
                        );
                        if (!fileResponse.ok) {
                            throw new Error(
                                `Failed to fetch additional file ${filename}: ${fileResponse.statusText}`
                            );
                        }
                        return await fileResponse.text();
                    }
                );

                setYamlData(parsedRecipe);
                setCurrentContainerId(null);
                setSaveStatus(SaveStatus.Unsaved);
                setIsPublishedContainer(true);
                setOriginalGithubYaml(yamlText);
                setIsModifiedFromGithub(false); // Just loaded from GitHub, so not modified
                setLoadingContainer(null);
            } else {
                // Container not found locally or on GitHub
                throw new Error(`Container "${containerName}" not found. It may not exist in the repository or your saved containers.`);
            }
        } catch (error) {
            console.error('Error loading container:', error);
            setContainerError(error instanceof Error ? error.message : 'Unknown error occurred while loading container');
            setLoadingContainer(null);
            // Don't automatically redirect on error, let user see the error message
        }
    }, [findGithubFileByName, checkIfModifiedFromGithub, isEditingName, isUpdatingUrl, yamlData]);

    // Handle browser back/forward buttons
    const handlePopState = useCallback(() => {
        // Don't handle navigation if we're editing the name or updating URL (to prevent race condition)
        if (isEditingName || isUpdatingUrl) return;

        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
            const containerName = hash.substring(2);
            if (containerName && containerName !== currentRoute) {
                setCurrentRoute(containerName);
                setContainerError(null); // Clear any previous errors
                loadContainerByName(containerName);
            }
        } else {
            setCurrentRoute('');
            setYamlData(null);
            setCurrentContainerId(null);
            setIsPublishedContainer(false);
            setSaveStatus(SaveStatus.Saved);
            setIsModifiedFromGithub(false);
            setOriginalGithubYaml("");
            setContainerError(null); // Clear errors when going home
            setLoadingContainer(null); // Clear loading state
        }
    }, [currentRoute, loadContainerByName, isEditingName, isUpdatingUrl]);

    // Initialize routing
    useEffect(() => {
        window.addEventListener('popstate', handlePopState);

        // Check initial URL
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
            const containerName = hash.substring(2);
            setCurrentRoute(containerName);
            if (files.length > 0) {
                loadContainerByName(containerName);
            }
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [files, handlePopState, loadContainerByName]);

    // Load container from URL when files are available
    useEffect(() => {
        // If we have a route but no data yet, try to load it
        // Don't load if we're currently editing the name (to prevent race condition)
        const hash = window.location.hash;
        if (hash.startsWith('#/') && !yamlData && files.length > 0 && !isEditingName && !isUpdatingUrl) {
            const containerName = hash.substring(2);
            loadContainerByName(containerName);
        }
    }, [files, yamlData, loadContainerByName, isEditingName, isUpdatingUrl]);

    // Debounced save function
    const debouncedSave = useCallback((data: ContainerRecipe) => {
        setSaveStatus(SaveStatus.Saving);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            const id = saveContainer(data, currentContainerId || undefined);
            if (!currentContainerId) {
                setCurrentContainerId(id);
            }
            setSaveStatus(SaveStatus.Saved);
        }, 1000); // 1 second debounce
    }, [currentContainerId]);

    // Handle name editing finished - update URL and container ID if needed
    const handleNameEditingFinished = useCallback((recipe: ContainerRecipe) => {
        if (!recipe) return;

        const newUrlName = getContainerUrlName(recipe);
        if (currentContainerId && currentRoute && currentRoute !== newUrlName) {
            // Name change affects URL - need to create new container to avoid URL mismatch
            setCurrentContainerId(null);
        }

        // Set flags to prevent race condition
        setIsUpdatingUrl(true);
        setIsEditingName(false);

        // Update URL and route directly without triggering load
        const urlName = getContainerUrlName(recipe);
        const newHash = `#/${urlName}`;
        if (window.location.hash !== newHash) {
            window.history.pushState(null, '', newHash);
            setCurrentRoute(urlName);
        }

        // Clear the updating flag after a brief delay
        setTimeout(() => setIsUpdatingUrl(false), 100);
    }, [currentContainerId, currentRoute]);

    const handleLoadRecipeFromList = (recipe: ContainerRecipe) => {
        setYamlData(recipe);
        setActiveSection(Section.BasicInfo);
        // Create new container ID for loaded recipes
        const id = saveContainer(recipe);
        setCurrentContainerId(id);
        setSaveStatus(SaveStatus.Saved);
        setIsPublishedContainer(true);
        setContainerError(null);
        setLoadingContainer(null);

        // Store original GitHub YAML for comparison
        const githubFile = findGithubFileByName(recipe.name);
        if (githubFile?.downloadUrl) {
            fetch(githubFile.downloadUrl)
                .then(response => response.text())
                .then(yamlText => {
                    setOriginalGithubYaml(yamlText);
                    setIsModifiedFromGithub(false); // Just loaded from GitHub
                })
                .catch(err => console.error('Error fetching GitHub YAML for comparison:', err));
        }

        updateUrl(recipe);
    };

    const handleLoadSavedContainer = (recipe: ContainerRecipe, id: string) => {
        setYamlData(recipe);
        setActiveSection(Section.BasicInfo);
        setCurrentContainerId(id);
        setSaveStatus(SaveStatus.Saved);
        const isPublished = !!findGithubFileByName(recipe.name);
        setIsPublishedContainer(isPublished);

        // If published, fetch original GitHub YAML to compare for modifications
        if (isPublished) {
            const githubFile = findGithubFileByName(recipe.name);
            if (githubFile?.downloadUrl) {
                fetch(githubFile.downloadUrl)
                    .then(response => response.text())
                    .then(yamlText => {
                        setOriginalGithubYaml(yamlText);
                        checkIfModifiedFromGithub(recipe).then(setIsModifiedFromGithub);
                    })
                    .catch(err => console.error('Error fetching GitHub YAML for comparison:', err));
            }
        } else {
            setOriginalGithubYaml("");
            setIsModifiedFromGithub(false);
        }

        updateUrl(recipe);
    };

    const handleDeleteSavedContainer = (id: string) => {
        deleteContainer(id);
        // If we're currently editing the deleted container, clear the current ID
        if (currentContainerId === id) {
            setCurrentContainerId(null);
        }
    };

    // Handle yamlData changes with debounced save
    useEffect(() => {
        if (yamlData) {
            setSaveStatus(SaveStatus.Unsaved);
            debouncedSave(yamlData);
            // Check if container is published when data changes
            setIsPublishedContainer(!!findGithubFileByName(yamlData.name));
            // Check if container is modified from GitHub version
            if (originalGithubYaml) {
                checkIfModifiedFromGithub(yamlData).then(setIsModifiedFromGithub);
            }
        }
    }, [yamlData, debouncedSave, findGithubFileByName, originalGithubYaml, checkIfModifiedFromGithub]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Load default YAML (don't auto-load from localStorage on startup)
        getDefaultYAML()
            .then((data) => {
                console.log("YAML data:", data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching YAML file:", error);
                setLoading(false);
            });
    }, []);

    // Update YAML text when yamlData changes
    useEffect(() => {
        if (yamlData) {
            try {
                setYamlText(dumpYAML(yamlData));
            } catch (err) {
                console.error("Error dumping YAML:", err);
            }
        }
    }, [yamlData]);

    const exportYAML = () => {
        if (!yamlData) return;

        const blob = new Blob([yamlText], { type: "text/yaml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${yamlData.name}-${yamlData.version}.yaml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNewContainer = () => {
        setYamlData(null);
        setCurrentContainerId(null);
        setSaveStatus(SaveStatus.Saved);
        setIsPublishedContainer(false);
        setIsModifiedFromGithub(false);
        setContainerError(null);
        setLoadingContainer(null);
        setOriginalGithubYaml("");
        updateUrl(null);
    };

    // Update yamlData from YAML text
    const updateFromYamlText = () => {
        try {
            const parsed = loadYAML(yamlText) as ContainerRecipe;
            setYamlData(parsed);
        } catch (err) {
            console.error("Error parsing YAML:", err);
        }
    };

    const scrollToSection = (sectionId: Section) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = window.innerWidth < 1024 ? 100 : 20; // Reduced mobile offset
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fdf2] flex">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="animate-pulse text-[#4f7b38] text-lg">
                            Loading...
                        </div>
                    </div>
                </div>
            ) : loadingContainer ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                        <div className="animate-spin h-12 w-12 border-4 border-[#6aa329] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <h2 className="text-lg font-semibold text-[#0c0e0a] mb-2">Loading Container</h2>
                        <p className="text-[#4f7b38]">
                            Loading &ldquo;{loadingContainer}&rdquo; from repository...
                        </p>
                    </div>
                </div>
            ) : containerError && !isEditingName && !isUpdatingUrl ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-[#0c0e0a] mb-2">Container Not Found</h2>
                        <p className="text-red-600 mb-6">
                            {containerError}
                        </p>
                        <div className="space-y-3">
                            {currentRoute && (
                                <button
                                    onClick={() => {
                                        const newContainer = getNewContainerYAML();
                                        // Convert URL format back to container name (remove hyphens, keep lowercase)
                                        newContainer.name = currentRoute.replace(/-/g, '').toLowerCase();
                                        setYamlData(newContainer);
                                        setActiveSection(Section.BasicInfo);
                                        setCurrentContainerId(null);
                                        setSaveStatus(SaveStatus.Unsaved);
                                        setIsPublishedContainer(false);
                                        setIsModifiedFromGithub(false);
                                        setOriginalGithubYaml("");
                                        setContainerError(null);
                                        setLoadingContainer(null);
                                        updateUrl(newContainer);
                                    }}
                                    className="w-full bg-[#6aa329] text-white px-4 py-2 rounded-md hover:bg-[#5a8f23] transition-colors font-medium"
                                >
                                    Create New Container &ldquo;{currentRoute}&rdquo;
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    window.history.pushState(null, '', window.location.pathname);
                                    setCurrentRoute('');
                                    setContainerError(null);
                                    setYamlData(null);
                                }}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            ) : yamlData ? (
                <>
                    {/* Sidebar Navigation */}
                    <SideNavigation
                        activeSection={activeSection}
                        onSectionChange={scrollToSection}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        yamlData={yamlData}
                        onNewContainer={handleNewContainer}
                        onExportYAML={exportYAML}
                        onOpenGitHub={() => setIsGitHubModalOpen(true)}
                        saveStatus={saveStatus}
                        isPublished={isPublishedContainer}
                        githubUrl={isPublishedContainer ? findGithubFileByName(yamlData?.name || '')?.htmlUrl : undefined}
                        isModified={isModifiedFromGithub}
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-h-screen">
                        {/* Top Navigation for Mobile */}
                        <TopNavigation
                            activeSection={activeSection}
                            onSectionChange={scrollToSection}
                            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                            yamlData={yamlData}
                            onNewContainer={handleNewContainer}
                            onOpenGitHub={() => setIsGitHubModalOpen(true)}
                            saveStatus={saveStatus}
                        />

                        <div className="max-w-5xl mx-auto px-4 py-6 pt-24 lg:pt-6">
                            {/* All Sections */}
                            <div className="space-y-8">
                                {/* Basic Info Section */}
                                <section id={Section.BasicInfo}>
                                    <SectionHeader
                                        icon={InformationCircleIcon}
                                        title="Basic Information"
                                        description="Configure your container's metadata and basic settings"
                                    />
                                    <ContainerMetadata
                                        recipe={yamlData}
                                        onChange={(updated) => setYamlData(updated)}
                                        onNameEditStart={() => setIsEditingName(true)}
                                        onNameEditFinish={() => handleNameEditingFinished(yamlData)}
                                    />
                                </section>

                                {/* Build Recipe Section */}
                                <section id={Section.BuildRecipe}>
                                    <SectionHeader
                                        icon={CogIcon}
                                        title="Build Recipe"
                                        description="Define the build process and software installation steps"
                                    />
                                    <BuildRecipeComponent
                                        recipe={yamlData.build}
                                        onChange={(updated) =>
                                            setYamlData({ ...yamlData, build: updated })
                                        }
                                    />
                                </section>

                                {/* Validate Section */}
                                <section id={Section.ValidateRecipe}>
                                    <SectionHeader
                                        icon={CheckCircleIcon}
                                        title="Validate & Generate"
                                        description="Test your configuration and generate the final container"
                                    />
                                    <ValidateRecipeComponent recipe={yamlData} />
                                </section>

                                {/* YAML Preview */}
                                <section className="mb-6">
                                    <div
                                        className="p-4 bg-gradient-to-r from-[#f8fdf2] to-[#f0f7e7] rounded-t-lg flex justify-between items-center cursor-pointer hover:from-[#f0f7e7] hover:to-[#e6f1d6] transition-colors"
                                        onClick={() =>
                                            document
                                                .getElementById("yaml-preview")
                                                ?.classList.toggle("hidden")
                                        }
                                    >
                                        <h3 className="font-semibold text-[#0c0e0a]">
                                            YAML Preview
                                        </h3>
                                        <ChevronDownIcon className="h-5 w-5 text-[#4f7b38]" />
                                    </div>

                                    <div id="yaml-preview" className="hidden p-4">
                                        <textarea
                                            className="w-full h-64 px-3 py-2 font-mono text-sm bg-[#1e2a16] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6aa329]"
                                            value={yamlText}
                                            onChange={(e) => setYamlText(e.target.value)}
                                            onBlur={updateFromYamlText}
                                        ></textarea>
                                        <div className="mt-3 text-right">
                                            <button
                                                className="bg-[#6aa329] text-white px-4 py-2 rounded-lg hover:bg-[#4f7b38] transition-colors font-medium"
                                                onClick={updateFromYamlText}
                                            >
                                                Apply YAML Changes
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 p-6 min-h-screen">
                    <div className="max-w-6xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6aa329] rounded-2xl mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-[#0c0e0a] mb-4">
                                Neurocontainers Builder
                            </h1>
                            <p className="text-xl text-[#4f7b38] mb-8 max-w-2xl mx-auto">
                                Create reproducible neuroimaging containers with ease. Build, validate, and publish
                                containerized neuroimaging tools using our intuitive visual interface.
                            </p>
                        </div>

                        {/* Action Cards at Top */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <button
                                className="group p-6 bg-white border-2 border-[#e6f1d6] rounded-xl hover:border-[#6aa329] hover:shadow-lg transition-all duration-300 text-left"
                                onClick={() => {
                                    const newContainer = getNewContainerYAML();
                                    setYamlData(newContainer);
                                    setActiveSection(Section.BasicInfo);
                                    setCurrentContainerId(null);
                                    setSaveStatus(SaveStatus.Unsaved);
                                    setIsPublishedContainer(false);
                                    setIsModifiedFromGithub(false);
                                    setOriginalGithubYaml("");
                                    setContainerError(null);
                                    setLoadingContainer(null);
                                    updateUrl(newContainer);
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-[#6aa329] rounded-lg mr-4 group-hover:scale-110 transition-transform">
                                        <PlusIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#0c0e0a]">
                                            Create New Container
                                        </h3>
                                        <p className="text-[#4f7b38] text-sm">
                                            Start from scratch with guided workflow
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <div
                                className="group p-6 bg-white border-2 border-dashed border-[#e6f1d6] rounded-xl hover:border-[#6aa329] hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
                                onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".yaml, .yml";
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const text = event.target?.result as string;
                                                try {
                                                    let parsed = loadYAML(text) as ContainerRecipe;
                                                    parsed = migrateLegacyRecipe(parsed);
                                                    setYamlData(parsed);
                                                    setCurrentContainerId(null);
                                                    setSaveStatus(SaveStatus.Unsaved);
                                                    setIsPublishedContainer(!!findGithubFileByName(parsed.name));
                                                    setIsModifiedFromGithub(false);
                                                    setOriginalGithubYaml("");
                                                    updateUrl(parsed);
                                                } catch (err) {
                                                    console.error("Error parsing YAML:", err);
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    };
                                    input.click();
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const text = event.target?.result as string;
                                            try {
                                                let parsed = loadYAML(text) as ContainerRecipe;
                                                parsed = migrateLegacyRecipe(parsed);
                                                setYamlData(parsed);
                                                setCurrentContainerId(null);
                                                setSaveStatus(SaveStatus.Unsaved);
                                                setIsPublishedContainer(!!findGithubFileByName(parsed.name));
                                                setIsModifiedFromGithub(false);
                                                setOriginalGithubYaml("");
                                                updateUrl(parsed);
                                            } catch (err) {
                                                console.error("Error parsing YAML:", err);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-[#1e2a16] rounded-lg mr-4 group-hover:scale-110 transition-transform">
                                        <ArrowUpTrayIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#0c0e0a]">
                                            Upload YAML Recipe
                                        </h3>
                                        <p className="text-[#4f7b38] text-sm">
                                            Import existing recipe file or drag & drop
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Local and Remote Containers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Local Containers */}
                            <LocalContainersList
                                onLoadContainer={handleLoadSavedContainer}
                                onDeleteContainer={handleDeleteSavedContainer}
                                githubFiles={files}
                            />

                            {/* Remote Containers */}
                            <RemoteContainersList
                                onLoadRecipe={handleLoadRecipeFromList}
                            />
                        </div>

                        {/* Footer */}
                        <Footer />
                    </div>
                </div>
            )}

            {/* GitHub Export Modal */}
            <GitHubModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
                yamlData={yamlData}
                yamlText={yamlText}
            />

        </div>
    );
}