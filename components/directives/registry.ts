import { ComponentType } from "react";
import { Directive } from "@/components/common";

export interface DirectiveMetadata {
    key: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    color: { dark: string, light: string };
    headerColor?: { dark: string, light: string }; // Optional separate color for the header background
    borderColor?: { dark: string, light: string }; // Optional separate color for the container border
    iconColor: { dark: string, light: string };
    defaultValue: Directive;
    keywords: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: ComponentType<any>;
}

// Registry to store all directive metadata
const directiveRegistry = new Map<string, DirectiveMetadata>();

export function registerDirective(metadata: DirectiveMetadata) {
    directiveRegistry.set(metadata.key, metadata);
}

export function getDirectiveRegistry(): Map<string, DirectiveMetadata> {
    return directiveRegistry;
}

export function getAllDirectives(): DirectiveMetadata[] {
    return Array.from(directiveRegistry.values());
}

export function getDirective(key: string): DirectiveMetadata | undefined {
    return directiveRegistry.get(key);
}