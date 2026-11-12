import type { ContainerRecipe, FileInfo } from "@/components/common";

/** Restore files that the UI moved into directives but auto_update still names. */
export function restoreUpdatePolicyFiles(recipe: ContainerRecipe): ContainerRecipe {
    const referencedNames = new Set(
        recipe.auto_update?.sources
            ?.map((source) => source.target?.file)
            .filter((name): name is string => typeof name === "string" && name.length > 0),
    );
    if (referencedNames.size === 0) {
        return recipe;
    }

    const files: FileInfo[] = [...(recipe.files ?? [])];
    const existingNames = new Set(files.map((file) => file.name));
    const directives = recipe.build.directives.filter((directive) => {
        if (
            !("file" in directive) ||
            directive.condition ||
            !referencedNames.has(directive.file.name) ||
            existingNames.has(directive.file.name)
        ) {
            return true;
        }

        files.push({ ...directive.file });
        existingNames.add(directive.file.name);
        return false;
    });

    if (directives.length === recipe.build.directives.length) {
        return recipe;
    }

    return {
        ...recipe,
        files,
        build: { ...recipe.build, directives },
    };
}

export function missingUpdatePolicyFiles(recipe: ContainerRecipe): string[] {
    const declaredNames = new Set((recipe.files ?? []).map((file) => file.name));
    return [...new Set(
        recipe.auto_update?.sources
            ?.map((source) => source.target?.file)
            .filter((name): name is string => typeof name === "string" && name.length > 0) ?? [],
    )].filter((name) => !declaredNames.has(name));
}

export function validateRecipeDomains(recipe: ContainerRecipe): void {
    const domains = recipe.domains;
    if (!Array.isArray(domains) || domains.length === 0) {
        throw new Error("domains is required and must be a non-empty list");
    }
    if (
        domains.some((domain) => typeof domain !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(domain)) ||
        new Set(domains).size !== domains.length
    ) {
        throw new Error("domains must contain unique lowercase domain IDs");
    }
}
