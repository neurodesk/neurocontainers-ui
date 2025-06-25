"use client";

import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { useState, useEffect, useCallback } from "react";
import { ExclamationTriangleIcon, PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { ContainerRecipe, migrateLegacyRecipe, mergeAdditionalFilesIntoRecipe } from "@/components/common";
import BuildRecipeComponent from "@/components/recipe";
import ContainerMetadata from "@/components/metadata";
import ValidateRecipeComponent from "@/components/validate";
import GitHubModal from "@/components/githubExport";
import { useGitHubFiles } from '@/lib/useGithub';
import { cn, useThemeStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

// Extracted components
import { LocalContainersList } from "@/components/LocalContainersList";
import { RemoteContainersList } from "@/components/RemoteContainersList";
import { SideNavigation } from "@/components/SideNavigation";
import { TopNavigation } from "@/components/TopNavigation";
import { SectionHeader } from "@/components/SectionHeader";
import { Footer } from "@/components/Footer";

// Extracted utilities and types
import { sections } from "@/lib/sections";
import { getNewContainerYAML } from "@/lib/containerStorage";

// Extracted hooks
import { useContainerStorage } from "@/hooks/useContainerStorage";
import { useContainerPublishing } from "@/hooks/useContainerPublishing";

export default function Home() {
    const { isDark } = useTheme();
    const styles = useThemeStyles(isDark);

    // Core state
    const [yamlData, setYamlData] = useState<ContainerRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingContainer, setLoadingContainer] = useState<string | null>(null);
    const [containerError, setContainerError] = useState<string | null>(null);
    const [yamlText, setYamlText] = useState("");
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditingName] = useState<boolean>(false);
    const [isUpdatingUrl] = useState<boolean>(false);
    const [filesystemMode, setFilesystemMode] = useState<'local' | 'remote'>('remote');
    const [isLocalFilesystemConnected, setIsLocalFilesystemConnected] = useState<boolean>(false);
    const [hasMetadataErrors, setHasMetadataErrors] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Custom hooks
    const {
        saveStatus,
        currentContainerId,
        saveToStorage,
        deleteContainer,
        exportYAML,
        setCurrentContainerId
    } = useContainerStorage();

    const {
        isPublishedContainer,
        isModifiedFromGithub,
        currentRoute,
        checkIfModifiedFromGithub,
        getGithubUrl,
        checkIfPublished,
        setOriginalYaml,
        setIsModifiedFromGithub,
        setCurrentRoute,
        resetPublishingState,
    } = useContainerPublishing();

    const { files } = useGitHubFiles("neurodesk", "neurocontainers", "main");

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
            const urlName = recipe.name?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `untitled-${new Date().toISOString().split('T')[0]}`;
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
    }, [setCurrentRoute]);

    // Check if a container should be auto-saved
    const shouldAutoSave = useCallback((recipe: ContainerRecipe): boolean => {
        return recipe.name.trim() !== '' ||
            recipe.version.trim() !== '' ||
            (recipe.build.directives && recipe.build.directives.length > 0);
    }, []);

    // Auto-save container data
    const autoSaveContainer = useCallback((data: ContainerRecipe) => {
        if (shouldAutoSave(data)) {
            saveToStorage(data, currentContainerId ?? undefined);
        }
    }, [shouldAutoSave, saveToStorage, currentContainerId]);

    // Load container from GitHub or local
    const loadContainer = useCallback(async (recipe: ContainerRecipe, id?: string) => {
        setYamlData(recipe);
        setCurrentContainerId(id || null);

        // Check if published
        if (recipe.name) {
            checkIfPublished(recipe.name, files);
        }

        updateUrl(recipe);
        setContainerError(null);
        setLoadingContainer(null);
    }, [setCurrentContainerId, checkIfPublished, files, updateUrl]);

    // Load container by name from URL
    const loadContainerByName = useCallback(async (containerName: string) => {
        setLoadingContainer(containerName);
        setContainerError(null);

        try {
            // First try to find it in GitHub
            const githubFile = findGithubFileByName(containerName);
            if (githubFile && githubFile.downloadUrl) {
                const response = await fetch(githubFile.downloadUrl);
                if (response.ok) {
                    const yamlText = await response.text();
                    let recipe = loadYAML(yamlText) as ContainerRecipe;
                    recipe = migrateLegacyRecipe(recipe);
                    recipe = await mergeAdditionalFilesIntoRecipe(
                        recipe,
                        async (filename: string) => {
                            const fileResponse = await fetch(
                                `${githubFile.downloadUrl!.replace(/build\.yaml$/, '')}${filename}`
                            );
                            if (!fileResponse.ok) {
                                throw new Error(`Failed to fetch additional file ${filename}`);
                            }
                            return await fileResponse.text();
                        }
                    );

                    setOriginalYaml(yamlText);
                    await loadContainer(recipe);
                    return;
                }
            }

            // If not found in GitHub, create new container
            const newContainer = getNewContainerYAML();
            newContainer.name = containerName.replace(/-/g, '').toLowerCase();
            await loadContainer(newContainer);

        } catch (error) {
            console.error('Error loading container:', error);
            setContainerError(`Container "${containerName}" could not be loaded.`);
        } finally {
            setLoadingContainer(null);
        }
    }, [findGithubFileByName, loadContainer, setOriginalYaml]);

    // Handle data changes
    const handleDataChange = useCallback((newData: ContainerRecipe) => {
        setYamlData(newData);
        updateUrl(newData);

        if (newData.name) {
            checkIfPublished(newData.name, files);
        }

        // Check if modified from GitHub
        if (isPublishedContainer) {
            checkIfModifiedFromGithub(newData).then(setIsModifiedFromGithub);
        }

        autoSaveContainer(newData);
    }, [updateUrl, checkIfPublished, files, isPublishedContainer, checkIfModifiedFromGithub, setIsModifiedFromGithub, autoSaveContainer]);


    // Handle new container
    const handleNewContainer = useCallback(() => {
        setYamlData(null);
        setContainerError(null);
        setLoadingContainer(null);
        setIsSidebarOpen(false);
        resetPublishingState();
        updateUrl(null);
    }, [resetPublishingState, updateUrl]);

    // Handle GitHub export
    const handleOpenGitHub = useCallback(() => {
        if (yamlData) {
            const yamlString = dumpYAML(yamlData, {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
                sortKeys: false
            });
            setYamlText(yamlString);
        }
        setIsGitHubModalOpen(true);
    }, [yamlData]);

    // Handle YAML export
    const handleExportYAML = useCallback(() => {
        if (yamlData) {
            exportYAML(yamlData);
        }
    }, [yamlData, exportYAML]);

    // Save to local filesystem
    const saveToLocalFilesystem = useCallback(async () => {
        if (!yamlData) return;

        try {
            // TODO: Implement saveYamlFile method in filesystem service
            console.log('Save to filesystem:', yamlData);
        } catch (error) {
            console.error('Failed to save to local filesystem:', error);
        }
    }, [yamlData]);

    // Handle file processing for both upload and drag-drop
    const processYamlFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const recipe = loadYAML(content) as ContainerRecipe;
                const migratedRecipe = migrateLegacyRecipe(recipe);
                // Generate a new ID and save immediately
                const newId = `uploaded-${Date.now()}`;
                loadContainer(migratedRecipe, newId);
                saveToStorage(migratedRecipe, newId);
            } catch (error) {
                console.error('Failed to load YAML file:', error);
                alert('Failed to load YAML file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }, [loadContainer, saveToStorage]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const yamlFile = files.find(file => 
            file.name.endsWith('.yaml') || file.name.endsWith('.yml')
        );

        if (yamlFile) {
            processYamlFile(yamlFile);
        } else {
            alert('Please drop a YAML file (.yaml or .yml)');
        }
    }, [processYamlFile]);

    // Initialize app
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check for URL hash
                const hash = window.location.hash;
                if (hash.startsWith('#/')) {
                    const containerName = hash.substring(2);
                    await loadContainerByName(containerName);
                }
            } catch (error) {
                console.error('Failed to initialize:', error);
                const newContainer = getNewContainerYAML();
                await loadContainer(newContainer);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, [loadContainer, loadContainerByName]);

    // Handle browser navigation
    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/')) {
                const containerName = hash.substring(2);
                if (containerName !== currentRoute) {
                    loadContainerByName(containerName);
                }
            } else if (currentRoute) {
                const newContainer = getNewContainerYAML();
                loadContainer(newContainer);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentRoute, loadContainer, loadContainerByName]);

    // Handle filesystem connection
    useEffect(() => {
        const checkConnection = async () => {
            try {
                // TODO: Implement isConnected method in filesystem service
                const isConnected = false;
                setIsLocalFilesystemConnected(isConnected);
            } catch {
                setIsLocalFilesystemConnected(false);
            }
        };

        if (filesystemMode === 'local') {
            checkConnection();
        }
    }, [filesystemMode]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                if (filesystemMode === 'local' && isLocalFilesystemConnected && yamlData) {
                    saveToLocalFilesystem();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filesystemMode, isLocalFilesystemConnected, yamlData, saveToLocalFilesystem]);


    return (
        <div className={cn("min-h-screen flex", isDark ? "bg-[#161a0e]" : "bg-[#f8fdf2]")}>
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className={cn("rounded-lg shadow-md p-8 text-center", styles.cards.default)}>
                        <div className={cn("animate-pulse text-lg", isDark ? "text-[#91c84a]" : "text-[#4f7b38]")}>
                            Loading...
                        </div>
                    </div>
                </div>
            ) : loadingContainer ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className={cn("rounded-lg shadow-md p-8 text-center max-w-md", styles.cards.default)}>
                        <div className={cn("animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4", isDark ? "border-[#7bb33a]" : "border-[#6aa329]")}></div>
                        <h2 className={cn("text-lg font-semibold mb-2", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>Loading Container</h2>
                        <p className={cn(isDark ? "text-[#91c84a]" : "text-[#4f7b38]")}>
                            Loading &ldquo;{loadingContainer}&rdquo; from repository...
                        </p>
                    </div>
                </div>
            ) : containerError && !isEditingName && !isUpdatingUrl ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className={cn("rounded-lg shadow-md p-8 text-center max-w-md", styles.cards.default)}>
                        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className={cn("text-lg font-semibold mb-2", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>Container Not Found</h2>
                        <p className={cn("mb-6", isDark ? "text-red-400" : "text-red-600")}>
                            {containerError}
                        </p>
                        <button
                            onClick={handleNewContainer}
                            className={cn("w-full px-4 py-2 rounded-md transition-colors font-medium", isDark ? "bg-[#7bb33a] text-white hover:bg-[#6aa329]" : "bg-[#6aa329] text-white hover:bg-[#4f7b38]")}
                        >
                            Create New Container
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Navigation */}
                    <SideNavigation
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        yamlData={yamlData}
                        onNewContainer={handleNewContainer}
                        onExportYAML={handleExportYAML}
                        onOpenGitHub={handleOpenGitHub}
                        saveStatus={saveStatus}
                        isPublished={isPublishedContainer}
                        githubUrl={yamlData ? getGithubUrl(yamlData) : ""}
                        isModified={isModifiedFromGithub}
                        filesystemMode={filesystemMode}
                        isLocalFilesystemConnected={isLocalFilesystemConnected}
                        onSaveToLocalFilesystem={saveToLocalFilesystem}
                        hasMetadataErrors={hasMetadataErrors}
                    />

                    <TopNavigation
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        yamlData={yamlData}
                        onNewContainer={handleNewContainer}
                        onOpenGitHub={handleOpenGitHub}
                        saveStatus={saveStatus}
                        filesystemMode={filesystemMode}
                        hasMetadataErrors={hasMetadataErrors}
                    />

                    {/* Main Content */}
                    <div className="flex-1 lg:ml-0 min-h-screen">
                        {!yamlData ? (
                            /* Container Selection View */
                            <div className="max-w-6xl mx-auto p-6 pt-20 lg:pt-6">
                                {/* Hero Section with Action Buttons */}
                                <div className="text-center mb-8">
                                    <h1 className={cn("text-3xl font-bold mb-4", isDark ? "text-[#e8f5d0]" : "text-[#0c0e0a]")}>
                                        NeuroContainers Builder
                                    </h1>
                                    <p className={cn("text-lg mb-8", isDark ? "text-[#91c84a]" : "text-[#4f7b38]")}>
                                        Create, customize, and validate containerized neuroimaging tools
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                                        <button
                                            onClick={() => loadContainer(getNewContainerYAML())}
                                            className={cn(
                                                "group flex items-center space-x-3 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                                                isDark
                                                    ? "bg-gradient-to-r from-[#7bb33a] to-[#6aa329] hover:from-[#6aa329] hover:to-[#5a8f23]"
                                                    : "bg-gradient-to-r from-[#6aa329] to-[#4f7b38] hover:from-[#5a8f23] hover:to-[#3a5c1b]"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isDark ? "bg-white/20 group-hover:bg-white/30" : "bg-white/20 group-hover:bg-white/30"
                                            )}>
                                                <PlusIcon className="h-6 w-6" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xl">Create New Container</span>
                                                <span className="text-sm opacity-90 font-normal">Start from scratch</span>
                                            </div>
                                        </button>

                                        <div 
                                            className="relative"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                accept=".yaml,.yml"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        processYamlFile(file);
                                                    }
                                                    // Reset the input
                                                    e.target.value = '';
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                id="yaml-upload"
                                            />
                                            <label
                                                htmlFor="yaml-upload"
                                                className={cn(
                                                    "group flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 cursor-pointer text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                                                    isDragging ? (
                                                        isDark
                                                            ? "bg-gradient-to-r from-[#5a8f23] to-[#7bb33a] text-white border-2 border-[#91c84a] scale-105"
                                                            : "bg-gradient-to-r from-[#4f7b38] to-[#6aa329] text-white border-2 border-[#7bb33a] scale-105"
                                                    ) : (
                                                        isDark
                                                            ? "bg-gradient-to-r from-[#2d4222] to-[#3a5c29] text-[#91c84a] hover:from-[#3a5c29] hover:to-[#4f7b38] border border-[#4f7b38]/30"
                                                            : "bg-gradient-to-r from-[#e6f1d6] to-[#d3e7b6] text-[#4f7b38] hover:from-[#d3e7b6] hover:to-[#c0d89f] border border-[#4f7b38]/20"
                                                    )
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    isDark
                                                        ? "bg-[#91c84a]/20 group-hover:bg-[#91c84a]/30"
                                                        : "bg-[#4f7b38]/20 group-hover:bg-[#4f7b38]/30"
                                                )}>
                                                    <ArrowUpTrayIcon className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xl">{isDragging ? 'Drop YAML File' : 'Upload Existing YAML'}</span>
                                                    <span className="text-sm opacity-80 font-normal">{isDragging ? 'Release to upload' : 'Click or drag & drop'}</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <LocalContainersList
                                        onLoadContainer={loadContainer}
                                        onDeleteContainer={deleteContainer}
                                        githubFiles={files}
                                    />
                                    <RemoteContainersList
                                        onLoadRecipe={loadContainer}
                                        onLoadLocalRecipe={(content) => {
                                            try {
                                                const recipe = loadYAML(content) as ContainerRecipe;
                                                loadContainer(migrateLegacyRecipe(recipe));
                                            } catch (error) {
                                                console.error('Failed to load local recipe:', error);
                                            }
                                        }}
                                        filesystemMode={filesystemMode}
                                        onFilesystemModeChange={setFilesystemMode}
                                    />
                                </div>
                                <Footer />
                            </div>
                        ) : (
                            /* Container Builder View - All Steps */
                            <div className="max-w-6xl mx-auto p-6 pt-20 lg:pt-6 space-y-8">
                                {/* Step 1: Basic Info */}
                                <div className="space-y-6">
                                    <SectionHeader
                                        icon={sections[0].icon}
                                        title={sections[0].title}
                                        description={sections[0].description}
                                    />
                                    <ContainerMetadata
                                        recipe={yamlData}
                                        onChange={handleDataChange}
                                        onValidationChange={setHasMetadataErrors}
                                    />
                                </div>

                                {/* Step 2: Build Recipe */}
                                <div className="space-y-6">
                                    <SectionHeader
                                        icon={sections[1].icon}
                                        title={sections[1].title}
                                        description={sections[1].description}
                                    />
                                    <BuildRecipeComponent
                                        recipe={yamlData.build}
                                        onChange={(buildRecipe) => handleDataChange({ ...yamlData, build: buildRecipe })}
                                    />
                                </div>

                                {/* Step 3: Validate */}
                                <div className="space-y-6">
                                    <SectionHeader
                                        icon={sections[2].icon}
                                        title={sections[2].title}
                                        description={sections[2].description}
                                    />
                                    <ValidateRecipeComponent
                                        recipe={yamlData}
                                    />
                                </div>

                                <Footer />
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    {isGitHubModalOpen && yamlData && (
                        <GitHubModal
                            isOpen={isGitHubModalOpen}
                            onClose={() => setIsGitHubModalOpen(false)}
                            yamlData={yamlData}
                            yamlText={yamlText}
                        />
                    )}
                </>
            )}
        </div>
    );
}