"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { ContainerRecipe } from "@/components/common";
import { SaveIndicator } from "@/components/SaveIndicator";
import { SaveStatus } from "@/lib/containerStorage";
import { cn } from "@/lib/styles";
import { ThemeToggleIcon } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/ThemeContext";
import { Logo } from "@/components/ui/Logo";

interface TopNavigationProps {
    onSidebarToggle: () => void;
    yamlData: ContainerRecipe | null;
    onNewContainer: () => void;
    onOpenGitHub: () => void;
    saveStatus: SaveStatus;
    filesystemMode?: 'local' | 'remote';
    hasMetadataErrors?: boolean;
}

export function TopNavigation({
    onSidebarToggle,
    yamlData,
    onNewContainer,
    onOpenGitHub,
    saveStatus,
    filesystemMode,
    hasMetadataErrors,
}: TopNavigationProps) {
    const { isDark } = useTheme();
    return (
        <div className={cn(
            "fixed top-0 left-0 right-0 border-b p-3 lg:hidden z-30",
            isDark
                ? "bg-[#0a0c08] border-[#1f2e18]"
                : "bg-white border-[#e6f1d6]"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onSidebarToggle}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            isDark 
                                ? "text-white hover:bg-[#1f2e18]" 
                                : "text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                    <div>
                        <Logo className="h-5 w-auto" />
                        <p className={cn(
                            "text-[10px] mt-0.5 font-medium",
                            isDark ? "text-[#91c84a]" : "text-green-600"
                        )}>
                            Container Builder
                        </p>
                    </div>
                </div>

                {/* Action buttons for mobile */}
                <div className="flex items-center space-x-2">
                    <ThemeToggleIcon />
                    <button
                        className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                            isDark
                                ? "bg-[#1f2e18] hover:bg-[#171e13] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        )}
                        onClick={onNewContainer}
                    >
                        New
                    </button>
                    <button
                        className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            isDark
                                ? "bg-green-700 hover:bg-green-600 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                        )}
                        onClick={onOpenGitHub}
                        disabled={!yamlData || hasMetadataErrors}
                        title={!yamlData ? "No recipe data available" : hasMetadataErrors ? "Please fix the metadata validation errors in the Basic Information section before publishing" : "Publish recipe to GitHub"}
                    >
                        Publish
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
    );
}