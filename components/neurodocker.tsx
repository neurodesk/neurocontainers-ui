import { NeuroDockerBuildRecipe, Directive } from "@/components/common";
import { BaseImageSelector, DirectivesList } from "@/components/ui";
import { CARDS } from "@/lib/styles";

export default function NeuroDockerBuildRecipeComponent({
    recipe,
    onChange,
}: {
    recipe: NeuroDockerBuildRecipe;
    onChange: (recipe: NeuroDockerBuildRecipe) => void;
}) {
    const onChangeWrapper = (updatedRecipe: NeuroDockerBuildRecipe, cause: string) => {
        console.log(`Recipe updated via ${cause}:`, updatedRecipe);
        onChange(updatedRecipe);
    };

    const updateBaseImageAndPkgManager = (baseImage: string, pkgManager: string) => {
        onChangeWrapper(
            { ...recipe, "base-image": baseImage, "pkg-manager": pkgManager },
            "updateBaseImageAndPkgManager"
        );
    };

    const updateAddDefaultTemplate = (addDefaultTemplate: boolean) => {
        onChangeWrapper(
            { ...recipe, "add-default-template": addDefaultTemplate },
            "updateAddDefaultTemplate"
        );
    };

    const updateDirective = (index: number, directive: Directive) => {
        const updatedDirectives = [...recipe.directives];
        updatedDirectives[index] = directive;
        onChangeWrapper({ ...recipe, directives: updatedDirectives }, "updateDirective");
    };

    const addDirective = (directive: Directive, index?: number) => {
        const updatedDirectives = [...recipe.directives];
        if (index !== undefined) {
            updatedDirectives.splice(index, 0, directive);
        } else {
            updatedDirectives.push(directive);
        }
        onChangeWrapper(
            { ...recipe, directives: updatedDirectives },
            "addDirective"
        );
    };

    const removeDirective = (index: number) => {
        onChangeWrapper(
            {
                ...recipe,
                directives: recipe.directives.filter((_, i) => i !== index),
            },
            "removeDirective"
        );
    };

    const moveDirective = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= recipe.directives.length) return;

        const updatedDirectives = [...recipe.directives];
        [updatedDirectives[index], updatedDirectives[newIndex]] = [
            updatedDirectives[newIndex],
            updatedDirectives[index],
        ];

        onChangeWrapper({ ...recipe, directives: updatedDirectives }, "moveDirective");
    };

    const reorderDirectives = (directives: Directive[]) => {
        onChangeWrapper({ ...recipe, directives }, "reorderDirectives");
    };

    return (
        <div className={CARDS.minimal}>
            <div className="p-4 sm:p-6">
                {/* Base Image Section */}
                <div className="mb-8">
                    <BaseImageSelector
                        baseImage={recipe["base-image"]}
                        pkgManager={recipe["pkg-manager"]}
                        addDefaultTemplate={recipe["add-default-template"]}
                        onChange={updateBaseImageAndPkgManager}
                        onAddDefaultTemplateChange={updateAddDefaultTemplate}
                    />
                </div>

                {/* Directives Section */}
                <DirectivesList
                    directives={recipe.directives}
                    baseImage={recipe["base-image"]}
                    onAddDirective={addDirective}
                    onUpdateDirective={updateDirective}
                    onRemoveDirective={removeDirective}
                    onMoveDirective={moveDirective}
                    onReorderDirectives={reorderDirectives}
                />
            </div>
        </div>
    );
}