/**
 * Filesystem service for handling local neurocontainers repository operations
 * Uses the File System Access API for modern browsers
 */

// Type declarations for File System Access API
declare global {
    interface Window {
        showDirectoryPicker(options?: {
            mode?: 'read' | 'readwrite';
            startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
        }): Promise<FileSystemDirectoryHandle>;
    }
    
    interface FileSystemDirectoryHandle {
        entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
        getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
        getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    }
    
    interface FileSystemFileHandle {
        getFile(): Promise<File>;
        createWritable(): Promise<FileSystemWritableFileStream>;
    }
    
    interface FileSystemWritableFileStream {
        write(data: string): Promise<void>;
        close(): Promise<void>;
    }
}

export interface FileSystemEntry {
    name: string;
    path: string;
    type: 'file' | 'directory';
    handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

export interface NeurocontainerRecipeFile {
    path: string;
    name: string;
    content: string;
    handle: FileSystemFileHandle;
}

// Check if File System Access API is supported
export const isFileSystemAccessSupported = (): boolean => {
    return 'showDirectoryPicker' in window;
};

// Check for secure context (required for File System Access API)
export const isSecureContext = (): boolean => {
    return window.isSecureContext;
};

export class FilesystemService {
    private rootDirectoryHandle: FileSystemDirectoryHandle | null = null;
    private recipesCache: Map<string, NeurocontainerRecipeFile> = new Map();

    /**
     * Open a directory picker and validate it's a neurocontainers repository
     */
    async openNeurocontainersDirectory(): Promise<FileSystemDirectoryHandle> {
        if (!isFileSystemAccessSupported()) {
            throw new Error('File System Access API not supported in this browser');
        }

        if (!isSecureContext()) {
            throw new Error('File System Access API requires secure context (HTTPS)');
        }

        try {
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Validate it's a neurocontainers repository
            await this.validateNeurocontainersRepository(directoryHandle);
            
            this.rootDirectoryHandle = directoryHandle;
            this.recipesCache.clear();
            
            return directoryHandle;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Directory selection was cancelled');
            }
            throw error;
        }
    }

    /**
     * Validate that the directory is a neurocontainers repository
     */
    private async validateNeurocontainersRepository(directoryHandle: FileSystemDirectoryHandle): Promise<void> {
        try {
            // Check for recipes directory (required)
            await directoryHandle.getDirectoryHandle('recipes');
            
            // Check for the builder package (critical for local Pyodide integration)
            try {
                const builderHandle = await directoryHandle.getDirectoryHandle('builder');
                try {
                    await builderHandle.getFileHandle('recipe.py');
                } catch {
                    await builderHandle.getFileHandle('build.py');
                }
            } catch {
                throw new Error('Directory appears to be missing the builder Python package - this may not be a complete NeuroContainers repository');
            }
            
            // Check for other expected files/directories
            const expectedItems = ['README.md', '.github', 'builder'];
            let foundExpected = 0;
            
            for await (const [name] of directoryHandle.entries()) {
                if (expectedItems.includes(name)) {
                    foundExpected++;
                }
            }

            // If no expected files found, warn but don't fail
            if (foundExpected < 2) {
                console.warn('Directory may not be a complete neurocontainers repository - some expected files/directories missing');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error; // Re-throw our custom error messages
            }
            throw new Error('Directory does not appear to be a neurocontainers repository (missing recipes folder)');
        }
    }

    /**
     * Get all recipe files from the recipes directory
     */
    async getRecipeFiles(): Promise<NeurocontainerRecipeFile[]> {
        if (!this.rootDirectoryHandle) {
            throw new Error('No directory opened. Call openNeurocontainersDirectory() first.');
        }

        const recipes: NeurocontainerRecipeFile[] = [];
        
        try {
            const recipesHandle = await this.rootDirectoryHandle.getDirectoryHandle('recipes');
            
            // Iterate through each container directory
            for await (const [containerName, containerHandle] of recipesHandle.entries()) {
                if (containerHandle.kind === 'directory') {
                    try {
                        // Look for build.yaml file
                        const buildFileHandle = await (containerHandle as FileSystemDirectoryHandle)
                            .getFileHandle('build.yaml');
                        
                        const file = await buildFileHandle.getFile();
                        const content = await file.text();
                        
                        const recipe: NeurocontainerRecipeFile = {
                            path: `recipes/${containerName}/build.yaml`,
                            name: containerName,
                            content,
                            handle: buildFileHandle
                        };
                        
                        recipes.push(recipe);
                        this.recipesCache.set(containerName, recipe);
                    } catch (error) {
                        // Skip containers without build.yaml
                        console.warn(`No build.yaml found in ${containerName}:`, error);
                    }
                }
            }
        } catch (error) {
            throw new Error(`Failed to read recipes directory: ${error}`);
        }

        return recipes;
    }

