"use client";

import {
    XMarkIcon,
    RectangleStackIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ComputerDesktopIcon,
    CloudArrowUpIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ContainerRecipe } from "@/components/common";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/lib/containerStorage";
import { cn } from "@/lib/styles";
import { ThemeToggleIcon } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/ThemeContext";
import { Logo } from "@/components/ui/Logo";

interface SideNavigationProps {
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
    filesystemMode?: 'local' | 'remote';
    isLocalFilesystemConnected?: boolean;
    onSaveToLocalFilesystem?: () => void;
    hasMetadataErrors?: boolean;
}

export function SideNavigation({
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
    filesystemMode,
    isLocalFilesystemConnected,
    onSaveToLocalFilesystem,
    hasMetadataErrors,
}: SideNavigationProps) {
    const { isDark } = useTheme();
    const actionStyle = cn(
        "w-full flex items-center space-x-3 px-4 py-3 md:px-3 md:py-2",
        "text-base md:text-sm font-medium min-h-[48px] md:min-h-[auto]",
        isDark 
            ? "text-[#c4e382] hover:text-[#e8f5d0] hover:bg-[#161a0e]" 
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
        "rounded-lg md:rounded-md transition-colors touch-manipulation",
        "disabled:opacity-50 disabled:cursor-not-allowed",
    );
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
                className={cn(
                    "fixed top-0 left-0 h-full lg:h-screen",
                    "w-full lg:w-64 border-r lg:border-r",
                    "transform transition-transform duration-300 ease-in-out z-50 lg:z-auto",
                    "flex flex-col lg:flex-shrink-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    isDark
                        ? "bg-[#0a0c08] border-[#2d4222]"
                        : "bg-white border-gray-200"
                )}
            >
                {/* Header with Logo */}
                <div className={cn(
                    "p-4 border-b",
                    isDark
                        ? "border-[#2d4222] bg-[#161a0e]"
                        : "border-gray-200 bg-gray-50"
                )}>
                    <div className="flex items-center justify-between">
                        <div>
                            <Logo className="h-6 w-auto" />
                            <p className={cn(
                                "text-xs mt-1 font-medium",
                                isDark ? "text-[#91c84a]" : "text-gray-600"
                            )}>
                                Container Builder
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemeToggleIcon />
                            <button
                                onClick={onToggle}
                                className={cn(
                                    "lg:hidden p-2 rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center",
                                    isDark ? "hover:bg-[#1e2a16] text-white" : "hover:bg-[#e6f1d6]"
                                )}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    {/* Save Status */}
                    {yamlData && (
                        <div className="mt-2">
                            <SaveIndicator status={saveStatus} mode={filesystemMode} />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={cn(
                    "flex-1 p-3",
                    isDark ? "bg-[#0a0c08]" : "bg-white"
                )}>
                    <div className="space-y-1">
                        <button
                            className={actionStyle}
                            onClick={onNewContainer}
                        >
                            <RectangleStackIcon className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
                            <span>Container Library</span>
                        </button>
                        <button
                            className={actionStyle}
                            onClick={onExportYAML}
                            disabled={!yamlData}
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
                            <span>Download YAML</span>
                        </button>
                        {isPublished && githubUrl ? (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={actionStyle}
                            >
                                <EyeIcon className="h-4 w-4" />
                                <span>View on GitHub</span>
                            </a>

                        ) : (<></>)}
                        {filesystemMode === 'local' && isLocalFilesystemConnected && (
                            <button
                                className={actionStyle}
                                onClick={onSaveToLocalFilesystem}
                                disabled={!yamlData}
                            >
                                <div className="flex items-center space-x-2">
                                    <ComputerDesktopIcon className="h-4 w-4" />
                                    <span>Save to Local Filesystem</span>
                                </div>
                                <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Ctrl+S</span>
                            </button>
                        )}
                        <button
                            className={actionStyle}
                            onClick={onOpenGitHub}
                            disabled={!yamlData || hasMetadataErrors}
                            title={!yamlData ? "No recipe data available" : hasMetadataErrors ? "Please fix the metadata validation errors in the Basic Information section before publishing" : "Publish recipe to GitHub"}
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                            <span>Publish to GitHub</span>
                        </button>
                        <a
                            href="https://github.com/neurodesk/neurocontainers-ui/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={actionStyle}
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Report an Issue</span>
                        </a>
                    </div>
                </div>

                {/* Unpublished Warning */}
                {yamlData && !isPublished && (
                    <div className={cn(
                        "p-3 border-t mt-auto", 
                        isDark 
                            ? "bg-orange-900/20 border-[#2d4222]" 
                            : "border-gray-200 bg-orange-50"
                    )}>
                        <div className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className={cn(
                                "h-4 w-4 flex-shrink-0 mt-0.5", 
                                isDark ? "text-orange-400" : "text-orange-600"
                            )} />
                            <div>
                                <p className={cn(
                                    "text-xs font-medium", 
                                    isDark ? "text-orange-200" : "text-orange-800"
                                )}>
                                    Unpublished Container
                                </p>
                                <p className={cn(
                                    "text-xs mt-1", 
                                    isDark ? "text-orange-300" : "text-orange-700"
                                )}>
                                    This container is not available in the public repository. Consider publishing it to make it accessible to others.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modified Warning */}
                {yamlData && isPublished && isModified && (
                    <div className={cn(
                        "p-3 border-t mt-auto", 
                        isDark 
                            ? "bg-yellow-900/20 border-[#2d4222]" 
                            : "border-gray-200 bg-yellow-50"
                    )}>
                        <div className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className={cn(
                                "h-4 w-4 flex-shrink-0 mt-0.5", 
                                isDark ? "text-yellow-400" : "text-yellow-600"
                            )} />
                            <div>
                                <p className={cn(
                                    "text-xs font-medium", 
                                    isDark ? "text-yellow-200" : "text-yellow-800"
                                )}>
                                    Modified Container
                                </p>
                                <p className={cn(
                                    "text-xs mt-1", 
                                    isDark ? "text-yellow-300" : "text-yellow-700"
                                )}>
                                    This container has been modified from the published version. Your changes are only saved locally.
                                </p>
                            </div>
                        </div>
                    </div>
                )}


            </nav>
        </>
    );
}