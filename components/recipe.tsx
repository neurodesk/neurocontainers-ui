import NeuroDockerBuildRecipeComponent from "./neurodocker";

export default function BuildRecipeComponent({ recipe, onChange }: { recipe: BuildRecipe, onChange: (recipe: BuildRecipe) => void }) {
    if (recipe.kind === "neurodocker") {
        return <NeuroDockerBuildRecipeComponent recipe={recipe} onChange={onChange} />;
    } else {
        return (
            <div className="bg-white rounded-lg shadow-md border border-red-200 p-6 text-red-500">
                Unknown Build Recipe
            </div>
        );
    }
}
