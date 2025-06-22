import { FolderOpenIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useCallback, useMemo } from "react";
import { filesystemService, isFileSystemAccessSupported, isSecureContext, NeurocontainerRecipeFile } from "@/lib/filesystem";
import { buttonStyles, iconStyles, textStyles, inputStyles, cn, useThemeStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

interface LocalFilesystemProps {
    onRecipeSelect: (content: string, filename: string) => void;
}

export default function LocalFilesystem({ onRecipeSelect }: LocalFilesystemProps) {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);
    const [isSupported] = useState(isFileSystemAccessSupported() && isSecureContext());
    const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
    const [recipes, setRecipes] = useState<NeurocontainerRecipeFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter recipes based on search term
    const filteredRecipes = useMemo(() => {
        if (!searchTerm) return recipes;
        return recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.path.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recipes, searchTerm]);

    const loadRecipes = useCallback(async () => {
        if (!filesystemService.isDirectoryOpen()) return;

        setIsLoading(true);
        try {
            const recipeFiles = await filesystemService.getRecipeFiles();
            setRecipes(recipeFiles);
            setError(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load recipes';
            setError(errorMessage);
            console.error('Failed to load recipes:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleOpenDirectory = useCallback(async () => {
        if (!isSupported) {
            setError('File System Access API is not supported in this browser or context');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await filesystemService.openNeurocontainersDirectory();
            setIsDirectoryOpen(true);

            // Load recipes from the directory
            await loadRecipes();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to open directory';
            setError(errorMessage);
            console.error('Failed to open directory:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, loadRecipes]);

    useEffect(() => {
        // Check if directory is already open on component mount
        const isOpen = filesystemService.isDirectoryOpen();
        setIsDirectoryOpen(isOpen);
        if (isOpen) {
            loadRecipes();
        }
    }, [loadRecipes]);

    const handleRecipeSelect = async (recipe: NeurocontainerRecipeFile) => {
        try {
            onRecipeSelect(recipe.content, recipe.name);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load recipe';
            setError(errorMessage);
            console.error('Failed to load recipe:', error);
        }
    };

    const handleCloseDirectory = () => {
        filesystemService.closeDirectory();
        setIsDirectoryOpen(false);
        setRecipes([]);
        setError(null);
        setSearchTerm('');
    };

    const handleRefresh = useCallback(async () => {
        if (isDirectoryOpen) {
            await loadRecipes();
        }
    }, [isDirectoryOpen, loadRecipes]);

    if (!isSupported) {
        return (
            <div className={cn(
                "border rounded-lg p-4 m-4",
                isDark ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
            )}>
                <div className="flex items-start">
                    <ExclamationTriangleIcon className={cn(
                        iconStyles(isDark, 'md'),
                        "mr-2 flex-shrink-0 mt-0.5",
                        isDark ? "text-yellow-400" : "text-yellow-600"
                    )} />
                    <div>
                        <h4 className={cn(
                            textStyles(isDark, { size: 'sm', weight: 'medium' }),
                            isDark ? "text-yellow-400" : "text-yellow-800"
                        )}>
                            Browser Not Supported
                        </h4>
                        <p className={cn(
                            textStyles(isDark, { size: 'sm' }),
                            "mt-1",
                            isDark ? "text-yellow-300" : "text-yellow-700"
                        )}>
                            Local filesystem access requires a modern browser with File System Access API support and HTTPS.
                            Try Chrome, Edge, or another Chromium-based browser.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!isDirectoryOpen ? (
                <div className="p-8 text-center">
                    <FolderOpenIcon className={cn(
                        "h-12 w-12 mx-auto mb-4",
                        isDark ? "text-[#9ca3af]" : "text-gray-400"
                    )} />
                    <h3 className={cn(
                        textStyles(isDark, { size: 'lg', weight: 'medium', color: 'primary' }),
                        "mb-2"
                    )}>
                        Open Local Repository
                    </h3>
                    <p className={cn(
                        textStyles(isDark, { size: 'sm', color: 'muted' }),
                        "mb-4"
                    )}>
                        Select your local neurocontainers repository directory to edit recipes directly.
                    </p>
                    <button
                        onClick={handleOpenDirectory}
                        disabled={isLoading}
                        className={cn(
                            buttonStyles(isDark, 'primary', 'md'),
                            "inline-flex items-center px-4 py-2",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Opening...
                            </>
                        ) : (
                            <>
                                <FolderOpenIcon className={cn(iconStyles(isDark, 'sm'), "mr-2")} />
                                Open Directory
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <>
                    {/* Connected Header */}
                    <div className={cn(
                        "p-4 border-b flex items-center justify-between",
                        isDark ? "border-[#2d4222]" : "border-[#f0f7e7]"
                    )}>
                        <div className={cn(textStyles(isDark, { size: 'sm', color: 'secondary' }))}>
                            Connected to local repository - {recipes.length} recipes
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className={cn(
                                    styles.buttons.icon,
                                    "p-1.5 transition-colors",
                                    isDark
                                        ? "text-[#9ca3af] hover:text-[#7bb33a]"
                                        : "text-gray-400 hover:text-[#6aa329]"
                                )}
                                title="Refresh"
                            >
                                <ArrowPathIcon className={iconStyles(isDark, 'sm')} />
                            </button>
                            <button
                                onClick={handleCloseDirectory}
                                className={cn(
                                    styles.buttons.icon,
                                    "p-1.5 transition-colors",
                                    isDark
                                        ? "text-[#9ca3af] hover:text-red-400"
                                        : "text-gray-400 hover:text-red-500"
                                )}
                                title="Close Directory"
                            >
                                <XMarkIcon className={iconStyles(isDark, 'sm')} />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className={cn(
                        "p-4 border-b",
                        isDark ? "border-[#2d4222]" : "border-[#f0f7e7]"
                    )}>
                        <div className="relative">
                            <MagnifyingGlassIcon className={cn(
                                iconStyles(isDark, 'sm', 'muted'),
                                "absolute left-3 top-1/2 transform -translate-y-1/2"
                            )} />
                            <input
                                type="text"
                                placeholder="Search local recipes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(
                                    inputStyles(isDark),
                                    "w-full pl-9 pr-3 py-2",
                                    isDark
                                        ? "bg-[#161a0e] focus:ring-2 focus:ring-[#7bb33a] focus:border-transparent"
                                        : "bg-gray-50 focus:ring-2 focus:ring-[#6aa329] focus:border-transparent"
                                )}
                            />
                        </div>
                    </div>

                    {/* Recipe list */}
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className={cn(
                                "animate-spin h-8 w-8 border-2 border-t-transparent rounded-full mx-auto mb-2",
                                isDark ? "border-[#7bb33a]" : "border-[#6aa329]"
                            )}></div>
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }))}>Loading recipes...</p>
                        </div>
                    ) : filteredRecipes.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            <div className={cn(
                                "divide-y",
                                isDark ? "divide-[#2d4222]" : "divide-[#f0f7e7]"
                            )}>
                                {filteredRecipes.map((recipe) => (
                                    <div
                                        key={recipe.name}
                                        className={cn(
                                            "group p-4 transition-colors",
                                            isDark ? "hover:bg-[#1f2e18]" : "hover:bg-[#fafdfb]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    textStyles(isDark, { size: 'sm', weight: 'medium', color: 'primary' }),
                                                    "truncate"
                                                )}>
                                                    {recipe.name}
                                                </h4>
                                                <p className={cn(
                                                    textStyles(isDark, { size: 'xs', color: 'muted' }),
                                                    "mt-1 font-mono truncate"
                                                )}>
                                                    {recipe.path}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-3">
                                                <button
                                                    onClick={() => handleRecipeSelect(recipe)}
                                                    className={cn(
                                                        styles.buttons.primary,
                                                        "px-3 py-1.5 text-xs"
                                                    )}
                                                >
                                                    Load
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : searchTerm ? (
                        <div className="p-8 text-center">
                            <MagnifyingGlassIcon className={cn(
                                "h-8 w-8 mx-auto mb-2",
                                isDark ? "text-[#9ca3af]" : "text-gray-400"
                            )} />
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }), "mb-2")}>No recipes found matching &ldquo;{searchTerm}&rdquo;</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className={cn(
                                    textStyles(isDark, { size: 'xs', weight: 'medium' }),
                                    isDark
                                        ? "text-[#7bb33a] hover:text-[#91c84a]"
                                        : "text-[#6aa329] hover:text-[#4f7b38]"
                                )}
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'muted' }))}>
                                No recipe files found in the repository.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Error display */}
            {error && (
                <div className={cn(
                    "border rounded-lg p-4 m-4",
                    isDark ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"
                )}>
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className={cn(
                            iconStyles(isDark, 'md'),
                            "mr-2 flex-shrink-0 mt-0.5",
                            isDark ? "text-red-400" : "text-red-600"
                        )} />
                        <div>
                            <h4 className={cn(
                                textStyles(isDark, { size: 'sm', weight: 'medium' }),
                                isDark ? "text-red-400" : "text-red-800"
                            )}>
                                Error
                            </h4>
                            <p className={cn(
                                textStyles(isDark, { size: 'sm' }),
                                "mt-1",
                                isDark ? "text-red-300" : "text-red-700"
                            )}>
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}