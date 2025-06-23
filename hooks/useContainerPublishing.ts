import { useState, useCallback } from "react";
import { load as loadYAML, dump as dumpYAML } from "js-yaml";
import { ContainerRecipe } from "@/components/common";

export function useContainerPublishing() {
    const [isPublishedContainer, setIsPublishedContainer] = useState<boolean>(false);
    const [isModifiedFromGithub, setIsModifiedFromGithub] = useState<boolean>(false);
    const [originalGithubYaml, setOriginalGithubYaml] = useState<string>("");
    const [currentRoute, setCurrentRoute] = useState<string>("");

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

    // Generate GitHub URL for a container
    const getGithubUrl = useCallback((recipe: ContainerRecipe) => {
        if (!recipe.name) return "";
        
        const containerName = getContainerUrlName(recipe);
        return `https://github.com/neurodesk/neurocontainers/tree/main/recipes/${containerName}`;
    }, []);

    // Check if container exists in GitHub files
    const checkIfPublished = useCallback((containerName: string, githubFiles: { path: string }[]) => {
        const isPublished = githubFiles.some(file => {
            const parts = file.path.split('/');
            const recipeName = parts[parts.length - 2] || '';
            return recipeName.toLowerCase() === containerName.toLowerCase();
        });
        setIsPublishedContainer(isPublished);
        return isPublished;
    }, []);

    // Set the original GitHub YAML content
    const setOriginalYaml = useCallback((yamlContent: string) => {
        setOriginalGithubYaml(yamlContent);
    }, []);

    // Reset publishing state
    const resetPublishingState = useCallback(() => {
        setIsPublishedContainer(false);
        setIsModifiedFromGithub(false);
        setOriginalGithubYaml("");
        setCurrentRoute("");
    }, []);

    return {
        isPublishedContainer,
        isModifiedFromGithub,
        originalGithubYaml,
        currentRoute,
        checkIfModifiedFromGithub,
        getContainerUrlName,
        getGithubUrl,
        checkIfPublished,
        setOriginalYaml,
        setIsModifiedFromGithub,
        setCurrentRoute,
        resetPublishingState,
    };
}