    /**
     * Read a specific recipe file
     */
    async getRecipeFile(containerName: string): Promise<NeurocontainerRecipeFile | null> {
        if (!this.rootDirectoryHandle) {
            throw new Error('No directory opened. Call openNeurocontainersDirectory() first.');
        }

        // Check cache first
        if (this.recipesCache.has(containerName)) {
            return this.recipesCache.get(containerName)!;
        }

        try {
            const recipesHandle = await this.rootDirectoryHandle.getDirectoryHandle('recipes');
            const containerHandle = await recipesHandle.getDirectoryHandle(containerName);
            const buildFileHandle = await containerHandle.getFileHandle('build.yaml');
            
            const file = await buildFileHandle.getFile();
            const content = await file.text();
            
            const recipe: NeurocontainerRecipeFile = {
                path: `recipes/${containerName}/build.yaml`,
                name: containerName,
                content,
                handle: buildFileHandle
            };
            
            this.recipesCache.set(containerName, recipe);
            return recipe;
        } catch (error) {
            console.warn(`Failed to read recipe for ${containerName}:`, error);
            return null;
        }
    }

    /**
     * Save a recipe file to the local repository
     */
    async saveRecipeFile(containerName: string, yamlContent: string): Promise<void> {
        if (!this.rootDirectoryHandle) {
            throw new Error('No directory opened. Call openNeurocontainersDirectory() first.');
        }

        try {
            const recipesHandle = await this.rootDirectoryHandle.getDirectoryHandle('recipes');
            
            // Create container directory if it doesn't exist
            const containerHandle = await recipesHandle.getDirectoryHandle(containerName, { 
                create: true 
            });
            
            // Create or update build.yaml file
            const buildFileHandle = await containerHandle.getFileHandle('build.yaml', { 
                create: true 
            });
            
            // Write the content
            const writable = await buildFileHandle.createWritable();
            await writable.write(yamlContent);
            await writable.close();
            
            // Update cache
            const updatedRecipe: NeurocontainerRecipeFile = {
                path: `recipes/${containerName}/build.yaml`,
                name: containerName,
                content: yamlContent,
                handle: buildFileHandle
            };
            
            this.recipesCache.set(containerName, updatedRecipe);
        } catch (error) {
            throw new Error(`Failed to save recipe for ${containerName}: ${error}`);
        }
    }

    /**
     * Read additional files referenced in a recipe (relative to container directory)
     */
    async readAdditionalFile(containerName: string, relativePath: string): Promise<string | null> {
        if (!this.rootDirectoryHandle) {
            throw new Error('No directory opened. Call openNeurocontainersDirectory() first.');
        }

        try {
            const recipesHandle = await this.rootDirectoryHandle.getDirectoryHandle('recipes');
            const containerHandle = await recipesHandle.getDirectoryHandle(containerName);
            
            // Navigate to the file using the relative path
            const pathParts = relativePath.split('/').filter(part => part.length > 0);
            let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = containerHandle;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
                currentHandle = await (currentHandle as FileSystemDirectoryHandle)
                    .getDirectoryHandle(pathParts[i]);
            }
            
            const fileName = pathParts[pathParts.length - 1];
            const fileHandle = await (currentHandle as FileSystemDirectoryHandle)
                .getFileHandle(fileName);
            
            const file = await fileHandle.getFile();
            return await file.text();
        } catch (error) {
            console.warn(`Failed to read additional file ${relativePath} for ${containerName}:`, error);
            return null;
        }
    }

    /**
     * Get the current directory name (repository name)
     */
    getDirectoryName(): string | null {
        return this.rootDirectoryHandle?.name || null;
    }

    /**
     * Close the current directory
     */
    closeDirectory(): void {
        this.rootDirectoryHandle = null;
        this.recipesCache.clear();
    }

    /**
     * Check if a directory is currently opened
     */
    isDirectoryOpen(): boolean {
        return this.rootDirectoryHandle !== null;
    }

    private async readDirectoryTextFiles(
        directoryHandle: FileSystemDirectoryHandle,
        basePath: string,
        result: Record<string, string>
    ): Promise<void> {
        for await (const [name, handle] of directoryHandle.entries()) {
            if (name === '__pycache__' || name === 'tests' || name === 'tester') {
                continue;
            }

            const path = `${basePath}/${name}`;
            if (handle.kind === 'directory') {
                await this.readDirectoryTextFiles(handle as FileSystemDirectoryHandle, path, result);
                continue;
            }

            if (!name.endsWith('.py') && !name.endsWith('.json') && !name.endsWith('.yaml')) {
                continue;
            }

            const file = await (handle as FileSystemFileHandle).getFile();
            result[path] = await file.text();
        }
    }

    /**
     * Get local builder package file content for Pyodide
     */
    async getLocalBuilderPackageFiles(): Promise<Record<string, string> | null> {
        if (!this.rootDirectoryHandle) {
            return null;
        }

        try {
            const builderHandle = await this.rootDirectoryHandle.getDirectoryHandle('builder');
            const files: Record<string, string> = {};
            await this.readDirectoryTextFiles(builderHandle, 'builder', files);
            return Object.keys(files).length ? files : null;
        } catch (error) {
            console.warn('Failed to read local builder package:', error);
            return null;
        }
    }

    /**
     * Get the legacy local builder/build.py file content for Pyodide
     */
    async getLocalBuilderScript(): Promise<string | null> {
        const files = await this.getLocalBuilderPackageFiles();
        return files?.['builder/build.py'] || null;
    }
}

// Global filesystem service instance
export const filesystemService = new FilesystemService();
