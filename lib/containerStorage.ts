import { load as loadYAML } from "js-yaml";
import { ContainerRecipe } from "@/components/common";

export enum SaveStatus {
    Saved = "saved",
    Saving = "saving",
    Unsaved = "unsaved",
}

export interface SavedContainer {
    id: string;
    name: string;
    version: string;
    lastModified: number;
    data: ContainerRecipe;
}

const LOCAL_STORAGE_KEY = "neurocontainers-builder-saved";

export function getNewContainerYAML(): ContainerRecipe {
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

export function getSavedContainers(): SavedContainer[] {
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

export function saveContainer(data: ContainerRecipe, existingId?: string): string {
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

        if (existingId) {
            const index = saved.findIndex(c => c.id === existingId);
            if (index !== -1) {
                saved[index] = container;
            } else {
                saved.unshift(container);
            }
        } else {
            const filtered = saved.filter(c => c.name !== data.name);
            filtered.unshift(container);
            saved.splice(0, saved.length, ...filtered);
        }

        const limited = saved.slice(0, 10);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(limited));
        return id;
    } catch (error) {
        console.error("Failed to save container:", error);
        return existingId || "";
    }
}

export function deleteContainer(id: string) {
    try {
        const saved = getSavedContainers();
        const filtered = saved.filter(c => c.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Failed to delete container:", error);
    }
}

export function formatTimeAgo(timestamp: number): string {
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