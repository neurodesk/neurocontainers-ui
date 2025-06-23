import { useState, useEffect, useCallback, useRef } from "react";
import { dump as dumpYAML } from "js-yaml";
import { ContainerRecipe } from "@/components/common";
import { SaveStatus, saveContainer, deleteContainer as deleteStoredContainer } from "@/lib/containerStorage";

export function useContainerStorage() {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Saved);
    const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const saveToStorage = useCallback((data: ContainerRecipe, existingId?: string) => {
        setSaveStatus(SaveStatus.Saving);
        
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            try {
                const id = saveContainer(data, existingId);
                setCurrentContainerId(id);
                setSaveStatus(SaveStatus.Saved);
            } catch (error) {
                console.error("Failed to save container:", error);
                setSaveStatus(SaveStatus.Unsaved);
            }
        }, 500);
    }, []);

    const deleteContainer = useCallback((id: string) => {
        try {
            deleteStoredContainer(id);
            if (currentContainerId === id) {
                setCurrentContainerId(null);
            }
        } catch (error) {
            console.error("Failed to delete container:", error);
        }
    }, [currentContainerId]);

    const exportYAML = useCallback((data: ContainerRecipe) => {
        try {
            const yamlContent = dumpYAML(data, {
                indent: 2,
                lineWidth: -1,
                noRefs: true,
            });

            const blob = new Blob([yamlContent], { type: "text/yaml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.name || "container"}.yaml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export YAML:", error);
        }
    }, []);

    const markAsUnsaved = useCallback(() => {
        setSaveStatus(SaveStatus.Unsaved);
    }, []);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        saveStatus,
        currentContainerId,
        saveToStorage,
        deleteContainer,
        exportYAML,
        markAsUnsaved,
        setCurrentContainerId,
    };
}