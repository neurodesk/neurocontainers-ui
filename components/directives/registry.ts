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

// Registrations deferred until the registry is first read. Built-in YAML groups
// use this: registering them while modules load would run inside the import
// cycle loader.tsx -> group.tsx -> ... -> directives/index.ts -> groups, before
// loader.tsx has finished evaluating.
const pendingRegistrations: Array<() => void> = [];

export function registerDirectivesLazily(register: () => void) {
    pendingRegistrations.push(register);
}

/** Run deferred registrations; every registry read calls this first. */
export function flushPendingRegistrations() {
    while (pendingRegistrations.length) pendingRegistrations.shift()!();
}

export function registerDirective(metadata: DirectiveMetadata) {
    directiveRegistry.set(metadata.key, metadata);
}

export function getDirectiveRegistry(): Map<string, DirectiveMetadata> {
    flushPendingRegistrations();
    return directiveRegistry;
}

export function getAllDirectives(): DirectiveMetadata[] {
    flushPendingRegistrations();
    return Array.from(directiveRegistry.values());
}

export function getDirective(key: string): DirectiveMetadata | undefined {
    flushPendingRegistrations();
    return directiveRegistry.get(key);
}